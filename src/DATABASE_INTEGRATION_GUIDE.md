# Database Integration Guide - AI News Analyzer

This guide provides step-by-step instructions for integrating a secure, real-time database into your AI News Analyzer application.

## 🎯 Recommended: Supabase Integration

Supabase is the recommended choice for this application because it offers:
- Real-time subscriptions
- PostgreSQL database (reliable and scalable)
- Built-in authentication
- Row-level security
- Free tier with generous limits
- Excellent India region support

---

## 📋 Step 1: Setup Supabase Project

### 1.1 Create Account
1. Visit https://supabase.com
2. Sign up with GitHub, Google, or email
3. Create a new project
4. Choose region closest to India (e.g., Southeast Asia - Singapore)
5. Set a strong database password
6. Wait 2-3 minutes for project initialization

### 1.2 Get API Credentials
1. Go to Project Settings → API
2. Copy these values:
   - `Project URL` (e.g., https://xyz.supabase.co)
   - `anon public` API key
   - `service_role` key (keep secure!)

---

## 📊 Step 2: Create Database Schema

### 2.1 Run SQL Commands

Go to SQL Editor in Supabase and run these commands:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create news_articles table
CREATE TABLE public.news_articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  published_date TIMESTAMP WITH TIME ZONE,
  topics TEXT[],
  language TEXT DEFAULT 'en',
  url TEXT,
  image_url TEXT,
  summary TEXT,
  bookmarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create article_analysis table
CREATE TABLE public.article_analysis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT,
  key_takeaways JSONB,
  exam_relevance TEXT,
  related_topics TEXT[],
  important_facts JSONB,
  potential_questions JSONB,
  sentiment TEXT,
  policy_implications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create pdf_documents table
CREATE TABLE public.pdf_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  content_text TEXT,
  page_count INTEGER,
  file_size INTEGER,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create pdf_analysis table
CREATE TABLE public.pdf_analysis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pdf_id UUID REFERENCES public.pdf_documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT,
  key_takeaways JSONB,
  exam_relevance TEXT,
  related_topics TEXT[],
  important_facts JSONB,
  potential_questions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  selected_topics TEXT[] DEFAULT ARRAY['all'],
  analysis_depth TEXT DEFAULT 'basic',
  dark_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_news_articles_user_id ON public.news_articles(user_id);
CREATE INDEX idx_news_articles_bookmarked ON public.news_articles(bookmarked);
CREATE INDEX idx_news_articles_published_date ON public.news_articles(published_date);
CREATE INDEX idx_pdf_documents_user_id ON public.pdf_documents(user_id);
CREATE INDEX idx_pdf_documents_upload_date ON public.pdf_documents(upload_date);
```

---

## 🔐 Step 3: Enable Row Level Security (RLS)

### 3.1 Create Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- News articles policies
CREATE POLICY "Users can view their own articles"
  ON public.news_articles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own articles"
  ON public.news_articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own articles"
  ON public.news_articles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own articles"
  ON public.news_articles FOR DELETE
  USING (auth.uid() = user_id);

-- PDF documents policies
CREATE POLICY "Users can view their own PDFs"
  ON public.pdf_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PDFs"
  ON public.pdf_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PDFs"
  ON public.pdf_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Analysis policies (similar pattern)
CREATE POLICY "Users can view their own article analysis"
  ON public.article_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own article analysis"
  ON public.article_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own PDF analysis"
  ON public.pdf_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PDF analysis"
  ON public.pdf_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 📦 Step 4: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## 🔧 Step 5: Create Supabase Client

Create `/utils/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper functions
export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });
  
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// News Article CRUD operations
export async function saveNewsArticle(article: any, userId: string) {
  const { data, error } = await supabase
    .from('news_articles')
    .insert({
      user_id: userId,
      title: article.title,
      content: article.content,
      source: article.source,
      published_date: article.date,
      topics: article.topics,
      language: article.language,
      url: article.url,
      image_url: article.imageUrl,
      summary: article.summary,
      bookmarked: article.bookmarked || false
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserNewsArticles(userId: string) {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function updateArticleBookmark(articleId: string, bookmarked: boolean) {
  const { data, error } = await supabase
    .from('news_articles')
    .update({ bookmarked })
    .eq('id', articleId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// PDF Document CRUD operations
export async function savePDFDocument(pdf: any, userId: string) {
  const { data, error } = await supabase
    .from('pdf_documents')
    .insert({
      user_id: userId,
      file_name: pdf.name,
      content_text: pdf.content,
      page_count: pdf.pageCount,
      language: pdf.language || 'en'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserPDFDocuments(userId: string) {
  const { data, error } = await supabase
    .from('pdf_documents')
    .select('*')
    .eq('user_id', userId)
    .order('upload_date', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function deletePDFDocument(pdfId: string) {
  const { error } = await supabase
    .from('pdf_documents')
    .delete()
    .eq('id', pdfId);
  
  if (error) throw error;
}

// Real-time subscriptions
export function subscribeToNewsArticles(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('news_articles_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'news_articles',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
}

export function subscribeToPDFDocuments(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('pdf_documents_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'pdf_documents',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
}
```

---

## 🔑 Step 6: Create Environment Variables

Create `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Add `.env` to your `.gitignore` file!

---

## 🎨 Step 7: Create Authentication Component

Create `/components/Auth.tsx`:

```typescript
import { useState } from 'react';
import { signIn, signUp, supabase } from '../utils/supabase';
import { toast } from 'sonner';

export function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
        toast.success('Account created! Please check your email to verify.');
      } else {
        await signIn(email, password);
        toast.success('Welcome back!');
        onAuthSuccess();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        
        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
```

---

## ✅ Step 8: Update App.tsx

Add authentication logic to your App.tsx:

```typescript
import { useEffect, useState } from 'react';
import { supabase, getCurrentUser } from './utils/supabase';
import { Auth } from './components/Auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth status
    getCurrentUser().then(user => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Auth onAuthSuccess={() => setUser(user)} />;
  }

  return (
    // Your existing app code here
  );
}
```

---

## 🚀 Step 9: Deploy & Test

### 9.1 Test Locally
```bash
npm run dev
```

### 9.2 Deploy to Vercel/Netlify
1. Connect your GitHub repository
2. Add environment variables in deployment settings
3. Deploy!

---

## 🔒 Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Enable MFA** on your Supabase account
3. **Use RLS policies** for all tables
4. **Rotate service_role key** periodically
5. **Monitor usage** in Supabase dashboard
6. **Set up email verification** for new users
7. **Implement rate limiting** on sensitive operations
8. **Backup your database** regularly

---

## 📊 Real-Time Features

### Enable Real-Time Updates

```typescript
// In your component
useEffect(() => {
  if (!user) return;

  const subscription = subscribeToNewsArticles(user.id, (payload) => {
    console.log('Change received!', payload);
    // Update your state here
  });

  return () => {
    supabase.removeChannel(subscription);
  };
}, [user]);
```

---

## 🌍 India-Specific Optimizations

1. **Region Selection**: Choose Singapore or Mumbai region for lowest latency
2. **CDN**: Use Supabase CDN for faster asset delivery
3. **Edge Functions**: Deploy edge functions for India-specific logic
4. **Localization**: Store multilingual content efficiently
5. **Caching**: Implement client-side caching for better performance

---

## 📈 Monitoring & Analytics

1. **Supabase Dashboard**: Monitor queries, storage, and auth
2. **Error Tracking**: Integrate Sentry or LogRocket
3. **Performance**: Use Web Vitals for frontend monitoring
4. **Usage Analytics**: Track feature usage with PostHog or Mixpanel

---

## 💡 Next Steps

1. Implement user profiles
2. Add social login (Google, GitHub)
3. Create sharing features
4. Add collaborative features
5. Implement advanced search
6. Create mobile app with React Native

---

## 🆘 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Discord**: Join Supabase Discord community
- **GitHub**: Check Supabase GitHub for examples
- **YouTube**: Search for "Supabase tutorials"

---

**Ready to build something amazing!** 🚀
