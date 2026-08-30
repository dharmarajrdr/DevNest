# DevNest

A Chrome New Tab replacement built for software engineers — a dark, Bento Grid
dashboard combining task management, quick links, and (in later phases) developer
utilities, time tools, and productivity stats. Manifest V3, React, TypeScript.

> Working name only. Branding is centralized in `src/config/brand.ts` — change three
> constants and the whole app relabels.

## 1. Product overview

Every new tab shows: the time, today's tasks with due-time reminders, and your
pinned developer links — with more widgets (Stopwatch, Timer/Pomodoro, Dev Tools,
Snippets, Notes, Productivity, GitHub) designed to slot into the same system without
touching existing code.

## 2. Features (this build)

- **Clock** — 12/24-hour, optional seconds/date, live-updating
- **Tasks** — full CRUD, priorities (Low/Medium/High/Urgent), due date + time,
  Today/Upcoming/Overdue/Completed filters, reminders scheduled via `chrome.alarms`
  and delivered via `chrome.notifications` (survives browser restarts — not a
  React timer)
- **Shortcuts** — CRUD, categories, automatic favicon with graceful fallback
- **Stopwatch** — start/pause/reset/lap, timestamp-based elapsed time (immune
  to interval drift/throttling), state persists across tabs
- **Timer** — presets (5–60 min) + custom duration, `chrome.alarms`-backed
  finish notification that fires even if the tab is closed, optional chime
- **Pomodoro** — focus/break cycling, configurable durations, session-count
  dots, skip; phase transitions are identical whether the tab is open or not
  (one shared pure function, called from both the store and the background
  worker)
- **Developer Tools** — 18 lazy-loaded utilities covering JSON format/minify,
  Base64, URL encode/decode, UUID, timestamp converter, hash generator
  (SHA-1/256/384/512), regex tester, JWT decoder, color converter, case
  converter, Lorem Ipsum, random string, cron helper, SQL formatter, and
  searchable Git/Docker/Linux/HTTP-status cheat sheets
- **Snippets** — CRUD, categories, favorites, one-click copy
- **Notes** — lightweight CRUD with autosave on close (not a Notion clone)
- **Command palette** — Cmd/Ctrl+K (and `/`), searches tasks, shortcuts,
  snippets, notes, and dev-tool names
- **Keyboard shortcuts** — `n` new task, `s` start stopwatch, `t` start timer,
  `Esc` close modal
- **Dashboard customization** — a "Customize" mode (Header) for dragging
  widgets to a new position, resizing from the corner handle, and hiding
  widgets to a tray they can be restored from. Drops that would overlap
  another widget are refused and the tile snaps back rather than stacking.
- **Productivity** — tasks completed today/this 7 days, focus minutes today,
  Pomodoro sessions today, current daily streak, and today's due-task
  completion rate — all derived from real local data (todos +
  a lightweight focus-session log), nothing simulated
- **GitHub Activity** — placeholder widget with mock commit/PR/issue counts,
  built against the exact return shape a real API integration would use
  (`GitHubService.getActivity()`), so wiring up real data later doesn't
  touch `GitHubWidget` at all
- **Google Sync** — sign in, then tasks/shortcuts/notes/snippets/settings
  sync to a hidden folder in your own Google Drive (`appDataFolder`) via
  `chrome.identity` + the Drive API — no custom backend. Requires a real
  OAuth Client ID to actually authenticate (see §9); the code path is
  fully wired either way.
- **Settings** — accent color, clock format, notification toggle, per-widget
  visibility, reset layout, Sync (account, Sync now, last-synced time, status)
- Empty states, skeleton loaders, visible focus rings, `prefers-reduced-motion`
  support, keyboard-trapped modals with focus restored on close

**Not yet built** (see Roadmap): command-palette *actions* (beyond search),
a real (non-placeholder) OAuth Client ID.

## 3. Screenshots

_Add screenshots here before publishing — `chrome://extensions` → load unpacked →
open a new tab → capture._

## 4. Architecture

- **React 18 + TypeScript (strict) + Vite**, bundled for MV3 by
  `@crxjs/vite-plugin` — this handles manifest generation, service-worker
  bundling, and HMR inside an extension context, which vanilla Vite doesn't.
- **State:** Zustand. Each domain (todos, shortcuts, settings, widget layout,
  stopwatch, timer, pomodoro, snippets, notes) is an independent store, not
  one shared graph — this app is a set of parallel widgets, not an
  interconnected app, so Redux-style single-store ceremony isn't earning
  its keep here.
- **Persistence:** a single `StorageService` wraps `chrome.storage` — nothing
  else calls the Chrome storage API directly. Repositories (`TodoRepository`,
  `ShortcutRepository`, `SettingsRepository`, `WidgetRepository`, and more)
  sit on top, so the backend is swappable later without touching stores or
  components.
- **Widgets:** a `WidgetRegistry` (`src/widgets/registry.ts`) maps a `type`
  string to `{ title, icon, component }`. `BentoGrid` renders purely from the
  `WidgetConfig[]` in the widget store, using each widget's explicit `x`/`y`
  (not DOM order) — layout is data, not markup.
- **Reminders/countdowns:** `TaskAlarmService` and `CountdownAlarmService`
  schedule `chrome.alarms` entries; the background service worker
  (`src/background/index.ts`) is the only place an alarm firing turns into
  a notification (and, for Timer/Pomodoro, the authoritative state write).
  This is deliberate — alarms persist across service-worker restarts and
  browser relaunches, a `setTimeout` in a page context does not. Pomodoro's
  phase-transition logic (`services/pomodoro/transition.ts`) is a pure
  function called from both the store and the background worker, so a
  phase change looks identical whether the tab was open when it happened
  or not.
- **Dashboard customization:** `useDragResize` converts pointer movement
  into grid-column/row deltas and writes a preview rect to local state;
  `useWidgetStore.updateWidgetRect` commits it only if the resulting
  position doesn't overlap another visible widget (checked in
  `utils/grid.ts`) — otherwise the change is rejected and the tile reverts.
  This is deliberately not a full collision-avoidance grid engine (like
  react-grid-layout): with nine widgets on a fixed 12-column grid, refusing
  an invalid drop is simpler and cheaper than auto-rearranging everything
  else, and it skips the dependency.
- **Productivity:** derived from real data, not simulated — task completion
  is read straight from `TodoRepository` (which already timestamps
  `completedAt`); focus time and Pomodoro session counts come from a small
  rolling log (`ProductivityRepository`) appended to at the same point a
  Pomodoro focus phase completes, in both the background-alarm path and
  the manual-skip path.
- **GitHub widget:** intentionally mock data behind a real interface
  (`GitHubService.getActivity()`) — per the brief, no GitHub login is
  required for this MVP, but `GitHubWidget` only depends on that function's
  return shape, so swapping the mock body for an authenticated API call
  later doesn't touch the widget.

## 5. Project structure

```
src/
  background/          service worker — alarms → notifications, only
  components/ui/        Card, Button, IconButton, Modal, EmptyState, Badge
  components/layout/    Header, BackgroundLayer, BentoGrid, WidgetTile, HiddenWidgetsTray
  components/search/    CommandPalette (Cmd/Ctrl+K)
  widgets/<name>/        one folder per widget (component + hooks + subcomponents)
  widgets/registry.ts    the single place widgets are registered
  store/                 zustand slices, one per domain
  services/storage/      StorageService + repositories
  services/alarms/       TaskAlarmService, CountdownAlarmService (Timer/Pomodoro)
  services/notifications/
  services/pomodoro/     pure phase-transition logic, shared by store + background
  services/auth/         GoogleAuthService (chrome.identity wrapper)
  services/sync/         DriveSyncService, SyncEngine
  hooks/                 useKeyboardShortcut, useDragResize
  utils/ types/ config/ styles/
  pages/NewTab/          entry point + page shell
  pages/Settings/        settings panel + SyncSection
  test/                  chromeMock.ts — shared chrome.storage mock for tests

public/
  icons/                 16/32/48/128 png, generated placeholder mark
  backgrounds/           placeholder background image

store-assets/            generated small promo tile for the Web Store listing
manifest.config.ts       MV3 manifest, single source of truth for permissions
vitest.config.ts         standalone test config (kept separate from vite.config.ts)
PRIVACY_POLICY.md        data-handling policy for the Web Store listing
STORE_LISTING.md         draft listing copy
```

## 6. Local development

```bash
npm install
npm run dev
```

`@crxjs/vite-plugin` gives you HMR inside the extension — load the `dist/`
folder once (see below) and most edits apply without a manual reload.

## 7. Build instructions

```bash
npm run build
```

Type-checks (`tsc -b`) then bundles to `dist/`.

## 8. Load extension into Chrome

1. `npm run build` (or `npm run dev` for a live-reloading dev build)
2. Open `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**, select the `dist/` folder
5. Open a new tab

`chrome_url_overrides.newtab` in the manifest is what redirects Chrome's New
Tab page to `newtab.html` — no extra permission needed for the override itself.

## 9. Google OAuth setup

The sync code is fully wired (`GoogleAuthService`, `DriveSyncService`,
`SyncEngine`, the Sync section in Settings) but ships with a **placeholder**
Client ID — `chrome.identity.getAuthToken` will fail until you swap it for a
real one:

1. In [Google Cloud Console](https://console.cloud.google.com/), create an
   OAuth 2.0 Client ID of type **Chrome Extension**. It needs your
   extension's ID, which Chrome assigns when you first load it unpacked
   (`chrome://extensions` → DevNest → the ID under its name).
2. Enable the **Google Drive API** and **Google People API** (or the
   userinfo endpoints) for the Cloud project.
3. Replace `oauth2.client_id` in `manifest.config.ts` with the real Client ID.
4. Rebuild (`npm run build`) and reload the unpacked extension.

No client secret is needed — this OAuth flow is browser-side only, and a
Chrome-extension Client ID isn't meant to be kept secret (it's baked into
the public manifest either way).

## 10. Sync architecture (implemented)

Data syncs into the signed-in Google account's **Drive `appDataFolder`** — a
hidden, per-application, per-user space in the user's own Drive — rather than
a custom backend service. That means: no server to run or pay for, data is
genuinely the user's own (they can revoke access from their Google account
at any time), and the extension only ever needs the narrow `drive.appdata`
scope, not full Drive access.

```
Local State (chrome.storage.local, source of truth offline)
    ↓ writes queue while offline
Sync Engine (per-record updatedAt comparison)
    ↓
Drive appDataFolder (source of truth online)
    ↓
Other Chrome installs, same Google account
```

Conflict resolution: last-write-wins per record, compared on `updatedAt`
(`SyncEngine.mergeById`, covering todos/shortcuts/notes/snippets). The
singleton config objects (settings, widget layout, Pomodoro settings)
merge as a whole rather than field-by-field: remote wins only if another
device pushed since this device's last successful sync, otherwise local
wins. This is intentionally simple for a single-user, small-number-of-devices
tool; a CRDT or operational-transform approach would be solving a problem
this product doesn't have yet. One known gap worth flagging: there are no
delete tombstones, so a record deleted on one device can reappear after a
sync from a device that hasn't seen the delete yet — acceptable for this
scale, worth fixing before relying on it heavily.

## 11. Permissions explanation

| Permission | Why |
|---|---|
| `storage` | persist tasks, shortcuts, settings, and layout |
| `alarms` | schedule task-due and timer/Pomodoro reminders that survive restarts |
| `notifications` | show the task-due / timer-complete / phase-complete notification |
| `identity` | Google sign-in for Sync — only requested interactively when the user clicks "Sign in with Google" |
| host permission: `https://www.googleapis.com/*` | talk to the Drive and account-info APIs during Sync — nowhere else |

Every permission maps to a shipped feature; none are speculative. See
`PRIVACY_POLICY.md` for the full data-handling explanation the Web Store
listing points to.

## 12. Environment variables

None required to build or run. The Google OAuth Client ID (see §9) lives in
`manifest.config.ts`, not a `.env` file — it's baked into the built manifest
either way, and it's a public identifier, not a secret.

## 13. Testing

```bash
npm test
```

Runs Vitest (`vitest.config.ts` — deliberately separate from `vite.config.ts`
so tests don't need the crx plugin's extension-build context). Current
coverage: 55 tests across `src/utils/date.test.ts`, `grid.test.ts`,
`time.test.ts`, `productivity.test.ts`, `services/pomodoro/transition.test.ts`,
and repository CRUD (`TodoRepository.test.ts`, `ShortcutRepository.test.ts`)
against a hand-rolled `chrome.storage` mock (`src/test/chromeMock.ts`) — real
`chrome.*` APIs don't exist outside an extension context, so repository
tests need that mock to run at all.

Not yet covered: `SyncEngine`'s merge logic (needs a Drive API mock),
`useDragResize`'s pointer math, and component-level rendering tests (no
React Testing Library / jsdom set up yet — everything above is pure-function
or storage-layer, deliberately, to keep the test setup itself simple).

**Performance:** the initial New Tab bundle is ~237KB (~70KB gzipped);
every Developer Tools panel (18 of them) is `React.lazy`-loaded into its
own chunk (~1KB each), so opening a tool costs a small fetch, not part of
every page load. No polling anywhere — `chrome.alarms` replaces it for
anything that needs to fire later.

**Accessibility:** every icon-only control goes through `<IconButton>`,
which requires an `aria-label`. `Modal` traps Tab focus while open and
restores focus to whatever opened it on close. Global `:focus-visible`
styling and `prefers-reduced-motion` support are in `globals.css`. Not yet
done: a full WCAG contrast audit and screen-reader testing pass with an
actual AT (NVDA/VoiceOver) rather than just semantic-HTML review.

## 14. Production build

```bash
npm run build
```

Outputs a clean `dist/` — that's the folder to zip for the Web Store or load
unpacked for local use.

## 15. Chrome Web Store publishing

1. `npm run build`
2. Zip the **contents** of `dist/` (not the folder itself) and upload via the
   [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. **Screenshots (still needed, not included):** load the unpacked extension,
   open a real new tab, and capture 1–5 screenshots at 1280×800 or 640×400.
   `store-assets/small-promo-tile-440x280.png` is generated brand artwork for
   the optional small promo tile slot — it is *not* a substitute for real
   product screenshots, and the Web Store's policy requires the screenshots
   themselves to be genuine.
4. Listing copy is drafted in `STORE_LISTING.md` — short description,
   detailed description, and category, ready to paste into the dashboard.
5. Host `PRIVACY_POLICY.md` somewhere public (a GitHub Pages link off this
   repo works) and link it in the dashboard's privacy-practices tab. Fill in
   the `[fill in before publishing]` placeholders in that file first — a
   real last-updated date and contact email.
6. In the dashboard's **Permissions justification** fields, use §11's table
   almost verbatim — it already maps every requested permission to the
   feature that needs it.
7. Set a real `oauth2.client_id` (§9) before submitting if Sync should work
   for real users — a placeholder Client ID will make sign-in fail for
   everyone who installs it.

## 16. Roadmap

- ~~**Phase 3** — Stopwatch, Timer, Pomodoro~~ — done
- ~~**Phase 4** — Developer utilities, Snippets, Notes~~ — done
- ~~**Phase 5 (partial)** — keyboard shortcuts (`n`, `s`, `t`), command
  palette extended to snippets/notes/tools~~ — done; full command-palette
  *actions* ("Create Task", "Start Timer" as executable commands, not just
  search results) still open
- ~~**Phase 6** — drag/resize widget customization mode~~ — done
- ~~**Phase 7** — Google sign-in + Drive `appDataFolder` sync~~ — code
  complete (§9, §10); needs a real OAuth Client ID swapped in before it
  authenticates for real users
- ~~**Phase 8** — productivity analytics, GitHub widget (mock data)~~ — done;
  swapping GitHub's mock data for a real API call is still open
- ~~**Phase 9** — test suite, performance pass, accessibility audit~~ — done
  (§13); a full WCAG contrast/AT pass and `SyncEngine`/drag-resize test
  coverage are the remaining gaps
- ~~**Phase 10** — Web Store assets~~ — privacy policy, listing copy, and
  promo art are done; real product screenshots and the actual Dashboard
  submission are steps only a human with a Chrome Web Store developer
  account can complete
