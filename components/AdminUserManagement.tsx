
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getAllUsers, deleteUser, isAdmin as checkIsAdmin } from '../services/authService';

interface AdminUserManagementProps {
  currentUser: User;
  showConfirm: (config: {
    title: string;
    message: string;
    confirmLabel: string;
    type: 'danger' | 'info' | 'warning';
    onConfirm: () => void;
  }) => void;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ currentUser, showConfirm }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  // Fixed: Use async fetch inside useEffect to populate user list
  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getAllUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleRemoveUser = (userToRemove: User) => {
    if (userToRemove.id === currentUser.id) {
      alert("You cannot remove your own administrative account.");
      return;
    }

    showConfirm({
      title: 'ADMIN: EXPUNGE USER',
      message: `You are about to permanently remove ${userToRemove.name} (${userToRemove.registrationNumber}) from the SASTRA Registry. All associated reports will remain, but the user identity will be erased. Proceed?`,
      confirmLabel: 'Expunge User',
      type: 'danger',
      onConfirm: async () => {
        // Fixed: Await asynchronous deletion before refreshing user list
        await deleteUser(userToRemove.id);
        const data = await getAllUsers();
        setUsers(data);
      }
    });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.registrationNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">User Registry</h1>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-1">Administrative Control Center</p>
        </div>
        
        <div className="relative w-full lg:max-w-md">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input
            type="text"
            placeholder="Search users by name, reg, or email..."
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 font-bold text-xs shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(u => (
          <div key={u.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-xl group transition-all duration-500">
            <div className="p-8">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 flex-shrink-0 shadow-inner">
                  <img 
                    src={u.profilePicture} 
                    className="w-full h-full object-cover" 
                    alt={u.name} 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-lg text-slate-800 dark:text-white leading-tight uppercase tracking-tight truncate">{u.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{u.registrationNumber}</span>
                    {checkIsAdmin(u.email) && (
                      <span className="bg-indigo-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase">ADMIN</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-50 dark:border-slate-700 pt-6">
                <div className="flex items-start gap-3">
                  <i className="fas fa-graduation-cap text-slate-300 dark:text-slate-600 mt-1"></i>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight uppercase">
                    {u.branch || 'No Department Specified'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-envelope text-slate-300 dark:text-slate-600"></i>
                  <p className="text-[10px] font-bold text-slate-400 truncate uppercase">{u.email}</p>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => handleRemoveUser(u)}
                  className="flex-1 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-100 dark:border-red-900/20 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  Remove User
                </button>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 px-8 py-3 flex justify-between items-center border-t dark:border-slate-700">
              <span className="text-[8px] font-black text-slate-300 uppercase">Trust Index: {u.trustScore}%</span>
              <span className="text-[8px] font-black text-slate-300 uppercase">{u.yearOfStudy}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="py-20 text-center bg-white dark:bg-slate-800 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
          <i className="fas fa-users-slash text-4xl text-slate-100 mb-6"></i>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em]">No registered users found in registry database.</p>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
