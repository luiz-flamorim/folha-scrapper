// App
const fs = require('fs');
// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-core');


const baseUrl = 'https://www.folha.com.br';


  async function collectH2Elements() {
    try {
      // const browser = await puppeteer.launch({ headless: 'new' });
      const browser = await puppeteer.launch({
        executablePath: process.env.CHROME_BIN || '/app/.apt/opt/google/chrome/chrome',
      });
      const page = await browser.newPage();
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  
      const h2CountArray = await page.evaluate(() => {
        const h2Elements = Array.from(document.querySelectorAll('h2'));
        return h2Elements.map(h2 => h2.textContent.trim());
      });
  
      const data = {};
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
      for (let index = 0; index < h2CountArray.length; index++) {
        const h2Text = h2CountArray[index];
  
        const { title, link, overview } = await page.evaluate((index) => {
          const h2Elements = Array.from(document.querySelectorAll('h2'));
          const h2Element = h2Elements[index];
          const title = h2Element.textContent.trim();
          const linkElement = h2Element.closest('a');
          const link = linkElement ? linkElement.href : '';
  
          const nextElement = h2Element.nextElementSibling;
          let pElement = null;
          if (nextElement) {
            let sibling = nextElement;
            while (sibling) {
              if (sibling.tagName === 'P') {
                pElement = sibling;
                break;
              }
              sibling = sibling.nextElementSibling;
            }
          }
  
          const overview = pElement ? pElement.textContent.trim() : '';
          return { title, link, overview };
        }, index);
  
        data[index] = {
          Title: title,
          Link: link,
          Overview: overview,
        };
      }
  
      await browser.close();
  
      let jsonData = {};
  
      if (fs.existsSync('folha-news.json')) {
        const existingData = fs.readFileSync('folha-news.json', 'utf8');
        jsonData = JSON.parse(existingData);
      }
  
      if (!jsonData[date]) {
        jsonData[date] = { news: {} };
      }
  
      jsonData[date].news = data;
  
      const updatedJsonData = JSON.stringify(jsonData, null, 2);
      fs.writeFileSync('folha-news.json', updatedJsonData);
  
      console.log(updatedJsonData)
  
      console.log(`Data has been scraped and saved to folha-news.json.`);
  
      console.log(`Number of h2 elements in the array: ${h2CountArray.length}`);
      console.log(`Number of h2 elements collected in the JSON objects: ${Object.keys(data).length}`);
  
      const stopWordsData = fs.readFileSync('stop-words-pt.json', 'utf8');
      const stopWordsObj = JSON.parse(stopWordsData);
      processData(jsonData, date, stopWordsObj.stopWords);
    } catch (error) {
      console.error('Error occurred while scraping:', error.message);
    }
  }



function processData(jsonData, date, stopWords) {
  if (jsonData[date] && jsonData[date].news) {
    const newsData = jsonData[date].news;
    let nonEmptyTitleCount = 0;
    const wordsFrequency = {};

    for (const key in newsData) {
      if (newsData.hasOwnProperty(key)) {
        const title = newsData[key].Title;
        if (title && title.trim() !== '') {
          nonEmptyTitleCount++;
          const words = title.trim().toLowerCase().split(/\s+/);
          words.forEach((word) => {
            if (!stopWords.includes(word) && isNaN(word)) {
              wordsFrequency[word] = (wordsFrequency[word] || 0) + 1;
            }
          });
        }
      }
    }

    // Sort the word frequency hash based on the frequency count
    const sortedWordsFrequency = Object.entries(wordsFrequency)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    jsonData[date].processed = {
      total: nonEmptyTitleCount,
      words: sortedWordsFrequency,
    };

    const updatedJsonData = JSON.stringify(jsonData, null, 2);
    fs.writeFileSync('folha-news.json', updatedJsonData);
    console.log(`Data has been processed and saved to folha-news.json.`);
    
  } else {
    console.error('Error: No data available for processing.');
  }
}


module.exports = {
  collectH2Elements
}


