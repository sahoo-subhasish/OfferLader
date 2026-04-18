import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import { useActivityMap } from "../Hooks/useActivityMap";
import { AllTierData } from "../../Data/index";

// --- Circular Progress Ring Component ---
const CircularProgress = ({ percentage, size = 120, strokeWidth = 6 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#222"
                    strokeWidth={strokeWidth}
                />
                {/* Progress arc */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#48D2A0" />
                        <stop offset="100%" stopColor="#508EFF" />
                    </linearGradient>
                </defs>
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white tracking-tight leading-none">
                    {percentage}%

                </span>

            </div>
        </div>
    );
};

// --- Tier config for dropdown labels ---
const tierConfig = [
    { key: 'basic', label: 'Basics - Beginner' },
    { key: 'tier5', label: 'Tier 5 - 3-6 LPA' },
    { key: 'tier4', label: 'Tier 4 - 6-9 LPA' },
    { key: 'tier3', label: 'Tier 3 - 9-12 LPA' },
    { key: 'tier2', label: 'Tier 2 - 12-18 LPA' },
    { key: 'tier1', label: 'Tier 1 - FAANG+' },
    { key: 'master', label: 'Master Set' },
];

export default function Home() {

    const { user } = useAuth();
    const [TotalSolved, setTotalSolved] = useState(0);
    const { activityMap, currentStreak, highestStreak } = useActivityMap(user);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [solvedProblems, setSolvedProblems] = useState({});
    const [selectedTier, setSelectedTier] = useState(() => localStorage.getItem('selectedTier') || 'basic');
    const [showAllSolved, setShowAllSolved] = useState(false);
    const [dailyTarget, setDailyTarget] = useState(0);
    const [editingTarget, setEditingTarget] = useState(false);
    const [tempTarget, setTempTarget] = useState(3);

    useEffect(() => {
        localStorage.setItem('selectedTier', selectedTier);
    }, [selectedTier]);

    const monthsInfo = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    useEffect(() => {
        const fetchTotalSolved = async () => {
            if (!user) return;

            try {
                const docRef = doc(firestore, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const sp = data.solvedProblems || {};
                    setSolvedProblems(sp);

                    const total = Object.values(sp).filter(Boolean).length;
                    setTotalSolved(total);

                    // Load daily target from Firestore
                    if (data.dailyTarget !== undefined) {
                        setDailyTarget(data.dailyTarget);
                        setTempTarget(data.dailyTarget || 3);
                    }
                } else {
                    setTotalSolved(0);
                    setSolvedProblems({});
                    setDailyTarget(0);
                }
            } catch (error) {
                console.error("Error fetching total solved:", error);
            }
        };

        fetchTotalSolved();
    }, [user]);

    const tierData = AllTierData[selectedTier]?.data || [];

    const difficultyStats = ['Easy', 'Medium', 'Hard'].map(diff => {
        const total = tierData.filter(p => p.difficulty === diff).length;
        const solved = tierData.filter(p => p.difficulty === diff && !!solvedProblems[p.id]).length;
        const percentage = total === 0 ? 0 : Math.round((solved / total) * 100);
        return { label: diff, total, solved, percentage };
    });

    const totalInTier = tierData.length;
    const solvedInTier = tierData.filter(p => !!solvedProblems[p.id]).length;
    const overallPercentage = totalInTier === 0 ? 0 : Math.round((solvedInTier / totalInTier) * 100);

    const todayStr = new Date().toDateString();
    const todaySolved = Object.values(solvedProblems)
        .filter(val => val && val.solved && val.date && new Date(val.date).toDateString() === todayStr)
        .length;

    const timeAgo = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;
        const minutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMs / 3600000);
        const days = Math.floor(diffMs / 86400000);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return '1 day ago';
        if (days < 7) return `${days} days ago`;
        if (weeks === 1) return '1 week ago';
        if (weeks < 5) return `${weeks} weeks ago`;
        if (months === 1) return '1 month ago';
        return `${months} months ago`;
    };

    const problemLookup = {};
    Object.values(AllTierData).forEach(tier => {
        (tier.data || []).forEach(p => {
            problemLookup[p.id] = p;
        });
    });

    const recentlySolved = Object.entries(solvedProblems)
        .filter(([, val]) => val && val.solved && val.date)
        .map(([id, val]) => {
            const prob = problemLookup[id];
            if (!prob) return null;
            return {
                id,
                title: prob.title,
                topic: prob.topic,
                difficulty: prob.difficulty,
                link: prob.link,
                date: val.date,
                timeAgo: timeAgo(val.date),
            };
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const displayedSolved = showAllSolved ? recentlySolved : recentlySolved.slice(0, 4);

    const diffColors = {
        'Easy': { color: '#48D2A0', bg: 'rgba(72,210,160,0.08)', border: 'rgba(72,210,160,0.2)' },
        'Medium': { color: '#F6B846', bg: 'rgba(246,184,70,0.08)', border: 'rgba(246,184,70,0.2)' },
        'Hard': { color: '#FF716C', bg: 'rgba(255,113,108,0.08)', border: 'rgba(255,113,108,0.2)' },
    };

    return (
        <div className="w-full flex flex-col gap-4 sm:gap-6 text-neutral-200 min-h-full pb-8 px-4 sm:px-0">

            {/* Header / Profile Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome back, {user?.displayName}</h1>
                    <p className="text-sm text-neutral-400 mt-1">Here is the overview of your progress and activity.</p>
                </div>
                <div className="flex items-center gap-3 bg-[#141414] border border-[#262626] p-2 pr-5 rounded-xl shadow-sm w-full md:w-auto">
                    <div className="w-11 h-11 rounded-lg border border-[#333] bg-[#222] flex items-center justify-center text-lg font-medium text-white overflow-hidden shrink-0">
                        {user?.photoURL ? (<img src={user?.photoURL} alt="profile" className="w-full h-full object-cover" />) : (user?.displayName?.charAt(0).toUpperCase())}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-white leading-tight truncate">{user?.displayName}</span>
                        <span className="text-xs text-neutral-500 font-mono mt-0.5 truncate max-w-[180px] sm:max-w-none">UID: {user?.uid}</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: 'Total Solved', value: TotalSolved },
                    { label: 'Current Streak', value: currentStreak, sub: 'days' },
                    { label: 'Highest Streak', value: highestStreak, sub: 'days' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#141414] border border-[#262626] rounded-xl p-5 flex flex-col justify-between shadow-sm">
                        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{stat.label}</span>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-3xl font-semibold text-white tracking-tight">{stat.value}</span>
                            <span className="text-xs text-neutral-500 font-medium">{stat.sub}</span>
                        </div>
                    </div>
                ))}

                {/* Daily Target Card */}
                <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 flex flex-col justify-between shadow-sm relative">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Daily Target</span>
                        {!editingTarget && (
                            <button
                                onClick={() => { setTempTarget(dailyTarget || 3); setEditingTarget(true); }}
                                className="text-neutral-500 hover:text-white transition-colors p-1 rounded hover:bg-[#262626]"
                                title="Edit target"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {editingTarget ? (
                        <div className="mt-3 flex flex-col gap-3">
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setTempTarget(prev => Math.max(1, prev - 1))}
                                    className="w-8 h-8 rounded-lg bg-[#222] border border-[#333] hover:border-[#555] text-neutral-300 hover:text-white flex items-center justify-center transition-all text-lg font-medium"
                                >−</button>
                                <span className="text-2xl font-bold text-white w-10 text-center tabular-nums">{tempTarget}</span>
                                <button
                                    onClick={() => setTempTarget(prev => Math.min(50, prev + 1))}
                                    className="w-8 h-8 rounded-lg bg-[#222] border border-[#333] hover:border-[#555] text-neutral-300 hover:text-white flex items-center justify-center transition-all text-lg font-medium"
                                >+</button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingTarget(false)}
                                    className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-[#222] border border-[#333] text-neutral-400 hover:text-white hover:border-[#444] transition-all"
                                >Cancel</button>
                                <button
                                    onClick={async () => {
                                        setDailyTarget(tempTarget);
                                        setEditingTarget(false);
                                        if (user) {
                                            try {
                                                await setDoc(doc(firestore, "users", user.uid), { dailyTarget: tempTarget }, { merge: true });
                                            } catch (e) { console.error("Error saving daily target:", e); }
                                        }
                                    }}
                                    className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all"
                                >Save</button>
                            </div>
                        </div>
                    ) : dailyTarget === 0 ? (
                        <button
                            onClick={() => { setTempTarget(3); setEditingTarget(true); }}
                            className="mt-3 text-sm text-neutral-500 hover:text-neutral-300 transition-colors text-left"
                        >
                            Set your daily target →
                        </button>
                    ) : (
                        <div className="mt-3 flex flex-col gap-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-semibold text-white tracking-tight">{todaySolved}</span>
                                <span className="text-lg text-neutral-500 font-medium">/ {dailyTarget}</span>
                            </div>
                            <span className="text-[11px] font-medium mt-1" style={{ color: todaySolved >= dailyTarget ? '#48D2A0' : '#888' }}>
                                {todaySolved >= dailyTarget ? 'Target reached!' : `${dailyTarget - todaySolved} more to go`}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile/Tablet Progress Tracker (Horizontal, hidden on lg screens) */}
            <div className="lg:hidden bg-[#141414] rounded-xl border border-[#262626] p-4 flex flex-col gap-4 shadow-sm w-full">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-sm font-semibold text-white">Progress Tracker</h2>
                        <span className="text-[11px] text-neutral-500 font-mono mt-0.5">{solvedInTier} / {totalInTier} solved</span>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedTier}
                            onChange={(e) => setSelectedTier(e.target.value)}
                            className="bg-[#111] border border-[#333] hover:border-[#444] text-neutral-200 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-500 transition-all appearance-none cursor-pointer pr-7"
                        >
                            {tierConfig.map(t => (
                                <option key={t.key} value={t.key}>{t.label.split(' - ')[0]}</option>
                            ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row items-center gap-4 sm:gap-6 mt-1">
                    <div className="flex-shrink-0 ml-1 sm:ml-2">
                        <CircularProgress percentage={overallPercentage} size={90} strokeWidth={6} />
                    </div>

                    <div className="flex-1 flex flex-col gap-2">
                        {difficultyStats.map((diff, i) => {
                            const colors = diffColors[diff.label];
                            return (
                                <div key={i} className="w-full flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.color, boxShadow: `0 0 4px ${colors.color}66` }}></div>
                                        <span className="text-xs font-semibold" style={{ color: colors.color }}>{diff.label}</span>
                                    </div>
                                    <div className="flex items-center gap-3 w-auto justify-end">
                                        <span className="text-[11px] font-mono font-medium text-right w-8" style={{ color: colors.color }}>{diff.solved}/{diff.total}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">

                {/* Left Column (Wider) */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Activity Heatmap */}
                    <div className="bg-[#141414] rounded-xl border border-[#262626] p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 shadow-sm">
                        <div className="flex justify-between items-center">
                            <h2 className="text-base font-semibold text-white">Activity</h2>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="bg-transparent border-none text-sm font-medium text-neutral-400 focus:outline-none focus:text-white cursor-pointer hover:bg-[#262626] px-2 py-1 rounded transition-colors"
                            >
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                            </select>
                        </div>

                        <div className="w-full pb-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <style>{`
                                .w-full.pb-2.overflow-x-auto::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>
                            <div className="w-full flex gap-1.5 sm:gap-2 md:gap-3 justify-between min-w-[850px]">
                                {monthsInfo.map((monthName, mIndex) => {
                                    const yearInt = parseInt(selectedYear);
                                    const daysInMonth = new Date(yearInt, mIndex + 1, 0).getDate();
                                    const firstDayOfWeek = new Date(yearInt, mIndex, 1).getDay();

                                    const weeks = [];
                                    let currentWeek = [];

                                    // Pad first week with nulls for days before firstDayOfWeek
                                    for (let i = 0; i < firstDayOfWeek; i++) {
                                        currentWeek.push(null);
                                    }

                                    for (let day = 1; day <= daysInMonth; day++) {
                                        currentWeek.push(day);
                                        if (currentWeek.length === 7) {
                                            weeks.push(currentWeek);
                                            currentWeek = [];
                                        }
                                    }

                                    // Pad last week with nulls
                                    if (currentWeek.length > 0) {
                                        while (currentWeek.length < 7) {
                                            currentWeek.push(null);
                                        }
                                        weeks.push(currentWeek);
                                    }

                                    return (
                                        <div key={mIndex} className="flex flex-col gap-1 sm:gap-2" style={{ flex: weeks.length }}>
                                            <span className="text-[9px] sm:text-[10px] md:text-[11px] font-medium text-neutral-500 overflow-hidden text-ellipsis">{monthName}</span>
                                            <div className="w-full flex gap-[2px] sm:gap-[3px] justify-between">
                                                {weeks.map((week, wIndex) => (
                                                    <div key={wIndex} className="flex-1 flex flex-col gap-[2px] sm:gap-[3px]">
                                                        {week.map((day, dIndex) => {
                                                            if (day === null) {
                                                                return <div key={dIndex} className="w-full aspect-square rounded-[1px] md:rounded-[2px] bg-transparent"></div>;
                                                            }

                                                            const date = new Date(yearInt, mIndex, day);
                                                            const key = date.toDateString();
                                                            const count = activityMap[key] || 0;

                                                            let finalIntensity = 0;
                                                            if (count === 0) finalIntensity = 0;
                                                            else if (count === 1) finalIntensity = 1;
                                                            else if (count === 2) finalIntensity = 2;
                                                            else if (count <= 4) finalIntensity = 3;
                                                            else if (count > 4) finalIntensity = 4;

                                                            const colorClass = [
                                                                'bg-[#1e1e1e]',
                                                                'bg-[#0e4429]',
                                                                'bg-[#006d32]',
                                                                'bg-[#26a641]',
                                                                'bg-[#39d353]'
                                                            ][finalIntensity];

                                                            return (
                                                                <div
                                                                    key={dIndex}
                                                                    className={`w-full aspect-square rounded-[1px] md:rounded-[2px] ${colorClass}`}
                                                                    title={`${count} solved on ${key}`}
                                                                ></div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-1 text-[11px] font-medium text-neutral-500">
                            <div className="flex items-center gap-1.5">
                                <span>Less</span>
                                <div className="w-[11px] h-[11px] rounded-[2px] bg-[#1e1e1e]"></div>
                                <div className="w-[11px] h-[11px] rounded-[2px] bg-[#0e4429]"></div>
                                <div className="w-[11px] h-[11px] rounded-[2px] bg-[#006d32]"></div>
                                <div className="w-[11px] h-[11px] rounded-[2px] bg-[#26a641]"></div>
                                <div className="w-[11px] h-[11px] rounded-[2px] bg-[#39d353]"></div>
                                <span>More</span>
                            </div>
                        </div>
                    </div>

                    {/* Recently Solved */}
                    <div className="bg-[#141414] rounded-xl border border-[#262626] flex flex-col overflow-hidden shadow-sm">
                        <div className="p-4 sm:p-5 border-b border-[#262626] flex justify-between items-center bg-[#181818]">
                            <h2 className="text-base font-semibold text-white">
                                Recently Solved
                                {recentlySolved.length > 0 && (
                                    <span className="text-xs text-neutral-500 font-normal ml-2">({recentlySolved.length})</span>
                                )}
                            </h2>
                            {recentlySolved.length > 4 && (
                                <button
                                    onClick={() => setShowAllSolved(prev => !prev)}
                                    className="text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                                >
                                    {showAllSolved ? 'Show Less' : 'View All'}
                                </button>
                            )}
                        </div>

                        <div className={`flex flex-col ${showAllSolved ? 'max-h-[420px] overflow-y-auto' : ''}`} style={showAllSolved ? { scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' } : {}}>
                            {displayedSolved.length === 0 ? (
                                <div className="p-8 flex flex-col items-center justify-center gap-2">
                                    <svg className="w-10 h-10 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <span className="text-sm text-neutral-500 font-medium">No problems solved yet</span>
                                    <span className="text-xs text-neutral-600">Start solving to see your progress here</span>
                                </div>
                            ) : (
                                displayedSolved.map((item, i) => {
                                    const diffStyles = {
                                        "Easy": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
                                        "Medium": "text-amber-400 bg-amber-400/10 border-amber-400/20",
                                        "Hard": "text-rose-400 bg-rose-400/10 border-rose-400/20"
                                    };
                                    return (
                                        <a
                                            key={item.id}
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center justify-between p-4 sm:p-5 hover:bg-[#1a1a1a] transition-colors cursor-pointer group ${i !== displayedSolved.length - 1 ? 'border-b border-[#262626]' : ''}`}
                                        >
                                            <div className="flex flex-col gap-1 min-w-0 mr-4">
                                                <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors truncate">{item.title}</span>
                                                <span className="text-xs text-neutral-500 font-mono tracking-tight truncate">{item.topic}</span>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className={`px-2 py-0.5 text-[11px] font-semibold border rounded ${diffStyles[item.difficulty] || ''}`}>
                                                    {item.difficulty}
                                                </span>
                                                <span className="text-xs text-neutral-500 w-20 text-right hidden sm:block">{item.timeAgo}</span>
                                            </div>
                                        </a>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (Narrower, hidden on mobile/tablet) */}
                <div className="hidden lg:flex lg:col-span-1 flex-col h-full">

                    {/* Progress Tracker Section */}
                    <div className="bg-[#141414] rounded-xl border border-[#262626] flex flex-col overflow-hidden shadow-sm">
                        <div className="p-4 sm:p-6 border-b border-[#262626] bg-[#181818]">
                            <h2 className="text-base font-semibold text-white mb-0.5">Progress Tracker</h2>
                            <p className="text-xs text-neutral-400 mb-5">Track your ladder completion</p>

                            <div className="relative">
                                <select
                                    value={selectedTier}
                                    onChange={(e) => setSelectedTier(e.target.value)}
                                    className="w-full bg-[#111] border border-[#333] hover:border-[#444] text-neutral-200 text-sm font-medium rounded-lg px-3 py-2.5 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all appearance-none cursor-pointer"
                                >
                                    {tierConfig.map(t => (
                                        <option key={t.key} value={t.key}>{t.label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 flex flex-col bg-[#141414]">
                            {/* Circular progress + overall stats */}
                            <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
                                <CircularProgress percentage={overallPercentage} size={110} strokeWidth={7} />
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-widest">Overall</span>
                                    <span className="text-sm text-neutral-300 font-mono">{solvedInTier} / {totalInTier} <span className="text-neutral-500">solved</span></span>
                                    <span className="text-[11px] text-neutral-500 mt-1">
                                        {tierConfig.find(t => t.key === selectedTier)?.label}
                                    </span>
                                </div>
                            </div>

                            {/* Difficulty Progress Bars */}
                            <div className="flex flex-col gap-5 mt-2">
                                <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Difficulty Breakdown</h3>
                                {difficultyStats.map((diff, i) => {
                                    const colors = diffColors[diff.label];
                                    return (
                                        <div key={i} className="flex flex-col gap-2.5 p-3 rounded-lg" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.color, boxShadow: `0 0 6px ${colors.color}66` }}></div>
                                                    <span className="text-[13px] font-semibold" style={{ color: colors.color }}>{diff.label}</span>
                                                </div>
                                                <span className="text-xs font-mono font-medium" style={{ color: colors.color }}>
                                                    {diff.solved}<span className="text-neutral-500">/{diff.total}</span>
                                                </span>
                                            </div>
                                            <div className="w-full bg-[#1a1a1a] rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                                    style={{
                                                        width: `${diff.percentage}%`,
                                                        backgroundColor: colors.color,
                                                        boxShadow: `0 0 8px ${colors.color}44`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>


                    </div>

                </div>
            </div>
        </div>
    );
}