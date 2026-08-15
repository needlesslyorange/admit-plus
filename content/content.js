/**
 * Admit+ Content Script
 * Clean, lightweight, loop-free Dark Mode, High Contrast, & Bidirectional School Jump Buttons
 * Zero-Flash Transition Engine
 */

(function () {
  // 0. Anti-Flash Zero-Latency Style & Meta Injection (Paints document dark on Frame 0)
  const localDark = localStorage.getItem('admitplus-dark');
  const localTheme = localStorage.getItem('admitplus-theme') || 'midnight';
  const localContrast = localStorage.getItem('admitplus-contrast');

  const isDarkInit = localDark !== 'false';

  if (isDarkInit) {
    if (!document.getElementById('admitplus-anti-flicker')) {
      const antiFlicker = document.createElement('style');
      antiFlicker.id = 'admitplus-anti-flicker';
      antiFlicker.textContent = `
        html.admitplus-dark {
          display: block !important;
          background-color: #090d16 !important;
          color-scheme: dark !important;
        }
        html.admitplus-dark body {
          background-color: #090d16 !important;
          color-scheme: dark !important;
        }
      `;
      (document.head || document.documentElement).appendChild(antiFlicker);
    }
    document.documentElement.classList.add('admitplus-dark');
    document.documentElement.setAttribute('data-admitplus-theme', localTheme);
    if (localContrast === 'true') {
      document.documentElement.setAttribute('data-admitplus-contrast', 'high');
    }

    // Update or add theme-color meta tag
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', '#090d16');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#090d16';
      (document.head || document.documentElement).appendChild(meta);
    }
  }

  let settings = {
    darkModeEnabled: isDarkInit,
    currentTheme: localTheme,
    highContrastEnabled: localContrast === 'true',
    forumJumpEnabled: true
  };

  // 1. Load verified user settings from chrome.storage.sync
  chrome.storage.sync.get(settings, (loaded) => {
    if (chrome.runtime.lastError) return;
    settings = { ...settings, ...loaded };
    syncLocalStorage();
    applyTheme();
    checkJumpButtons();
  });

  // 2. Listen for live changes from popup or shortcut
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      if (changes.darkModeEnabled !== undefined) {
        settings.darkModeEnabled = changes.darkModeEnabled.newValue;
      }
      if (changes.currentTheme !== undefined) {
        settings.currentTheme = changes.currentTheme.newValue;
      }
      if (changes.highContrastEnabled !== undefined) {
        settings.highContrastEnabled = changes.highContrastEnabled.newValue;
      }
      if (changes.forumJumpEnabled !== undefined) {
        settings.forumJumpEnabled = changes.forumJumpEnabled.newValue;
      }
      syncLocalStorage();
      applyTheme();
      checkJumpButtons();
    }
  });

  function syncLocalStorage() {
    try {
      localStorage.setItem('admitplus-dark', settings.darkModeEnabled ? 'true' : 'false');
      localStorage.setItem('admitplus-theme', settings.currentTheme || 'midnight');
      localStorage.setItem('admitplus-contrast', settings.highContrastEnabled ? 'true' : 'false');
    } catch (e) {}
  }

  function applyTheme() {
    const html = document.documentElement;
    if (!html) return;

    if (settings.darkModeEnabled) {
      if (!html.classList.contains('admitplus-dark')) {
        html.classList.add('admitplus-dark');
      }
      const theme = settings.currentTheme || 'midnight';
      if (html.getAttribute('data-admitplus-theme') !== theme) {
        html.setAttribute('data-admitplus-theme', theme);
      }
      if (settings.highContrastEnabled) {
        html.setAttribute('data-admitplus-contrast', 'high');
      } else {
        html.removeAttribute('data-admitplus-contrast');
      }
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', '#090d16');
    } else {
      if (html.classList.contains('admitplus-dark')) {
        html.classList.remove('admitplus-dark');
      }
      if (html.hasAttribute('data-admitplus-theme')) {
        html.removeAttribute('data-admitplus-theme');
      }
      if (html.hasAttribute('data-admitplus-contrast')) {
        html.removeAttribute('data-admitplus-contrast');
      }
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', '#f6f6f6');
    }
  }

  // Keyboard shortcut: Alt + Shift + D
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
      e.preventDefault();
      const newState = !settings.darkModeEnabled;
      chrome.storage.sync.set({ darkModeEnabled: newState });
    }
  });

  // Direct message listener
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ADMITPLUS_SETTINGS_UPDATED') {
      settings = { ...settings, ...message.changes };
      syncLocalStorage();
      applyTheme();
      checkJumpButtons();
      sendResponse({ status: 'ok' });
    }
    return true;
  });

  /* ==========================================================================
     BIDIRECTIONAL QUICK JUMP BUTTONS (CLIENT-SIDE SPA ROUTING)
     1. /cycle-results/<school-slug> -> /school-forums/<school-slug>/2026/1
     2. /school-forums/<school-slug>/... -> /cycle-results/<school-slug>
     ========================================================================== */

  function navigateClientSide(targetUrl) {
    // Dispatch click on a detached standalone anchor to let Next.js client router handle it
    const link = document.createElement('a');
    link.href = targetUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function checkJumpButtons() {
    if (!settings.forumJumpEnabled) {
      removeAllJumpButtons();
      return;
    }

    const path = window.location.pathname;

    // A. School Cycle Results Page -> Inject "School Forum ↗"
    if (path.includes('/cycle-results/')) {
      const match = path.match(/\/cycle-results\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        injectSchoolForumButton(match[1]);
        return;
      }
    }

    // B. School Forum Page -> Inject "Cycle Results ↗"
    if (path.includes('/school-forums/')) {
      const match = path.match(/\/school-forums\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        injectCycleResultsButton(match[1]);
        return;
      }
    }

    // Not on a single-school page -> Clean up buttons
    removeAllJumpButtons();
  }

  function injectSchoolForumButton(schoolSlug) {
    const year = getActiveYear();
    const targetUrl = `/school-forums/${schoolSlug}/${year}/1`;

    const existing = document.getElementById('admitplus-school-forum-btn');
    if (existing) {
      if (existing.getAttribute('data-target-url') !== targetUrl) {
        existing.setAttribute('data-target-url', targetUrl);
        existing.href = targetUrl;
      }
      return;
    }

    const headerTitle = document.querySelector(
      'main h1, main h2, [class*="schoolName"], [class*="schoolInfo"], [class*="SchoolHeader"]'
    );
    if (!headerTitle) return;

    const btn = document.createElement('a');
    btn.id = 'admitplus-school-forum-btn';
    btn.className = 'admitplus-school-forum-btn';
    btn.href = targetUrl;
    btn.setAttribute('data-target-url', targetUrl);
    btn.title = `Open ${schoolSlug.replace(/-/g, ' ')} Forum`;
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>School Forum ↗</span>
    `;

    // Stop propagation to prevent triggering parent /school-rankings link!
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigateClientSide(targetUrl);
    });

    const parent = headerTitle.parentElement;
    if (parent) {
      if (headerTitle.tagName === 'H1' || headerTitle.tagName === 'H2') {
        headerTitle.style.display = 'inline-flex';
        headerTitle.style.alignItems = 'center';
        headerTitle.style.flexWrap = 'wrap';
        headerTitle.style.gap = '10px';
        headerTitle.appendChild(btn);
      } else {
        parent.appendChild(btn);
      }
    }
  }

  function injectCycleResultsButton(schoolSlug) {
    const targetUrl = `/cycle-results/${schoolSlug}`;

    const existing = document.getElementById('admitplus-cycle-results-jump-btn');
    if (existing) {
      if (existing.getAttribute('data-target-url') !== targetUrl) {
        existing.setAttribute('data-target-url', targetUrl);
        existing.href = targetUrl;
      }
      return;
    }

    // Find school title container in forum header
    const mainTitleSpan = document.querySelector(
      '[class*="n-ofEa__title"] span:first-child, [class*="titleContainer"] span:first-child, [class*="SchoolForumPage"] span:first-child, [class*="titleContainer"] h1, main h1'
    );
    const titleDiv = document.querySelector(
      '[class*="n-ofEa__title"], [class*="titleContainer"] > div, [class*="titleContainer"]'
    );

    if (!mainTitleSpan && !titleDiv) return;

    const btn = document.createElement('a');
    btn.id = 'admitplus-cycle-results-jump-btn';
    btn.className = 'admitplus-cycle-results-jump-btn';
    btn.href = targetUrl;
    btn.setAttribute('data-target-url', targetUrl);
    btn.title = `Open ${schoolSlug.replace(/-/g, ' ')} Cycle Results`;
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
      <span>Cycle Results ↗</span>
    `;

    // Stop propagation to prevent triggering parent links
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigateClientSide(targetUrl);
    });

    if (mainTitleSpan) {
      mainTitleSpan.style.display = 'inline-flex';
      mainTitleSpan.style.alignItems = 'center';
      mainTitleSpan.style.flexWrap = 'wrap';
      mainTitleSpan.style.gap = '8px';
      mainTitleSpan.appendChild(btn);
    } else if (titleDiv) {
      titleDiv.appendChild(btn);
    }
  }

  function removeAllJumpButtons() {
    const forumBtn = document.getElementById('admitplus-school-forum-btn');
    if (forumBtn) forumBtn.remove();
    const cycleBtn = document.getElementById('admitplus-cycle-results-jump-btn');
    if (cycleBtn) cycleBtn.remove();
  }

  function getActiveYear() {
    const btn = document.querySelector(
      'button[data-active="true"], button[data-state="active"], button[class*="active"]'
    );
    if (btn && btn.textContent) {
      const match = btn.textContent.match(/202[0-9]/);
      if (match) return match[0];
    }
    return '2026';
  }

  // Debounced observer for Next.js SPA navigation (runs at most once every 200ms)
  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    if (debounceTimer) return;
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      applyTheme();
      checkJumpButtons();
    }, 200);
  });

  function init() {
    applyTheme();
    checkJumpButtons();
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', () => {
    applyTheme();
    checkJumpButtons();
  });

  window.addEventListener('popstate', () => {
    setTimeout(() => {
      applyTheme();
      checkJumpButtons();
    }, 50);
  });
})();
