// // Function to send browsing data to Gemini via the proxy
// async function sendBrowsingDataToGemini(browsingData) {
//     const endpoint = "http://localhost:3000/proxy";

//     try {
//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           prompt: `Please provide feedback on how I have been spending my time on Chrome based on the following browsing data:\n${JSON.stringify(browsingData, null, 2)}`,
//           model: "gemini-v1"
//         })
//       });

//       const result = await response.json();
//       console.log("Gemini AI Response:", result);
//       displayGeminiResponse(result); // Call function to display the response
//       return result;
//     } catch (error) {
//       console.error("Error communicating with Gemini:", error);
//     }
//   }

//   // Function to retrieve tracked data from chrome.storage.local and send it to Gemini
//   function retrieveAndSendTrackedData() {
//     chrome.storage.local.get('trackedData', (result) => {
//       if (result.trackedData) {
//         const browsingData = {
//           browsing_data: Object.keys(result.trackedData).map(url => ({
//             url,
//             time_spent: result.trackedData[url].totalTime,
//             visit_date: new Date().toISOString().split('T')[0] // Use current date as visit date
//           }))
//         };
//         sendBrowsingDataToGemini(browsingData);
//       } else {
//         console.log("No tracked data found.");
//       }
//     });
//   }

//   // Function to display Gemini's response
//   function displayGeminiResponse(response) {
//     const responseContainer = document.getElementById('geminiResponseContainer');
//     if (responseContainer) {
//       responseContainer.textContent = JSON.stringify(response, null, 2); // Format the response as a JSON string
//     } else {
//       console.log("Gemini Response Container not found.");
//     }
//   }

//   // Call the function to retrieve and send tracked data
//   retrieveAndSendTrackedData();

// Function to send browsing data to Gemini via the proxy using XMLHttpRequest
function sendBrowsingDataToGemini(browsingData) {
    const endpoint = "http://localhost:3000/proxy";
    const xhr = new XMLHttpRequest();

    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          console.log("Gemini AI Response:", result);
          displayGeminiResponse(result); // Call function to display the response
        } else {
          console.error("Error communicating with Gemini:", xhr.statusText);
        }
      }
    };

    const requestBody = JSON.stringify({
      prompt: `Please provide feedback on how I have been spending my time on Chrome based on the following browsing data:\n${JSON.stringify(browsingData, null, 2)}`,
      model: "gemini-v1"
    });

    xhr.send(requestBody);
  }

  // Function to retrieve tracked data from chrome.storage.local and send it to Gemini
  function retrieveAndSendTrackedData() {
    chrome.storage.local.get('trackedData', (result) => {
      if (result.trackedData) {
        const browsingData = {
          browsing_data: Object.keys(result.trackedData).map(url => ({
            url,
            time_spent: result.trackedData[url].totalTime,
            visit_date: new Date().toISOString().split('T')[0] // Use current date as visit date
          }))
        };
        sendBrowsingDataToGemini(browsingData);
      } else {
        console.log("No tracked data found.");
      }
    });
  }

  // Function to display Gemini's response
  function displayGeminiResponse(response) {
    const responseContainer = document.getElementById('geminiResponseContainer');
    if (responseContainer) {
      responseContainer.textContent = JSON.stringify(response, null, 2); // Format the response as a JSON string
    } else {
      console.log("Gemini Response Container not found.");
    }
  }

  // Call the function to retrieve and send tracked data
  retrieveAndSendTrackedData();
