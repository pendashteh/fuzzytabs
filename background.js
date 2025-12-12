// Open tab finder when extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('popup.html')
  });
});

// Open tab finder with keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-tab-finder') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup.html')
    });
  }
});

// Track when tabs are created
chrome.tabs.onCreated.addListener((tab) => {
  chrome.storage.local.get(['tabOpenTimes'], (result) => {
    const tabOpenTimes = result.tabOpenTimes || {};
    tabOpenTimes[tab.id] = Date.now();
    chrome.storage.local.set({ tabOpenTimes });
  });
});
