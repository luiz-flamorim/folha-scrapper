const express = require('express');
const { collectH2Elements } = require('./scrapper.js'); // Import the scraper function
const cors = require('cors');

const app = express();

app.use(cors({
  origin: "https://folha-scrapper-117789299b68.herokuapp.com/",
}));

app.get('/', async (req, res) => {
  res.header("Access-Control-Allow-Origin","https://folha-scrapper-117789299b68.herokuapp.com/")
  try {
    

    // Call the scraper function directly
    const scrapingResult = await collectH2Elements();

    // Format the scraping result as HTML elements
    const resultHTML = scrapingResult
      .map(
        (item, index) => `
      <div>
        <h2>${item.Title}</h2>
        <p><strong>Link:</strong> <a href="${item.Link}" target="_blank">${item.Link}</a></p>
        <p><strong>Overview:</strong> ${item.Overview}</p>
      </div>
    `
      )
      .join('');

    // Create the complete HTML response
    const htmlResponse = `
      <html>
        <head>
          <title>Scraping Results</title>
        </head>
        <body>
          <h1>Scraping Completed</h1>
          <div>
            ${resultHTML}
          </div>
        </body>
      </html>
    `;

    res.status(200).send(htmlResponse);
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).send('An error occurred during scraping');
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
