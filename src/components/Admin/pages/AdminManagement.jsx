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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#333] bg-[#222]">
                <th className="px-6 py-4 text-[#888] font-medium text-sm">User</th>
                <th className="px-6 py-4 text-[#888] font-medium text-sm">Email</th>
                <th className="px-6 py-4 text-[#888] font-medium text-sm">Role</th>
                <th className="px-6 py-4 text-[#888] font-medium text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-8 text-[#888]">Loading users...</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-[#333] hover:bg-[#222]/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{u.fullName || u.displayName || (u.email ? u.email.split('@')[0] : 'No Name')}</p>
                    <p className="text-xs text-[#555] font-mono">{u.id}</p>
                  </td>
                  <td className="px-6 py-4 text-[#ccc]">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-[#48D2A0]/20 text-[#48D2A0]' : 'bg-[#333] text-[#aaa]'}`}>
                      {u.role === 'admin' ? 'ADMIN' : 'USER'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleRole(u.id, u.role)}
                      className="inline-flex justify-center items-center text-[10px] font-bold text-white bg-[#2a2a2a] hover:bg-white hover:text-black px-5 py-2.5 rounded-xl transition-all uppercase tracking-widest border border-[#333] hover:border-white active:scale-95"
                    >
                      {u.role === 'admin' ? 'REVOKE ADMIN' : 'MAKE ADMIN'}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr><td colSpan="4" className="text-center py-8 text-[#888]">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
