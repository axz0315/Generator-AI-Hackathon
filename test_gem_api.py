import requests
import json

# Replace with your actual API key
API_KEY = "AIzaSyC0A559rCoDFiCPrUNp1Hg4DNElihwF2Ug"
ENDPOINT = "https://gemini.googleapis.com/v1/queries"

# Sample browsing data to test the API
browsing_data = [
    {
        "url": "example.com",
        "title": "Example",
        "totalTime": 120000,  # Time in milliseconds
        "visit_date": "2023-10-01"
    },
    {
        "url": "test.com",
        "title": "Test",
        "totalTime": 300000,  # Time in milliseconds
        "visit_date": "2023-10-01"
    }
]

# Create the request payload
payload = {
    "prompt": f"Please provide feedback on how I have been spending my time on Chrome based on the following browsing data:\n{json.dumps(browsing_data, indent=2)}",
    "model": "gemini-v1"
}

# Set the headers
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

# Send the POST request to the Gemini API
response = requests.post(ENDPOINT, headers=headers, data=json.dumps(payload))

# Check the response
if response.status_code == 200:
    print("Gemini AI Response:", response.json())
else:
    print(f"Error communicating with Gemini: {response.status_code} - {response.text}")
