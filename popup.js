document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup loaded. Requesting data from background script...");

  let currentSortType = "recency"; // Default sort type
  let responseData = {}; // To store the response data

  // Fetch and render data
  function fetchDataAndRender() {
    chrome.runtime.sendMessage({ type: "getTrackedData" }, (response) => {
      console.log("Received data:", response);
      responseData = response; // Save response for sorting
      console.log(responseData);
      renderTable(responseData, currentSortType);
    });
  }

  // Render table based on sort type
  function renderTable(data, sortType) {
    const tableBody = document.getElementById("data-table");
    tableBody.innerHTML = ""; // Clear previous data

    if (!data || Object.keys(data).length === 0) {
      console.log("No data available.");
      const row = document.createElement("tr");
      const noDataCell = document.createElement("td");
      noDataCell.textContent = "No data available";
      noDataCell.colSpan = 3;
      row.appendChild(noDataCell);
      tableBody.appendChild(row);
      return;
    }

    // Sort entries
    let sortedEntries = Object.entries(data);
    switch (sortType) {
      case "recency":
        sortedEntries.sort((a, b) => b[1].lastAccessed - a[1].lastAccessed); // Most recent first
        break;
      case "totalTime":
        sortedEntries.sort((a, b) => a[1].totalTime - b[1].totalTime); // Lowest total time first
        break;
      case "category":
        sortedEntries.sort((a, b) => {
          const baseA = new URL(a[0]).hostname;
          const baseB = new URL(b[0]).hostname;
          return baseA.localeCompare(baseB);
        });
        break;
    }

    // Render sorted entries (prepend rows to display newest or highest first)
    sortedEntries.forEach(([url, data]) => {
      
      if (data.totalTime > 30) { // Only include entries with more than 30 seconds
        console.log("Processing data for URL:", url, data);

        const row = document.createElement("tr");

        // Favicon Column
        const faviconCell = document.createElement("td");
        const faviconImg = document.createElement("img");
        faviconImg.src = `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;
        faviconImg.alt = "favicon";
        faviconImg.width = 16;
        faviconImg.height = 16;
        faviconCell.appendChild(faviconImg);
        row.appendChild(faviconCell);

        // Website Column
        const websiteCell = document.createElement("td");
        const websiteLink = document.createElement("a");
        websiteLink.href = url;
        websiteLink.textContent = data.title || new URL(url).hostname; // Show title or base URL
        websiteLink.target = "_blank";
        websiteCell.appendChild(websiteLink);
        row.appendChild(websiteCell);

        // Time Column
        const timeCell = document.createElement("td");
        const totalTimeInMinutes = (data.totalTime / (1000 * 60)).toFixed(2); // Convert milliseconds to minutes
        timeCell.textContent = totalTimeInMinutes + "m";
        row.appendChild(timeCell);

        tableBody.prepend(row); // Prepend the row to display the newest/highest first
      }
    });
  }

  // Handle sort type change
  document.getElementById("sort-dropdown").addEventListener("change", (e) => {
    currentSortType = e.target.value;
    renderTable(responseData, currentSortType);
  });

  // Fetch data on load
  fetchDataAndRender();
});
