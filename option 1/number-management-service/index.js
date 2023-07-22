const express = require('express');
const axios = require('axios');

const app = express();
const port = 8008;
const MAX_TIMEOUT = 500; 


app.get('/numbers', async (req, res) => {
  const urls = req.query.url;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'Invalid URLs in query parameters' });
  }

  const results = [];
  const promises = [];

 
  const fetchDataWithTimeout = (url) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout while fetching data from ${url}`));
      }, MAX_TIMEOUT);

      axios
        .get(url)
        .then((response) => {
          clearTimeout(timeout);
          resolve(response.data.numbers);
        })
        .catch((error) => {
          clearTimeout(timeout);
          console.error(`Error fetching data from ${url}:`, error.message);
          resolve(null);
        });
    });
  };


  for (const url of urls) {
    promises.push(fetchDataWithTimeout(url));
  }

  
  try {
    const data = await Promise.all(promises);
    for (const numbers of data) {
      if (numbers !== null) {
        results.push(...numbers);
      }
    }

   
    results.sort((a, b) => a - b);

    
    const uniqueNumbers = results.filter((value, index, self) => self.indexOf(value) === index);

    return res.json({ numbers: uniqueNumbers });
  } catch (error) {
    console.error('Error while fetching data:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Number management service is running on http://localhost:${port}`);
});
