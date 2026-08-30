import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';
// Central place for the extension manifest. Keep permissions minimal —
// add a new permission only when a shipped feature needs it, and note
// why in a comment next to it.
export default defineManifest({
    manifest_version: 3,
    name: 'DevNest — Software Engineer Command Center',
    short_name: 'DevNest',
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
    ],
    // No host_permissions in this phase. identity + Drive appDataFolder host
    // permission are added in the Google-sync phase, not before it's built.
});
