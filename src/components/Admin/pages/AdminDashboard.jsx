import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    contests: 0,
    blogs: 0,
    admins: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(firestore, 'users'));
        let adminCount = 0;
        usersSnap.forEach(doc => {
          if(doc.data().role === 'admin') adminCount++;
        });

        const contestsSnap = await getDocs(collection(firestore, 'contests'));
        const blogsSnap = await getDocs(collection(firestore, 'blogs'));

        setStats({
          users: usersSnap.size,
          admins: adminCount,
          contests: contestsSnap.size,
          blogs: blogsSnap.size
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Users', value: stats.users, icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> },
    { title: 'Total Admins', value: stats.admins, icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> },
    { title: 'Contests', value: stats.contests, icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg> },
    { title: 'Blogs', value: stats.blogs, icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-[#888]">Overview of your platform's metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a]/50 flex flex-col items-start gap-4">
            <span className="text-[#48D2A0] bg-[#48D2A0]/10 p-3 rounded-xl">{stat.icon}</span>
            <div>
              <p className="text-[#888] font-medium text-sm">{stat.title}</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
