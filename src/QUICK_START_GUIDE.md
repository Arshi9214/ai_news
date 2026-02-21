# 🚀 Quick Start Guide - AI News Analyzer

## Get Started in 5 Minutes!

### 📦 Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Code editor (VS Code recommended)

---

## ⚡ Quick Setup

### Step 1: Install Dependencies
```bash
npm install
```

This installs:
- React + TypeScript
- Tailwind CSS v4
- Lucide React (icons)
- Sonner (toast notifications)
- PDF.js (PDF parsing)
- jsPDF (PDF export)
- React Router (navigation)
- And more...

---

### Step 2: Configure API Keys (Optional but Recommended)

#### Groq API (AI Summaries) - FREE & FAST ⚡
1. Visit https://console.groq.com
2. Sign up (free)
3. Create API key
4. Open `/utils/groqApi.ts`
5. Replace `YOUR_GROQ_API_KEY_1_HERE` with your key
6. (Optional) Add 2-3 more keys for rotation

#### WorldNewsAPI (News) - RECOMMENDED 📰
1. Visit https://worldnewsapi.com
2. Sign up (free tier: 500/day)
3. Get API key
4. Open `/utils/multiNewsApi.ts`
5. Replace `YOUR_WORLDNEWS_API_KEY_HERE`

#### NewsData.io (Backup) - OPTIONAL
1. Visit https://newsdata.io
2. Sign up (free tier: 200/day)
3. Get API key
4. Add to `/utils/multiNewsApi.ts`

#### GNews (Fallback) - OPTIONAL
1. Visit https://gnews.io
2. Sign up (free tier: 100/day)
3. Get API key
4. Add to `/utils/multiNewsApi.ts`

---

### Step 3: Run Development Server
```bash
npm run dev
```

Open browser at `http://localhost:5173`

---

## ✅ You're Done!

### What Works Now:
- ✅ Full UI with 11 languages
- ✅ Dark mode toggle
- ✅ Mobile hamburger menu
- ✅ Onboarding for first-time users
- ✅ PDF upload & analysis
- ✅ Export to PDF
- ✅ Bookmark functionality
- ✅ Topic filtering
- ✅ Responsive design

### What Needs API Keys:
- ⚠️ Real-time news fetching (works with dummy data)
- ⚠️ AI-powered summaries (shows fallback summaries)
- ⚠️ Advanced PDF analysis (works with basic analysis)

---

## 🎯 Testing Without API Keys

The app works perfectly without API keys! You'll see:
- Beautiful UI components
- Mock/dummy data
- All features functional
- Onboarding experience
- Mobile responsiveness
- PDF upload (local processing)
- Export functionality

Just add API keys when you want real data!

---

## 📱 Test Mobile View

### Option 1: Chrome DevTools
1. Open app in Chrome
2. Press F12
3. Click "Toggle device toolbar" (Ctrl+Shift+M)
4. Select "iPhone 12 Pro" or "Galaxy S20"
5. Test hamburger menu, onboarding, etc.

### Option 2: Real Device
1. Find your local IP: `ipconfig` or `ifconfig`
2. Run `npm run dev -- --host`
3. Open `http://YOUR_IP:5173` on phone
4. Test touch interactions

---

## 🔧 Common Issues & Fixes

### Issue: "Module not found"
**Fix**: Run `npm install` again

### Issue: "Port 5173 already in use"
**Fix**: Kill process or use different port:
```bash
npm run dev -- --port 3000
```

### Issue: API not working
**Fix**: Check API keys are correct, check console for errors

### Issue: Onboarding not showing
**Fix**: Clear localStorage:
- Open DevTools → Application → Local Storage → Clear

### Issue: PDF upload fails
**Fix**: Ensure PDF is < 50MB, valid PDF format

---

## 🌟 Pro Tips

### 1. Skip Onboarding (for testing)
Add `?skip_onboarding=true` to URL

### 2. Test Different Languages
1. Click language selector in header
2. Or open hamburger menu → Settings → Language

### 3. Enable Dark Mode
1. Click sun/moon icon in header
2. Or hamburger menu → Dark Mode toggle

### 4. Test PDF Analysis
1. Download any PDF (< 50MB)
2. Go to "PDF Analysis" section
3. Drag & drop or click to upload
4. View analysis (basic analysis works without API)

### 5. Test Bookmarks
1. Click star icon on any news card
2. Go to Dashboard
3. See bookmarked items highlighted

---

## 📚 Next Steps

### Immediate (5-10 minutes)
- [ ] Test all features
- [ ] Try different screen sizes
- [ ] Complete onboarding tour
- [ ] Upload a test PDF
- [ ] Export something to PDF

### Soon (1 hour)
- [ ] Get free Groq API key
- [ ] Get free news API key
- [ ] Configure API keys
- [ ] Test real news fetching
- [ ] Test AI summaries

### Later (Optional)
- [ ] Set up Supabase database (see DATABASE_INTEGRATION_GUIDE.md)
- [ ] Deploy to Vercel/Netlify
- [ ] Configure custom domain
- [ ] Add analytics
- [ ] Invite users for testing

---

## 📖 Full Documentation

### Detailed Guides
- **`/API_SETUP_GUIDE.md`** - Complete API setup instructions
- **`/DATABASE_INTEGRATION_GUIDE.md`** - Supabase setup (optional)
- **`/IMPLEMENTATION_STATUS.md`** - Feature checklist
- **`/FINAL_IMPLEMENTATION_SUMMARY.md`** - All features explained

### Component Documentation
- Each component has detailed JSDoc comments
- Check `/components` folder for individual files
- Read inline comments for logic explanations

---

## 🆘 Need Help?

### Resources
1. **Console Errors**: Press F12, check Console tab
2. **Network Tab**: See API requests/responses
3. **React DevTools**: Install browser extension
4. **Documentation**: Read guide files in root

### Community
- Groq Discord: https://discord.gg/groq
- React Community: https://react.dev/community
- Supabase Discord: https://discord.supabase.com

---

## 🎨 Customization Ideas

### Easy Customizations
```typescript
// Change primary color
// In Tailwind classes: blue-600 → purple-600

// Change default language
// In App.tsx
const [language, setLanguage] = useState<Language>('hi'); // Hindi

// Change default dark mode
const [darkMode, setDarkMode] = useState(true); // Start in dark mode

// Disable onboarding
// In Onboarding.tsx, change:
const completed = localStorage.getItem('onboarding_completed');
if (true) { // Always skip
```

### Advanced Customizations
- Add more languages in translation files
- Change color scheme in Tailwind config
- Add custom topics for news filtering
- Customize PDF analysis prompts
- Add more export formats

---

## 🚀 Deploy to Production

### Vercel (Recommended)
1. Push code to GitHub
2. Visit https://vercel.com
3. Import repository
4. Add environment variables:
   ```
   VITE_GROQ_API_KEY=your_key
   VITE_WORLDNEWS_API_KEY=your_key
   ```
5. Deploy! ✨

### Netlify
1. Push code to GitHub
2. Visit https://netlify.com
3. New site from Git
4. Add environment variables
5. Deploy!

### Build Locally
```bash
npm run build
# Files in /dist folder
# Upload to any static host
```

---

## ✨ You're All Set!

Your AI News Analyzer is ready to help students across India prepare for competitive exams with:
- 🌍 11 Indian languages
- 📰 Real-time India news
- 🤖 AI-powered analysis
- 📱 Mobile-responsive design
- 📄 PDF processing & export
- 🎓 Exam-focused content

**Happy Building!** 🎉

---

**Questions?** Check the detailed guides in the root directory!

**Feature Requests?** All major features are complete - customize to your needs!

**Issues?** Check console errors and verify API keys!
