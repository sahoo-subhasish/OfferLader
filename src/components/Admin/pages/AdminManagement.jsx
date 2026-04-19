import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase';
import { useAuth } from '../../../context/AuthContext';

export default function AdminManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(firestore, 'users'));
      const usersList = [];
      snap.forEach(doc => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (userId, currentRole) => {
    if (userId === currentUser.uid) {
      alert("You cannot change your own role!");
      return;
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(firestore, 'users', userId), { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Management</h1>
        <p className="text-[#888]">Grant or revoke admin privileges for users.</p>
      </div>

      <div className="glass-card rounded-[20px] overflow-hidden border border-[#2a2a2a] bg-[#1a1a1a]/50 backdrop-blur-md">
        {/* Header - Desktop only */}
        <div className="hidden md:grid md:grid-cols-[2fr_2fr_1fr_1.5fr] px-6 py-4 border-b border-[#333] bg-[#222]">
          <div className="text-[#888] font-medium text-sm">User</div>
          <div className="text-[#888] font-medium text-sm">Email</div>
          <div className="text-[#888] font-medium text-sm">Role</div>
          <div className="text-[#888] font-medium text-sm text-right">Actions</div>
        </div>

        {/* Content */}
        <div className="flex flex-col p-4 md:p-0 gap-4 md:gap-0">
          {loading ? (
            <div className="text-center py-8 text-[#888]">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-[#888]">No users found.</div>
          ) : (
            users.map(u => (
              <div key={u.id} className="flex flex-col md:grid md:grid-cols-[2fr_2fr_1fr_1.5fr] items-start md:items-center p-5 md:px-6 md:py-4 gap-4 md:gap-0 border border-[#333] md:border-x-0 md:border-t-0 md:border-b last:border-b-0 hover:bg-[#222]/50 transition-colors rounded-xl md:rounded-none bg-[#111] md:bg-transparent">
                <div className="flex flex-col w-full min-w-0">
                  <div className="flex justify-between items-start md:block">
                    <p className="text-white font-medium pr-4 md:pr-0 truncate">{u.fullName || u.displayName || (u.email ? u.email.split('@')[0] : 'No Name')}</p>
                    <div className="md:hidden shrink-0 mt-0.5">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-[#48D2A0]/20 text-[#48D2A0]' : 'bg-[#333] text-[#aaa]'}`}>
                        {u.role === 'admin' ? 'ADMIN' : 'USER'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#555] font-mono break-all mt-1">{u.id}</p>
                </div>
                
                <div className="text-[#ccc] w-full text-sm flex flex-col md:block min-w-0">
                  <span className="md:hidden text-xs text-[#888] mb-1 font-medium">Email Address</span>
                  <span className="truncate">{u.email}</span>
                </div>
                
                <div className="hidden md:block min-w-0">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-[#48D2A0]/20 text-[#48D2A0]' : 'bg-[#333] text-[#aaa]'}`}>
                    {u.role === 'admin' ? 'ADMIN' : 'USER'}
                  </span>
                </div>
                
                <div className="w-full md:w-auto flex md:justify-end mt-2 md:mt-0 shrink-0">
                  <button
                    onClick={() => toggleRole(u.id, u.role)}
                    className="w-full md:w-auto inline-flex justify-center items-center text-[10px] font-bold text-white bg-[#2a2a2a] hover:bg-white hover:text-black px-5 py-3 md:py-2.5 rounded-xl transition-all uppercase tracking-widest border border-[#333] hover:border-white active:scale-95"
                  >
                    {u.role === 'admin' ? 'REVOKE ADMIN' : 'MAKE ADMIN'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
