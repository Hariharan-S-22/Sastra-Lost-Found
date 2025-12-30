
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Dashboard from './components/Dashboard.tsx';
import Login from './components/Login.tsx';
import ItemForm from './components/ItemForm.tsx';
import ItemDetails from './components/ItemDetails.tsx';
import UserProfile from './components/UserProfile.tsx';
import ChatInbox from './components/ChatInbox.tsx';
import ChatRoom from './components/ChatRoom.tsx';
import ConfirmationPanel from './components/ConfirmationPanel.tsx';
import AdminUserManagement from './components/AdminUserManagement.tsx';
import { User, Item, ItemStatus, ChatMessage } from './types.ts';
import { getCurrentUser, logoutUser, updateUserTheme, isAdmin } from './services/authService.ts';
import { itemService } from './services/itemService.ts';

const THEME_STORAGE_KEY = 'sastra_lf_theme';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    return 'light';
  });

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    type: 'danger' | 'info' | 'warning';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    type: 'info',
    onConfirm: () => {},
  });

  const showConfirm = useCallback((config: {
    title: string;
    message: string;
    confirmLabel: string;
    type: 'danger' | 'info' | 'warning';
    onConfirm: () => void;
  }) => {
    setConfirmState({ ...config, isOpen: true });
  }, []);

  const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }));
  
  const refreshItems = useCallback(async () => {
    try {
      const data = await itemService.getItems();
      setItems(data);
    } catch (e) {
      console.error("Local Storage access failed:", e);
    }
  }, []);

  useEffect(() => {
    const initApp = async () => {
      const storedUser = getCurrentUser();
      if (storedUser) {
        setCurrentUser(storedUser);
      }
      await refreshItems();
      setLoading(false);
    };
    initApp();
  }, [refreshItems]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.theme) setTheme(user.theme);
    refreshItems(); 
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const toggleTheme = () => {
    const newTheme: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (currentUser) {
      const updatedUser: User = { ...currentUser, theme: newTheme };
      setCurrentUser(updatedUser);
      updateUserTheme(newTheme);
    }
  };

  const addItem = async (newItem: Item) => {
    const savedItem = await itemService.addItem(newItem);
    setItems(prev => [savedItem, ...prev]);
  };

  const removeItem = async (itemId: string) => {
    await itemService.deleteItem(itemId);
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateItemStatus = async (itemId: string, status: ItemStatus) => {
    await itemService.updateStatus(itemId, status);
    if (status === ItemStatus.CLAIMED || status === ItemStatus.RESOLVED) {
      setItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, status } : item));
    }
  };

  const reportItem = (itemId: string, userId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const reports = item.reports || [];
        if (!reports.includes(userId)) return { ...item, reports: [...reports, userId] };
      }
      return item;
    }));
  };

  const addMessageToItem = async (itemId: string, message: ChatMessage) => {
    await itemService.addMessage(itemId, message);
    setItems(prev => prev.map(item => {
      if (item.id === itemId) return { ...item, messages: [...(item.messages || []), message] };
      return item;
    }));
  };

  const clearChat = async (itemId: string) => {
    await itemService.deleteItem(itemId);
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[8px]">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-500">
        {currentUser && currentUser.onboarded && <Navbar user={currentUser} items={items} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />}
        
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/login" element={(!currentUser || !currentUser.onboarded) ? <Login onLoginSuccess={handleLogin} theme={theme} onToggleTheme={toggleTheme} /> : <Navigate to="/" />} />
            <Route path="/" element={currentUser && currentUser.onboarded ? <Dashboard items={items} user={currentUser} /> : <Navigate to="/login" />} />
            <Route path="/chats" element={currentUser && currentUser.onboarded ? <ChatInbox items={items} user={currentUser} onClearChat={clearChat} showConfirm={showConfirm} /> : <Navigate to="/login" />} />
            <Route path="/chat/:id" element={currentUser && currentUser.onboarded ? <ChatRoom items={items} user={currentUser} onUpdateStatus={updateItemStatus} onAddMessage={addMessageToItem} showConfirm={showConfirm} /> : <Navigate to="/login" />} />
            <Route path="/report/:type" element={currentUser && currentUser.onboarded ? <ItemForm user={currentUser} onAdd={addItem} /> : <Navigate to="/login" />} />
            <Route path="/item/:id" element={currentUser && currentUser.onboarded ? <ItemDetails items={items} user={currentUser} onUpdateStatus={updateItemStatus} onAddMessage={addMessageToItem} onRemoveItem={removeItem} onReportItem={reportItem} showConfirm={showConfirm} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={currentUser && currentUser.onboarded ? <UserProfile user={currentUser} items={items} /> : <Navigate to="/login" />} />
            <Route path="/admin/users" element={currentUser && currentUser.onboarded && isAdmin(currentUser.email) ? <AdminUserManagement currentUser={currentUser} showConfirm={showConfirm} /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <ConfirmationPanel
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          type={confirmState.type}
          onConfirm={() => { confirmState.onConfirm(); closeConfirm(); }}
          onCancel={closeConfirm}
        />

        <footer className="bg-white dark:bg-slate-900 border-t dark:border-slate-800 py-6 text-center text-slate-400 text-xs">
          <p className="font-bold tracking-widest text-[8px] opacity-60 uppercase">© {new Date().getFullYear()} Sastra Lost & Found</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
