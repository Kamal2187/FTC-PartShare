/**
 * Backend Web Scraper for goBilda Parts
 * This Node.js service scrapes goBilda's website for parts data
 * Run with: node backend/scraper.js
 */

const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

class GoBildaScraper {
  constructor() {
    this.baseUrl = 'https://www.gobilda.com';
    this.browser = null;
    this.scrapedData = new Map();
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Scrape parts from a specific category
   */
  async scrapeCategory(categoryPath) {
    console.log(`Scraping category: ${categoryPath}`);
    
    const page = await this.browser.newPage();
    
    try {
      // Set user agent to avoid blocking
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const url = `${this.baseUrl}/${categoryPath}`;
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for product grid to load
      await page.waitForSelector('.product-grid, .product-list, [data-product]', { timeout: 10000 });
      
      // Extract product data
      const products = await page.evaluate(() => {
        const productElements = document.querySelectorAll('.product-item, [data-product], .product-card');
        const results = [];
        
        productElements.forEach((element, index) => {
          try {
            // Extract basic info (adjust selectors based on actual goBilda HTML structure)
            const nameEl = element.querySelector('.product-name, .title, h3, h4');
            const skuEl = element.querySelector('.sku, .product-sku, [data-sku]');
            const priceEl = element.querySelector('.price, .product-price');
            const imageEl = element.querySelector('img');
            const linkEl = element.querySelector('a');
            
            if (nameEl && skuEl) {
              results.push({
                name: nameEl.textContent.trim(),
                sku: skuEl.textContent.trim().replace(/SKU:?\s*/i, ''),
                price: priceEl ? priceEl.textContent.trim() : null,
                imageUrl: imageEl ? imageEl.src || imageEl.dataset.src : null,
                productUrl: linkEl ? linkEl.href : null,
                category: window.location.pathname.split('/')[1] || 'Unknown'
              });
            }
          } catch (error) {
            console.log(`Error extracting product ${index}:`, error.message);
          }
        });
        
        return results;
      });
      
      console.log(`Found ${products.length} products in ${categoryPath}`);
      
      // Get detailed info for each product
      const detailedProducts = [];
      for (const product of products.slice(0, 20)) { // Limit for demo
        try {
          const details = await this.scrapeProductDetails(product);
          detailedProducts.push(details);
        } catch (error) {
          console.log(`Error getting details for ${product.sku}:`, error.message);
          detailedProducts.push(product); // Use basic info as fallback
        }
      }
      
      return detailedProducts;
      
    } catch (error) {
      console.error(`Error scraping category ${categoryPath}:`, error.message);
      return [];
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape detailed information for a specific product
   */
  async scrapeProductDetails(basicProduct) {
    if (!basicProduct.productUrl) return basicProduct;
    
    const page = await this.browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.goto(basicProduct.productUrl, { waitUntil: 'networkidle2', timeout: 20000 });
      
      const details = await page.evaluate((basic) => {
        // Extract detailed specifications (adjust selectors for actual goBilda structure)
        const descriptionEl = document.querySelector('.product-description, .description, .product-details');
        const specsTable = document.querySelector('.specifications, .product-specs, .specs-table');
        
        let specifications = [];
        
        if (specsTable) {
          const rows = specsTable.querySelectorAll('tr, .spec-row');
          rows.forEach(row => {
            const cells = row.querySelectorAll('td, .spec-label, .spec-value');
            if (cells.length >= 2) {
              specifications.push({
                attribute: cells[0].textContent.trim(),
                values: [cells[1].textContent.trim()]
              });
            }
          });
        }
        
        return {
          ...basic,
          description: descriptionEl ? descriptionEl.textContent.trim() : basic.name,
          specifications: specifications.length > 0 ? specifications : [
            { attribute: 'SKU', values: [basic.sku] }
          ]
        };
      }, basicProduct);
      
      return details;
      
    } catch (error) {
      console.log(`Error getting product details: ${error.message}`);
      return basicProduct;
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape all major categories
   */
  async scrapeAllCategories() {
    const categories = [
      'motion/motors',
      'motion/servos', 
      'motion/wheels',
      'structure/channels',
      'structure/brackets',
      'motion/bearings',
      'motion/shafts',
      'hardware/screws',
      'hardware/nuts',
      'electronics/sensors'
    ];

    const allProducts = [];
    
    for (const category of categories) {
      try {
        const products = await this.scrapeCategory(category);
        allProducts.push(...products);
        
        // Be respectful - add delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to scrape ${category}:`, error.message);
      }
    }

    return allProducts;
  }

  /**
   * Save scraped data to file
   */
  async saveData(data, filename = 'gobilda_parts.json') {
    const filepath = path.join(__dirname, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    console.log(`Saved ${data.length} parts to ${filepath}`);
  }
}

// Express API endpoints
app.get('/api/scrape-gobilda/:category', async (req, res) => {
  try {
    const scraper = new GoBildaScraper();
    await scraper.initialize();
    
    const category = req.params.category;
    const products = await scraper.scrapeCategory(category);
    
    await scraper.close();
    
    res.json(products);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/scrape-all', async (req, res) => {
  try {
    const scraper = new GoBildaScraper();
    await scraper.initialize();
    
    const allProducts = await scraper.scrapeAllCategories();
    await scraper.saveData(allProducts);
    
    await scraper.close();
    
    res.json({ 
      success: true, 
      count: allProducts.length,
      data: allProducts 
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/parts', async (req, res) => {
  try {
    const filepath = path.join(__dirname, 'gobilda_parts.json');
    const data = await fs.readFile(filepath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(404).json({ error: 'Parts data not found' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  // Run as standalone scraper
  async function runScraper() {
    console.log('Starting goBilda parts scraper...');
    
    const scraper = new GoBildaScraper();
    await scraper.initialize();
    
    try {
      const allProducts = await scraper.scrapeAllCategories();
      await scraper.saveData(allProducts);
      console.log(`Successfully scraped ${allProducts.length} products`);
    } catch (error) {
      console.error('Scraping failed:', error);
    } finally {
      await scraper.close();
    }
  }
  
  // Also start the API server
  app.listen(PORT, () => {
    console.log(`Scraper API running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log(`  GET http://localhost:${PORT}/api/scrape-gobilda/:category`);
    console.log(`  GET http://localhost:${PORT}/api/scrape-all`);
    console.log(`  GET http://localhost:${PORT}/api/parts`);
  });
  
  // Run initial scrape
  runScraper();
}

module.exports = { GoBildaScraper };
