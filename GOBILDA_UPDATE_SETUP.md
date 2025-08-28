# goBilda Parts Auto-Update System

This document explains how to set up and maintain automatic updates for your FTC Parts Exchange website to stay current with goBilda's constantly changing part library.

## 🚀 Quick Start

### 1. Backend Setup (Web Scraping Service)

```bash
# Install backend dependencies
cd backend
npm install

# Start the scraping service
npm start
```

### 2. Frontend Integration

The frontend automatically integrates with the update system through:
- `PartsContext` - Enhanced with dynamic data loading
- `UpdateScheduler` - Automatic periodic updates
- `PartsUpdateAdmin` - Admin interface for manual control

## 📋 System Components

### 1. **Web Scraper** (`backend/scraper.js`)
- Scrapes goBilda's website using Puppeteer
- Extracts product information, SKUs, specifications
- Provides REST API endpoints for the frontend
- Handles rate limiting and respectful scraping

### 2. **Parts Updater Service** (`src/services/partsUpdater.ts`)
- Manages parts database updates
- Handles merging new data with existing parts
- Provides update status and error handling
- Stores data in localStorage (easily upgraded to database)

### 3. **Update Scheduler** (`src/services/updateScheduler.ts`)
- Automatic periodic updates (default: 24 hours)
- Background processing with error handling
- Configurable update intervals
- Real-time notifications for UI

### 4. **Admin Interface** (`src/components/Admin/PartsUpdateAdmin.tsx`)
- Manual update triggers
- Scheduler control (start/stop/configure)
- Update history and error monitoring
- Real-time status dashboard

## 🔧 Configuration Options

### Update Frequency
```typescript
// Default: 24 hours
updateScheduler.updateInterval(12 * 60 * 60 * 1000); // 12 hours
updateScheduler.updateInterval(7 * 24 * 60 * 60 * 1000); // 7 days
```

### Backend API Configuration
```javascript
// In backend/scraper.js
const PORT = process.env.PORT || 3001;
const SCRAPE_DELAY = process.env.SCRAPE_DELAY || 2000; // ms between requests
```

### Frontend Configuration
```typescript
// In src/services/partsUpdater.ts
private readonly UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
private readonly GOBILDA_BASE_URL = 'https://www.gobilda.com';
```

## 📡 API Endpoints

### Backend Scraping Service

- `GET /api/scrape-gobilda/:category` - Scrape specific category
- `GET /api/scrape-all` - Scrape all categories (full update)
- `GET /api/parts` - Get cached parts data
- `GET /health` - Service health check

### Usage Examples

```bash
# Scrape motors category
curl http://localhost:3001/api/scrape-gobilda/motion/motors

# Full database update
curl http://localhost:3001/api/scrape-all

# Get current parts data
curl http://localhost:3001/api/parts
```

## 🔄 Update Strategies

### 1. **Automatic Updates** (Recommended)
- Runs every 24 hours by default
- Background processing with error handling
- Minimal performance impact
- Automatic retry on failures

### 2. **Manual Updates**
- Admin interface for immediate updates
- Useful for urgent part additions
- Full control over timing
- Real-time feedback

### 3. **Hybrid Approach**
- Automatic updates for regular maintenance
- Manual updates for urgent changes
- Notification system for awareness
- Error monitoring and alerts

## 🛠️ Deployment Options

### Option 1: Simple Deployment
1. Run backend scraper on the same server
2. Frontend calls local API endpoints
3. Data stored in localStorage/files
4. Suitable for small to medium sites

### Option 2: Production Deployment
1. Deploy scraper as separate service
2. Use proper database (PostgreSQL/MongoDB)
3. Implement caching (Redis)
4. Add monitoring and alerts

### Option 3: Serverless
1. Convert scraper to serverless functions
2. Schedule with cron jobs
3. Store data in cloud storage
4. Cost-effective for smaller loads

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check backend service
curl http://localhost:3001/health

# Check update status
curl http://localhost:3001/api/parts | jq '.length'
```

### Log Monitoring
- Backend logs scraping activities
- Frontend logs update results
- Error tracking with detailed messages
- Performance metrics available

### Database Maintenance
```typescript
// Clear old data
localStorage.removeItem('gobilda_parts');

// Force fresh update
partsUpdater.forceUpdate();

// Check update status
const status = partsUpdater.getUpdateStatus();
```

## 🚨 Error Handling

### Common Issues & Solutions

#### 1. **Scraping Blocked**
```javascript
// Solution: Add delays, rotate user agents
await page.setUserAgent('Mozilla/5.0...');
await new Promise(resolve => setTimeout(resolve, 2000));
```

#### 2. **Rate Limiting**
```javascript
// Solution: Implement exponential backoff
const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
```

#### 3. **Data Parsing Errors**
```javascript
// Solution: Robust error handling
try {
  const data = extractProductData(element);
} catch (error) {
  console.warn('Parse error:', error);
  return fallbackData;
}
```

#### 4. **Network Issues**
```javascript
// Solution: Retry with timeout
const response = await fetch(url, { 
  timeout: 30000,
  retry: 3 
});
```

## 🔐 Best Practices

### 1. **Respectful Scraping**
- Add delays between requests (2+ seconds)
- Use appropriate user agents
- Monitor for 429 (rate limit) responses
- Respect robots.txt

### 2. **Data Quality**
- Validate scraped data before storage
- Handle missing/malformed data gracefully
- Maintain data consistency
- Regular data audits

### 3. **Performance**
- Implement caching strategies
- Use efficient data structures
- Minimize DOM queries
- Batch database operations

### 4. **Reliability**
- Implement proper error handling
- Use circuit breakers for external calls
- Monitor system health
- Have rollback procedures

## 🔄 Alternative Update Methods

### 1. **RSS/Feed Monitoring**
```typescript
// If goBilda provides RSS feeds
const feedUrl = 'https://www.gobilda.com/rss/new-products';
const newProducts = await parseFeed(feedUrl);
```

### 2. **API Integration**
```typescript
// If goBilda provides an API
const apiResponse = await fetch('https://api.gobilda.com/products', {
  headers: { 'Authorization': 'Bearer ' + apiKey }
});
```

### 3. **Third-party Services**
```typescript
// Using services like PartCAD
import { GoBildaPartCAD } from 'partcad-gobilda';
const parts = await GoBildaPartCAD.getAllParts();
```

### 4. **Community Contributions**
- Allow users to submit new parts
- Crowdsource part information
- Community moderation system
- Integration with official updates

## 📈 Scaling Considerations

### Small Scale (< 1000 parts)
- Single server deployment
- localStorage for data storage
- Manual monitoring
- Basic error handling

### Medium Scale (1000-10000 parts)
- Dedicated scraping service
- Database storage (PostgreSQL)
- Automated monitoring
- Caching layer (Redis)

### Large Scale (> 10000 parts)
- Microservices architecture
- Distributed scraping
- Advanced caching strategies
- Real-time monitoring & alerts

## 🎯 Next Steps

1. **Test the system** with a small subset of parts
2. **Monitor performance** and adjust intervals
3. **Implement alerting** for failures
4. **Consider database migration** for production
5. **Add user notifications** for new parts
6. **Implement part change detection** (price, availability)
7. **Add analytics** for popular parts tracking

## 🤝 Contributing

To improve the update system:
1. Monitor goBilda's website structure changes
2. Update selectors when needed
3. Add new categories as they appear
4. Improve error handling
5. Optimize performance

## 📞 Support

For issues with the update system:
1. Check the admin interface for error logs
2. Verify backend service is running
3. Test API endpoints manually
4. Check browser console for frontend errors
5. Review network requests in DevTools

---

**Remember**: This system requires ongoing maintenance as goBilda updates their website structure. Regular monitoring and updates to the scraping selectors may be necessary.
