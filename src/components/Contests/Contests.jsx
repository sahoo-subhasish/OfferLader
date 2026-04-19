import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';

const PAGE_SIZE = 10;

// ─── Helpers ────────────────────────────────────────────────────────────────

function getStatus(startTime, endTime) {
  const now = Date.now();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (!startTime || !endTime) return 'unknown';
  if (now < start) return 'not_started';
  if (now >= start && now < end) return 'live';
  return 'ended';
}

function getDuration(startTime, endTime) {
  if (!startTime || !endTime) return '—';
  const diffMs = new Date(endTime) - new Date(startTime);
  if (diffMs <= 0) return '—';
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Status Badge ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', dot: 'bg-[#F6B846]', text: 'text-[#F6B846]', bg: 'bg-[#F6B846]/10', border: 'border-[#F6B846]/25' },
  live: { label: 'Live', dot: 'bg-[#48D2A0] animate-pulse', text: 'text-[#48D2A0]', bg: 'bg-[#48D2A0]/10', border: 'border-[#48D2A0]/25' },
  ended: { label: 'Ended', dot: 'bg-[#FF716C]', text: 'text-[#FF716C]', bg: 'bg-[#FF716C]/10', border: 'border-[#FF716C]/25' },
  unknown: { label: '—', dot: 'bg-[#444]', text: 'text-[#666]', bg: 'bg-[#111]', border: 'border-[#2a2a2a]' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Skeleton Row ────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {[120, 80, 160, 90, 80, 80, 80].map((w, i) => (
        <td key={i} className="px-6 py-5">
          <div className="h-3 rounded-full bg-[#2a2a2a] animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const snap = await getDocs(collection(firestore, 'contests'));
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        list.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        setContests(list);
      } catch (error) {
        console.error("Error fetching contests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  // ── Filter + Paginate ────────────────────────────────────────────────────
  const filtered = contests.filter(c => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      (c.contestId || '').toLowerCase().includes(q) ||
      (c.title || '').toLowerCase().includes(q);
    const matchesStatus = !statusFilter || getStatus(c.startTime, c.endTime) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = useCallback((e) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleStatusFilter = (s) => {
    setStatusFilter(prev => prev === s ? null : s);
    setPage(1);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <section className="flex flex-col gap-8 text-white w-full max-w-[1200px] mx-auto px-4 md:px-6 py-6 mb-20">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-1">Contests</h1>
          <p className="text-[#888] text-sm">Participate in the latest coding contests. Status updates automatically.</p>
        </div>
        {/* Stats pills */}
        {!loading && (
          <div className="flex gap-2 flex-wrap">
            {['live', 'not_started', 'ended'].map(s => {
              const count = contests.filter(c => getStatus(c.startTime, c.endTime) === s).length;
              const cfg = STATUS_CONFIG[s];
              return (
                <span key={s} className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {count} {cfg.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* SEARCH + FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search input */}
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444]" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            id="contest-search"
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search by Contest ID or name…"
            className="w-full bg-[#141516] border border-[#2a2a2a] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#48D2A0]/50 transition-all"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 flex-wrap">
          {/* All pill */}
          <button
            onClick={() => { setStatusFilter(null); setPage(1); }}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${statusFilter === null
              ? 'bg-white text-black border-white shadow-[0_0_14px_rgba(255,255,255,0.18)]'
              : 'bg-[#141516] border-[#2a2a2a] text-[#777] hover:text-white hover:border-[#444]'
              }`}
          >
            All
          </button>
          {['live', 'not_started', 'ended'].map(s => {
            const cfg = STATUS_CONFIG[s];
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => handleStatusFilter(s)}
                className={`whitespace-nowrap inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${isActive
                  ? `${cfg.bg} ${cfg.border} ${cfg.text} shadow-[0_0_14px_rgba(0,0,0,0.3)]`
                  : 'bg-[#141516] border-[#2a2a2a] text-[#777] hover:text-white hover:border-[#444]'
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? cfg.dot : 'bg-[#555]'}`} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="rounded-[24px] bg-[#1a1c1d] border border-[#2a2a2a] shadow-2xl overflow-hidden">

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-[#141516]/60 border-b border-[#2a2a2a] text-[10px] font-black text-[#444] uppercase tracking-[0.18em]">
                <th className="px-6 py-5">#</th>
                <th className="px-6 py-5">Contest Name</th>
                <th className="px-6 py-5">Contest ID</th>
                <th className="px-6 py-5">Start Time</th>
                <th className="px-6 py-5">Duration</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]/40">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : paginated.length > 0
                  ? paginated.map((c, i) => {
                    const status = getStatus(c.startTime, c.endTime);
                    const isLive = status === 'live';
                    return (
                      <tr key={c.id} className={`group transition-all duration-200 ${isLive ? 'hover:bg-[#48D2A0]/5' : 'hover:bg-[#202224]'}`}>
                        <td className="px-6 py-5 text-[#555] text-xs font-mono">
                          {(safePage - 1) * PAGE_SIZE + i + 1}
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-semibold text-[#ccc] group-hover:text-white transition-colors">
                            {c.title || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {c.contestId
                            ? <span className="text-xs font-mono font-bold text-[#48D2A0] bg-[#48D2A0]/8 border border-[#48D2A0]/25 px-2.5 py-1 rounded-lg">#{c.contestId}</span>
                            : <span className="text-[#555] text-xs">—</span>
                          }
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs text-[#888]">{formatDateTime(c.startTime)}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-mono font-bold text-[#ccc] bg-[#111] border border-[#2a2a2a] px-2.5 py-1 rounded-lg">
                            {getDuration(c.startTime, c.endTime)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            {/* Leaderboard */}
                            <a
                              href={c.link ? `${c.link}#rank` : '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Leaderboard"
                              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#888] bg-[#111] border border-[#2a2a2a] hover:text-white hover:border-[#444] px-3.5 py-2 rounded-xl transition-all"
                            >
                              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
                              Board
                            </a>
                            {/* Participate */}
                            <a
                              href={c.link || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-4 py-2 rounded-xl transition-all ${isLive
                                ? 'bg-[#48D2A0] text-black hover:bg-[#5ee0ad] shadow-[0_0_12px_rgba(72,210,160,0.25)]'
                                : 'bg-[#2a2a2a] text-white hover:bg-[#333]'
                                }`}
                            >
                              {isLive ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                                  Join Live
                                </>
                              ) : (
                                <>
                                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                  Participate
                                </>
                              )}
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                  : (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center text-[#555]">
                        <svg className="mx-auto mb-3 text-[#333]" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        <p className="text-sm">No contests match <span className="text-white font-medium">"{search}"</span></p>
                      </td>
                    </tr>
                  )
              }
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden flex flex-col divide-y divide-[#2a2a2a]/50">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 flex flex-col gap-3 animate-pulse">
                <div className="h-3 rounded-full bg-[#2a2a2a] w-3/4" />
                <div className="h-2.5 rounded-full bg-[#2a2a2a] w-1/2" />
                <div className="h-2.5 rounded-full bg-[#2a2a2a] w-2/3" />
              </div>
            ))
            : paginated.length > 0
              ? paginated.map((c) => {
                const status = getStatus(c.startTime, c.endTime);
                const isLive = status === 'live';
                return (
                  <div key={c.id} className={`p-5 flex flex-col gap-3 ${isLive ? 'bg-[#48D2A0]/5' : ''}`}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        {c.contestId && (
                          <span className="text-[10px] font-mono font-bold text-[#48D2A0]">#{c.contestId}</span>
                        )}
                        <span className="text-[15px] font-bold text-white leading-snug">{c.title || '—'}</span>
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#888]">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#555] block mb-0.5">Start</span>
                        {formatDateTime(c.startTime)}
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#555] block mb-0.5">Duration</span>
                        <span className="font-mono font-bold text-[#ccc]">{getDuration(c.startTime, c.endTime)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <a
                        href={c.link ? `${c.link}#rank` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center text-[10px] font-bold text-[#888] bg-[#111] border border-[#2a2a2a] py-2 rounded-xl active:scale-95 transition-transform"
                      >
                        Leaderboard
                      </a>
                      <a
                        href={c.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 text-center text-[10px] font-bold py-2 rounded-xl active:scale-95 transition-transform ${isLive ? 'bg-[#48D2A0] text-black' : 'bg-[#2a2a2a] text-white'
                          }`}
                      >
                        {isLive ? '⚡ Join Live' : 'Participate'}
                      </a>
                    </div>
                  </div>
                );
              })
              : (
                <div className="p-10 text-center text-[#555] text-sm">
                  No contests match "{search}"
                </div>
              )
          }
        </div>
      </div>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="text-xs text-[#555]">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} contests
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-[#1a1c1d] border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#444] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${p === safePage
                  ? 'bg-[#48D2A0] text-black shadow-[0_0_12px_rgba(72,210,160,0.3)]'
                  : 'bg-[#1a1c1d] border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#444]'
                  }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-[#1a1c1d] border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#444] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* EMPTY STATE (no contests at all) */}
      {!loading && contests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-[#555] rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a]/40">
          <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" className="mb-4 text-[#333]">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-1">No Contests Yet</h2>
          <p className="text-sm">Weekly and Bi-weekly contests will appear here soon.</p>
        </div>
      )}
    </section>
  );
}