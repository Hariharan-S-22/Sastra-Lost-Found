
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Item, User, ItemStatus, ItemType, ChatMessage } from '../types';
import { isAdmin as checkIsAdmin } from '../services/authService';

interface ItemDetailsProps {
  items: Item[];
  user: User;
  onUpdateStatus: (id: string, status: ItemStatus) => void;
  onAddMessage: (itemId: string, message: ChatMessage) => void;
  onRemoveItem: (id: string) => void;
  onReportItem: (itemId: string, userId: string) => void;
  showConfirm: (config: {
    title: string;
    message: string;
    confirmLabel: string;
    type: 'danger' | 'info' | 'warning';
    onConfirm: () => void;
  }) => void;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ items, user, onUpdateStatus, onAddMessage, onRemoveItem, onReportItem, showConfirm }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = items.find(i => i.id === id);
  const claimFileInputRef = useRef<HTMLInputElement>(null);

  const [isClaiming, setIsClaiming] = useState(false);
  const [proof, setProof] = useState('');
  const [claimImages, setClaimImages] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <i className="fas fa-search text-3xl text-slate-200 mb-4"></i>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Registry entry not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 bg-blue-900 text-white px-6 py-2 rounded-lg font-black uppercase tracking-widest text-[10px]">Back to Feed</button>
      </div>
    );
  }

  const isOwner = item.reporterId === user.id;
  const isAdmin = checkIsAdmin(user.email);
  const canManage = isOwner || isAdmin;
  const isPendingApproval = item.status === ItemStatus.PENDING_CLAIM;
  const isClaimed = item.status === ItemStatus.CLAIMED;
  const isResolved = item.status === ItemStatus.RESOLVED;
  const hasReported = item.reports?.includes(user.id);
  const hasMessages = item.messages && item.messages.some(m => m.senderId === user.id || isOwner);

  const handleClaimImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setClaimImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeClaimImage = (index: number) => {
    setClaimImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleReport = () => {
    if (hasReported) return;

    showConfirm({
      title: 'REPORT FAKE POST',
      message: 'Are you sure this post is fraudulent? Malicious reporting affects your Trust Score.',
      confirmLabel: 'Confirm Report',
      type: 'warning',
      onConfirm: () => {
        onReportItem(item.id, user.id);
      }
    });
  };

  const handleDeleteItem = () => {
    showConfirm({
      title: isAdmin ? 'ADMIN OVERRIDE: ERASE LOG' : 'ERASE CASE LOG',
      message: 'This report will be permanently erased from the registry. This cannot be undone.',
      confirmLabel: 'Delete Case',
      type: 'danger',
      onConfirm: () => {
        setIsDeleting(true);
        setTimeout(() => {
          onRemoveItem(item.id);
          navigate('/');
        }, 1000);
      }
    });
  };

  const handleApprove = () => {
    showConfirm({
      title: 'APPROVE CLAIM',
      message: 'Confirming this recovery request will remove the post from public view. Continue?',
      confirmLabel: 'Approve & Finalize',
      type: 'info',
      onConfirm: () => {
        onUpdateStatus(item.id, ItemStatus.CLAIMED);
        onAddMessage(item.id, {
          id: `system-approve-${Date.now()}`,
          senderId: 'SYSTEM',
          senderName: 'REGISTRY',
          text: 'PROTOCOL UPDATE: Claim approved via item console. coordination active.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        navigate(`/chat/${item.id}`);
      }
    });
  };

  const handleDeny = () => {
    showConfirm({
      title: 'DENY CLAIM',
      message: 'Rejecting this claim will reopen the case to the public. Are you sure?',
      confirmLabel: 'Deny Claim',
      type: 'danger',
      onConfirm: () => {
        onUpdateStatus(item.id, ItemStatus.NEW);
        onAddMessage(item.id, {
          id: `system-deny-${Date.now()}`,
          senderId: 'SYSTEM',
          senderName: 'REGISTRY',
          text: 'PROTOCOL UPDATE: Reporter has denied the claim in console. Case reopened.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });
  };

  const handleResolve = () => {
    showConfirm({
      title: 'RESOLVE CASE',
      message: 'Finalizing this case will archive the log and increment your community contribution. Has the item been successfully recovered?',
      confirmLabel: 'Resolve & Close',
      type: 'info',
      onConfirm: () => {
        onUpdateStatus(item.id, ItemStatus.RESOLVED);
        onAddMessage(item.id, {
          id: `system-resolve-${Date.now()}`,
          senderId: 'SYSTEM',
          senderName: 'REGISTRY',
          text: 'PROTOCOL FINALIZED: Reporter marked this case as resolved. Thank you for making SASTRA safer.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof.trim()) return;
    setIsSuccess(true);
    
    onUpdateStatus(item.id, ItemStatus.PENDING_CLAIM);

    const autoMsg: ChatMessage = {
      id: `claim-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      text: `Evidence Submission: ${user.name} has filed a recovery request. Information: "${proof}"`,
      images: claimImages,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onAddMessage(item.id, autoMsg);
    
    setTimeout(() => {
      setIsClaiming(false);
      setIsSuccess(false);
      navigate(`/chat/${item.id}`);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500 overflow-hidden">
      {/* Mini Breadcrumb Header */}
      <div className="flex items-center justify-between py-2 px-1 mb-2">
        <button onClick={() => navigate('/')} className="text-slate-400 font-black uppercase text-[9px] tracking-widest flex items-center gap-2 hover:text-blue-900 transition">
          <i className="fas fa-chevron-left"></i> Registry Feed
        </button>
        <div className="flex gap-2">
          {canManage && (
            <button onClick={handleDeleteItem} disabled={isDeleting} className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition">
              {isDeleting ? 'Removing...' : 'Delete Case'}
            </button>
          )}
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopySuccess(true);
              setTimeout(() => setCopySuccess(false), 2000);
            }}
            className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200"
          >
            {copySuccess ? 'Link Copied' : 'Share Case'}
          </button>
        </div>
      </div>

      {/* Main Single-Screen Content Grid */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden h-full">
        
        {/* LEFT COLUMN: Visual Media (40%) */}
        <div className="lg:w-[40%] flex flex-col gap-4 overflow-hidden h-full">
          <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden flex-1 shadow-xl border border-slate-100 dark:border-slate-800 group">
            <img 
              src={item.imagePaths[0]} 
              className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-110" 
              aria-hidden="true"
              alt=""
            />
            <div className="absolute inset-0 flex items-center justify-center p-8">
               <img 
                 src={item.imagePaths[0]} 
                 className="max-w-full max-h-full object-contain relative z-10 rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.03]" 
                 alt={item.title} 
                 referrerPolicy="no-referrer"
               />
            </div>
            <div className={`absolute top-6 left-6 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-xl z-20 ${item.type === ItemType.FOUND ? 'bg-green-500' : 'bg-red-500'}`}>
              {item.type}
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-md flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 font-black text-xs border border-blue-100">
               {item.reporterName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Reporter Identity</p>
              <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase truncate">{item.reporterName}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleReport}
              disabled={hasReported || isOwner}
              className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition shadow-sm border ${hasReported ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600'}`}
            >
              <i className="fas fa-flag mr-2"></i> {hasReported ? 'Post Reported' : 'Report Fake Post'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Info & Actions (60%) - Internal Scrolling */}
        <div className="lg:w-[60%] flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden h-full">
          
          <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8 scrollbar-hide">
            {/* Header Identity */}
            <div className="border-b dark:border-slate-800 pb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg border ${
                  item.status === ItemStatus.NEW ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  item.status === ItemStatus.PENDING_CLAIM ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' :
                  (item.status === ItemStatus.CLAIMED ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-green-50 text-green-600 border-green-100')
                }`}>{item.status.replace('_', ' ')}</span>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Registry Entry #{item.id}</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight mb-2">
                {item.title}
              </h1>
              <p className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.25em]">Logged on {item.date}</p>
            </div>

            {/* REPORTER QUICK ACTIONS - NOW ALWAYS VISIBLE TO OWNER UNLESS RESOLVED */}
            {isOwner && !isResolved && (
              <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner space-y-4">
                <div className="flex items-center gap-3">
                  <i className={`fas ${isPendingApproval ? 'fa-shield-alt text-amber-500' : (isClaimed ? 'fa-check-double text-indigo-500' : 'fa-cog text-slate-400')} text-xl`}></i>
                  <h3 className="text-[10px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-widest">Reporter Console</h3>
                </div>
                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase">
                  {isPendingApproval 
                    ? 'Evidence has been submitted. Review details or visit the chat for detailed audit.'
                    : isClaimed 
                    ? 'Coordination is active. Once recovery is confirmed, finalize below.'
                    : 'Manage this case entry. You can mark it as resolved if the item was recovered outside the platform.'
                  }
                </p>
                <div className="flex flex-wrap gap-4">
                  {isPendingApproval && (
                    <>
                      <button onClick={handleApprove} className="flex-1 min-w-[120px] bg-green-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg">Approve Claim</button>
                      <button onClick={handleDeny} className="flex-1 min-w-[120px] bg-red-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg">Deny Request</button>
                    </>
                  )}
                  <button onClick={handleResolve} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition">Mark as Resolved & Archive</button>
                </div>
              </div>
            )}

            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] border-l-4 border-blue-900 pl-4 py-0.5">Registry Metadata</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</span>
                  <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase">{item.category}</span>
                </div>
                <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date Reported</span>
                  <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase">{item.date}</span>
                </div>
                <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2 col-span-full">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                  <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase truncate ml-6">{item.location}</span>
                </div>
              </div>
            </div>

            {/* Case Briefing */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] border-l-4 border-blue-900 pl-4 py-0.5">Briefing</h3>
              <p className="text-lg font-black text-slate-800 dark:text-white leading-relaxed bg-slate-50 dark:bg-slate-950 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 italic shadow-inner">
                "{item.description}"
              </p>
            </div>

            {/* CLAIM ACTIONS */}
            <div className="pt-4 border-t dark:border-slate-800">
              {isResolved ? (
                 <div className="text-center p-8 bg-green-50 dark:bg-green-900/10 rounded-[2.5rem] border border-green-100 dark:border-green-900/20">
                    <i className="fas fa-check-circle text-green-600 text-3xl mb-4"></i>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Registry Case Finalized</h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-4">This item has been successfully recovered and coordination archived.</p>
                    <button onClick={() => navigate(`/chat/${item.id}`)} className="text-green-600 font-black text-[10px] uppercase tracking-widest underline underline-offset-4">View Final Audit Log</button>
                 </div>
              ) : (hasMessages || isOwner || isPendingApproval || isClaimed) ? (
                <div className="text-center p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/20">
                  <i className="fas fa-comments text-blue-600 text-3xl mb-4"></i>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Registry Log Active</h3>
                  <button onClick={() => navigate(`/chat/${item.id}`)} className="bg-blue-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-800 transition">
                    Access Recovery Channel
                  </button>
                </div>
              ) : isClaiming ? (
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl shadow-xl border-2 border-blue-600 animate-in zoom-in duration-300">
                  <form onSubmit={handleClaimSubmit} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-id-badge text-blue-600 text-2xl"></i>
                      <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Ownership Protocol</h3>
                    </div>
                    
                    <textarea
                      required
                      rows={3}
                      placeholder="Detail unique markers known only to the owner..."
                      className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 font-bold text-xs"
                      value={proof}
                      onChange={(e) => setProof(e.target.value)}
                    />

                    <div className="space-y-4">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Visual Evidence (Required for verification)</p>
                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          {claimImages.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                              <img src={img} className="w-full h-full object-cover" alt="Proof Preview" />
                              <button type="button" onClick={() => removeClaimImage(idx)} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><i className="fas fa-trash-alt text-xs"></i></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => claimFileInputRef.current?.click()} className="aspect-square bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition">
                            <i className="fas fa-plus text-xs mb-1"></i>
                            <span className="text-[7px] font-black uppercase">Add Photo</span>
                          </button>
                        </div>
                        <input type="file" ref={claimFileInputRef} onChange={handleClaimImagesChange} accept="image/*" multiple className="hidden" />
                        
                        <div className="flex gap-4">
                          <button type="button" onClick={() => { setIsClaiming(false); setClaimImages([]); }} className="flex-1 text-slate-400 text-[8px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-900 rounded-xl py-4 border border-slate-200 dark:border-slate-800">Abort Process</button>
                          <button type="submit" className="flex-[2] bg-blue-900 text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg">Submit for Review</button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <button 
                  onClick={() => setIsClaiming(true)} 
                  className="w-full bg-blue-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-800 transition flex items-center justify-center gap-3"
                >
                  <i className="fas fa-hand-holding-heart"></i>
                  File Recovery Request
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
