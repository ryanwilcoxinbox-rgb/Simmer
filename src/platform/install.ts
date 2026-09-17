import { installAdvice, type Environment, type InstallAdvice } from '../core/install'

/**
 * The browser side of prompting someone to install Simmer.
 *
 * Chrome fires beforeinstallprompt once, early, and usually before React has
 * rendered anything. If nobody is listening at that moment the chance is gone,
 * so the listener is registered at module load and the event is kept for
 * later. That is also why this is a module with its own state rather than a
 * hook: the event does not wait for a component to mount.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()

function announce() {
  for (const listener of listeners) listener()
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Without this the browser shows its own bar as well as ours.
    event.preventDefault()
    deferred = event as BeforeInstallPromptEvent
    announce()
  })

  // Fired after a successful install, so the banner can disappear by itself.
  window.addEventListener('appinstalled', () => {
    deferred = null
    announce()
  })
}

export function isStandalone(): boolean {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari never adopted display-mode and uses this instead.
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    )
  } catch {
    return false
  }
}

export function currentEnvironment(): Environment {
  return {
    userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
    standalone: isStandalone(),
    canPrompt: deferred !== null,
    maxTouchPoints: typeof navigator === 'undefined' ? 0 : navigator.maxTouchPoints,
  }
}

export function currentAdvice(): InstallAdvice {
  return installAdvice(currentEnvironment())
}

/** Fire the browser's own install prompt. True if they went through with it. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  try {
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    // It can only be used once, whatever they chose.
    deferred = null
    announce()
    return outcome === 'accepted'
  } catch {
    deferred = null
    announce()
    return false
  }
}

/** Told when a prompt becomes available or is used up. */
export function onInstallChange(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
