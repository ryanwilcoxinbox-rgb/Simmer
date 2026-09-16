# Cooking Companion App: Project Brief

## Who this is for and why it exists

I'm Ryan, building this for my brother Arran, who cooks a lot and uses an iPhone. I'm new to coding and relying on you to build it, so explain what you're doing as you go, in plain language. Treat me as a capable adult who doesn't know the jargon yet.

Arran asked for a multi-timer he can label: rice on the hob in one row, chicken in the oven in another, and so on. He reckons five rows is enough, and each row should work as either a countdown or a stopwatch. He also wants spice pairings (which spices go together), cooking temperatures for different meats, and cooking terms and styles explained.

It starts as a private app for Arran. It may go public later, so make decisions that don't block that, but don't build for strangers yet.

## Product vision

One cooking companion with the timer at its heart, not three separate tools in one app. The glue: every reference entry can launch a labelled timer. Arran looks up chicken thighs, sees the oven temperature and target internal temperature, taps "Start timer", and a timer called "Chicken" starts running with the right duration.

Priority order: the timer must be rock solid before anything else is built. Reference content comes later because it's a big content job, and content jobs are where hobby projects stall.

## Platform decision: PWA first, native as a fallback

We're building a Progressive Web App (installed to Arran's Home Screen), not a native iPhone app, for now. Reasons: no $99 Apple Developer fee, no App Store or TestFlight, instant updates, and a simpler setup for a beginner developing on Windows.

The known trade-off: a PWA on iOS can't reliably fire an alarm when the phone is locked or the app is in the background. iOS suspends the page, and web push would need a server and isn't guaranteed to deliver. We accept this for now on the assumption that Arran cooks with the phone propped up and the app open. We'll test that assumption with him (see Milestone 4). If it fails, we move to native with Expo (React Native), so keep the code portable (see Architecture).

## Tech stack

- Vite + React + TypeScript
- vite-plugin-pwa for the manifest and service worker (offline support, Home Screen install)
- localStorage for saving timer state and settings
- No backend, no accounts, no analytics
- Hosted on a free static host with HTTPS (Cloudflare Pages, Netlify or Vercel; recommend one and explain why). HTTPS is required for the service worker and the Wake Lock API.
- Git from day one, with a commit after each working step

I develop on Windows and test on my own iPhone. Local dev over the network is plain HTTP, which breaks wake lock and service workers, so set up a way for me to test on the iPhone over HTTPS (deploy previews or a tunnel). Explain the options.

## Non-negotiable technical rules

These exist because iOS treats web apps harshly in specific ways. Follow them even if a simpler approach seems to work on desktop.

**1. Timers store end times, never tick counters.** A countdown saves "ends at 21:43:10" as a timestamp. Remaining time is always calculated as `endTime - now` when rendering. A stopwatch saves its start time plus any accumulated paused duration. Never decrement a counter each second, because iOS freezes background pages and the count drifts or dies. Timer state is saved to localStorage on every change, so closing and reopening the app restores everything correctly.

**2. Keep the screen awake while timers run.** Use the Screen Wake Lock API. Request it when the first timer starts and release it when no timers are running. iOS drops the wake lock whenever the app leaves the screen, so listen for `visibilitychange` and re-request it every time the app becomes visible again with timers running. Handle the API being unavailable without crashing.

**3. Handle "finished while you were away" loudly.** If Arran leaves the app (to reply on WhatsApp, say) and a timer ends meanwhile, the moment he returns the app must make it obvious: highlight the row, show "Rice finished 3 min ago", and play the alarm. Never just quietly show 00:00.

**4. Unlock audio on a user tap.** iOS only allows web audio after a user gesture, so prepare the alarm sound during the Start button tap, not when the timer ends. Test with the iPhone's silent switch on, because that's the most likely way alarms fail. Investigate `navigator.audioSession` (type "playback") as a way to play through silent mode where Safari supports it, and tell me what you find. Note that vibration isn't available to web apps on iPhone, so don't rely on it.

**5. Say the rule where it matters.** Show a small, always-visible line on the timer screen while timers run, such as "Screen stays on. Keep this app open for alarms." Don't put this in an onboarding screen that gets skipped.

## UX requirements

- Built for a kitchen: large tap targets, high contrast, readable from arm's length, usable with messy hands
- Timer screen is the home screen
- Each row has a label, a mode toggle (countdown or stopwatch), a time display and start, pause and reset
- Design the layout for five visible rows, but don't hardcode five as a limit
- Quick presets for common durations
- A clear, distinct alarm sound, with a big button to dismiss a finished timer
- Planned tabs: Timers, Guide (meats and cooking terms), Spices, Settings
- Celsius/Fahrenheit toggle in Settings from the start (default Celsius)

## Content rules

**Temperatures are a safety issue, so never invent them.** Every temperature entry needs a named source (UK Food Standards Agency, USDA or similar official guidance). Distinguish "safe" temperatures (chicken, pork, mince) from "preference" doneness (steak rare to well done). UK and US guidance don't always match, for example the FSA frames poultry as 70°C held for two minutes while the USDA uses 74°C, so show which source a number comes from. Include a note on carryover cooking (pull meat a few degrees early because it keeps cooking while resting). If you're not certain of a figure, add it with a `needsVerification: true` flag and tell me, and I'll check it against the official sites myself. Internal temperatures assume a probe thermometer; we haven't confirmed Arran owns one, so keep time-based guidance alongside.

**Spice content must be original.** Arran mentioned the book *The Science of Spice*. Do not reproduce, paraphrase closely or restructure content from that book or any other copyrighted source. Build our own dataset from general culinary knowledge: spices grouped by flavour character, pairings between them, and a handful of classic blends. Give each spice a personal notes field so Arran can record his own findings and keep using the book alongside the app.

**Cooking terms** are short, plain-English explanations written from scratch (braise, blanch, sear, rest, deglaze and so on).

## Architecture: keep it portable

A move to native (Expo) later is possible, so separate the parts that would survive a rewrite:

- `src/core/` holds pure TypeScript logic for timers (creating, pausing, calculating remaining time, detecting finished timers) with no React or browser APIs inside. Write unit tests for this.
- `src/data/` holds reference content as typed data files (meats, cooking terms, spices, blends). Every item that can launch a timer includes a suggested label and duration.
- `src/platform/` holds browser-specific wrappers (wake lock, audio, storage) so they can be swapped for native equivalents.
- `src/features/` holds the UI screens.

## Milestones

Work on one milestone at a time. At the end of each, tell me how to test it on my iPhone, what "done" looks like, and wait for my confirmation before starting the next one.

1. **Setup.** Project created, Git initialised, deployed to HTTPS hosting, installable to the Home Screen, opens on my iPhone as a standalone app.
2. **Timers.** Labelled rows, countdown or stopwatch, start, pause and reset, presets, end-time model (rule 1) and state that survives closing the app.
3. **Reliability safeguards.** Wake lock with re-acquire (rule 2), finished-while-away handling (rule 3), audio unlock and silent-switch testing (rule 4) and the on-screen notice (rule 5). This is the hardest milestone, so don't rush it.
4. **Arran's kitchen test.** He uses it for a week of real cooking. The key question afterwards: did he ever miss a timer because he left the app? If yes, we plan a move to native before building more. If no, we stay on the web. Help me prepare a short list of things to ask him.
5. **Guide tab.** Meat temperatures and cooking terms, the C/F toggle and "Start timer" buttons that create labelled timers.
6. **Finish together.** Arran enters each item's cook time (chicken 40 min, rice 15, veg 8) and the app tells him when to start each one so everything is ready at the same moment, ideally starting each timer automatically or prompting him at the right time.
7. **Spices.** Flavour groups, pairings, a handful of blends and personal notes.
8. **Public readiness.** Only if we decide to go public: icon and branding, a food-safety disclaimer, and a review of whether the web version is enough or native (App Store, lock-screen alarms) is needed.

## How to work with me

- Before writing code for a milestone, give me a short plan and wait for my go-ahead.
- Explain what you built and why, briefly, before moving on.
- Ask before adding any new dependency, and keep dependencies minimal.
- When something breaks, I'll paste the exact error. Explain the cause, not just the fix.
- Push back if I ask for something that conflicts with this brief or will cause problems later. I'd rather hear it.
- When writing any user-facing text or documentation for me, avoid em dashes.
