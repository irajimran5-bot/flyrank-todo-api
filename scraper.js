const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { checkRobotsTxt } = require('./robots');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const AXIOS_CONFIG = {
  headers: {
    'User-Agent': 'FlyRankInternScraper/1.0 (contact@flyrank.ai)',
    'Accept-Language': 'en-US,en;q=0.9'
  },
  timeout: 10000
};

function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim(); // Removes extra spaces & newlines
}

function cleanPrice(priceStr) {
  if (!priceStr) return 0;
  // Removes currency symbols like £, $, etc. and keeps numbers & decimal
  const numeric = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(numeric) || 0;
}

async function scrapeBooks(maxPages = 2) {
  const baseUrl = 'http://books.toscrape.com';
  
  // 1. Check Ethics / Robots.txt
  await checkRobotsTxt(baseUrl);

  const scrapedData = [];

  for (let page = 1; page <= maxPages; page++) {
    const pageUrl = page === 1 
      ? `${baseUrl}/index.html` 
      : `${baseUrl}/catalogue/page-${page}.html`;

    console.log(`🌐 Fetching Page ${page}: ${pageUrl}`);

    try {
      // Fetch HTML
      const response = await axios.get(pageUrl, AXIOS_CONFIG);
      const $ = cheerio.load(response.data);

      // Parse & Extract each book container
      $('.product_pod').each((index, element) => {
        const rawTitle = $(element).find('h3 a').attr('title');
        const rawPrice = $(element).find('.price_color').text();
        const rawAvailability = $(element).find('.availability').text();
        const rawRatingClass = $(element).find('.star-rating').attr('class');
        
        // Rating extraction from class name (e.g., "star-rating Three" -> "Three")
        const rating = rawRatingClass ? rawRatingClass.replace('star-rating', '').trim() : 'Unknown';

        // Clean & Structure Record
        const record = {
          id: scrapedData.length + 1,
          title: cleanText(rawTitle),
          price_gbp: cleanPrice(rawPrice),
          in_stock: cleanText(rawAvailability).includes('In stock'),
          rating: rating,
          scraped_at: new Date().toISOString()
        };

        scrapedData.push(record);
      });

      console.log(`✅ Extracted ${scrapedData.length} records so far...`);

      // Polite Rate Limiting: 1.5 second delay before fetching next page
      if (page < maxPages) {
        console.log('⏳ Rate limiting delay (1500ms)...');
        await sleep(1500);
      }

    } catch (err) {
      console.error(`❌ Error scraping page ${page}:`, err.message);
    }
  }

  // Save to JSON
  const outputDir = path.join(__dirname, 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const outputPath = path.join(outputDir, 'output.json');
  fs.writeFileSync(outputPath, JSON.stringify(scrapedData, null, 2));

  console.log(`\n🎉 Pipeline Complete! Total ${scrapedData.length} records saved to ${outputPath}`);
}

// Execute Scraper
scrapeBooks(2);