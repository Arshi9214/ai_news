# AI News Summarizer App 2.0

Transform news into knowledge. Your intelligent companion for staying informed with AI-powered analysis and multi-language support.

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## Features

### Smart Multi-Source News Aggregation
- **RSS Feed Integration**: Direct feeds from 8+ major Indian news sources (TOI, The Hindu, Indian Express, etc.)
- **CORS Proxy System**: Automatic fallback across multiple proxies for reliable access
- Smart date range filtering (24h, 7 days, 30 days, custom)
- Real-time duplicate detection with unique IDs
- Language filtering (English/Hindi detection)

### AI-Powered Analysis
- **Groq API** integration with 3-key rotation for rate limit handling
- Lightweight summaries with key takeaways
- Exam-relevant insights extraction
- Sentiment analysis

### PDF Processing
- Upload and analyze PDF documents
- Extract text with **PDF.js**
- AI-powered content summarization
- Export analyzed content

### 11 Language Support
English • Hindi • Tamil • Bengali • Telugu • Marathi • Gujarati • Kannada • Malayalam • Punjabi • Urdu

### Topic Categories
Economy • Polity • Environment • International Relations • Science & Tech • Society • History • Geography

### Modern UI/UX
- Dark mode support
- Responsive design (mobile, tablet, desktop)
- Smooth animations with Tailwind CSS v3
- Radix UI components for accessibility

---

## Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- API Keys (see [API Setup](#-api-setup))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd "AI News Summarizer App 2.0"

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

Visit http://localhost:3000

---

## API Setup

### Required API

#### **Groq API** (AI Analysis) - REQUIRED
- **Free Tier**: Generous limits with fast inference
- **Get Keys**: [console.groq.com](https://console.groq.com)
- **Add to `.env`**:
  ```env
  VITE_GROQ_API_KEY=your_key_1
  VITE_GROQ_API_KEY_2=your_key_2
  VITE_GROQ_API_KEY_3=your_key_3
  ```
- **Note**: Multiple keys enable automatic rotation to avoid rate limits

### `.env` Template

```env
# AI Analysis (Groq) - REQUIRED
VITE_GROQ_API_KEY=your_groq_key_1
VITE_GROQ_API_KEY_2=your_groq_key_2
VITE_GROQ_API_KEY_3=your_groq_key_3
```

### News Sources (No API Keys Needed)

The app uses **RSS feeds** from major Indian news sources:
- **Times of India** (TOI)
- **The Hindu**
- **Indian Express**
- **Hindustan Times**
- **NDTV**
- **LiveMint**
- **The Wire**
- **India Today**

**Benefits:**
- No API keys required for news
- No rate limits or quotas
- Real-time news updates
- Direct from trusted sources
- Automatic CORS proxy fallback

---

## Project Structure

```
AI News Summarizer App 2.0/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components (Radix)
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── NewsAggregator.tsx
│   │   ├── PDFProcessor.tsx
│   │   ├── AnalysisViewer.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileMenu.tsx
│   │   └── Onboarding.tsx
│   ├── utils/              # Utility functions
│   │   ├── rssApi.ts       # RSS feed fetching & parsing
│   │   ├── groqApi.ts      # AI analysis integration
│   │   ├── pdfParser.ts    # PDF processing
│   │   ├── pdfExporter.ts  # Export functionality
│   │   └── aiAnalyzer.ts   # AI analysis logic
│   ├── styles/
│   │   └── globals.css     # Global styles
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── vite-env.d.ts       # TypeScript declarations
├── .env                    # Environment variables (create from .env.example)
├── .env.example            # Environment template
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
└── README.md               # You are here!
```

---

## How It Works

### RSS News Fetching Flow
```
User selects topics & date range
         ↓
Fetch from 8 RSS feeds in parallel
         ↓
Try CORS Proxy 1 (corsproxy.io)
         ↓ (if fails)
Try CORS Proxy 2 (allorigins.win)
         ↓ (if fails)
Try CORS Proxy 3 (cors-anywhere)
         ↓
Parse XML & extract articles
         ↓
Filter by language (EN/HI detection)
         ↓
Detect topics from content
         ↓
Filter by date range
         ↓
Return sorted articles (newest first)
```

### AI Analysis Flow
```
Article fetched
         ↓
Send to Groq API (Key 1)
         ↓ (if rate limited)
Rotate to Key 2
         ↓ (if rate limited)
Rotate to Key 3
         ↓
Generate summary + key takeaways
```

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18.3.1, TypeScript |
| **Build Tool** | Vite 6.3.5 |
| **Styling** | Tailwind CSS v3.4.0 |
| **UI Components** | Radix UI, Lucide Icons |
| **PDF Processing** | PDF.js 4.9.155 |
| **AI Analysis** | Groq API (Llama models) |
| **News Sources** | RSS Feeds (8+ Indian sources) |
| **State Management** | React Hooks |
| **Notifications** | Sonner |

---

## News Sources & Reliability

### RSS Feed Sources
| Source | Type | Update Frequency | Reliability |
|--------|------|------------------|-------------|
| Times of India | General | Real-time | Excellent |
| The Hindu | General | Real-time | Excellent |
| Indian Express | General | Real-time | Excellent |
| Hindustan Times | General | Real-time | Very Good |
| NDTV | General | Real-time | Very Good |
| LiveMint | Business | Real-time | Very Good |
| The Wire | Analysis | Real-time | Very Good |
| India Today | General | Real-time | Very Good |

### CORS Proxy System
The app uses a 3-tier fallback system:
1. **corsproxy.io** (Primary)
2. **allorigins.win** (Secondary)
3. **cors-anywhere.herokuapp.com** (Backup)

**Benefits:**
- No API keys needed for news fetching
- No rate limits or daily quotas
- Real-time updates from trusted sources
- Automatic fallback if one proxy fails
- 100% free news aggregation

**Console Logging:**
The app shows RSS feed status in real-time:
- RSS toi: Fetched 20 items via https://corsproxy.io
- RSS hindu failed with proxy 1, trying proxy 2...

---

## Features in Detail

### Dashboard
- Recent articles overview
- Bookmarked articles
- Processed PDFs
- Quick stats

### News Aggregator
- RSS feed aggregation from 8+ sources
- Automatic CORS proxy fallback
- Search & filter by topic
- Date range selection (24h/week/month/custom)
- Language detection & filtering
- Progressive AI summarization
- Export to JSON/PDF

### PDF Processor
- Drag & drop upload
- Text extraction
- AI-powered analysis
- Manage processed documents

### Analysis Viewer
- Detailed article/PDF analysis
- Key takeaways
- Exam relevance
- Potential questions
- Related topics

---

## Known Issues & Fixes

### Fixed Issues
1. **RSS Integration**: Migrated from paid news APIs to free RSS feeds
2. **CORS Proxy System**: Implemented 3-tier fallback for reliable access
3. **Date Range Bug**: Fixed incorrect 24h/week/month calculations
4. **PDF.js Version**: Corrected worker version mismatch (4.9.155)
5. **Duplicate Detection**: Changed from title-based to unique ID-based
6. **Tailwind CSS**: Reverted to stable v3.4.0 from problematic v4
7. **Language Detection**: Added English/Hindi content filtering
8. **Server Port**: Updated to port 3000 with auto-open in browser
9. **News Card UI**: Enhanced with better visual hierarchy

### Ongoing Improvements
- Enhanced error handling
- Better rate limit management
- Improved caching strategy

---

## Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- **Figma Design**: Original design from [Figma Community](https://www.figma.com/design/gyTvphSj7O4ZRiB8SnwwDb/AI-News-Summarizer-App)
- **APIs**: WorldNewsAPI, GNews, NewsData.io, Groq
- **UI Components**: Radix UI, Lucide Icons
- **PDF Processing**: Mozilla PDF.js

---

## Support

Having issues? Check these resources:

- **API Setup Issues**: Only Groq API keys needed in `.env` file
- **Build Errors**: Run `npm install` again
- **News Not Loading**: Check internet connection (RSS feeds are free, no quotas!)
- **CORS Issues**: App automatically tries 3 different proxies
- **PDF Processing**: Ensure PDF.js worker version matches (4.9.155)

---

---

Made for staying informed

[Star this repo](https://github.com/your-repo) • [Report Bug](https://github.com/your-repo/issues) • [Request Feature](https://github.com/your-repo/issues)
