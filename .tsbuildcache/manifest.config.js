import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';
// Central place for the extension manifest. Keep permissions minimal —
// add a new permission only when a shipped feature needs it, and note
// why in a comment next to it.
export default defineManifest({
    manifest_version: 3,
    name: 'DevTab',
    short_name: 'DevTab',
    version: pkg.version,
    description: "Replaces new tab with a developer's dashboard: tasks, shortcuts, and time tools in one Bento Grid.",
    icons: {
        16: 'public/icons/icon16.png',
        32: 'public/icons/icon32.png',
        48: 'public/icons/icon48.png',
        128: 'public/icons/icon128.png',
    },
    chrome_url_overrides: {
        newtab: 'newtab.html',
    },
    background: {
        service_worker: 'src/background/index.ts',
        type: 'module',
    },
    permissions: [
        'storage', // persist todos/shortcuts/settings locally + small config via sync
        'alarms', // schedule task due-time reminders that survive tab/browser restarts
        'notifications', // surface due-task and timer-complete notifications
        'identity', // Google sign-in (chrome.identity.getAuthToken) for account sync
    ],
    host_permissions: [
        'https://www.googleapis.com/*', // Drive appDataFolder + userinfo
        'https://api.github.com/*', // GitHub API
        'https://github-contributions-api.jogruber.de/*', // GitHub contributions calendar
        'https://leetcode.com/*', // LeetCode GraphQL & public endpoints
        'https://leetcode-stats-api.herokuapp.com/*', // LeetCode stats mirror
        'https://alfa-leetcode-api.onrender.com/*', // LeetCode stats fallback
        'https://*/*', // Favicons and external developer endpoints
    ],
    oauth2: {
        // Placeholder — replace with a real OAuth 2.0 Client ID (type "Chrome
        // Extension") from Google Cloud Console before Sign in with Google will
        // work. See README §9. Not a secret: this ID is baked into the built
        // manifest and is meant to be public, the way it works for every
        // Chrome-extension OAuth flow.
        client_id: 'YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com',
        scopes: [
            'https://www.googleapis.com/auth/drive.appdata',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ],
    },
});
