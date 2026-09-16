# `src/data`

Typed reference content: meats and their temperatures, cooking terms, spices
and blends. Plain data files with no UI and no browser APIs, so they carry
over unchanged if the app ever moves to React Native.

Two rules hold here.

**Every temperature names a source.** `sources.ts` holds the registry, and
`data.test.ts` fails the build if any temperature points at a source that does
not exist, or if a doneness preference is ever attributed to a food safety
body. Oven settings and times are our own estimates, flagged with
`needsVerification` and labelled as such in the UI, because they are not
guidance and must not look like it.

**The spice content is original.** It is written from general culinary
knowledge and is not taken, reworded or restructured from any book. Arran
mentioned The Science of Spice; the app is built to be used alongside it,
which is what the per-spice notes field is for, not to replace it.

Items that can launch a timer carry a suggested label and duration.
