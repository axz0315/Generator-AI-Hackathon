document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup loaded. Requesting data from background script...");

  chrome.runtime.sendMessage({ type: "getTrackedData" }, (response) => {
    console.log("Received data:", response);

    const tableBody = document.getElementById("data-table");
    tableBody.innerHTML = ""; // Clear previous data

    if (!response || Object.keys(response).length === 0) {
      console.log("No data available.");
      const row = document.createElement("tr");
      const noDataCell = document.createElement("td");
      noDataCell.textContent = "No data available";
      noDataCell.colSpan = 3;
      row.appendChild(noDataCell);
      tableBody.appendChild(row);
      return;
    }

    // Sort entries by most recent (descending order of total time)
    const sortedEntries = Object.entries(response).sort(
      (a, b) => b[1].totalTime - a[1].totalTime
    );

    for (const [url, data] of sortedEntries) {
      console.log("Processing data for URL:", url, data);

      const row = document.createElement("tr");

      // Favicon Column
      const faviconCell = document.createElement("td");
      const faviconImg = document.createElement("img");
      faviconImg.src = `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;
      faviconImg.alt = "favicon";
      faviconImg.width = 16; // Set the desired size
      faviconImg.height = 16;
      faviconCell.appendChild(faviconImg);
      row.appendChild(faviconCell);

      // Website Column with Title as Link Text
      const websiteCell = document.createElement("td");
      const websiteLink = document.createElement("a");
      websiteLink.href = url;
      websiteLink.textContent = data.title || url; // Fallback to URL if title is missing
      websiteLink.target = "_blank"; // Open link in a new tab
      websiteCell.appendChild(websiteLink);
      row.appendChild(websiteCell);

      // Time Column
      // const timeCell = document.createElement("td");
      // timeCell.textContent = (data.totalTime / 1000).toFixed(2); // Display time in seconds

      const timeCell = document.createElement("td");
      const totalTimeInMinutes = (data.totalTime / (1000 * 60)).toFixed(2); // Convert milliseconds to minutes
      timeCell.textContent = totalTimeInMinutes + 'm'; // Display time in minutes
      row.appendChild(timeCell);

      tableBody.prepend(row); // Add the newest at the top
    }
  });
  // Fetch summary automatically
  chrome.runtime.sendMessage({ type: "getSummary" }, (summary) => {
    console.log("Received summary:", summary);

    const summaryDiv = document.getElementById("summary");
    summaryDiv.innerHTML = ""; // Clear previous summary

    if (!summary || summary.length === 0) {
      summaryDiv.textContent = "No summary data available.";
      return;
    }

    const list = document.createElement("ul");
    summary.forEach(({ url, title, totalTime }) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${title} (${url}): ${totalTime} seconds`;
      list.appendChild(listItem);
    });

    summaryDiv.appendChild(list);
  });
});
