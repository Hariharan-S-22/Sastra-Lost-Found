
import React, { useState, useRef, useEffect } from 'react';
import { User, Item } from '../types';
import { Link } from 'react-router-dom';
import { BRANCHES, YEARS } from '../constants';
import { updateUserProfile, isAdmin as checkIsAdmin } from '../services/authService';

interface UserProfileProps {
  user: User;
  items: Item[];
}

const UserProfile: React.FC<UserProfileProps> = ({ user, items }) => {
  const [isEditing, setIsEditing] = useState(false);
  const isAdmin = checkIsAdmin(user.email);
  
  const [editedUser, setEditedUser] = useState<Partial<User>>({
    name: user.name || '',
    branch: user.branch || BRANCHES[0],
    yearOfStudy: user.yearOfStudy || YEARS[0],
    residency: user.residency || 'Unspecified',
  });
  
  useEffect(() => {
    setEditedUser({
      name: user.name || '',
      branch: user.branch || BRANCHES[0],
      yearOfStudy: user.yearOfStudy || YEARS[0],
      residency: user.residency || 'Unspecified',
    });
  }, [user]);

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imgError, setImgError] = useState(false);
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=1e3a8a&color=fff&size=256&bold=true`;

  const userItems = items.filter(item => item.reporterId === user.id || item.reporterId === btoa(user.email));
  const openCases = userItems.filter(i => i.status !== 'RESOLVED').length;
  const trustScore = typeof user.trustScore === 'number' ? user.trustScore : 100;

  const handleSave = async () => {
    if (!editedUser.name?.trim()) {
      alert("Institutional Name cannot be empty.");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateUserProfile(editedUser);
      if (updated) {
        setIsEditing(false);
      }
    } catch (e) {
      console.error("Save Error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await updateUserProfile({ profilePicture: base64 });
        window.location.reload();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-10 transition-colors">
        <div className="relative group">
          <div className="w-44 h-44 rounded-[3rem] overflow-hidden bg-blue-50 dark:bg-slate-900 ring-8 ring-blue-50 dark:ring-blue-900/20 shadow-2xl transition-transform duration-500 group-hover:scale-105">
            <img 
              src={imgError ? fallbackAvatar : (user.profilePicture || fallbackAvatar)} 
              alt={user.name} 
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-2xl hover:bg-blue-700 transition active:scale-95"
          >
            <i className="fas fa-camera text-sm"></i>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        
        <div className="flex-1 w-full text-center md:text-left">
          {!isEditing ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase">
                  {user.name || "Institutional Member"}
                </h1>
                <div className="flex gap-2 justify-center md:justify-start">
                  {isAdmin ? (
                    <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full border border-amber-600 shadow-lg uppercase tracking-widest animate-pulse flex items-center gap-2">
                      <i className="fas fa-shield-halved"></i> System Admin
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black rounded-full border border-blue-100 dark:border-blue-800 uppercase tracking-widest">Verified Member</span>
                  )}
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-full border border-slate-200 dark:border-slate-600 uppercase tracking-widest hover:bg-blue-900 hover:text-white transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-slate-500 dark:text-slate-400 mb-8 font-bold uppercase tracking-wide">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-blue-500 shadow-sm border dark:border-slate-700 flex-shrink-0">
                    <i className="fas fa-envelope text-xs"></i>
                  </div>
                  <span className="break-all">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-blue-500 shadow-sm border dark:border-slate-700 flex-shrink-0">
                    <i className="fas fa-id-card text-xs"></i>
                  </div>
                  <span>REG: {user.registrationNumber || 'N/A'}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4 mb-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  value={editedUser.name}
                  onChange={e => setEditedUser({...editedUser, name: e.target.value})}
                  className="w-full text-2xl font-black bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 px-5 py-3 rounded-2xl outline-none focus:border-blue-500 dark:text-white uppercase"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-blue-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition flex items-center justify-center gap-3 shadow-xl"
                >
                  {isSaving ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-save"></i>}
                  Sync Profile
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-500 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 px-7 py-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner">
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-2">Student Trust Index</p>
              <div className="flex items-center gap-5">
                <p className="text-4xl font-black text-blue-900 dark:text-blue-400">{trustScore}%</p>
                <div className="w-32 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-1000" 
                    style={{ width: `${trustScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="group bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-xl flex items-center gap-8 hover:shadow-2xl transition duration-500">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-3xl flex items-center justify-center text-3xl transition border border-green-100/50">
            <i className="fas fa-medal"></i>
          </div>
          <div>
            <h4 className="text-5xl font-black text-slate-900 dark:text-white leading-none mb-2">{user.resolvedCount || 0}</h4>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest">Resolved Cases</p>
          </div>
        </div>
        <div className="group bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-xl flex items-center gap-8 hover:shadow-2xl transition duration-500">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-3xl flex items-center justify-center text-3xl transition border border-red-100/50">
            <i className="fas fa-search-minus"></i>
          </div>
          <div>
            <h4 className="text-5xl font-black text-slate-900 dark:text-white leading-none mb-2">{openCases}</h4>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest">Open Cases</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
