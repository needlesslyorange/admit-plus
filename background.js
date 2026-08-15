const DEFAULT_SETTINGS = {
  darkModeEnabled: true,
  currentTheme: 'midnight',
  highContrastEnabled: false,
  forumJumpEnabled: true
};

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

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'admitplus_toggle_dark',
      title: 'Toggle Dark Mode',
      contexts: ['all']
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === 'admitplus_toggle_dark') {
    const { darkModeEnabled = true } = await chrome.storage.sync.get('darkModeEnabled');
    const newState = !darkModeEnabled;
    await chrome.storage.sync.set({ darkModeEnabled: newState });
    notifyTabsOfStateChange({ darkModeEnabled: newState });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-dark-mode') {
    const { darkModeEnabled = true } = await chrome.storage.sync.get('darkModeEnabled');
    const newState = !darkModeEnabled;
    await chrome.storage.sync.set({ darkModeEnabled: newState });
    notifyTabsOfStateChange({ darkModeEnabled: newState });
  }
});

async function notifyTabsOfStateChange(changes) {
  try {
    const tabs = await chrome.tabs.query({ url: ['*://admit.org/*', '*://*.admit.org/*'] });
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'ADMITPLUS_SETTINGS_UPDATED', changes }).catch(() => {});
      }
    }
  } catch (err) {
    console.error(err);
  }
}
