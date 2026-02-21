# API Setup Guide

This guide will help you configure the application to use real-time news APIs and AI analysis.

## Quick Setup

### 1. News API Integration

The application supports two news APIs:

#### Option A: NewsAPI.org (Recommended)
1. Visit https://newsapi.org/register
2. Sign up for a free account
3. Get your API key from the dashboard
4. Open `/utils/newsApi.ts`
5. Replace `YOUR_NEWS_API_KEY_HERE` with your actual API key:
   ```typescript
   const NEWS_API_KEY = 'your_actual_api_key_here';
   ```

**Free Tier Limits:**
- 100 requests per day
- Development only (localhost)

#### Option B: GNews.io (Alternative)
1. Visit https://gnews.io/
2. Create a free account
3. Get your API key
4. Open `/utils/newsApi.ts`
5. Replace `YOUR_GNEWS_API_KEY_HERE` with your actual API key
6. Set `USE_NEWSAPI = false` to use GNews instead

**Free Tier Limits:**
- 100 requests per day
- Limited to last 7 days of news

### 2. AI Analysis (Optional but Recommended)

For advanced AI-powered content analysis:

1. Visit https://platform.openai.com/api-keys
2. Create an account and get an API key
3. Open `/utils/aiAnalyzer.ts`
4. Replace `YOUR_OPENAI_API_KEY_HERE` with your actual API key:
   ```typescript
   const OPENAI_API_KEY = 'sk-your_actual_api_key_here';
   ```

**Note:** If you don't configure OpenAI, the app will use an enhanced rule-based analysis system instead.

### 3. PDF Processing

PDF processing works out of the box using pdf.js library. No API key required!

The system will:
- Extract text from uploaded PDFs with 95%+ accuracy
- Analyze document structure
- Generate intelligent insights

## Features Overview

### Real-Time News
- Fetches latest news from Indian and international sources
- Filters by topics (Economy, Polity, Environment, etc.)
- Date range selection (24h, 1 week, 1 month)
- **Advanced Mode**: Custom date range picker for specific time periods

### PDF Analysis
- Upload PDF documents up to 50MB
- Real text extraction using pdf.js
- AI-powered content analysis
- Generates exam-relevant insights

### Share Functionality
- Web Share API for mobile sharing
- Clipboard fallback for desktop
- Share analysis summaries and key takeaways

### Advanced Analysis Mode
- More detailed insights
- Policy implications
- Potential exam questions
- Custom time period filtering
- Enhanced content analysis

## Environment Variables (Production)

For production deployment, use environment variables instead of hardcoding API keys:

```typescript
// In newsApi.ts
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'YOUR_NEWS_API_KEY_HERE';
const GNEWS_API_KEY = process.env.GNEWS_API_KEY || 'YOUR_GNEWS_API_KEY_HERE';

// In aiAnalyzer.ts
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE';
```

## API Rate Limits & Best Practices

### NewsAPI.org
- **Free Tier**: 100 requests/day
- **Developer Plan** ($29/month): 500 requests/day
- **Caching**: Consider caching responses for 1 hour

### GNews.io
- **Free Tier**: 100 requests/day
- **Basic Plan** ($9/month): 10,000 requests/month
- **Rate Limiting**: Implement request throttling

### OpenAI
- **Pay-as-you-go**: ~$0.002 per 1K tokens
- **Model**: gpt-4o-mini (cost-effective)
- **Optimization**: Use basic mode for simple analysis

## Testing

1. Start the application
2. Navigate to "News Aggregator"
3. Click "Fetch Latest News"
4. If configured correctly, you'll see real news articles
5. Try uploading a PDF in "PDF Analysis" section
6. Test the share button on any analysis page

## Troubleshooting

### "News API keys not configured" Error
- Check that you've replaced the placeholder API keys
- Ensure there are no extra quotes or spaces
- Verify your API key is active on the provider's dashboard

### PDF Upload Fails
- Ensure file is under 50MB
- Verify it's a valid PDF file
- Check browser console for errors

### Share Button Not Working
- On desktop, it will copy to clipboard
- On mobile, it uses native share dialog
- Ensure HTTPS is enabled for Web Share API

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify API keys are correct
3. Ensure you're within rate limits
4. Check API provider status pages

## Security Notes

⚠️ **Important:**
- Never commit API keys to version control
- Use environment variables in production
- Rotate keys regularly
- Monitor API usage on provider dashboards
- This application is for educational purposes only

## Features Without API Keys

Even without configuring API keys, you can still:
- Use the application UI and explore features
- Upload and process PDFs (uses client-side pdf.js)
- View enhanced rule-based analysis
- Export and share analysis results
- Experience the full interface and workflow

The app will show helpful messages guiding you to set up API keys when needed.
