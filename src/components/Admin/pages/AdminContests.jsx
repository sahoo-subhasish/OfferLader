import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase';

export default function AdminContests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', link: '' });
  const [adding, setAdding] = useState(false);

  const fetchContests = async () => {
    try {
      const snap = await getDocs(collection(firestore, 'contests'));
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => b.createdAt - a.createdAt);
      setContests(list);
    } catch (error) {
      console.error("Error fetching contests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addDoc(collection(firestore, 'contests'), {
        title: formData.title,
        link: formData.link,
        createdAt: Date.now()
      });
      setFormData({ title: '', link: '' });
      fetchContests();
    } catch (error) {
      console.error("Error adding contest:", error);
      alert("Failed to add contest");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contest?")) return;
    try {
      await deleteDoc(doc(firestore, 'contests', id));
      setContests(contests.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting contest:", error);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Manage Contests</h1>
        <p className="text-[#888]">Add external links to new coding contests.</p>
      </div>

      <div className="glass-card p-6 rounded-[20px] border border-[#2a2a2a] bg-[#1a1a1a]/50">
        <h2 className="text-xl font-semibold mb-4 text-white">Add New Contest</h2>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-[#888] mb-1">Contest Title</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#48D2A0]" placeholder="Weekly Contest 400" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-[#888] mb-1">Link URL</label>
            <input required type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#48D2A0]" placeholder="https://leetcode.com/contest/..." />
          </div>
          <button type="submit" disabled={adding} className="bg-[#48D2A0] text-black font-bold py-3 px-6 rounded-xl hover:bg-[#3bb589] transition-colors h-[50px]">
            {adding ? 'Adding...' : 'Add Contest'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="text-[#888]">Loading contests...</div>
        ) : contests.map(c => (
          <div key={c.id} className="p-5 rounded-2xl border border-[#333] bg-[#1a1a1a] flex justify-between items-center group">
            <div className="overflow-hidden">
              <h3 className="font-semibold text-lg text-white truncate">{c.title}</h3>
              <a href={c.link} target="_blank" rel="noreferrer" className="text-sm text-[#48D2A0] hover:underline truncate block w-fit max-w-full">{c.link}</a>
            </div>
            <button onClick={() => handleDelete(c.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          </div>
        ))}
        {!loading && contests.length === 0 && (
          <div className="text-[#888]">No contests added yet.</div>
        )}
      </div>
    </div>
  );
}
