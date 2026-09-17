# iOS behaviour: what we have actually tested

Written after Milestone 3. The point of this file is that these findings were
expensive to get and easy to forget, and at least one of them contradicts the
assumption the project was founded on.

## The headline

**Simmer's alarm sounds on a locked iPhone, with the app in the background,
after 30 minutes.** This was not expected and it is better than the brief
assumed possible.

### What was tested

| | |
| --- | --- |
| Device | Ryan's iPhone, iOS 26.3.1 |
| Install | PWA added to the Home Screen |
| Method | Start a countdown, lock the phone, do not touch it again |
| Durations | 1 minute (twice), then 30 minutes |
| Result | Alarm sounded by itself every time |
| Background alarm setting | Worked both switched on and switched off |

That the experimental "background alarm" setting made no difference is the
interesting part. It means the pre-booked audio is not what is doing the work.

### Why it probably happens

Almost certainly `navigator.audioSession.type = 'playback'`, set in
`src/platform/audio.ts` when the Start button opens the audio system.

That line was added to try to play through the silent switch. It declares the
page as a media app, and iOS deliberately lets media apps keep running and
keep making sound in the background. This is the same rule that stops Spotify
dying when you lock your phone. We appear to have qualified for it by accident.

**This is a hypothesis, not a confirmed cause.** It has not been A/B tested by
removing the line and repeating the 30 minute test.

### What this does NOT mean

- It is not confirmed on any phone other than Ryan's, and not on any iOS
  version other than 26.3.1.
- It is not promised to the user anywhere in the app, on purpose. The wording
  still says to keep the app open. If this behaviour disappears after an iOS
  update, a user who was told they could lock their phone burns dinner, while a
  user who was told to keep it open simply gets a nice surprise. The cost of
  being wrong is lopsided, so the wording errs safe.
- It does not remove the reason to keep `src/core` portable. If Apple changes
  this, native becomes the answer again.

## The silent switch: confirmed working

**Arran has confirmed the alarm sounds with the silent switch on.** Tested on
his own phone, which unlike Ryan's has a working switch.

This closes the question the app was built around not being able to answer, and
it strongly supports the hypothesis above: `navigator.audioSession.type =
'playback'` is doing real work. Declaring Simmer a media app appears to buy us
both the silent-switch playback and the background execution, from one line.

That makes the warning comment on that line in `src/platform/audio.ts` more
important, not less. Two separate promises now rest on it.

The app still warns about the ringer, and should keep doing so. Silent mode and
the ringer volume are not the same control, the warning costs nothing, and a
phone at zero volume will still be silent.

## Still unknown

- **Whether `audioSession` is really the cause.** Settled by switching that one
  line off and repeating the 30 minute locked test.
- **Battery cost** of holding a media session open for a long cook.

## Re-test this when

- Arran first installs it, on his phone (Milestone 4).
- After any major iOS release.
- If `src/platform/audio.ts` is ever refactored. See the warning comment on the
  `audioSession` line before changing it.
