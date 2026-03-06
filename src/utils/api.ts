// Auto-detect API URL based on current hostname
const getApiUrl = () => {
  const hostname = window.location.hostname;
  // If accessing via localhost or 127.0.0.1, use localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  // Otherwise use the same hostname (for network access)
  return `http://${hostname}:5000/api`;
};

const API_URL = import.meta.env.VITE_API_URL || getApiUrl();

let authToken: string | null = localStorage.getItem('auth_token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
});

export const api = {
  setToken(token: string) {
    authToken = token;
    localStorage.setItem('auth_token', token);
  },

  clearToken() {
    authToken = null;
    localStorage.removeItem('auth_token');
  },

  async register(name: string, password: string, email?: string) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const data = await res.json();
    this.setToken(data.token);
    return data.user;
  },

  async login(name: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const data = await res.json();
    this.setToken(data.token);
    return data.user;
  },

  async getAllUsers() {
    const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async saveArticle(article: any) {
    const res = await fetch(`${API_URL}/articles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(article)
    });
    if (!res.ok) throw new Error('Failed to save article');
    return res.json();
  },

  async getArticles() {
    const res = await fetch(`${API_URL}/articles`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  },

  async toggleArticleBookmark(id: string) {
    const res = await fetch(`${API_URL}/articles/${id}/bookmark`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to toggle bookmark');
    return res.json();
  },

  async deleteArticle(id: string) {
    const res = await fetch(`${API_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete article');
    return res.json();
  },

  async savePDF(pdf: any) {
    const res = await fetch(`${API_URL}/pdfs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(pdf)
    });
    if (!res.ok) throw new Error('Failed to save PDF');
    return res.json();
  },

  async getPDFs() {
    const res = await fetch(`${API_URL}/pdfs`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch PDFs');
    return res.json();
  },

  async togglePDFBookmark(id: string) {
    const res = await fetch(`${API_URL}/pdfs/${id}/bookmark`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to toggle bookmark');
    return res.json();
  },

  async deletePDF(id: string) {
    const res = await fetch(`${API_URL}/pdfs/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete PDF');
    return res.json();
  },

  async savePreferences(prefs: any) {
    const res = await fetch(`${API_URL}/preferences`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(prefs)
    });
    if (!res.ok) throw new Error('Failed to save preferences');
    return res.json();
  },

  async getPreferences() {
    const res = await fetch(`${API_URL}/preferences`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch preferences');
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_URL}/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  }
};
