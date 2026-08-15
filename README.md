<div align="center">

# 🌙 Admit+

**Elevate your Admit.org experience with high-performance Dark Mode & 1-Click School Jump.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](manifest.json)
[![Chrome](https://img.shields.io/badge/Chrome-Supported-4285F4.svg?logo=google-chrome&logoColor=white)](#chrome--brave--edge--opera)
[![Firefox](https://img.shields.io/badge/Firefox-Supported-FF7139.svg?logo=firefox&logoColor=white)](#mozilla-firefox)

</div>

---

## ✨ Features

- 🎨 **5 Curated Dark Theme Palettes**:
  - **Midnight**: Deep navy charcoal with clean contrast (Default).
  - **OLED**: Pitch black (`#000000`) designed for OLED and AMOLED displays.
  - **Slate**: Neutral zinc graphite for minimum eye strain.
  - **Mocha**: Warm espresso coffee tones.
  - **Indigo**: Deep twilight purple & blue accents.
- ⚡ **1-Click School Quick Jump**:
  - Instantly jump from any school's **Cycle Results** to its active **School Forum** (`💬 School Forum ↗`).
  - Jump back from the **School Forum** to the school's **Cycle Results** (`📊 Cycle Results ↗`).
  - Powered by client-side SPA routing with **zero white flash** and **zero screen tearing**.
- 🔲 **High Contrast Mode**: Sharpen card borders, thread dividers, and inputs with higher outline definition.
- ⌨️ **Instant Keyboard Shortcut**: Press `Alt + Shift + D` (or `Option + Shift + D` on macOS) anywhere on Admit.org to toggle Dark Mode.
- 🔒 **Privacy First & 100% Local**: No tracking, no analytics, no external servers. All preferences stay in your browser's local sync storage.

---

## 📥 Installation

### Option 1: Install from GitHub Releases (Quickest)

1. Download the latest `.zip` for your browser from the **[Releases](https://github.com/needlesslyorange/admit-plus/releases)** page:
   - For **Chrome / Brave / Edge / Opera**: Download `admit-plus-chrome.zip`
   - For **Firefox**: Download `admit-plus-firefox.zip`
2. Extract the downloaded `.zip` file into a folder on your computer.

#### Chrome / Brave / Edge / Opera:
1. Open your browser and go to `chrome://extensions` (or `brave://extensions`, `edge://extensions`).
2. Turn ON **"Developer mode"** in the top right corner.
3. Click **"Load unpacked"** in the top left corner.
4. Select the extracted folder.

#### Mozilla Firefox:
1. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
2. Click **"Load Temporary Add-on..."**.
3. Select the `manifest.json` file from the extracted folder (or directly select `admit-plus-firefox.zip`).

---

### Option 2: Clone & Run from Source

```bash
# Clone the repository
git clone https://github.com/needlesslyorange/admit-plus.git
cd admit-plus

# Build the packages (optional, requires Node.js)
node build.js
```

Then load the root folder in `chrome://extensions` or the `firefox_build/` folder in Firefox `about:debugging`.

---

## ⚙️ Usage

- **Toggle Dark Mode**: Click the extension icon in your browser toolbar or press `Alt + Shift + D`.
- **Change Themes**: Open the extension popup to switch between *Midnight*, *OLED*, *Slate*, *Mocha*, and *Indigo*.
- **High Contrast**: Toggle the *High Contrast* switch in the popup to sharpen all container borders.
- **Navigate School Pages**: When viewing any medical school on Admit.org, click the yellow **`💬 School Forum ↗`** or blue **`📊 Cycle Results ↗`** buttons in the header.

---

## 🛠️ Tech Stack & Architecture

- **Manifest V3**: Compliant with latest WebExtension standards.
- **Zero-Flash Painting**: Custom frame-0 style hydration prevents white flashes during server-side rendered route transitions.
- **Pure CSS Custom Property Theming**: Native variable mapping ensures charts, graphs, tables, and drawers render cleanly without layout distortion.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
