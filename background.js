let activeTabId = null;
let activeTabStartTime = null;

let trackedData = {};

// Load tracked data from storage when the extension starts
chrome.storage.local.get('trackedData', (result) => {
  if (result.trackedData) {
    trackedData = result.trackedData;
  }
  logStoredData(); // Log stored data when the extension starts
});

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

        // Save updated trackedData to storage
        chrome.storage.local.set({ trackedData });
      }
    } catch (error) {
      console.error("Error saving active tab time:", error);
    }
  }
}

// Function to convert trackedData into a list for Gemini
function convertTrackedDataForGemini(trackedData) {
  return Object.keys(trackedData).map(url => ({
    url,
    title: trackedData[url].title,
    totalTime: trackedData[url].totalTime,
    visit_date: new Date().toISOString().split('T')[0] // Use current date as visit date
  }));
}

// Function to log stored data
function logStoredData() {
  chrome.storage.local.get('trackedData', (result) => {
    console.log("Stored trackedData:", result.trackedData);
  });
}

// Function to retrieve stored data
function retrieveStoredData() {
  chrome.storage.local.get('trackedData', (result) => {
    console.log("Retrieved trackedData:", result.trackedData);
  });
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


// **********testing**************
// Test function to retrieve and log stored data
function testRetrieveStoredData() {
  retrieveStoredData();
}
