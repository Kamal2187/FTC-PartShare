/**
 * Automated Parts Update Service
 * Scrapes goBilda's website for new parts and updates local database
 */

import { Part } from '../contexts/PartsContext';

interface ScrapedPart {
  sku: string;
  name: string;
  category: string;
  description: string;
  specifications: { attribute: string; values: string[] }[];
  imageUrl: string;
  price?: number;
  availability?: boolean;
}

export class PartsUpdaterService {
  private readonly GOBILDA_BASE_URL = 'https://www.gobilda.com';
  private readonly UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  
  /**
   * Main update function - call this periodically
   */
  async updatePartsDatabase(): Promise<{ added: number; updated: number; errors: string[] }> {
    const results = { added: 0, updated: 0, errors: [] as string[] };
    
    try {
      console.log('Starting parts database update...');
      
      // Scrape different categories
      const categories = [
        'motion/motors-servos',
        'motion/wheels-hubs',
        'structure/channels-brackets',
        'motion/bearings-shafts',
        'hardware/fasteners'
      ];
      
      for (const category of categories) {
        try {
          const categoryParts = await this.scrapeCategory(category);
          const updateResult = await this.processScrapedParts(categoryParts);
          results.added += updateResult.added;
          results.updated += updateResult.updated;
        } catch (error) {
          results.errors.push(`Error scraping ${category}: ${error.message}`);
        }
      }
      
      // Update last sync timestamp
      localStorage.setItem('lastPartsUpdate', new Date().toISOString());
      
      console.log(`Parts update complete: ${results.added} added, ${results.updated} updated`);
      return results;
      
    } catch (error) {
      results.errors.push(`General update error: ${error.message}`);
      return results;
    }
  }
  
  /**
   * Scrape a specific category page
   */
  private async scrapeCategory(categoryPath: string): Promise<ScrapedPart[]> {
    // Note: This would typically use a backend service with proper web scraping tools
    // For now, this is a placeholder that would integrate with your backend
    
    const response = await fetch(`/api/scrape-gobilda/${categoryPath}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to scrape category: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Process scraped parts and update local storage
   */
  private async processScrapedParts(scrapedParts: ScrapedPart[]): Promise<{ added: number; updated: number }> {
    const existingParts = this.getExistingParts();
    const existingSkus = new Set(existingParts.map(p => p.sku));
    
    let added = 0;
    let updated = 0;
    
    const updatedParts = [...existingParts];
    
    for (const scrapedPart of scrapedParts) {
      if (existingSkus.has(scrapedPart.sku)) {
        // Update existing part
        const existingIndex = updatedParts.findIndex(p => p.sku === scrapedPart.sku);
        if (existingIndex >= 0) {
          updatedParts[existingIndex] = this.convertScrapedToPart(scrapedPart, updatedParts[existingIndex].id);
          updated++;
        }
      } else {
        // Add new part
        const newPart = this.convertScrapedToPart(scrapedPart);
        updatedParts.push(newPart);
        added++;
      }
    }
    
    // Save to localStorage (in production, this would be a database)
    localStorage.setItem('gobilda_parts', JSON.stringify(updatedParts));
    
    return { added, updated };
  }
  
  /**
   * Convert scraped part data to internal Part format
   */
  private convertScrapedToPart(scraped: ScrapedPart, existingId?: string): Part {
    return {
      id: existingId || `scraped_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sku: scraped.sku,
      name: scraped.name,
      category: scraped.category,
      description: scraped.description,
      specifications: scraped.specifications,
      imageUrl: scraped.imageUrl
    };
  }
  
  /**
   * Get existing parts from storage
   */
  private getExistingParts(): Part[] {
    const stored = localStorage.getItem('gobilda_parts');
    return stored ? JSON.parse(stored) : [];
  }
  
  /**
   * Check if update is needed based on last update time
   */
  shouldUpdate(): boolean {
    const lastUpdate = localStorage.getItem('lastPartsUpdate');
    if (!lastUpdate) return true;
    
    const timeSinceUpdate = Date.now() - new Date(lastUpdate).getTime();
    return timeSinceUpdate > this.UPDATE_INTERVAL;
  }
  
  /**
   * Manual trigger for immediate update
   */
  async forceUpdate(): Promise<{ added: number; updated: number; errors: string[] }> {
    return this.updatePartsDatabase();
  }
  
  /**
   * Get update status and statistics
   */
  getUpdateStatus(): {
    lastUpdate: string | null;
    totalParts: number;
    nextUpdateDue: string;
  } {
    const lastUpdate = localStorage.getItem('lastPartsUpdate');
    const parts = this.getExistingParts();
    
    const nextUpdate = lastUpdate 
      ? new Date(new Date(lastUpdate).getTime() + this.UPDATE_INTERVAL)
      : new Date();
    
    return {
      lastUpdate,
      totalParts: parts.length,
      nextUpdateDue: nextUpdate.toISOString()
    };
  }
}

// Singleton instance
export const partsUpdater = new PartsUpdaterService();
