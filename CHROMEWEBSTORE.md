# Chrome Web Store Listing — Admit+

**Extension Name**: Admit+ | Dark Mode & Forum Jump for Admit.org  
**Short Name**: Admit+  
**Version**: 1.2.0  
**Category**: Productivity / Accessibility  
**Last Updated**: 2026-08-15  

---

## Store Listing Details

### Summary (132 chars max)
Dark Mode with 5 theme palettes, high contrast mode, and 1-click quick jumps between Cycle Results and School Forums on Admit.org.

### Detailed Description
**Admit+** elevates your **Admit.org** experience with a sleek Dark Mode engine and 1-click quick navigation between admissions Cycle Results and School Discussion Forums.

🌙 **Key Features:**
- **5 Curated Dark Theme Palettes**: Choose between *Midnight* (deep navy charcoal), *OLED Pitch Black* (pure #000000 for OLED screens), *Zinc Slate* (soft neutral gray), *Warm Mocha* (warm coffee tones), and *Deep Indigo*.
- **1-Click School Quick Jump**:
  - Instantly jump from any school's **Cycle Results** to its active **School Forum** thread with a single click (`💬 School Forum ↗`).
  - Jump right back from the **School Forum** to the school's **Cycle Results** (`📊 Cycle Results ↗`).
  - Seamless client-side transitions with zero screen tear and zero white flash.
- **High Contrast Mode**: Boost border sharpness and outline contrast for cards and discussion threads.
- **Instant Keyboard Shortcut**: Press `Alt + Shift + D` (or `Option + Shift + D` on macOS) anywhere on Admit.org to toggle Dark Mode immediately.
- **Zero Layout Distortion**: Native CSS custom property theming that preserves all table structures, charts, graphs, and drawers without shifting elements or breaking sticky headers.
- **Privacy First & 100% Local**: No tracking, no telemetry, and no remote data collection. All settings stay securely in your browser's local sync storage.

---

## Permissions Justification

| Permission / Host | Justification |
|-------------------|---------------|
| `storage` | Required to store and sync user preferences (dark mode toggle, theme palette selection, high contrast mode, and quick jump button toggle) across browser sessions. |
| `activeTab` | Required to apply theme changes to the active Admit.org tab when pressing the keyboard shortcut or toggling options in the extension popup. |
| `tabs` | Required to locate and notify open Admit.org tabs when theme settings are adjusted in the popup, updating styles live without requiring manual page refreshes. |
| `contextMenus` | Required to provide a right-click context menu shortcut to toggle Dark Mode directly from the webpage. |
| `*://admit.org/*`, `*://*.admit.org/*` | Required to inject dark mode stylesheets and quick navigation buttons specifically into Admit.org pages. No other domains are accessed. |

---

## Privacy & Single-Purpose Policy

- **Single Purpose**: Enhances accessibility and navigation on Admit.org through custom Dark Mode theming and 1-click school forum/cycle results navigation.
- **Data Collection**: **None**. Admit+ does not collect, log, transmit, or share any personal data, browsing history, applicant stats, or analytics.
- **Remote Code**: **None**. All CSS and JavaScript execute 100% locally from the packaged extension without any external scripts or CDN dependencies.

---

## Packaging Instructions

Create the submission `.zip` file excluding dev files:
```powershell
Compress-Archive -Path manifest.json, background.js, icons, content, popup -DestinationPath admit-plus-v1.2.0.zip -Force
```
