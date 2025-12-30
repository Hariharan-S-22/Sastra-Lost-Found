
import { Link } from 'react-router-dom';
import { User, Item } from '../types';
import { isAdmin as checkIsAdmin } from '../services/authService';

interface NavbarProps {
  user: User;
  items: Item[];
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, items, onLogout, theme, onToggleTheme }) => {
  const isAdmin = checkIsAdmin(user.email);
  
  const activeChatsCount = items.filter(item => 
    (item.reporterId === user.id || (item.messages && item.messages.some(m => m.senderId === user.id))) && 
    (item.messages && item.messages.length > 0)
  ).length;

  return (
    <nav className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-blue-800 text-white p-2 rounded-lg w-9 h-9 flex items-center justify-center group-hover:bg-blue-900 transition-colors">
                <i className="fas fa-search-location text-lg"></i>
              </div>
              <span className="font-black text-lg md:text-xl text-blue-900 dark:text-white tracking-tighter uppercase hidden sm:inline">
                Sastra L&F
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {isAdmin && (
              <Link 
                to="/admin/users" 
                className="p-2 w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition flex items-center justify-center border border-amber-100 dark:border-amber-800 shadow-sm"
                title="Admin Control Center"
              >
                <i className="fas fa-shield-halved text-sm"></i>
              </Link>
            )}

            <button
              onClick={onToggleTheme}
              className="p-2 w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm active:scale-90"
            >
              <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-sm`}></i>
            </button>

            <Link 
              to="/chats" 
              className="p-2 w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition flex items-center justify-center relative border border-slate-100 dark:border-slate-700"
            >
              <i className="fas fa-comment-alt text-sm"></i>
              {activeChatsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800 animate-pulse">
                  {activeChatsCount}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-2">
              <Link to="/report/lost" className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 md:px-5 py-2 rounded-xl text-xs md:text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition whitespace-nowrap">
                <i className="fas fa-plus-circle"></i>
                <span className="hidden xs:inline">Lost</span>
              </Link>
              <Link to="/report/found" className="flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 md:px-5 py-2 rounded-xl text-xs md:text-sm font-bold hover:bg-green-100 dark:hover:bg-green-900/50 transition whitespace-nowrap">
                <i className="fas fa-bullhorn"></i>
                <span className="hidden xs:inline">Found</span>
              </Link>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

            <div className="flex items-center gap-3 pl-2 md:pl-0">
              <Link to="/profile" className="flex items-center gap-2 group">
                <img 
                  src={user.profilePicture} 
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-blue-100 dark:group-hover:ring-blue-900 transition shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                />
              </Link>
              <button 
                onClick={onLogout}
                className="text-slate-400 hover:text-red-500 transition p-2"
                title="Logout"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
