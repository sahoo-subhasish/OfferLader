import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchContests();
  }, []);

  return (
    <section className="flex flex-col h-full text-white w-full max-w-5xl mx-auto pt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contests</h1>
        <p className="text-[#888]">Participate in the latest coding contests.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-[#888]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#48D2A0] mb-4"></div>
          <p>Loading contests...</p>
        </div>
      ) : contests.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-[#555] bg-[#1a1a1a]/50 rounded-2xl border border-[#2a2a2a]">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <h2 className="text-xl font-semibold text-white mb-2">No Contests Yet</h2>
          <p>Weekly and Bi-weekly contests will appear here soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contests.map(c => (
            <a 
              key={c.id} 
              href={c.link} 
              target="_blank" 
              rel="noreferrer"
              className="p-6 rounded-2xl border border-[#333] bg-[#1a1a1a] hover:border-[#48D2A0] hover:bg-[#222] transition-colors flex flex-col group"
            >
              <h3 className="font-semibold text-xl text-white mb-2 group-hover:text-[#48D2A0] transition-colors">{c.title}</h3>
              <span className="text-[#888] text-sm truncate">{c.link}</span>
              <div className="mt-4 text-[#48D2A0] text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Participate
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}