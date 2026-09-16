# `src/platform`

Thin wrappers around browser-only APIs: screen wake lock, audio playback and
localStorage. Everything else in the app talks to these wrappers rather than
to the browser directly, so a move to React Native means rewriting only this
folder. Filled in during Milestones 2 and 3.
