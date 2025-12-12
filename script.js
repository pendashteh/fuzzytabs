let allTabs = [];
let filteredTabs = [];
let selectedIndex = 0;
const tabOpenTimes = {};
const fallbackIcon = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22%3E%3Ctext y=%2212%22 font-size=%2212%22%3E🌐%3C/text%3E%3C/svg%3E';

// Fuzzy search implementation
function fuzzyMatch(str, pattern) {
  if (!pattern) return { score: 1, matches: [] };
  
  str = str.toLowerCase();
  pattern = pattern.toLowerCase();
  
  let patternIdx = 0;
  let score = 0;
  const matches = [];
  
  for (let i = 0; i < str.length; i++) {
    if (str[i] === pattern[patternIdx]) {
      matches.push(i);
      score += (100 - i);
      patternIdx++;
      if (patternIdx === pattern.length) break;
    }
  }
  
  if (patternIdx !== pattern.length) return null;
  return { score, matches };
}

// Format time ago
function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Load tab open times from storage
async function loadTabTimes() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['tabOpenTimes'], (result) => {
        if (result.tabOpenTimes) {
          Object.assign(tabOpenTimes, result.tabOpenTimes);
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// Save tab open times
function saveTabTimes() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ tabOpenTimes });
  }
}

// Get tab content
function getTabContent(tab) {
  return `${tab.title || ''} ${tab.url || ''}`;
}

// Load all tabs
async function loadTabs() {
  try {
    await loadTabTimes();
    
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      console.error('Chrome tabs API not available');
      document.getElementById('tabList').innerHTML = '<div class="loading">Error: Chrome API not available</div>';
      return;
    }

    chrome.tabs.query({}, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error('Error querying tabs:', chrome.runtime.lastError);
        document.getElementById('tabList').innerHTML = '<div class="loading">Error loading tabs</div>';
        return;
      }

      const now = Date.now();
      
      allTabs = tabs.map(tab => {
        // Track new tabs
        if (!tabOpenTimes[tab.id]) {
          tabOpenTimes[tab.id] = now;
        }
        
        return {
          ...tab,
          content: getTabContent(tab),
          openedAt: tabOpenTimes[tab.id]
        };
      });

      saveTabTimes();
      filterTabs();
    });
  } catch (error) {
    console.error('Error loading tabs:', error);
    document.getElementById('tabList').innerHTML = '<div class="loading">Error loading tabs</div>';
  }
}

// Filter tabs based on search
function filterTabs() {
  const query = document.getElementById('searchInput').value;
  const clearBtn = document.getElementById('clearBtn');
  
  if (query) {
    clearBtn.classList.add('visible');
  } else {
    clearBtn.classList.remove('visible');
  }

  filteredTabs = allTabs
    .map(tab => {
      const searchText = `${tab.title} ${tab.url} ${tab.content}`;
      const match = fuzzyMatch(searchText, query);
      return match ? { ...tab, score: match.score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  selectedIndex = 0;
  renderTabs();
}

// Render tabs using DOM manipulation instead of innerHTML
function renderTabs() {
  const tabList = document.getElementById('tabList');
  const tabCount = document.getElementById('tabCount');
  
  tabCount.textContent = `${filteredTabs.length} tab${filteredTabs.length !== 1 ? 's' : ''} found`;

  // Clear existing content
  tabList.innerHTML = '';

  if (filteredTabs.length === 0) {
    tabList.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <p>No tabs found matching your search</p>
      </div>
    `;
    return;
  }

  // Create tab items using DOM
  filteredTabs.forEach((tab, index) => {
    const tabItem = document.createElement('div');
    tabItem.className = `tab-item ${index === selectedIndex ? 'selected' : ''}`;
    tabItem.dataset.index = index;

    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';

    // Favicon
    const favicon = document.createElement('img');
    favicon.className = 'favicon';
    favicon.alt = '';
    
    // Handle favicon URL safely
    if (tab.favIconUrl && !tab.favIconUrl.includes('onerror=') && !tab.favIconUrl.includes('<')) {
      favicon.src = tab.favIconUrl;
      favicon.onerror = function() {
        this.src = fallbackIcon;
      };
    } else {
      favicon.src = fallbackIcon;
    }

    // Tab info container
    const tabInfo = document.createElement('div');
    tabInfo.className = 'tab-info';

    // Title
    const title = document.createElement('div');
    title.className = 'tab-title';
    title.textContent = tab.title || 'Untitled';

    // URL
    const url = document.createElement('div');
    url.className = 'tab-url';
    url.textContent = tab.url || '';

    // Preview
    const preview = document.createElement('div');
    preview.className = 'tab-preview';
    preview.textContent = tab.content.substring(0, 150);

    // Metadata
    const meta = document.createElement('div');
    meta.className = 'tab-meta';

    // Time
    const timeItem = document.createElement('div');
    timeItem.className = 'meta-item';
    timeItem.innerHTML = `
      <svg class="clock-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>${formatTimeAgo(tab.openedAt)}</span>
    `;

    // Window
    const windowItem = document.createElement('div');
    windowItem.className = 'meta-item';
    const windowSpan = document.createElement('span');
    windowSpan.textContent = `Window ${tab.windowId}`;
    windowItem.appendChild(windowSpan);

    meta.appendChild(timeItem);
    meta.appendChild(windowItem);

    // Audio indicator
    if (tab.audible) {
      const audioItem = document.createElement('div');
      audioItem.className = 'meta-item';
      const audioSpan = document.createElement('span');
      audioSpan.textContent = '🔊 Playing';
      audioItem.appendChild(audioSpan);
      meta.appendChild(audioItem);
    }

    // Pinned indicator
    if (tab.pinned) {
      const pinnedItem = document.createElement('div');
      pinnedItem.className = 'meta-item';
      const pinnedSpan = document.createElement('span');
      pinnedSpan.textContent = '📌 Pinned';
      pinnedItem.appendChild(pinnedSpan);
      meta.appendChild(pinnedItem);
    }

    // Assemble everything
    tabInfo.appendChild(title);
    tabInfo.appendChild(url);
    tabInfo.appendChild(preview);
    tabInfo.appendChild(meta);

    tabContent.appendChild(favicon);
    tabContent.appendChild(tabInfo);
    tabItem.appendChild(tabContent);
    tabList.appendChild(tabItem);
  });

  // Scroll selected item into view
  const selectedItem = tabList.querySelector('.tab-item.selected');
  if (selectedItem) {
    selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// Switch to tab
function switchToTab(tab) {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.update(tab.id, { active: true }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error switching to tab:', chrome.runtime.lastError);
        return;
      }
      chrome.windows.update(tab.windowId, { focused: true });
    });
  }
}

// Reset search when returning to the tab
function resetSearch() {
  document.getElementById('searchInput').value = '';
  filterTabs();
  document.getElementById('searchInput').focus();
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', filterTabs);

document.getElementById('clearBtn').addEventListener('click', () => {
  resetSearch();
});

document.getElementById('searchInput').addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex = Math.min(selectedIndex + 1, filteredTabs.length - 1);
    renderTabs();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex = Math.max(selectedIndex - 1, 0);
    renderTabs();
  } else if (e.key === 'Enter' && filteredTabs[selectedIndex]) {
    e.preventDefault();
    switchToTab(filteredTabs[selectedIndex]);
  } else if (e.key === 'Escape') {
    resetSearch();
  }
});

document.getElementById('tabList').addEventListener('click', (e) => {
  const tabItem = e.target.closest('.tab-item');
  if (tabItem) {
    const index = parseInt(tabItem.dataset.index);
    switchToTab(filteredTabs[index]);
  }
});

// Listen for when page becomes visible again
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // Page is now visible - reload tabs and reset search
    loadTabs();
    resetSearch();
  }
});

// Initialize
loadTabs();

// Clean up old tab times periodically
if (typeof chrome !== 'undefined' && chrome.tabs) {
  chrome.tabs.query({}, (tabs) => {
    const activeTabIds = new Set(tabs.map(t => t.id));
    Object.keys(tabOpenTimes).forEach(tabId => {
      if (!activeTabIds.has(parseInt(tabId))) {
        delete tabOpenTimes[tabId];
      }
    });
    saveTabTimes();
  });
}
