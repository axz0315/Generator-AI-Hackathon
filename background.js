let activeTabId = null;
let activeTabStartTime = null;

const trackedData = {};

// Function to save data for the active tab
async function saveActiveTabTime() {
  if (activeTabId !== null && activeTabStartTime !== null) {
    const elapsedTime = Date.now() - activeTabStartTime;
    console.log(`Saving time for tab ${activeTabId}: ${elapsedTime / 1000} seconds`);

    try {
      const tab = await chrome.tabs.get(activeTabId);
      if (tab && tab.url) {
        const url = new URL(tab.url).hostname;
        if (!trackedData[url]) {
          trackedData[url] = { title: tab.title || "Unknown", totalTime: 0 };
        }
        trackedData[url].totalTime += elapsedTime;
        console.log("Updated trackedData:", trackedData);
      }
    } catch (error) {
      console.error("Error saving active tab time:", error);
    }
  }
}

// Handle when the active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log("Tab activated:", activeInfo);

  await saveActiveTabTime(); // Save the time spent on the previously active tab

  activeTabId = activeInfo.tabId;
  activeTabStartTime = Date.now();
  console.log("New active tab set:", activeTabId);
});

// Handle when a tab is updated (e.g., new page loaded)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("Tab updated:", tabId, changeInfo, tab);

  if (changeInfo.status === "complete" && tab.url) {
    const url = new URL(tab.url).hostname;
    if (!trackedData[url]) {
      trackedData[url] = { title: tab.title || "Unknown", totalTime: 0 };
    }
    console.log("Tracked or updated tab:", url, trackedData[url]);
  }
});

// Handle when a window gains or loses focus
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  console.log("Window focus changed:", windowId);

  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await saveActiveTabTime();
    activeTabId = null;
    activeTabStartTime = null;
    console.log("No window in focus. Reset active tab.");
  } else {
    // Update the active tab when the window regains focus
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab) {
      activeTabId = tab.id;
      activeTabStartTime = Date.now();
      console.log("Window focus regained. Active tab set:", activeTabId);
    }
  }
});

// Handle tab closures to save the time spent
chrome.tabs.onRemoved.addListener(async (tabId) => {
  console.log("Tab closed:", tabId);

  if (tabId === activeTabId) {
    await saveActiveTabTime();
    activeTabId = null;
    activeTabStartTime = null;
  }
});

// Respond to messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);
  if (request.type === "getTrackedData") {
    sendResponse(trackedData);
  }
});
