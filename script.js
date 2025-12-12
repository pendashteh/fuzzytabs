let allTabs = [];
let filteredTabs = [];
let selectedIndex = 0;
const tabOpenTimes = {};

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

// Render tabs
function renderTabs() {
  const tabList = document.getElementById('tabList');
  const tabCount = document.getElementById('tabCount');
  
  tabCount.textContent = `${filteredTabs.length} tab${filteredTabs.length !== 1 ? 's' : ''} found`;

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

  tabList.innerHTML = filteredTabs.map((tab, index) => {
    const faviconUrl = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="12" font-size="12">🌐</text></svg>';
    const fallbackIcon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="12" font-size="12">🌐</text></svg>';
    
    return `
      <div class="tab-item ${index === selectedIndex ? 'selected' : ''}" data-index="${index}">
        <div class="tab-content">
          <img 
            class="favicon" 
            src="${faviconUrl}"
            onerror="this.src='${fallbackIcon}'"
          />
          <div class="tab-info">
            <div class="tab-title">${escapeHtml(tab.title || 'Untitled')}</div>
            <div class="tab-url">${escapeHtml(tab.url || '')}</div>
            <div class="tab-preview">${escapeHtml(tab.content.substring(0, 150))}</div>
            <div class="tab-meta">
              <div class="meta-item">
                <svg class="clock-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>${formatTimeAgo(tab.openedAt)}</span>
              </div>
              <div class="meta-item">
                <span>Window ${tab.windowId}</span>
              </div>
              ${tab.audible ? '<div class="meta-item"><span>🔊 Playing</span></div>' : ''}
              ${tab.pinned ? '<div class="meta-item"><span>📌 Pinned</span></div>' : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

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

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', filterTabs);

document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('searchInput').value = '';
  filterTabs();
  document.getElementById('searchInput').focus();
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
    document.getElementById('searchInput').value = '';
    filterTabs();
  }
});

document.getElementById('tabList').addEventListener('click', (e) => {
  const tabItem = e.target.closest('.tab-item');
  if (tabItem) {
    const index = parseInt(tabItem.dataset.index);
    switchToTab(filteredTabs[index]);
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
