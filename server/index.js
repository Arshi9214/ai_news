const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize SQLite Database
const db = new Database(path.join(__dirname, 'newsapp.db'));

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_login TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL,
    url TEXT,
    date TEXT NOT NULL,
    topics TEXT NOT NULL,
    language TEXT NOT NULL,
    bookmarked INTEGER DEFAULT 0,
    analysis TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS pdfs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    upload_date TEXT NOT NULL,
    page_count INTEGER,
    bookmarked INTEGER DEFAULT 0,
    analysis TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    language TEXT NOT NULL,
    selected_topics TEXT NOT NULL,
    theme_mode TEXT NOT NULL,
    analysis_depth TEXT NOT NULL,
    last_sync TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_articles_user ON articles(user_id);
  CREATE INDEX IF NOT EXISTS idx_pdfs_user ON pdfs(user_id);
`);

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ============ AUTH ROUTES ============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const stmt = db.prepare('INSERT INTO users (id, name, email, password, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(userId, name, email || null, hashedPassword, now, now);

    const token = jwt.sign({ userId, name }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      user: { id: userId, name, email, createdAt: now, lastLogin: now },
      token
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    const stmt = db.prepare('SELECT * FROM users WHERE name = ?');
    const user = stmt.get(name);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(now, user.id);

    const token = jwt.sign({ userId: user.id, name: user.name }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        lastLogin: now
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all users (admin only)
app.get('/api/users', authenticateToken, (req, res) => {
  try {
    const currentUser = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.userId);
    
    if (currentUser.name.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = db.prepare('SELECT id, name, email, created_at, last_login FROM users').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ============ ARTICLE ROUTES ============

// Save article
app.post('/api/articles', authenticateToken, (req, res) => {
  try {
    const article = req.body;
    const now = new Date().toISOString();

    // Handle source as object or string
    const source = typeof article.source === 'string' ? article.source : article.source?.name || 'Unknown';

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO articles 
      (id, user_id, title, content, source, url, date, topics, language, bookmarked, analysis, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      article.id,
      req.user.userId,
      article.title,
      article.content,
      source,
      article.url || null,
      article.date,
      JSON.stringify(article.topics),
      article.language,
      article.bookmarked ? 1 : 0,
      article.analysis ? JSON.stringify(article.analysis) : null,
      now,
      now
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Article save error:', error.message);
    res.status(500).json({ error: 'Failed to save article', details: error.message });
  }
});

// Get articles
app.get('/api/articles', authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM articles WHERE user_id = ? ORDER BY date DESC');
    const articles = stmt.all(req.user.userId).map(a => ({
      ...a,
      topics: JSON.parse(a.topics),
      bookmarked: a.bookmarked === 1,
      date: new Date(a.date)
    }));

    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Toggle bookmark
app.patch('/api/articles/:id/bookmark', authenticateToken, (req, res) => {
  try {
    const article = db.prepare('SELECT bookmarked FROM articles WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId);
    
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const newBookmark = article.bookmarked === 1 ? 0 : 1;
    db.prepare('UPDATE articles SET bookmarked = ?, updated_at = ? WHERE id = ? AND user_id = ?')
      .run(newBookmark, new Date().toISOString(), req.params.id, req.user.userId);

    res.json({ success: true, bookmarked: newBookmark === 1 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

// Delete article
app.delete('/api/articles/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM articles WHERE id = ? AND user_id = ?').run(req.params.id, req.user.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// ============ PDF ROUTES ============

// Save PDF
app.post('/api/pdfs', authenticateToken, (req, res) => {
  try {
    const pdf = req.body;
    const now = new Date().toISOString();

    console.log('Saving PDF:', { id: pdf.id, name: pdf.name, userId: req.user.userId });

    // Check if PDF already exists
    const existing = db.prepare('SELECT id FROM pdfs WHERE id = ? AND user_id = ?').get(pdf.id, req.user.userId);
    
    if (existing) {
      console.log('PDF already exists, updating...');
      const stmt = db.prepare(`
        UPDATE pdfs 
        SET name = ?, content = ?, upload_date = ?, page_count = ?, bookmarked = ?, analysis = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `);
      
      stmt.run(
        pdf.name,
        pdf.content || '',
        typeof pdf.uploadDate === 'string' ? pdf.uploadDate : new Date(pdf.uploadDate).toISOString(),
        pdf.pageCount || 0,
        pdf.bookmarked ? 1 : 0,
        pdf.analysis ? JSON.stringify(pdf.analysis) : null,
        now,
        pdf.id,
        req.user.userId
      );
    } else {
      console.log('Inserting new PDF...');
      const stmt = db.prepare(`
        INSERT INTO pdfs 
        (id, user_id, name, content, upload_date, page_count, bookmarked, analysis, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        pdf.id,
        req.user.userId,
        pdf.name,
        pdf.content || '',
        typeof pdf.uploadDate === 'string' ? pdf.uploadDate : new Date(pdf.uploadDate).toISOString(),
        pdf.pageCount || 0,
        pdf.bookmarked ? 1 : 0,
        pdf.analysis ? JSON.stringify(pdf.analysis) : null,
        now,
        now
      );
    }

    console.log('PDF saved successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('PDF save error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to save PDF', details: error.message });
  }
});

// Get PDFs
app.get('/api/pdfs', authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM pdfs WHERE user_id = ? ORDER BY upload_date DESC');
    const pdfs = stmt.all(req.user.userId).map(p => ({
      ...p,
      bookmarked: p.bookmarked === 1,
      uploadDate: new Date(p.upload_date)
    }));

    res.json(pdfs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch PDFs' });
  }
});

// Toggle PDF bookmark
app.patch('/api/pdfs/:id/bookmark', authenticateToken, (req, res) => {
  try {
    console.log('Toggle bookmark for PDF:', req.params.id, 'User:', req.user.userId);
    
    const pdf = db.prepare('SELECT id, bookmarked FROM pdfs WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId);
    
    if (!pdf) {
      console.log('PDF not found. Checking all PDFs for user...');
      const allPdfs = db.prepare('SELECT id FROM pdfs WHERE user_id = ?').all(req.user.userId);
      console.log('User PDFs:', allPdfs);
      return res.status(404).json({ error: 'PDF not found' });
    }

    const newBookmark = pdf.bookmarked === 1 ? 0 : 1;
    console.log('Updating bookmark to:', newBookmark);
    
    db.prepare('UPDATE pdfs SET bookmarked = ?, updated_at = ? WHERE id = ? AND user_id = ?')
      .run(newBookmark, new Date().toISOString(), pdf.id, req.user.userId);

    console.log('Bookmark updated successfully');
    res.json({ success: true, bookmarked: newBookmark === 1 });
  } catch (error) {
    console.error('PDF bookmark error:', error.message);
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

// Delete PDF
app.delete('/api/pdfs/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM pdfs WHERE id = ? AND user_id = ?').run(req.params.id, req.user.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete PDF' });
  }
});

// ============ PREFERENCES ROUTES ============

// Save preferences
app.post('/api/preferences', authenticateToken, (req, res) => {
  try {
    const prefs = req.body;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO preferences 
      (user_id, language, selected_topics, theme_mode, analysis_depth, last_sync)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      req.user.userId,
      prefs.language,
      JSON.stringify(prefs.selectedTopics),
      prefs.themeMode,
      prefs.analysisDepth,
      now
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

// Get preferences
app.get('/api/preferences', authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM preferences WHERE user_id = ?');
    const prefs = stmt.get(req.user.userId);

    if (!prefs) return res.json(null);

    res.json({
      ...prefs,
      selectedTopics: JSON.parse(prefs.selected_topics)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// ============ STATS ROUTE ============

app.get('/api/stats', authenticateToken, (req, res) => {
  try {
    const articlesCount = db.prepare('SELECT COUNT(*) as count FROM articles WHERE user_id = ?').get(req.user.userId).count;
    const bookmarkedArticles = db.prepare('SELECT COUNT(*) as count FROM articles WHERE user_id = ? AND bookmarked = 1').get(req.user.userId).count;
    const pdfsCount = db.prepare('SELECT COUNT(*) as count FROM pdfs WHERE user_id = ?').get(req.user.userId).count;
    const bookmarkedPdfs = db.prepare('SELECT COUNT(*) as count FROM pdfs WHERE user_id = ? AND bookmarked = 1').get(req.user.userId).count;

    res.json({
      articlesCount,
      bookmarkedCount: bookmarkedArticles + bookmarkedPdfs,
      pdfsCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Admin: Get stats for specific user
app.get('/api/admin/user-stats/:userId', authenticateToken, (req, res) => {
  try {
    const currentUser = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.userId);
    
    if (currentUser.name.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userId = req.params.userId;
    const articlesCount = db.prepare('SELECT COUNT(*) as count FROM articles WHERE user_id = ?').get(userId).count;
    const bookmarkedArticles = db.prepare('SELECT COUNT(*) as count FROM articles WHERE user_id = ? AND bookmarked = 1').get(userId).count;
    const pdfsCount = db.prepare('SELECT COUNT(*) as count FROM pdfs WHERE user_id = ?').get(userId).count;
    const bookmarkedPdfs = db.prepare('SELECT COUNT(*) as count FROM pdfs WHERE user_id = ? AND bookmarked = 1').get(userId).count;

    res.json({
      articlesCount,
      bookmarkedCount: bookmarkedArticles + bookmarkedPdfs,
      pdfsCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Network: http://YOUR_IP:${PORT}`);
  console.log(`✅ Database: ${path.join(__dirname, 'newsapp.db')}`);
});
