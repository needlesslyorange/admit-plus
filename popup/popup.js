/**
 * Admit+ Popup Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const contrastToggle = document.getElementById('contrast-toggle');
  const forumJumpToggle = document.getElementById('forum-jump-toggle');
  const themePills = document.querySelectorAll('.theme-pill');

  const defaultSettings = {
    darkModeEnabled: true,
    currentTheme: 'midnight',
    highContrastEnabled: false,
    forumJumpEnabled: true
  };

  // Load current settings
  chrome.storage.sync.get(defaultSettings, (settings) => {
    darkModeToggle.checked = settings.darkModeEnabled;
    contrastToggle.checked = settings.highContrastEnabled || false;
    forumJumpToggle.checked = settings.forumJumpEnabled;
    setActiveThemePill(settings.currentTheme || 'midnight');
  });

  // Dark mode switch handler
  darkModeToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.sync.set({ darkModeEnabled: isEnabled }, () => {
      notifyActiveTab({ darkModeEnabled: isEnabled });
    });
  });

  // High contrast switch handler
  contrastToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.sync.set({ highContrastEnabled: isEnabled }, () => {
      notifyActiveTab({ highContrastEnabled: isEnabled });
    });
  });

  // Forum jump switch handler
  forumJumpToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.sync.set({ forumJumpEnabled: isEnabled }, () => {
      notifyActiveTab({ forumJumpEnabled: isEnabled });
    });
  });

  // Theme pill selection handler
  themePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const selectedTheme = pill.getAttribute('data-theme');
      setActiveThemePill(selectedTheme);
      chrome.storage.sync.set({ currentTheme: selectedTheme }, () => {
        notifyActiveTab({ currentTheme: selectedTheme });
      });
    });
  });

  function setActiveThemePill(themeName) {
    themePills.forEach((pill) => {
      if (pill.getAttribute('data-theme') === themeName) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  function notifyActiveTab(changes) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'ADMITPLUS_SETTINGS_UPDATED',
          changes
        }).catch(() => {});
      }
    });
  }
});
