
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Item, User, ItemStatus, ChatMessage } from '../types';
import { isAdmin as checkIsAdmin } from '../services/authService';

interface ChatRoomProps {
  items: Item[];
  user: User;
  onUpdateStatus: (id: string, status: ItemStatus) => void;
  onAddMessage: (itemId: string, message: ChatMessage) => void;
  showConfirm: (config: {
    title: string;
    message: string;
    confirmLabel: string;
    type: 'danger' | 'info' | 'warning';
    onConfirm: () => void;
  }) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ items, user, onUpdateStatus, onAddMessage, showConfirm }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = items.find(i => i.id === id);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [focusedImage, setFocusedImage] = useState<string | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [item?.messages]);

  if (!item) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <i className="fas fa-comment-slash text-4xl text-slate-200 mb-4"></i>
        <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Registry log not found.</h3>
        <button onClick={() => navigate('/chats')} className="mt-6 bg-blue-900 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Return to Inbox</button>
      </div>
    );
  }

  const isOwner = item.reporterId === user.id;
  const isAdmin = checkIsAdmin(user.email);
  const isPendingApproval = item.status === ItemStatus.PENDING_CLAIM;
  const isClaimed = item.status === ItemStatus.CLAIMED;
  const isResolved = item.status === ItemStatus.RESOLVED;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isResolved) return;

    const chatMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: isAdmin ? `ADMIN (${user.name})` : user.name,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onAddMessage(item.id, chatMsg);
    setNewMessage('');
  };

  const handleApprove = () => {
    showConfirm({
      title: 'APPROVE CLAIM',
      message: 'By approving, the post will be removed from the public feed and recovery coordination will be officially synchronized.',
      confirmLabel: 'Confirm Approval',
      type: 'info',
      onConfirm: () => {
        onUpdateStatus(item.id, ItemStatus.CLAIMED);
        onAddMessage(item.id, {
          id: `system-approve-${Date.now()}`,
          senderId: 'SYSTEM',
          senderName: 'REGISTRY',
          text: 'PROTOCOL UPDATE: Claim approved. Coordination is now officially active. Item removed from feed.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });
  };

  const handleDeny = () => {
    showConfirm({
      title: 'DENY CLAIM',
      message: 'Are you sure the evidence provided is insufficient? This will reset the status to public and allow others to file requests.',
      confirmLabel: 'Deny Claim',
      type: 'danger',
      onConfirm: () => {
        onUpdateStatus(item.id, ItemStatus.NEW);
        onAddMessage(item.id, {
          id: `system-deny-${Date.now()}`,
          senderId: 'SYSTEM',
          senderName: 'REGISTRY',
          text: 'PROTOCOL UPDATE: Reporter has denied the claim evidence. Item status reset to public.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });
  };

  const handleResolve = () => {
    showConfirm({
      title: 'RESOLVE CASE',
      message: 'Has the item been successfully returned/recovered? Resolving will close the case and archive the log. This contributes to your community trust score.',
      confirmLabel: 'Mark as Resolved',
      type: 'info',
      onConfirm: () => {
        onUpdateStatus(item.id, ItemStatus.RESOLVED);
        onAddMessage(item.id, {
          id: `system-resolve-${Date.now()}`,
          senderId: 'SYSTEM',
          senderName: 'REGISTRY',
          text: 'PROTOCOL FINALIZED: Case successfully resolved. Registry closed. Thank you for your contribution to the SASTRA community.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });
  };

  const renderMessageImages = (msg: ChatMessage) => {
    const images = msg.images || (msg.image ? [msg.image] : []);
    if (images.length === 0) return null;

    return (
      <div className={`flex flex-wrap gap-2 mb-3 ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
        {images.map((img, idx) => (
          <div key={idx} className="relative group cursor-pointer inline-block" onClick={() => setFocusedImage(img)}>
            <img src={img} className="max-w-[200px] max-h-40 object-cover rounded-xl border-2 border-white/20 shadow-lg group-hover:brightness-90 transition" alt="Evidence" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <span className="bg-black/60 text-white text-[7px] font-black uppercase px-2 py-1 rounded-full backdrop-blur-sm">View</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col animate-in fade-in duration-500">
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-6 border-b dark:border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate('/chats')} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-600 transition">
            <i className="fas fa-arrow-left text-sm"></i>
          </button>
          <div>
            <div className="flex items-center gap-3">
               <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</h2>
               <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${
                 item.status === ItemStatus.PENDING_CLAIM ? 'bg-amber-50 text-amber-600' : 
                 (item.status === ItemStatus.CLAIMED ? 'bg-indigo-50 text-indigo-600' : 
                 (item.status === ItemStatus.RESOLVED ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'))
               }`}>
                 {item.status.replace('_', ' ')}
               </span>
            </div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Registry Session Log</p>
          </div>
        </div>
        <button onClick={() => navigate(`/item/${item.id}`)} className="text-[9px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 hover:underline">
          <i className="fas fa-info-circle"></i> Item Details
        </button>
      </div>

      {/* Coordination Console for Reporter */}
      {isOwner && (isPendingApproval || isClaimed) && !isResolved && (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <i className={`fas ${isPendingApproval ? 'fa-shield-alt text-amber-500' : 'fa-check-circle text-indigo-500'} text-xl`}></i>
            <div>
              <p className="text-[9px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-widest">
                {isPendingApproval ? 'Verification Pending' : 'Handover Process Active'}
              </p>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                {isPendingApproval ? 'Review evidence before approving' : 'Coordinate handover then mark as resolved'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isPendingApproval ? (
              <>
                <button onClick={handleApprove} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-green-700 transition active:scale-95">Approve Proof</button>
                <button onClick={handleDeny} className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest border border-red-100 transition active:scale-95">Deny</button>
              </>
            ) : (
              <button onClick={handleResolve} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition active:scale-95">Mark as Resolved</button>
            )}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/20 dark:bg-slate-950/20 p-6 space-y-6 scrollbar-hide">
        {item.messages?.map(msg => (
          <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : (msg.senderId === 'SYSTEM' ? 'justify-center' : 'justify-start')}`}>
            <div className={`max-w-[85%] p-5 rounded-2xl text-[12px] font-medium shadow-md leading-relaxed ${
              msg.senderId === user.id ? 'bg-blue-900 text-white rounded-tr-none' : 
              msg.senderId === 'SYSTEM' ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase text-center border-none py-2 px-6' :
              'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
            }`}>
              {msg.senderId !== 'SYSTEM' && <p className={`text-[8px] font-black uppercase tracking-widest mb-2 ${msg.senderId === user.id ? 'text-blue-200' : 'text-slate-400'}`}>{msg.senderName}</p>}
              
              {renderMessageImages(msg)}
              
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.senderId !== 'SYSTEM' && <div className={`text-[8px] mt-3 font-black ${msg.senderId === user.id ? 'text-blue-300 text-right' : 'text-slate-300'}`}>{msg.timestamp}</div>}
            </div>
          </div>
        ))}
        {isResolved && (
          <div className="flex justify-center py-4">
             <div className="bg-green-50 dark:bg-green-900/10 px-8 py-4 rounded-[2rem] border border-green-100 dark:border-green-900/20 text-center">
               <i className="fas fa-check-circle text-green-600 text-2xl mb-3"></i>
               <h4 className="text-[10px] font-black text-green-800 dark:text-green-400 uppercase tracking-widest">Registry Log Finalized</h4>
               <p className="text-[8px] text-green-600/70 font-bold uppercase tracking-widest mt-1">Item safely recovered</p>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      {!isResolved && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-b-[2.5rem] border-t dark:border-slate-800">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              placeholder="Input recovery coordination..."
              className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-[11px] font-bold uppercase tracking-tight dark:text-white focus:border-blue-500 transition-all"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="w-14 h-14 bg-blue-900 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-blue-800 transition active:scale-95 group">
              <i className="fas fa-paper-plane text-[11px] group-hover:translate-x-1 transition-transform"></i>
            </button>
          </form>
        </div>
      )}

      {/* High-Resolution Image Focus Overlay */}
      {focusedImage && (
        <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300" onClick={() => setFocusedImage(null)}>
           <div className="relative max-w-full max-h-full">
             <img src={focusedImage} className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10" alt="Focused Evidence" />
             <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] text-center mt-6">Protocol Evidence View • Click to close</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
