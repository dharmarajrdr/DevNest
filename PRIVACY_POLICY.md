# DevNest Privacy Policy

*Last updated: [fill in the actual date before publishing]*

DevNest is a Chrome New Tab replacement for developers. This document
explains what data DevNest accesses, where it's stored, and who can see it.

## Summary

- Your tasks, shortcuts, notes, snippets, and settings are stored **only
  on your own device** by default, using Chrome's built-in storage APIs
  (`chrome.storage.local` and `chrome.storage.sync`).
- DevNest does not operate a server, and does not send your data to
  DevNest's developer or to any third party.
- If you choose to turn on **Sync** (Settings → Sync), your data is
  copied to a hidden, app-private folder in **your own** Google Drive
  (Drive's `appDataFolder`), so it can follow you to another computer
  signed into the same Google account. This folder is invisible in your
  normal Drive view and is not accessible to any app other than DevNest.
- Signing in with Google is optional. DevNest works fully offline without it.

## What DevNest stores, and where

| Data | Where it's stored | Leaves your device? |
|---|---|---|
| Tasks, shortcuts, notes, snippets | `chrome.storage.local` (this device only) | Only if Sync is on — then also written to your Drive `appDataFolder` |
| Settings, widget layout, accent color | `chrome.storage.sync` (synced by Chrome itself across your signed-in Chrome browsers) | Handled by Chrome's own sync, per your Chrome account settings — not by DevNest |
| Your Google name, email, and profile picture | `chrome.storage.sync`, only if you sign in | Only ever sent to Google's own APIs, never to DevNest's developer |

DevNest never reads your browsing history, open tabs, or any website's
content. The only external network requests DevNest makes are, when Sync
is enabled, to `www.googleapis.com` (Google's own Drive and account-info
APIs) — nothing else.

## Permissions, and why each is requested

| Permission | Why DevNest needs it |
|---|---|
| `storage` | Save your tasks, shortcuts, notes, snippets, and settings on this device |
| `alarms` | Fire task-due and timer/Pomodoro reminders even if the New Tab page isn't open |
| `notifications` | Show those reminders as a system notification |
| `identity` | Let you sign in with Google, only when you choose to, for Sync |
| Host permission for `www.googleapis.com` | Talk to Google's Drive and account-info APIs during Sync — nowhere else |

## Removing your data

- Uninstalling the extension removes everything stored locally.
- Settings → Sync → Sign out revokes DevNest's access to your Google
  account and stops future syncing; the sync file already in your Drive
  `appDataFolder` can be removed by revoking DevNest's access at
  [myaccount.google.com/permissions](https://myaccount.google.com/permissions),
  which deletes its `appDataFolder` contents.

## Changes to this policy

If this policy changes, the "Last updated" date above will change and the
new version will be posted at the same URL used in the Chrome Web Store
listing.

## Contact

[fill in a contact email before publishing — the Chrome Web Store
developer console requires one for the privacy-practices tab]
