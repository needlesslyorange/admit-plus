// Background Service Worker for Admit+
const DEFAULT_SETTINGS = {
  darkModeEnabled: true,
  currentTheme: 'midnight',
  highContrastEnabled: false,
  forumJumpEnabled: true
};

// Initialize settings
chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get(null);
  const toSet = {};

  for (const [key, val] of Object.entries(DEFAULT_SETTINGS)) {
    if (existing[key] === undefined) {
      toSet[key] = val;
    }
  }

  if (Object.keys(toSet).length > 0) {
    await chrome.storage.sync.set(toSet);
  }

  // Minimal context menu
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'admitplus_toggle_dark',
      title: '🌙 Toggle Admit.org Dark Mode',
      contexts: ['all']
    });
  });
});

// Handle context menus
chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === 'admitplus_toggle_dark') {
    const { darkModeEnabled = true } = await chrome.storage.sync.get('darkModeEnabled');
    const newState = !darkModeEnabled;
    await chrome.storage.sync.set({ darkModeEnabled: newState });
    notifyTabsOfStateChange({ darkModeEnabled: newState });
  }
});

// Handle keyboard command (Alt+Shift+D)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-dark-mode') {
    const { darkModeEnabled = true } = await chrome.storage.sync.get('darkModeEnabled');
    const newState = !darkModeEnabled;
    await chrome.storage.sync.set({ darkModeEnabled: newState });
    notifyTabsOfStateChange({ darkModeEnabled: newState });
  }
});

// Notify open Admit.org tabs of changes
async function notifyTabsOfStateChange(changes) {
  try {
    const tabs = await chrome.tabs.query({ url: ['*://admit.org/*', '*://*.admit.org/*'] });
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'ADMITPLUS_SETTINGS_UPDATED', changes }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('Error broadcasting state change:', err);
  }
}
