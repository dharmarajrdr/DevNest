# DevTab

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
- **Settings** — accent color, clock format, notification toggle, per-widget
  visibility, reset layout
- Empty states, skeleton loaders, visible focus rings, `prefers-reduced-motion`
  support

**Not yet built** (see Roadmap): command-palette *actions* (beyond search),
drag/resize widget customization, productivity analytics, GitHub widget,
Google account sync.

## 3. Screenshots

_Add screenshots here before publishing — `chrome://extensions` → load unpacked →
open a new tab → capture._

## 4. Architecture

- **React 18 + TypeScript (strict) + Vite**, bundled for MV3 by
  `@crxjs/vite-plugin` — this handles manifest generation, service-worker
  bundling, and HMR inside an extension context, which vanilla Vite doesn't.
- **State:** Zustand. Each domain (todos, shortcuts, settings, widget layout) is
  an independent store, not one shared graph — this app is a set of parallel
  widgets, not an interconnected app, so Redux-style single-store ceremony
  isn't earning its keep here.
- **Persistence:** a single `StorageService` wraps `chrome.storage` — nothing
  else calls the Chrome storage API directly. Repositories (`TodoRepository`,
  `ShortcutRepository`, `SettingsRepository`, `WidgetRepository`) sit on top,
  so the backend is swappable later without touching stores or components.
- **Widgets:** a `WidgetRegistry` (`src/widgets/registry.ts`) maps a `type`
  string to `{ title, icon, component }`. `BentoGrid` renders purely from the
  `WidgetConfig[]` in the widget store — layout is data, not markup.
- **Reminders:** `TaskAlarmService` schedules a `chrome.alarms` entry per task
  with a due time; the background service worker (`src/background/index.ts`)
  is the only place an alarm firing turns into a notification. This is
  deliberate — alarms persist across service-worker restarts and browser
  relaunches, a `setTimeout` in a page context does not.

## 5. Project structure

```
src/
  background/          service worker — alarm → notification, only
  components/ui/        Card, Button, IconButton, Modal, EmptyState, Badge
  components/layout/    Header, BackgroundLayer, BentoGrid
  components/search/    CommandPalette (Cmd/Ctrl+K)
  widgets/<name>/        one folder per widget (component + hooks + subcomponents)
  widgets/registry.ts    the single place widgets are registered
  store/                 zustand slices, one per domain
  services/storage/      StorageService + repositories
  services/alarms/       TaskAlarmService
  services/notifications/
  hooks/ utils/ types/ config/ styles/
  pages/NewTab/          entry point + page shell
  pages/Settings/        settings panel

public/
  icons/                 16/32/48/128 png, generated placeholder mark
  backgrounds/           placeholder background image

manifest.config.ts       MV3 manifest, single source of truth for permissions
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

## 9. Google OAuth setup (not wired yet — see Roadmap)

When the sync phase is built: create an OAuth 2.0 Client ID (type "Chrome
Extension") in Google Cloud Console, add it under a `oauth2.client_id` key in
`manifest.config.ts`, and request the `identity` permission plus the
`https://www.googleapis.com/auth/drive.appdata` scope. No client secret is
needed for the Chrome-extension OAuth flow — `chrome.identity.getAuthToken`
handles the token exchange.

## 10. Sync architecture (designed, not implemented)

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

Conflict resolution: last-write-wins per record, compared on `updatedAt`.
This is intentionally simple for a single-user, single-device-at-a-time tool;
a CRDT or operational-transform approach would be solving a problem this
product doesn't have yet.

## 11. Permissions explanation

| Permission | Why |
|---|---|
| `storage` | persist tasks, shortcuts, settings, and layout |
| `alarms` | schedule task-due reminders that survive restarts |
| `notifications` | show the task-due / timer-complete notification |

No `host_permissions`, no `<all_urls>`, no `identity` in this build — each is
added only in the phase that has a shipped feature needing it.

## 12. Environment variables

None required for this build. The sync phase will need a Google OAuth Client
ID (see §9), which should live in `manifest.config.ts`, not in a `.env` file
committed to the repo, since it's baked into the built manifest either way —
treat it as a public identifier (it is one), not a secret.

## 13. Testing

`npm test` runs Vitest. Test scaffolding isn't included in this pass —
priority candidates once added: due/overdue date logic (`src/utils/date.ts`),
repository CRUD (`TodoRepository`, `ShortcutRepository`), and alarm scheduling
edge cases (past due dates, disabled notifications).

## 14. Production build

```bash
npm run build
```

Outputs a clean `dist/` — that's the folder to zip for the Web Store or load
unpacked for local use.

## 15. Chrome Web Store publishing

1. `npm run build`
2. Zip the **contents** of `dist/` (not the folder itself)
3. Add real screenshots (§3) and a store listing description
4. Upload via the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
5. Fill in the privacy practices tab honestly against §11 — this build's
   permission set is narrow enough to make that section short

## 16. Roadmap

- ~~**Phase 3** — Stopwatch, Timer, Pomodoro~~ — done
- ~~**Phase 4** — Developer utilities, Snippets, Notes~~ — done
- ~~**Phase 5 (partial)** — keyboard shortcuts (`n`, `s`, `t`), command
  palette extended to snippets/notes/tools~~ — done; full command-palette
  *actions* ("Create Task", "Start Timer" as executable commands, not just
  search results) still open
- **Phase 6** — drag/resize widget customization mode
- **Phase 7** — Google sign-in + Drive `appDataFolder` sync (architecture in §10)
- **Phase 8** — productivity analytics, GitHub widget (mock data → real API)
- **Phase 9** — test suite, performance pass, accessibility audit
- **Phase 10** — Web Store assets and submission
