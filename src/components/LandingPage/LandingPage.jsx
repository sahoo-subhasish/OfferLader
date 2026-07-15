import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import SEO from '../SEO';




// ─── TIER SNEAK PEEK DATA (REAL QUESTIONS FROM DATASET) ────────────────────────
const SNEAK_PEEK_TIERS = [
  {
    name: 'Beginner',
    label: 'BGN',
    color: '#9A4FEB',
    desc: 'Core concepts, I/O, control flow, arrays, strings, hashing & recursion.',
    questions: [
      { title: 'Print / IO', topic: 'Input/Output', difficulty: 'Easy' },
      { title: 'Data Types', topic: 'Data Types', difficulty: 'Easy' },
      { title: 'If-Else', topic: 'Control Flow', difficulty: 'Easy' },
      { title: 'Loops', topic: 'Control Flow', difficulty: 'Easy' },
      { title: 'Functions', topic: 'Functions', difficulty: 'Easy' },
      { title: 'Maths', topic: 'Mathematics', difficulty: 'Easy' },
      { title: 'Basic Arrays', topic: 'Arrays', difficulty: 'Easy' },
    ]
  },
  {
    name: 'Tier 5',
    label: 'T5',
    color: '#508EFF',
    desc: 'Arrays, strings, sorting, binary search, linked lists, stacks & queues.',
    questions: [
      { title: 'Check for Prime Number', topic: 'Basic Math', difficulty: 'Easy' },
      { title: 'Two Sum', topic: 'Hashing', difficulty: 'Easy' },
      { title: 'Reverse an array', topic: 'Arrays', difficulty: 'Easy' },
      { title: 'Longest Common Prefix', topic: 'Strings', difficulty: 'Easy' },
      { title: 'Bubble Sort', topic: 'Sorting', difficulty: 'Easy' },
      { title: 'Binary Search', topic: 'Binary Search', difficulty: 'Easy' },
      { title: 'Reverse a LinkedList', topic: 'Linked List', difficulty: 'Easy' },
    ]
  },
  {
    name: 'Tier 4',
    label: 'T4',
    color: '#FF716C',
    desc: 'Trees, BSTs, graphs, sliding window & intro to dynamic programming.',
    questions: [
      { title: 'Binary Tree Level Order', topic: 'Trees', difficulty: 'Medium' },
      { title: 'Validate Binary Search Tree', topic: 'BST', difficulty: 'Medium' },
      { title: 'Number of Islands', topic: 'Graphs / BFS', difficulty: 'Medium' },
      { title: 'Longest Substring Without Repeating', topic: 'Sliding Window', difficulty: 'Medium' },
      { title: 'Climbing Stairs', topic: 'DP', difficulty: 'Easy' },
      { title: 'Flood Fill', topic: 'Graphs / DFS', difficulty: 'Easy' },
      { title: 'Maximum Depth of Binary Tree', topic: 'Trees', difficulty: 'Easy' },
    ]
  },
  {
    name: 'Tier 3',
    label: 'T3',
    color: '#F6B846',
    desc: 'Advanced recursion, backtracking, heaps, priority queues & tree views.',
    questions: [
      { title: 'N Queens Problem', topic: 'Backtracking', difficulty: 'Hard' },
      { title: 'Kth Largest Element in Array', topic: 'Heaps', difficulty: 'Medium' },
      { title: 'Binary Search on Answer', topic: 'Binary Search', difficulty: 'Medium' },
      { title: 'Word Search', topic: 'Backtracking / DFS', difficulty: 'Medium' },
      { title: 'Right View of Binary Tree', topic: 'Trees', difficulty: 'Medium' },
      { title: 'Median of two sorted arrays', topic: 'Binary Search', difficulty: 'Hard' },
      { title: 'Rat in a Maze', topic: 'Backtracking', difficulty: 'Medium' },
    ]
  },
  {
    name: 'Tier 2',
    label: 'T2',
    color: '#48D2A0',
    desc: 'Advanced Dynamic Programming, graph algorithms (shortest path, MST), Tries & LFU caches.',
    questions: [
      { title: 'Task Scheduler', topic: 'Heaps / Greedy', difficulty: 'Medium' },
      { title: 'Longest Increasing Subsequence', topic: 'DP (Subsequences)', difficulty: 'Medium' },
      { title: 'Dijkstra\'s Algorithm', topic: 'Graphs (Short Path)', difficulty: 'Medium' },
      { title: 'Trie Implementation & Ops', topic: 'Tries', difficulty: 'Medium' },
      { title: 'LFU Cache', topic: 'Design / DLL', difficulty: 'Hard' },
      { title: 'Minimum Window Substring', topic: 'Sliding Window', difficulty: 'Hard' },
      { title: 'Sudoku Solver', topic: 'Backtracking', difficulty: 'Hard' },
    ]
  },
  {
    name: 'Tier 1',
    label: 'T1',
    color: '#f381aaff',
    desc: 'Multi-dimensional DP, advanced graph theory, segment trees & complex binary search.',
    questions: [
      { title: 'Median of Two Sorted Arrays', topic: 'Binary Search', difficulty: 'Hard' },
      { title: 'Vertical Order Traversal', topic: 'Binary Trees', difficulty: 'Hard' },
      { title: 'Kosaraju\'s Algorithm', topic: 'Graphs (SCC)', difficulty: 'Hard' },
      { title: 'Burst Balloons', topic: 'DP (MCM Pattern)', difficulty: 'Hard' },
      { title: 'Distinct Subsequences', topic: 'DP (Strings)', difficulty: 'Hard' },
      { title: 'Sum of Distances (Re-rooting)', topic: 'DP on Trees', difficulty: 'Hard' },
      { title: 'Range Sum Query 2D (Mutable)', topic: 'Segment Tree', difficulty: 'Hard' },
    ]
  },
  {
    name: 'Master',
    label: 'MST',
    color: '#B084E9',
    desc: 'Your Complete A–Z Guide to Mastering DSA from Beginner to Advanced',
    questions: [
      { title: 'Segment Tree – Range Min Query', topic: 'Segment Tree', difficulty: 'Hard' },
      { title: 'Traveling Salesman (TSP)', topic: 'Bitmask DP', difficulty: 'Hard' },
      { title: 'Alien Dictionary', topic: 'Topological Sort', difficulty: 'Hard' },
      { title: 'Maximum Flow (Ford-Fulkerson)', topic: 'Graphs', difficulty: 'Hard' },
      { title: 'Palindrome Partitioning II', topic: 'DP', difficulty: 'Hard' },
      { title: 'Largest Rectangle in Histogram', topic: 'Stacks', difficulty: 'Hard' },
      { title: 'LFU Cache Design', topic: 'Design', difficulty: 'Hard' },
    ]
  }
];




const TIERS = [
  {
    id: 'beginner',
    name: 'Beginner Set',
    tag: 'FOUNDATION',
    topics: ['Complexity Analysis', 'Basic Mathematics', 'Arrays & Lists Basics', 'Hashing Prereq', 'Sorting Algos'],
    stats: { easy: 18, medium: 4, hard: 0, target: 'Build fundamental logical coding skills.' }
  },
  {
    id: 'tier5-4',
    name: 'Tiers 5 & 4',
    tag: 'PLACEMENT FOUNDATION',
    topics: ['Two Pointers', 'Sliding Window', 'Binary Search', 'Recursion basics', 'Hashing Map / Sets'],
    stats: { easy: 35, medium: 28, hard: 2, target: 'Master basic data manipulation and linear traversals.' }
  },
  {
    id: 'tier3-2',
    name: 'Tiers 3 & 2',
    tag: 'PRODUCT COMPANY READY',
    topics: ['Trees & BST', 'Recursion & Backtracking', 'Stacks & Queues', 'Greedy Algorithms', 'Linked Lists'],
    stats: { easy: 15, medium: 52, hard: 14, target: 'Ace intermediate standard structures and core heuristics.' }
  },
  {
    id: 'tier1',
    name: 'Tier 1',
    tag: 'DREAM TECH LEVEL',
    topics: ['Dynamic Programming', 'Graph Theory', 'Trie Datastructure', 'Heaps & Priority Queues'],
    stats: { easy: 6, medium: 45, hard: 38, target: 'Solve advanced non-linear structures and optimized subproblems.' }
  },
  {
    id: 'master',
    name: 'Master Set',
    tag: 'MAANG SPECIALISTS',
    topics: ['Hard DP', 'Advanced Graphs (Tarjan, Flow)', 'Segment Trees & Fenwick', 'Bitmasking Optimization'],
    stats: { easy: 0, medium: 12, hard: 68, target: 'Target niche competitive programming standard tracks.' }
  }
];



// ─── MAIN LANDING PAGE ───────────────────────────────────────────────────────
export default function LandingPage() {
  const { user } = useAuth();
  const [activeTier, setActiveTier] = useState(TIERS[0]);
  const [autoTierIdx, setAutoTierIdx] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  if (user) {
    return <Navigate to="/home" replace />;
  }

  useEffect(() => {
    // Hero entrance animations
    const tl = gsap.timeline();

    // Navbar drop-in
    tl.fromTo('.anim-navbar',
      { y: -20, opacity: 0, filter: 'blur(5px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }
    );

    // Title reveal
    tl.fromTo('.anim-hero-title',
      { y: 50, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power4.out' },
      '-=0.6'
    );

    // Description reveal
    tl.fromTo('.anim-hero-desc',
      { y: 20, opacity: 0, filter: 'blur(8px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' },
      '-=0.7'
    );

    // CTA Button
    tl.fromTo('.anim-hero-cta',
      { y: 15, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.6'
    );

    // Orb/Visual slide-in
    tl.fromTo('.anim-hero-visual',
      { scale: 0.85, opacity: 0, filter: 'blur(15px)' },
      { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power2.out' },
      '-=0.9'
    );

    // Auto rotate tier showcase (Adjusted to 1.5s pace)
    const interval = setInterval(() => {
      setAutoTierIdx((prev) => (prev + 1) % SNEAK_PEEK_TIERS.length);
    }, 1500);

    // Scroll-triggered reveals
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cards = entry.target.querySelectorAll('.anim-scroll-card');
          gsap.fromTo(cards,
            { y: 20, opacity: 0, filter: 'blur(4px)' },
            { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, stagger: 0.08, ease: 'power2.out' }
          );
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    document.querySelectorAll('.anim-scroll-section').forEach(sec => revealObserver.observe(sec));

    return () => {
      clearInterval(interval);
      revealObserver.disconnect();
    };
  }, []);

  const currentPeek = SNEAK_PEEK_TIERS[autoTierIdx];

  return (
    <div className="w-full min-h-screen font-sans bg-[#0E0E0E] text-white overflow-x-hidden relative selection:bg-white/20 selection:text-white">
      <SEO 
        title="Algo2Offer - From Algorithms to Offers" 
        description="Learn DSA, Computer science fundamentals, aptitude, and track your daily placement preparedness metrics in a high-fidelity integrated cockpit."
      />

      {/* HEADER NAVBAR */}
      <header className="anim-navbar max-w-[1400px] mx-auto px-6 sm:px-8 h-20 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border-[3px] border-white bg-transparent shadow-[0_0_12px_rgba(255,255,255,0.4)]"></div>
          <span className="text-white font-extrabold text-base tracking-wider">Algo2Offer</span>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-8 pt-10 pb-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[90vh]">

        {/* Left Content column */}
        <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start relative z-20">
          <h1 className="anim-hero-title text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter leading-[1.08] text-white">
            From Algorithms <br />
            to Offers: <br />
            Your Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400">Placement Launchpad.</span>
          </h1>

          <p className="anim-hero-desc text-neutral-400 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed font-medium">
            Learn DSA, Computer fundamentals, and track your daily placement preparedness metrics in a high-fidelity integrated cockpit.
          </p>

          {/* CTA Buttons */}
          <div className="anim-hero-cta flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 w-full max-w-md mx-auto lg:mx-0">
            <Link
              to="/login"
              className="w-fit bg-white text-black hover:bg-neutral-200 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_35px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 text-center"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Right: Animated White Logo */}
        <div className="anim-hero-visual lg:col-span-6 flex justify-center items-center">
          <div className="flex flex-col items-center gap-6">

            {/* ── Keyframe definitions ── */}
            <style>{`
              @keyframes sonar {
                0%   { transform: scale(0.85); opacity: 0.6; }
                100% { transform: scale(2.0);  opacity: 0; }
              }
              @keyframes shimmer-sweep {
                0%   { background-position: -200% center; }
                100% { background-position: 200% center; }
              }
              @keyframes slow-spin {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
              }
            `}</style>

            {/* Sonar rings + static large white orb */}
            <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>

              {/* Sonar pulse rings */}
              {[0, 0.7, 1.4].map((delay, i) => (
                <div key={i} className="absolute inset-0 rounded-full border border-white/20"
                  style={{ animation: `sonar 3.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s infinite` }} />
              ))}

              {/* Outer spinning dash ring for unique premium tech feel */}
              <div className="absolute inset-[-12px] rounded-full border border-dashed border-white/20"
                style={{ animation: 'slow-spin 20s linear infinite' }} />

              {/* Solid White Glowing Ring */}
              <div
                className="w-full h-full rounded-full border-[5px] border-white bg-transparent relative"
                style={{
                  boxShadow: '0 0 40px rgba(255,255,255,0.35), inset 0 0 20px rgba(255,255,255,0.15)',
                }}
              >
                {/* Subtle inner accent ring */}
                <div className="absolute inset-[6px] rounded-full border border-white/10" />
              </div>
            </div>

            {/* Shimmer tagline */}
            <span
              className="text-[12px] font-mono uppercase tracking-[0.25em]"
              style={{
                background: 'linear-gradient(90deg, #444 0%, #fff 40%, #fff 60%, #444 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmer-sweep 3.5s linear infinite',
              }}
            >
              Algorithms → Offers
            </span>

          </div>
        </div>

      </section>

      {/* CORE PHILOSOPHY SECTION - REWORKED WITH COLUMNS AUTO ROTATING SHOWCASE & BANNER */}
      <section className="anim-scroll-section max-w-[1400px] mx-auto px-6 sm:px-8 py-20 relative border-t border-[#2a2a2a]/40">

        <div className="anim-scroll-card grid grid-cols-1 md:grid-cols-12 gap-8 items-center pb-12 border-b border-[#2a2a2a]/40">
          <div className="md:col-span-7">
            <h2 className="text-xs font-black text-neutral-500 tracking-[0.25em] uppercase mb-3">Our Core Philosophy</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              Everything You Need To <br />
              <span className="text-neutral-500">Grab The</span> Placement.
            </h3>
          </div>
          <div className="md:col-span-1 hidden md:block h-20 w-[1px] bg-[#2a2a2a] justify-self-center"></div>
          <div className="md:col-span-4 text-left md:text-right">
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm ml-auto">
              A single platform that combines structured learning, daily practice targets, and transparent progress indicators so you can master DSA with absolute confidence.
            </p>
          </div>
        </div>

        {/* Grid: Flat TUF-Style Tiers List vs Heatmap */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-y-16 xl:gap-y-0 xl:gap-20 pt-12 divide-y xl:divide-y-0 xl:divide-x divide-[#2a2a2a]/50">

          {/* LEFT: Flat Tier Questions List */}
          <div className="anim-scroll-card xl:pr-16">

            {/* Heading */}
            <h4 className="text-2xl font-black text-white tracking-tight uppercase">TIER-BASED DSA ROADMAPS</h4>
            <p className="text-neutral-400 text-sm mt-2 mb-6 leading-relaxed max-w-md min-h-[72px] sm:min-h-[48px]">
              {currentPeek.desc}
            </p>

            {/* Flat Tab Bar — no background, just border-bottom */}
            <div className="flex items-center gap-0 border-b border-[#2a2a2a] overflow-x-auto whitespace-nowrap scrollbar-none">
              {SNEAK_PEEK_TIERS.map((tier, idx) => {
                const isActive = autoTierIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setAutoTierIdx(idx)}
                    className="relative px-4 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-all flex-shrink-0"
                    style={{ color: isActive ? tier.color : '#666' }}
                  >
                    {tier.name}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t"
                        style={{ backgroundColor: tier.color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Questions — plain rows, no container */}
            <div className="mt-1">
              {currentPeek.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3.5 border-b border-[#1e1e1e] group hover:bg-white/[0.02] transition-colors px-1"
                  style={{ borderLeft: idx === 0 ? `2px solid ${currentPeek.color}` : '2px solid transparent' }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-neutral-600 w-5 text-right tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors">{q.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider hidden sm:block">{q.topic}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded ${q.difficulty === 'Easy' ? 'text-[#48D2A0] bg-[#48D2A0]/8' :
                      q.difficulty === 'Medium' ? 'text-[#F6B846] bg-[#F6B846]/8' :
                        'text-[#FF716C] bg-[#FF716C]/8'
                      }`}>
                      {q.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Prep-Track Index */}
          <div className="anim-scroll-card xl:pl-16 pt-12 xl:pt-0">
            <h4 className="text-2xl font-black text-white tracking-tight mb-2">
              FIVE MODULES.
            </h4>
            <p className="text-neutral-500 text-sm mt-2 mb-6 leading-relaxed max-w-sm">
              Everything You Need. Nothing You Don't.
            </p>

            {/* Prep-track index list */}
            <div className="border-t border-[#2a2a2a]">
              {[
                { num: '01', name: 'DSA', desc: '7 tiers from Basics to FAANG+ — track your tier, solve daily, and climb the offer ladder.', stat: '7 tiers' },
                { num: '02', name: 'CS Fundamentals', desc: 'OS, DBMS, Networks & OOP — curated one-shots, InterviewBit Qs, and cheat sheets per topic.', stat: '4 subjects' },
                { num: '03', name: 'Aptitude', desc: 'Quant, logical & verbal via IndiaBix — the screening gateway most people ignore until it\'s too late.', stat: 'IndiaBix' },
                { num: '04', name: 'Contests', desc: 'VJudge-backed live contests with real-time leaderboards — live, upcoming, or ended, all tracked.', stat: 'Live boards' },
                { num: '05', name: 'Blogs', desc: 'Community markdown blogs — read interview experiences, write editorials, and like what helps.', stat: 'Community' },
              ].map(({ num, name, desc, stat }) => (
                <div
                  key={num}
                  className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-5 py-5 border-b border-[#2a2a2a]"
                >
                  {/* Top row on mobile: number + name + stat badge */}
                  <div className="flex items-center gap-3 sm:contents">
                    {/* Number */}
                    <span className="font-mono text-[11px] text-neutral-600 w-8 flex-none">{num}</span>

                    {/* Module name */}
                    <span className="font-bold text-sm sm:text-base text-white sm:w-36 flex-none">
                      {name}
                    </span>

                    {/* Stat — shown inline on mobile */}
                    <span className="font-mono text-[9px] text-neutral-600 sm:hidden ml-auto flex-none">
                      {stat}
                    </span>
                  </div>

                  {/* Description */}
                  <span className="text-[11px] text-neutral-500 leading-relaxed sm:flex-1 pl-11 sm:pl-0">
                    {desc}
                  </span>

                  {/* Stat — desktop only (right column) */}
                  <span className="font-mono text-[10px] text-neutral-600 flex-none hidden sm:block w-24 text-right">
                    {stat}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </section>

      {/* FAQ SECTION */}
      <section className="anim-scroll-section max-w-[920px] mx-auto px-6 sm:px-8 py-20 relative border-t border-[#2a2a2a]/40">
        <div className="anim-scroll-card text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-black text-neutral-400 tracking-[0.25em] uppercase">Common Queries</h2>
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">Frequently Asked Questions</h3>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            Everything you need to know about placement preparation and the Algo2Offer journey.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'What skills do companies prefer in candidates for on-campus placements?',
              a: (
                <div className="space-y-3">
                  <p>In general, top recruiters and tech companies look for candidates who are:</p>
                  <ol className="list-decimal space-y-2.5 pl-4 text-neutral-400">
                    <li>
                      <strong className="text-white">Good at Communication:</strong> Clear articulation of logic and technical thoughts during interviews.
                    </li>
                    <li>
                      <strong className="text-white">Strong at Basic Fundamentals:</strong> A solid grasp of core CS subjects like OOPs, DBMS, Operating Systems, and Computer Networks.
                    </li>
                    <li>
                      <strong className="text-white">Good at Problem Solving:</strong> Proficient in core Data Structures & Algorithms.
                    </li>
                    <li>
                      <strong className="text-white">Valuable Portfolio (Projects & Research):</strong> Projects solving actual problems, possessing unique features, solid research work, or documenting valuable development over the last 3 years.
                    </li>
                    <li>
                      <strong className="text-white">Confident and Presentable:</strong> Strong interpersonal skills and readiness to tackle unseen interview problems.
                    </li>
                  </ol>
                </div>
              )
            },
            {
              q: 'How to start with DSA as a beginner?',
              a: (
                <div className="space-y-3">
                  <p>Mastering DSA requires a structured, step-by-step approach. Instead of rushing, follow the **Algo2Offer Tiers Roadmap**:</p>
                  <ol className="list-decimal space-y-2.5 pl-4">
                    <li>
                      <strong className="text-white">Pick a Language:</strong> Learn the basics of C++, Java, or Python (syntax, conditional statements, loops).
                    </li>
                    <li>
                      <strong className="text-white">Start at the Basics Tier:</strong> Conquer basic mathematics, pattern printing, and simple recursion to build core computational logic.
                    </li>
                    <li>
                      <strong className="text-white">Solve Topic-by-Topic:</strong> When starting data structures, solve all <span className="text-[#48D2A0]">Easy</span> questions first. Do not jump to Medium problems prematurely.
                    </li>
                    <li>
                      <strong className="text-white">Climb the Tiers:</strong> Once Easy problems are fully solved, move on to <span className="text-[#F6B846]">Medium</span> questions, followed by <span className="text-[#FF716C]">Hard</span> challenges to secure premium FAANG+ placements.
                    </li>
                  </ol>
                </div>
              )
            },
            {
              q: 'I am unable to solve questions, how do I approach them?',
              a: (
                <div className="space-y-3">
                  <p>Struggling with problem-solving is completely normal. Build your logic using this strategy:</p>
                  <ul className="list-none space-y-2.5 pl-1">
                    <li className="flex items-start gap-3">
                      <span className="text-neutral-500 mt-0.5">▪</span>
                      <div>
                        <strong className="text-white">Brute Force First:</strong> Try to understand the problem fully and design a basic brute force solution before optimizing.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-neutral-500 mt-0.5">▪</span>
                      <div>
                        <strong className="text-white">The 30-Minute Limit:</strong> Never spend more than 30 minutes struggling blindly on a question. Check the solution, analyze what you missed, and understand the logic.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-neutral-500 mt-0.5">▪</span>
                      <div>
                        <strong className="text-white">No Copy-Paste:</strong> Code the solution yourself from scratch without looking back at the reference code.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-neutral-500 mt-0.5">▪</span>
                      <div>
                        <strong className="text-white">Revisit & Review:</strong> Mark the question for review and attempt it again independently after a few days to ensure the pattern has registered.
                      </div>
                    </li>
                  </ul>
                </div>
              )
            },
            {
              q: 'When do I start appearing for contests?',
              a: (
                <div className="space-y-3">
                  <p>Transition to competitive environments early to adapt to real-time coding stress:</p>
                  <ul className="list-none space-y-2.5 pl-1">
                    <li className="flex items-start gap-3">
                      <span className="text-neutral-500 mt-0.5">▪</span>
                      <div>
                        <strong className="text-white">Prerequisites:</strong> Solve easy questions on basic topics: Arrays, Strings, Stacks, Queues, Maps, and Recursion.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-neutral-500 mt-0.5">▪</span>
                      <div>
                        <strong className="text-white">Contest Entry:</strong> Begin by attempting just the 1st and 2nd questions in live contests.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-neutral-500 mt-0.5">▪</span>
                      <div>
                        <strong className="text-white">Parallel Solving:</strong> Continue practicing and unlocking next-level topics on your main dashboard while contesting.
                      </div>
                    </li>
                  </ul>
                </div>
              )
            }
          ].map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className={`anim-scroll-card rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen
                  ? 'bg-[#141516] border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.02)]'
                  : 'bg-transparent border-[#2a2a2a] hover:border-white/10'
                  }`}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-white transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full border border-neutral-800 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 border-white/20' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-neutral-400 leading-relaxed font-medium border-t border-[#2a2a2a]/60">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PREMIUM FOOTER */}
      <footer className="py-12 border-t border-[#2a2a2a]/40 text-center z-20 relative bg-[#0E0E0E]">
        <div className="w-6 h-6 rounded-full border-[3px] border-white mx-auto mb-6 shadow-[0_0_12px_rgba(255,255,255,0.4)]"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 px-4">&copy; 2026 Algo2Offer. All Rights Reserved.</p>
      </footer>

    </div>
  );
}