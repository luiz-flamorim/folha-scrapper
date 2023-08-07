// const express = require('express');
// // importar a função scrapper aqui

// const app = express();
// // provável importar o scrapper  echamar a funç∫ao
 
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .send('Hello server is running')
//     .end();
// });
 
// // Start the server
// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`App listening on port ${PORT}`);
//   console.log('Press Ctrl+C to quit.');
// });



const express = require('express');
const { collectH2Elements } = require('./scrapper.js'); // Adjust the path as needed

const app = express();

app.get('/', async (req, res) => {
  try {
    // Call your scraper function from scrapper.js
    const scrapingResult = await collectH2Elements();
    
    // Process the scrapingResult and save it to a JSON file if needed
    
    res
      .status(200)
      .send('Scraping completed and results saved')
      .end();
  } catch (error) {
    console.error('Error during scraping:', error);
    res
      .status(500)
      .send('An error occurred during scraping')
      .end();
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
