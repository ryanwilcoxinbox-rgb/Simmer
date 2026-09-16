/**
 * The alarm.
 *
 * iOS only lets a web page make noise if the audio system was opened during a
 * real finger press. It is not enough to have tapped something earlier in the
 * session: the AudioContext itself has to be created or resumed inside the
 * handler for a genuine tap. So unlock() is called from the Start button, and
 * everything afterwards reuses that one context. Get this wrong and the app
 * works perfectly on a laptop and is mute on the phone.
 *
 * The sound is generated rather than loaded from a file. That keeps the app
 * small, means there is nothing to fetch when the alarm needs to fire, and
 * lets the tone be tuned to cut through a noisy kitchen.
 */

declare global {
  interface Navigator {
    /**
     * Safari 16.4+. Declaring the session as "playback" is what asks iOS to
     * treat this like a media app, which is the documented route to playing
     * through the silent switch.
     */
    audioSession?: { type: string }
  }
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

let context: AudioContext | null = null
let keepAlive: OscillatorNode | null = null
let burstTimer: number | null = null
/** Nodes scheduled ahead of time, so they can be cancelled if a timer stops. */
const armed = new Map<string, OscillatorNode[]>()

/** Two alternating tones. A minor third apart, which sounds urgent, not musical. */
const TONES = [880, 1174.7]
const BEEP_LENGTH = 0.14
const BEEP_GAP = 0.1
const BEEPS_PER_BURST = 4
const BURST_PERIOD_MS = 2200

export function isSupported(): boolean {
  return typeof window !== 'undefined' && Boolean(window.AudioContext ?? window.webkitAudioContext)
}

/**
 * Open the audio system. MUST be called synchronously inside a tap handler.
 * Safe and cheap to call on every tap; it only does real work the first time.
 */
export function unlock(): boolean {
  try {
    if (!context) {
      const Ctor = window.AudioContext ?? window.webkitAudioContext
      if (!Ctor) return false
      context = new Ctor()
    }
    if (navigator.audioSession) navigator.audioSession.type = 'playback'
    // Resuming is what actually consumes the user gesture.
    void context.resume()
    return true
  } catch {
    return false
  }
}

/** Nudge the context awake after iOS has suspended it in the background. */
export function resume(): void {
  if (context && context.state === 'suspended') void context.resume()
}

function scheduleBeep(at: number, frequency: number): OscillatorNode | null {
  if (!context) return null
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'square' // harsher than a sine, and carries further
  oscillator.frequency.value = frequency

  // A hard on/off produces an audible click, so ramp the edges very slightly.
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(0.5, at + 0.01)
  gain.gain.setValueAtTime(0.5, at + BEEP_LENGTH - 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + BEEP_LENGTH)

  oscillator.connect(gain).connect(context.destination)
  oscillator.start(at)
  oscillator.stop(at + BEEP_LENGTH + 0.02)
  return oscillator
}

/** One burst of alternating beeps, starting at the given audio-clock time. */
function scheduleBurst(startAt: number): OscillatorNode[] {
  const nodes: OscillatorNode[] = []
  for (let i = 0; i < BEEPS_PER_BURST; i++) {
    const node = scheduleBeep(startAt + i * (BEEP_LENGTH + BEEP_GAP), TONES[i % 2])
    if (node) nodes.push(node)
  }
  return nodes
}

/**
 * Start sounding the alarm now and keep it going until stopAlarm().
 *
 * Each burst is scheduled a moment ahead on the audio clock, and a repeating
 * timer queues the next one. The repeating timer is only responsible for
 * queueing, never for timing the beeps themselves, so a throttled page makes
 * the alarm stutter rather than drift out of rhythm.
 */
export function startAlarm(): void {
  if (!context || burstTimer !== null) return
  resume()
  scheduleBurst(context.currentTime + 0.05)
  burstTimer = window.setInterval(() => {
    if (context) scheduleBurst(context.currentTime + 0.05)
  }, BURST_PERIOD_MS)
}

export function stopAlarm(): void {
  if (burstTimer !== null) {
    window.clearInterval(burstTimer)
    burstTimer = null
  }
}

export function isAlarming(): boolean {
  return burstTimer !== null
}

/**
 * EXPERIMENTAL. Queue a timer's alarm on the audio hardware's own clock, at
 * the exact moment it is due.
 *
 * The theory: Web Audio scheduling is handled below JavaScript, so a sound
 * booked in advance may still play after iOS has frozen the page. If that
 * holds, Arran hears his timer even with the app in the background. If it
 * does not, nothing is lost, because the in-app alarm covers the same moment.
 */
export function arm(id: string, delayMs: number): void {
  // Already booked. Re-booking would tear down and rebuild a hundred queued
  // nodes every time any timer on the screen changes.
  if (!context || delayMs < 0 || armed.has(id)) return
  const startAt = context.currentTime + delayMs / 1000
  const nodes: OscillatorNode[] = []
  // About a minute of alarm, in case nobody is looking at the phone.
  for (let burst = 0; burst < 27; burst++) {
    nodes.push(...scheduleBurst(startAt + burst * (BURST_PERIOD_MS / 1000)))
  }
  armed.set(id, nodes)
}

export function disarm(id: string): void {
  const nodes = armed.get(id)
  if (!nodes) return
  for (const node of nodes) {
    try {
      node.stop()
    } catch {
      // Already finished or never started. Nothing to do.
    }
  }
  armed.delete(id)
}

export function disarmAll(): void {
  for (const id of [...armed.keys()]) disarm(id)
}

/**
 * A continuous, effectively silent tone. Its only job is to stop iOS deciding
 * the page has finished with audio and tearing the session down, which would
 * take any scheduled alarms with it. Only used with the experiment enabled,
 * since it keeps the audio hardware awake and therefore costs battery.
 */
export function setKeepAlive(on: boolean): void {
  if (!context) return
  if (on && !keepAlive) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.frequency.value = 20 // below anything a phone speaker reproduces
    gain.gain.value = 0.0001
    oscillator.connect(gain).connect(context.destination)
    oscillator.start()
    keepAlive = oscillator
  } else if (!on && keepAlive) {
    try {
      keepAlive.stop()
    } catch {
      // Already stopped.
    }
    keepAlive = null
  }
}

/** What the silent-switch workaround reported, for the Settings screen. */
export function audioSessionSupport(): 'supported' | 'unavailable' {
  return typeof navigator !== 'undefined' && navigator.audioSession
    ? 'supported'
    : 'unavailable'
}

/**
 * Whether the audio system is open and able to make a sound right now.
 *
 * False on a cold start, because iOS will not open it until a finger has
 * touched the screen. The timer screen uses this to arrange for the first tap
 * to bring a waiting alarm to life.
 */
export function isReady(): boolean {
  return context !== null && context.state === 'running'
}
