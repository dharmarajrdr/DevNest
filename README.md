<div align="center">

# 🦅 DevNest

### The Ultimate Developer Command Center for Chrome New Tab

**Transform your browser's new tab page into a high-performance, distraction-free developer workspace.**  
Tasks, developer utilities, focus timers, GitHub & LeetCode streaks, technical bookshelf, and quick links — all in a customizable Bento Grid.

<!-- Badges Section (Using markdown-badges / shields.io) -->
<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome Extension Manifest V3" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License MIT" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/Offline-100%25_Ready-success?style=flat-square&logo=offline&logoColor=white" alt="Offline Ready" />
  <img src="https://img.shields.io/badge/Privacy-100%25_Local-blueviolet?style=flat-square" alt="Privacy First" />
</p>

</div>

---

## About DevNest

Every software engineer opens tens or hundreds of new tabs every day. By default, browser new tab pages are filled with sponsored links, distractions, and generic search bars.

**DevNest replaces your Chrome New Tab page with an all-in-one Developer Command Center.**

Designed with an ultra-clean dark aesthetic, DevNest brings together your daily task list, focus timers, documentation shortcuts, code snippets, git/docker cheat sheets, technical blogs, and developer utilities (Diff Viewer, JSON Formatter, JWT Decoder, Regex Tester) into a modular, draggable **Bento Grid**.

> [!NOTE] **100% Privacy & Offline-First**
DevNest operates completely locally within your browser. No external tracking, no accounts required, and no telemetry sent to remote servers.

---

## Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-orange?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/Lucide_Icons-F05032?style=for-the-badge&logo=feather&logoColor=white" alt="Lucide" />
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/Google_Chrome-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Google Chrome" />
</p>

- **Frontend Core**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Zustand](https://github.com/pmndrs/zustand)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/)
- **Bundler & Build Tooling**: [Vite](https://vitejs.dev/), [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)
- **Testing**: [Vitest](https://vitest.dev/), mock Chrome extension API sandbox
- **Chrome APIs**: `chrome.storage.local`, `chrome.storage.sync`, `chrome.alarms`, `chrome.notifications`

---

### Prerequisites

- [Node.js](https://nodejs.org/) (version `18.0.0` or higher)
- [npm](https://www.npmjs.com/) (or `pnpm` / `yarn`)
- Google Chrome or any Chromium-based browser (Brave, Edge, Arc, Opera)

### Installation & Build

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/DevNest.git
   cd DevNest
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the production extension bundle**:
   ```bash
   npm run build
   ```
   *This compiles TypeScript and builds all optimized static assets into the `dist/` directory.*

---

### Loading Extension in Chrome

1. Open Google Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the `dist/` folder located in your cloned `DevNest` directory.
5. Open a **New Tab** (`Ctrl + T` or `Cmd + T`) to launch DevNest! 🎉

---

### Development with HMR

For live code editing with instant Hot Module Replacement (HMR) inside Chrome:

```bash
npm run dev
```

Load the `dist/` folder once in `chrome://extensions/`. Any changes saved in `src/` will automatically reload the extension in real time.

---

## Contributing

Contributions, issues, and feature requests are very welcome!

1. **Fork the Project**
   ```bash
   git clone https://github.com/dharmarajrdr/DevNest.git
   cd DevNest
   ```

2. **Create your Feature Branch**:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes**:
   ```bash
   git commit -m "feat: add AmazingFeature to devtools"
   ```
4. **Push to the Branch**:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ for developers by developers. <br /> Do ⭐ the project if you find it helpful!</sub>
</div>

