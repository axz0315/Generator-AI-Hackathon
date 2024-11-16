// const express = require('express');
// const fetch = require('node-fetch');
// const cors = require('cors');
// const app = express();
// const port = 3000;

// app.use(cors()); // Enable CORS for all routes
// app.use(express.json());

// app.post('/proxy', async (req, res) => {
//   const apiKey = "YOUR_API_KEY_HERE"; // Replace with your actual API key
//   const endpoint = "https://gemini.googleapis.com/v1/queries";

//   try {
//     const response = await fetch(endpoint, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${apiKey}`
//       },
//       body: JSON.stringify(req.body)
//     });

//     const result = await response.json();
//     res.json(result);
//   } catch (error) {
//     console.error('Error communicating with Gemini:', error);
//     res.status(500).send('Error communicating with Gemini');
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

const express = require('express');
const fetch = require('node-fetch'); // Import node-fetch
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

app.post('/proxy', async (req, res) => {
  const apiKey = "YOUR_API_KEY_HERE"; // Replace with your actual API key
  const endpoint = "https://gemini.googleapis.com/v1/queries";

  try {
    console.log('Received request:', req.body);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    });

    const result = await response.json();
    console.log('Response from Gemini:', result);

    if (!response.ok) {
      console.error('Error response from Gemini:', result);
      res.status(response.status).json(result);
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error('Error communicating with Gemini:', error);
    res.status(500).send('Error communicating with Gemini');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
