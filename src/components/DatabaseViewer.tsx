import { useState, useEffect } from 'react';
import { Users, Database, Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { UserManager, User } from '../utils/userManager';
import DatabaseService from '../utils/database';
import { Language, ThemeMode } from '../App';

interface DatabaseViewerProps {
  language: Language;
  themeMode?: ThemeMode;
}

export function DatabaseViewer({ language, themeMode }: DatabaseViewerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const maskEmail = (email: string) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = local.length > 2 ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1] : local;
    return `${maskedLocal}@${domain}`;
  };
  
  // Only show for admin user "admin"
  const currentUser = UserManager.getCurrentUser();
  if (!currentUser || currentUser.name.toLowerCase() !== 'admin') {
    return null;
  }

  const t = {
    en: {
      title: 'Database Viewer',
      allUsers: 'All Users',
      noUsers: 'No users found',
      userId: 'User ID',
      name: 'Name',
      email: 'Email',
      password: 'Password',
      created: 'Created',
      lastLogin: 'Last Login',
      articles: 'Articles',
      pdfs: 'PDFs',
      bookmarks: 'Bookmarks',
      refresh: 'Refresh',
      showPasswords: 'Show Passwords',
      hidePasswords: 'Hide Passwords',
      deleteUser: 'Delete User',
      confirmDelete: 'Delete this user and all their data?'
    },
    hi: {
      title: 'डेटाबेस व्यूअर',
      allUsers: 'सभी उपयोगकर्ता',
      noUsers: 'कोई उपयोगकर्ता नहीं मिला',
      userId: 'उपयोगकर्ता आईडी',
      name: 'नाम',
      email: 'ईमेल',
      password: 'पासवर्ड',
      created: 'बनाया गया',
      lastLogin: 'अंतिम लॉगिन',
      articles: 'लेख',
      pdfs: 'पीडीएफ',
      bookmarks: 'बुकमार्क',
      refresh: 'रीफ्रेश',
      showPasswords: 'पासवर्ड दिखाएं',
      hidePasswords: 'पासवर्ड छुपाएं',
      deleteUser: 'उपयोगकर्ता हटाएं',
      confirmDelete: 'इस उपयोगकर्ता और उनका सारा डेटा हटाएं?'
    }
  };

  const translations = t[language as keyof typeof t] || t.en;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allUsers = await UserManager.getAllUsers();
      setUsers(allUsers);

      // Load stats for each user from backend
      const stats: Record<string, any> = {};
      const token = localStorage.getItem('auth_token');
      
      // Auto-detect API URL
      const hostname = window.location.hostname;
      const baseUrl = (hostname === 'localhost' || hostname === '127.0.0.1') 
        ? 'http://localhost:5000' 
        : `http://${hostname}:5000`;
      
      for (const user of allUsers) {
        try {
          const response = await fetch(`${baseUrl}/api/admin/user-stats/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userStats = await response.json();
            stats[user.id] = userStats;
          } else {
            stats[user.id] = { articlesCount: 0, pdfsCount: 0, bookmarkedCount: 0 };
          }
        } catch (error) {
          console.error(`Failed to load stats for user ${user.name}:`, error);
          stats[user.id] = { articlesCount: 0, pdfsCount: 0, bookmarkedCount: 0 };
        }
      }
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(translations.confirmDelete)) return;
    
    try {
      const allUsers = await UserManager.getAllUsers();
      const updatedUsers = allUsers.filter(u => u.id !== userId);
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
      
      await loadData();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <div className={`rounded-lg p-6 border ${
      themeMode === 'newspaper'
        ? 'bg-[#f9f3e8] border-[#8b7355]'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className={`h-6 w-6 ${
            themeMode === 'newspaper' ? 'text-[#5a4a3a]' : 'text-blue-600 dark:text-blue-400'
          }`} />
          <h3 className={`text-xl font-semibold ${
            themeMode === 'newspaper' ? 'text-[#2c1810]' : 'text-gray-900 dark:text-white'
          }`}>
            {translations.title}
          </h3>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
              themeMode === 'newspaper'
                ? 'bg-[#8b7355] hover:bg-[#6b5744] text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {translations.refresh}
          </button>
        </div>
      </div>

      <div className={`rounded-lg p-4 mb-4 ${
        themeMode === 'newspaper' ? 'bg-[#f4e8d0]' : 'bg-gray-50 dark:bg-gray-700'
      }`}>
        <h4 className={`font-medium mb-3 flex items-center gap-2 ${
          themeMode === 'newspaper' ? 'text-[#3d2817]' : 'text-gray-900 dark:text-white'
        }`}>
          <Users className="h-5 w-5" />
          {translations.allUsers} ({users.length})
        </h4>

        {users.length === 0 ? (
          <p className={`text-center py-4 ${
            themeMode === 'newspaper' ? 'text-[#5a4a3a]' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {translations.noUsers}
          </p>
        ) : (
          <div className="space-y-3">
            {users.map(user => (
              <div
                key={user.id}
                className={`p-4 rounded-lg border ${
                  themeMode === 'newspaper'
                    ? 'bg-[#f9f3e8] border-[#d4c5a9]'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1">
                      <span className={`font-semibold block truncate ${
                        themeMode === 'newspaper' ? 'text-[#2c1810]' : 'text-gray-900 dark:text-white'
                      }`}>
                        {user.name}
                      </span>
                      {user.email && (
                        <span className={`text-sm block truncate ${
                          themeMode === 'newspaper' ? 'text-[#5a4a3a]' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          ({maskEmail(user.email)})
                        </span>
                      )}
                    </div>
                    
                    <div className={`text-xs space-y-1 ${
                      themeMode === 'newspaper' ? 'text-[#5a4a3a]' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      <div className="break-all"><strong>{translations.userId}:</strong> {user.id}</div>
                      <div><strong>{translations.created}:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}</div>
                      <div><strong>{translations.lastLogin}:</strong> {user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {userStats[user.id] && (
                  <div className="flex gap-4 text-sm">
                    <span className={themeMode === 'newspaper' ? 'text-[#5a4a3a]' : 'text-gray-600 dark:text-gray-400'}>
                      {translations.pdfs}: <strong>{userStats[user.id].pdfsCount || 0}</strong>
                    </span>
                    <span className={themeMode === 'newspaper' ? 'text-[#5a4a3a]' : 'text-gray-600 dark:text-gray-400'}>
                      {translations.bookmarks}: <strong>{userStats[user.id].bookmarkedCount || 0}</strong>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
