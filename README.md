# 🚀 AI News Summarizer App 2.0

> **Transform news into knowledge** — Your intelligent companion for staying informed with AI-powered analysis and multi-language support.

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## ✨ Features

### 📰 **Smart Multi-Source News Aggregation**
- Intelligent API selection: **NewsData.io** (recent) → **GNews** (monthly) → **WorldNews** (backup)
- Automatic fallback system for maximum coverage
- Smart date range filtering (24h, 7 days, 30 days, custom)
- Real-time duplicate detection with unique IDs

### 🧠 **AI-Powered Analysis**
- **Groq API** integration with 3-key rotation for rate limit handling
- Lightweight summaries with key takeaways
- Exam-relevant insights extraction
- Sentiment analysis

### 📄 **PDF Processing**
- Upload and analyze PDF documents
- Extract text with **PDF.js**
- AI-powered content summarization
- Export analyzed content

### 🌍 **11 Language Support**
English • Hindi • Tamil • Bengali • Telugu • Marathi • Gujarati • Kannada • Malayalam • Punjabi • Urdu

### 🎯 **Topic Categories**
Economy • Polity • Environment • International Relations • Science & Tech • Society • History • Geography

### 🎨 **Modern UI/UX**
- Dark mode support
- Responsive design (mobile, tablet, desktop)
- Smooth animations with Tailwind CSS v3
- Radix UI components for accessibility

---

## 🚀 Quick Start

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

Visit **http://localhost:3000** 🎉

---

## 🔑 API Setup

### Required APIs

#### 1. **NewsData.io** (Primary for Recent News)
- **Free Tier**: 200 credits/day, 10 articles per credit, 12-hour delay
- **Best For**: Last 24h & Last week (highest volume)
- **Get Key**: [newsdata.io](https://newsdata.io)
- **Add to `.env`**: `VITE_NEWSDATA_API_KEY=your_key_here`

#### 2. **GNews** (Primary for Monthly)
- **Free Tier**: 100 requests/day, max 10 articles per request, 12-hour delay
- **Best For**: Last month (30-day history works perfectly)
- **Get Key**: [gnews.io](https://gnews.io)
- **Add to `.env`**: `VITE_GNEWS_API_KEY=your_key_here`

#### 3. **WorldNewsAPI** (Backup)
- **Free Tier**: 50 points/day, 1-month historical data
- **Get Key**: [worldnewsapi.com](https://worldnewsapi.com)
- **Add to `.env`**: `VITE_WORLD_NEWS_API_KEY=your_key_here`

#### 4. **Groq API** (AI Analysis)
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
# News APIs
VITE_WORLD_NEWS_API_KEY=your_worldnews_key
VITE_GNEWS_API_KEY=your_gnews_key
VITE_NEWSDATA_API_KEY=your_newsdata_key

# AI Analysis (Groq)
VITE_GROQ_API_KEY=your_groq_key_1
VITE_GROQ_API_KEY_2=your_groq_key_2
VITE_GROQ_API_KEY_3=your_groq_key_3
```

---

## 📁 Project Structure

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
│   │   ├── multiNewsApi.ts # Multi-source news fetching
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

## 🎯 How It Works

### Smart News Fetching Flow
```
User selects topics & date range
         ↓
    Is it recent (≤7 days)?
    ├─ YES → NewsData.io (200 credits/day)
    │         ↓ (if fails)
    │        GNews (100 req/day)
    │         ↓ (if fails)
    │        WorldNews (50 points/day)
    │
    └─ NO → GNews (30-day history)
              ↓ (if fails)
             NewsData.io
              ↓ (if fails)
             WorldNews
         ↓
Return articles with source info
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

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18.3.1, TypeScript |
| **Build Tool** | Vite 6.3.5 |
| **Styling** | Tailwind CSS v3.4.0 |
| **UI Components** | Radix UI, Lucide Icons |
| **PDF Processing** | PDF.js 4.9.155 |
| **AI Analysis** | Groq API (Llama models) |
| **News APIs** | WorldNewsAPI, GNews, NewsData.io |
| **State Management** | React Hooks |
| **Notifications** | Sonner |

---

## 📊 API Limitations & Solutions

| API | Free Tier | Historical Data | Best For |
|-----|-----------|----------------|----------|
| NewsData.io | 200 credits/day, 10 articles/credit | ⚠️ 12h delay | Recent (24h-7d) |
| GNews | 100 req/day, 10 articles/req | ✅ 30 days (12h delay) | Monthly |
| WorldNewsAPI | 50 points/day | ✅ 1 month | Backup |
| Groq | Generous | N/A | 3-key rotation |

**Optimized Strategy for India News:**
- **Last 24h & Last week**: NewsData.io first (200 credits = highest volume)
- **Last month**: GNews first (30-day history works perfectly)
- **All ranges**: Automatic fallback to other APIs if primary fails
- **Reality**: Expect 10-30 articles per fetch (free tier limits)

**Why This Works:**
- NewsData.io: 200 credits/day beats WorldNews's 50 points for recent news
- GNews: 30-day history + 100 req/day perfect for monthly searches
- WorldNews: Kept as backup for all ranges
- All APIs have 12-hour delay on free tier

**Console Logging:**
The app shows which API and key is being used in real-time:
- `🔄 Attempting NEWSDATA API (Key: ...1234)`
- `✅ SUCCESS: NEWSDATA returned 15 articles`

---

## 🎨 Features in Detail

### Dashboard
- Recent articles overview
- Bookmarked articles
- Processed PDFs
- Quick stats

### News Aggregator
- Multi-source fetching with fallback
- Search & filter by topic
- Date range selection (24h/week/month/custom)
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

## 🚧 Known Issues & Fixes

### ✅ Fixed Issues
1. **Date Range Bug**: Fixed incorrect 24h/week/month calculations using milliseconds
2. **API Priority**: Optimized to NewsData.io (recent) → GNews (monthly) → WorldNews (backup)
3. **PDF.js Version**: Corrected worker version mismatch (4.9.155)
4. **Duplicate Detection**: Changed from title-based to unique ID-based
5. **Tailwind CSS**: Reverted to stable v3.4.0 from problematic v4
6. **API Logging**: Added real-time console logs showing which API/key is used
7. **Server Port**: Updated to port 3000 with auto-open in browser
8. **News Card UI**: Enhanced with better visual hierarchy and interaction states

### 🔄 Ongoing Improvements
- Enhanced error handling
- Better rate limit management
- Improved caching strategy

---

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Figma Design**: Original design from [Figma Community](https://www.figma.com/design/gyTvphSj7O4ZRiB8SnwwDb/AI-News-Summarizer-App)
- **APIs**: WorldNewsAPI, GNews, NewsData.io, Groq
- **UI Components**: Radix UI, Lucide Icons
- **PDF Processing**: Mozilla PDF.js

---

## 📧 Support

Having issues? Check these resources:

- **API Setup Issues**: Verify keys in `.env` file
- **Build Errors**: Run `npm install` again
- **News Not Loading**: Check API quotas and internet connection
- **PDF Processing**: Ensure PDF.js worker version matches (4.9.155)

---

<div align="center">

**Made with ❤️ for staying informed**

[⭐ Star this repo](https://github.com/your-repo) • [🐛 Report Bug](https://github.com/your-repo/issues) • [✨ Request Feature](https://github.com/your-repo/issues)

</div>
