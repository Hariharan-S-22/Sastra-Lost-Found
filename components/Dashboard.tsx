
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Item, ItemType, ItemStatus, User } from '../types';
import { CATEGORIES } from '../constants';
import { isAdmin as checkIsAdmin } from '../services/authService';

interface DashboardProps {
  items: Item[];
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ items, user }) => {
  const [filterType, setFilterType] = useState<ItemType>(ItemType.FOUND);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const isAdmin = checkIsAdmin(user.email);
  const navigate = useNavigate();

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesType = item.type === filterType;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      
      // Post should be NEW or PENDING_CLAIM to show in public feed
      // Once APPROVED (CLAIMED) or RESOLVED, it is strictly removed from the feed
      const isVisibleStatus = item.status === ItemStatus.NEW || item.status === ItemStatus.PENDING_CLAIM;
      
      // Hide posts with 3 or more reports from regular users
      const tooManyReports = !isAdmin && (item.reports && item.reports.length >= 3);
      
      return matchesType && matchesSearch && matchesCategory && isVisibleStatus && !tooManyReports;
    });
  }, [items, filterType, searchQuery, selectedCategory, isAdmin]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">University Registry</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Institutional Feed</p>
        </div>
        
        <div className="relative w-full lg:max-w-sm">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input
            type="text"
            placeholder="Quick search..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 font-bold text-xs shadow-sm dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-2">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <button
            onClick={() => setFilterType(ItemType.FOUND)}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterType === ItemType.FOUND ? 'bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Found Items
          </button>
          <button
            onClick={() => setFilterType(ItemType.LOST)}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterType === ItemType.LOST ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Lost Items
          </button>
        </div>
        
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition ${selectedCategory === 'All' ? 'bg-blue-900 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition ${selectedCategory === cat ? 'bg-blue-900 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const isReporter = item.reporterId === user.id;
            const isClaimant = item.messages?.some(m => m.senderId === user.id);
            const canChatDirectly = isReporter || isClaimant;
            const isDoodle = item.imagePaths[0].includes('material-design-icons');

            return (
              <div 
                key={item.id}
                className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-md relative"
              >
                <Link to={`/item/${item.id}`} className="block">
                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                    <img 
                      src={item.imagePaths[0]} 
                      alt={item.title}
                      className={`${isDoodle ? 'w-1/3 opacity-30 grayscale' : 'w-full h-full object-cover'} group-hover:scale-110 transition duration-700 ease-out`}
                      referrerPolicy="no-referrer"
                    />
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest text-white shadow-lg z-10 ${item.type === ItemType.FOUND ? 'bg-green-500' : 'bg-red-500'}`}>
                      {item.type}
                    </div>
                    
                    {item.status === ItemStatus.PENDING_CLAIM && (
                      <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-20">
                        <div className="bg-white/90 dark:bg-slate-900/90 px-3 py-2 rounded-xl text-center shadow-xl border border-white/50">
                          <i className="fas fa-clock text-blue-600 text-xs mb-1 animate-pulse"></i>
                          <p className="text-[7px] font-black uppercase text-slate-800 dark:text-white tracking-[0.2em] leading-tight">Verification In Progress</p>
                        </div>
                      </div>
                    )}

                    {isAdmin && item.reports && item.reports.length > 0 && (
                      <div className="absolute top-4 right-4 bg-red-600 text-white text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg border border-red-500/50 animate-pulse z-30">
                        <i className="fas fa-flag mr-1"></i> {item.reports.length} Flagged
                      </div>
                    )}
                  </div>
                </Link>

                {/* Direct Message Icon for relevant parties */}
                {canChatDirectly && (
                  <button 
                    onClick={() => navigate(`/chat/${item.id}`)}
                    className="absolute bottom-20 right-4 w-10 h-10 bg-blue-900 text-white rounded-xl shadow-xl flex items-center justify-center hover:bg-blue-800 transition transform active:scale-95 z-20"
                    title="Open Registry Log"
                  >
                    <i className="fas fa-comments text-xs"></i>
                  </button>
                )}

                <div className="p-5">
                  <Link to={`/item/${item.id}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">{item.category}</span>
                      <span className="text-[7px] font-black text-slate-300 dark:text-slate-600 uppercase">{item.date}</span>
                    </div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white truncate uppercase tracking-tight mb-4 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition">{item.title}</h3>
                    <div className="flex items-center text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-t border-slate-50 dark:border-slate-800 pt-4">
                      <i className="fas fa-map-marker-alt mr-2 text-red-500 opacity-70"></i>
                      <span className="truncate">{item.location.toUpperCase()}</span>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center bg-white dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 transition-colors shadow-inner">
          <i className="fas fa-box-open text-4xl text-slate-200 dark:text-slate-800 mb-6"></i>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No matching registry reports found</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
