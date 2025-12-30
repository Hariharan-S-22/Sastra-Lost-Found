
import React from 'react';
import { Link } from 'react-router-dom';
import { Item, User } from '../types';
import { isAdmin as checkIsAdmin } from '../services/authService';

interface ChatInboxProps {
  items: Item[];
  user: User;
  onClearChat: (itemId: string) => void;
  showConfirm: (config: {
    title: string;
    message: string;
    confirmLabel: string;
    type: 'danger' | 'info' | 'warning';
    onConfirm: () => void;
  }) => void;
}

const ChatInbox: React.FC<ChatInboxProps> = ({ items, user, onClearChat, showConfirm }) => {
  const isAdmin = checkIsAdmin(user.email);

  
  const activeConversations = items
    .filter(item => (
      isAdmin ||
      item.reporterId === user.id || 
      (item.messages && item.messages.some(m => m.senderId === user.id))
    ))
    .filter(item => item.messages && item.messages.length > 0)
    .sort((a, b) => {
      const lastA = a.messages && a.messages.length > 0 ? a.messages[a.messages.length - 1].timestamp : '';
      const lastB = b.messages && b.messages.length > 0 ? b.messages[b.messages.length - 1].timestamp : '';
      return lastB.localeCompare(lastA);
    });

  const getAvatarUrl = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=475569&size=128&bold=true&rounded=true`;
  };

  const handleDeleteChat = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    showConfirm({
      title: isAdmin ? 'ADMIN: EXPUNGE SYSTEM LOG' : 'CLEAR RECOVERY SESSION',
      message: 'This action permanently erases the coordination history. This cannot be recovered.',
      confirmLabel: 'Confirm Deletion',
      type: 'danger',
      onConfirm: () => onClearChat(itemId)
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Registry Comms</h1>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-1">
            {isAdmin ? 'Campus-Wide Supervision Mode' : 'Institutional Communication Hub'}
          </p>
        </div>
      </div>

      {activeConversations.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="divide-y dark:divide-slate-700">
            {activeConversations.map(item => {
              const lastMessage = item.messages?.[item.messages.length - 1];
              const isUserReporter = item.reporterId === user.id;
              
              // For admin, show both names if possible. For student, show the counterparty.
              const contactName = isUserReporter 
                ? (lastMessage?.senderId === user.id ? 'Claimant' : lastMessage?.senderName || 'Student')
                : item.reporterName;

              return (
                <div key={item.id} className="relative group flex items-center">
                  <Link 
                    to={`/chat/${item.id}`}
                    className="flex-1 flex items-center gap-5 p-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all"
                  >
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <img 
                        src={item.imagePaths[0]} 
                        className="w-full h-full object-cover rounded-xl shadow-sm border border-slate-100 dark:border-slate-800" 
                        alt={item.title} 
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-black text-base text-slate-900 dark:text-white truncate uppercase tracking-tight">
                            {item.title}
                          </h3>
                          {isAdmin && !isUserReporter && !item.messages?.some(m => m.senderId === user.id) ? (
                            <span className="text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest bg-amber-500 text-white shadow-sm">SUPERVISION</span>
                          ) : (
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${isUserReporter ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                              {isUserReporter ? 'REPORTER' : 'CLAIMANT'}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase">{lastMessage?.timestamp}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <img src={getAvatarUrl(contactName)} className="w-4 h-4 rounded-full" alt="Avatar" />
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold truncate italic">
                          <span className="font-black not-italic text-slate-500 dark:text-slate-400 mr-2">{lastMessage?.senderName}:</span>
                          {lastMessage ? lastMessage.text : 'Syncing coordination...'}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="pr-5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleDeleteChat(e, item.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-400 hover:bg-red-600 hover:text-white transition flex items-center justify-center text-xs shadow-sm">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-20 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 shadow-inner">
          <i className="fas fa-comment-slash text-4xl text-slate-100 dark:text-slate-800 mb-6"></i>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No active campus-wide logs detected.</p>
        </div>
      )}
    </div>
  );
};

export default ChatInbox;
