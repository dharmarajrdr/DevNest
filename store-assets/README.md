# Store assets

## Included
- `small-promo-tile-440x280.png` — generated brand artwork for the Chrome
  Web Store's small promo tile slot. This is promotional graphics, not a
  product screenshot.

## Still needed before submission
Chrome Web Store requires **actual screenshots** of the running
extension (1–5 images, 1280×800 or 640×800) — these can't be generated
without a real Chrome instance, and faking one would violate Web Store
policy. To capture them:

1. `npm run build`
2. Load `dist/` unpacked in `chrome://extensions` (Developer mode → Load unpacked)
3. Open a new tab, populate it with a few real tasks/shortcuts/notes so
   it doesn't look empty, and use Chrome's own screenshot tooling
   (DevTools → Cmd/Ctrl+Shift+P → "Capture full size screenshot") at
   1280×800 or a similar 16:10 window size
4. Repeat for 2–4 more views worth showing: Customize mode mid-drag, the
   Command Palette open, a Developer Tools panel, the Pomodoro widget mid-session

Optional: a 1400×560 marquee image, only needed if you want DevNest
considered for Chrome Web Store featured placement.
