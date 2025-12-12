// Open tab finder when extension icon is clicked
chrome.action.onClicked.addListener(() => {
  openOrFocusTabFinder();
});

// Open tab finder with keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-tab-finder') {
    openOrFocusTabFinder();
  }
});

// Open or focus existing tab finder
function openOrFocusTabFinder() {
  const finderUrl = chrome.runtime.getURL('popup.html');
  
  // Check if tab finder is already open
  chrome.tabs.query({}, (tabs) => {
    const existingTab = tabs.find(tab => tab.url === finderUrl);

    if (existingTab) {
      // Tab finder already open - focus it
      chrome.tabs.update(existingTab.id, { active: true });
      chrome.windows.update(existingTab.windowId, { focused: true });
    } else {
      // Tab finder not open - create new tab
      chrome.tabs.create({ url: finderUrl });
    }
  });
}

// Track when tabs are created
chrome.tabs.onCreated.addListener((tab) => {
  chrome.storage.local.get(['tabOpenTimes'], (result) => {
    const tabOpenTimes = result.tabOpenTimes || {};
    tabOpenTimes[tab.id] = Date.now();
    chrome.storage.local.set({ tabOpenTimes });
  });
});
