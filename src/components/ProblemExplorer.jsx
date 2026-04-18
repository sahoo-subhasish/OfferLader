import { useState, useEffect } from 'react';
import { cardInfo } from '../Data/data';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import StrategyBtn from './StrategyBtn';

// --- SUB-COMPONENT: STAT BAR ---
const StatBar = ({ label, solved, total, color }) => {
  const percentage = total === 0 ? 0 : (solved / total) * 100;
  return (
    <div className="flex flex-col gap-1 w-full lg:w-28">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-bold uppercase text-[#666]">{label}</span>
        <span className="text-[11px] font-medium text-white">{solved}<span className="text-[#444]">/{total}</span></span>
      </div>
      <div className="h-1 w-full bg-[#1a1c1d] rounded-full border border-[#2a2a2a] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percentage}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}33` }}
        />
      </div>
    </div>
  );
};


export default function ProblemExplorer({ problemSet, infoIndex, info }) {
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [problems, setProblems] = useState(problemSet);


  const { user } = useAuth();


  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        let solvedProblems = {};
        if (docSnap.exists()) {
          solvedProblems = docSnap.data().solvedProblems || {};
        }

        setProblems(problemSet.map(prob => {
          return { ...prob, isSolved: !!solvedProblems[prob.id] };
        }));
      } catch (error) {
        console.error("Error fetching user progress:", error);
      }
    };

    setProblems(problemSet);
    fetchProgress();
  }, [user, problemSet]);


  const toggleSolved = async (probId) => {
    if (!user) {
      alert("Please login with Google to save your progress!");
      return;
    }

    const currentProb = problems.find(p => p.id === probId);
    const newStatus = !currentProb.isSolved;

    setProblems(prev => prev.map((prob) =>
      prob.id === probId ? { ...prob, isSolved: newStatus } : prob
    ));

    try {
      const userDocRef = doc(firestore, 'users', user.uid);

      await setDoc(userDocRef, {
        solvedProblems: {
          [probId]: newStatus
            ? { solved: true, date: new Date().toISOString() }
            : false
        }
      }, { merge: true });

      console.log("Progress synced!");
    } catch (error) {
      console.error("Error syncing to Firestore:", error.message);

      setProblems(prev => prev.map((prob) =>
        prob.id === probId ? { ...prob, isSolved: !newStatus } : prob
      ));
    }
  };

  // --- FILTER & STATS LOGIC ---
  const filteredProblems = problems.filter((prob) => {
    const matchesDifficulty = activeFilter ? prob.difficulty === activeFilter : true;
    const matchesSearch = prob.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  const solvedCount = {
    easy: problems.filter(p => p.difficulty === "Easy" && p.isSolved).length,
    medium: problems.filter(p => p.difficulty === "Medium" && p.isSolved).length,
    hard: problems.filter(p => p.difficulty === "Hard" && p.isSolved).length
  }

  const problemCounts = {
    easy: problems.filter(p => p.difficulty === "Easy").length,
    medium: problems.filter(p => p.difficulty === "Medium").length,
    hard: problems.filter(p => p.difficulty === "Hard").length
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto p-4 md:p-6 mb-20">

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div className="max-w-xl flex flex-col items-start">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tighter">{cardInfo[infoIndex].subtitle}</h1>
          <p className="text-[#888] text-sm leading-relaxed font-medium mb-6">{cardInfo[infoIndex].desc}</p>
          <StrategyBtn info={info} />
        </div>

        {/* STATS AREA */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:items-center gap-4 md:gap-6 bg-[#141516] p-4 md:p-5 rounded-2xl border border-[#2a2a2a] shadow-2xl w-full lg:w-auto">
          <div className="grid grid-cols-1 sm:flex gap-4 sm:gap-6 flex-1">
            <StatBar label="Easy" solved={solvedCount.easy} total={problemCounts.easy} color="#48D2A0" />
            <StatBar label="Medium" solved={solvedCount.medium} total={problemCounts.medium} color="#F6B846" />
            <StatBar label="Hard" solved={solvedCount.hard} total={problemCounts.hard} color="#FF716C" />
          </div>
          <div className="pt-4 sm:pt-0 sm:pl-6 border-t sm:border-t-0 sm:border-l border-[#2a2a2a] flex justify-between sm:flex-col items-center sm:items-center">
            <span className="text-[10px] text-[#555] font-black uppercase sm:hidden">Total</span>
            <span className="text-2xl font-bold text-white leading-none">{problems.length}</span>
            <span className="hidden sm:block text-[9px] text-[#555] font-black uppercase mt-1 tracking-widest text-center">Total</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            type="text"
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141516] border border-[#2a2a2a] rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#444] transition-all"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar py-1">
          {['Easy', 'Medium', 'Hard'].map(filter => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(isActive ? null : filter)}
                className={`whitespace-nowrap px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${isActive
                  ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                  : 'bg-[#141516] border-[#2a2a2a] text-[#777] hover:text-white hover:border-[#444]'
                  }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* THE PROBLEM MATRIX CONTAINER */}
      <div className="rounded-[24px] md:rounded-[28px] bg-[#1a1c1d] border border-[#2a2a2a] shadow-2xl overflow-hidden">

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141516]/50 border-b border-[#2a2a2a] text-[10px] font-black text-[#444] uppercase tracking-[0.2em]">
                <th className="px-8 py-5 w-24">Status</th>
                <th className="px-8 py-5">Problem Name</th>
                <th className="px-8 py-5">Topic</th>
                <th className="px-8 py-5">Difficulty</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]/30">
              {filteredProblems.map((prob, index) => (
                <tr key={index} className="group hover:bg-[#202224] transition-all duration-200">
                  <td className="px-8 py-6">
                    <input
                      type="checkbox"
                      checked={prob.isSolved}
                      onChange={() => toggleSolved(prob.id)}
                      className="w-5 h-5 cursor-pointer rounded border-2 border-[#2a2a2a] bg-transparent appearance-none checked:bg-[#48D2A0] checked:border-[#48D2A0] transition-all relative"
                    />
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-[#ccc] group-hover:text-white transition-colors">{prob.title}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-bold text-[#666] bg-[#111] px-2.5 py-1.5 rounded-lg border border-[#2a2a2a] uppercase tracking-wider">{prob.topic}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-medium px-3 py-1.5 rounded-full border ${prob.difficulty === 'Easy' ? 'text-[#48D2A0] border-[#48D2A0]/20 bg-[#48D2A0]/5' :
                      prob.difficulty === 'Medium' ? 'text-[#F6B846] border-[#F6B846]/20 bg-[#F6B846]/5' :
                        'text-[#FF716C] border-[#FF716C]/20 bg-[#FF716C]/5'
                      }`}>
                      {prob.difficulty.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <a
                      href={prob.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-white bg-[#2a2a2a] hover:bg-white hover:text-black px-6 py-2 rounded-xl transition-all">SOLVE</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden flex flex-col divide-y divide-[#2a2a2a]/50">
          {filteredProblems.map((prob, index) => (
            <div key={index} className="p-5 flex flex-col gap-4 hover:bg-[#202224] transition-colors active:bg-[#202224]">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest">{prob.topic}</span>
                  <span className="text-[15px] font-bold text-white pr-4">{prob.title}</span>
                </div>
                <span className={`text-[9px] font-black px-2 py-1 rounded-md border shrink-0 ${prob.difficulty === 'Easy' ? 'text-[#48D2A0] border-[#48D2A0]/20 bg-[#48D2A0]/5' :
                  prob.difficulty === 'Medium' ? 'text-[#F6B846] border-[#F6B846]/20 bg-[#F6B846]/5' :
                    'text-[#FF716C] border-[#FF716C]/20 bg-[#FF716C]/5'
                  }`}>
                  {prob.difficulty.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={prob.isSolved}
                    onChange={() => toggleSolved(prob.id)}
                    className="w-5 h-5 cursor-pointer rounded border-2 border-[#2a2a2a] bg-transparent appearance-none checked:bg-[#48D2A0] checked:border-[#48D2A0] transition-all relative"
                  />
                  <span className={`text-[10px] font-bold uppercase ${prob.isSolved ? 'text-[#48D2A0]' : 'text-[#555]'}`}>
                    {prob.isSolved ? 'Solved' : 'Status'}
                  </span>
                </div>

                <a
                  href={prob.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black text-white bg-[#2a2a2a] px-5 py-2 rounded-lg active:scale-95 transition-transform text-center"
                >
                  SOLVE
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
