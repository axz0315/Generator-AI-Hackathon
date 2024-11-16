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

    for (const [url, data] of Object.entries(response)) {
      console.log("Processing data for URL:", url, data);

      const row = document.createElement("tr");

      const urlCell = document.createElement("td");
      urlCell.textContent = url;
      row.appendChild(urlCell);

      const titleCell = document.createElement("td");
      titleCell.textContent = data.title || "N/A";
      row.appendChild(titleCell);

      const timeCell = document.createElement("td");
      timeCell.textContent = (data.totalTime / 1000).toFixed(2);
      row.appendChild(timeCell);

      tableBody.appendChild(row);
    }
  });
});
