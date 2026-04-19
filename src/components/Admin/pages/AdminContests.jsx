import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase';

// ─── Helpers (mirrored from Contests.jsx) ────────────────────────────────────

function extractContestId(url) {
  try {
    const { pathname } = new URL(url);
    const parts = pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  } catch {
    return '';
  }
}

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

// ─── Status Badge ─────────────────────────────────────────────────────────────

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

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {[60, 160, 80, 120, 70, 70, 60].map((w, i) => (
        <td key={i} className="px-6 py-5">
          <div className="h-3 rounded-full bg-[#2a2a2a] animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Add Contest Modal ────────────────────────────────────────────────────────

const EMPTY_FORM = { title: '', link: '', contestId: '', startTime: '', endTime: '' };

function AddContestModal({ onClose, onAdded }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);

  const handleLinkChange = (e) => {
    const link = e.target.value;
    const contestId = extractContestId(link);
    setFormData(prev => ({ ...prev, link, contestId }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addDoc(collection(firestore, 'contests'), {
        title: formData.title,
        link: formData.link,
        contestId: formData.contestId,
        startTime: formData.startTime,
        endTime: formData.endTime,
        createdAt: Date.now(),
      });
      onAdded();
      onClose();
    } catch (error) {
      console.error('Error adding contest:', error);
      alert('Failed to add contest');
    } finally {
      setAdding(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl bg-[#141516] border border-[#2a2a2a] rounded-[24px] shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#2a2a2a]">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Add New Contest</h2>
            <p className="text-xs text-[#555] mt-0.5">Contest ID auto-fills when you paste a link.</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#555] hover:text-white hover:bg-[#2a2a2a] transition-all p-2 rounded-xl"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-5">
          {/* Row 1 — Title + Link */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-[#555] uppercase tracking-widest mb-2">Contest Title</label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[#1a1c1d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#48D2A0]/60 transition-all placeholder:text-[#444]"
                placeholder="Weekly Contest 400"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-[#555] uppercase tracking-widest mb-2">Link URL</label>
              <input
                required
                type="url"
                name="link"
                value={formData.link}
                onChange={handleLinkChange}
                className="w-full bg-[#1a1c1d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#48D2A0]/60 transition-all placeholder:text-[#444]"
                placeholder="https://vjudge.net/contest/800465"
              />
            </div>
          </div>

          {/* Row 2 — Contest ID + Start + End */}
          <div className="flex gap-4 flex-wrap">
            <div className="min-w-[160px]">
              <label className="block text-xs font-bold text-[#555] uppercase tracking-widest mb-2">
                Contest ID
                <span className="ml-2 normal-case text-[#48D2A0] font-semibold tracking-normal">auto-filled</span>
              </label>
              <input
                type="text"
                name="contestId"
                value={formData.contestId}
                onChange={handleChange}
                className="w-full bg-[#1a1c1d] border border-[#48D2A0]/30 rounded-xl px-4 py-3 text-sm text-[#48D2A0] font-mono font-bold focus:outline-none focus:border-[#48D2A0] transition-all placeholder:text-[#333]"
                placeholder="800465"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-bold text-[#555] uppercase tracking-widest mb-2">Start Time</label>
              <input
                required
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full bg-[#1a1c1d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#48D2A0]/60 transition-all [color-scheme:dark]"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-bold text-[#555] uppercase tracking-widest mb-2">End Time</label>
              <input
                required
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full bg-[#1a1c1d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#48D2A0]/60 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#2a2a2a]">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center items-center text-[11px] font-bold text-[#aaa] bg-[#111] hover:bg-white hover:text-black px-6 py-2.5 rounded-xl transition-all uppercase tracking-widest border border-[#2a2a2a] hover:border-white"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={adding}
              className="inline-flex justify-center items-center gap-2 text-[11px] font-bold text-white bg-[#2a2a2a] hover:bg-white hover:text-black px-6 py-2.5 rounded-xl transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  ADDING…
                </span>
              ) : 'ADD CONTEST'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminContests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const fetchContests = async () => {
    try {
      const snap = await getDocs(collection(firestore, 'contests'));
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      setContests(list);
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContests(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contest?')) return;
    try {
      await deleteDoc(doc(firestore, 'contests', id));
      setContests(contests.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting contest:', error);
    }
  };

  const filtered = contests.filter(c => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.contestId || '').toLowerCase().includes(q) ||
      (c.title || '').toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Modal */}
      {showModal && (
        <AddContestModal
          onClose={() => setShowModal(false)}
          onAdded={fetchContests}
        />
      )}

      <div className="flex flex-col gap-8 text-white w-full max-w-[1200px] mx-auto px-4 md:px-6 py-6 mb-20">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-1">Manage Contests</h1>
            <p className="text-[#888] text-sm">Add, review and delete coding contests.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Add button */}
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 text-[11px] font-bold text-white bg-[#2a2a2a] hover:bg-white hover:text-black px-6 py-2.5 rounded-xl transition-all uppercase tracking-widest active:scale-95"
            >
              ADD CONTEST
            </button>
          </div>
        </div>

        {/* STATS + SEARCH BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Stats pills with label text */}
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
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444]" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              id="admin-contest-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Contest ID or name…"
              className="w-full bg-[#141516] border border-[#2a2a2a] rounded-xl py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#48D2A0]/50 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            )}
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
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]/40">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.length > 0
                    ? filtered.map((c, i) => {
                      const status = getStatus(c.startTime, c.endTime);
                      const isLive = status === 'live';
                      return (
                        <tr key={c.id} className={`group transition-all duration-200 ${isLive ? 'hover:bg-[#48D2A0]/5' : 'hover:bg-[#202224]'}`}>
                          <td className="px-6 py-5 text-[#555] text-xs font-mono">{i + 1}</td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-semibold text-[#ccc] group-hover:text-white transition-colors">{c.title || '—'}</span>
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
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-500/5 border border-red-500/20 hover:bg-red-500/15 hover:border-red-500/40 px-3.5 py-2 rounded-xl transition-all"
                            >
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                    : (
                      <tr>
                        <td colSpan={7} className="px-6 py-20 text-center text-[#555]">
                          <svg className="mx-auto mb-3 text-[#333]" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                          </svg>
                          {search
                            ? <p className="text-sm">No contests match <span className="text-white font-medium">"{search}"</span></p>
                            : (
                              <>
                                <p className="text-sm mb-3">No contests added yet.</p>
                                <button onClick={() => setShowModal(true)} className="text-xs font-bold text-[#48D2A0] hover:underline">
                                  + Add your first contest
                                </button>
                              </>
                            )
                          }
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
              ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-5 flex flex-col gap-3 animate-pulse">
                  <div className="h-3 rounded-full bg-[#2a2a2a] w-3/4" />
                  <div className="h-2.5 rounded-full bg-[#2a2a2a] w-1/2" />
                </div>
              ))
              : contests.length > 0
                ? contests.map((c) => {
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
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="self-end text-[10px] font-bold text-red-400 bg-red-500/5 border border-red-500/20 hover:bg-red-500/15 px-4 py-2 rounded-xl transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })
                : (
                  <div className="p-10 text-center text-[#555] text-sm flex flex-col items-center gap-3">
                    No contests yet.
                    <button onClick={() => setShowModal(true)} className="text-xs font-bold text-[#48D2A0] hover:underline">
                      + Add your first contest
                    </button>
                  </div>
                )
            }
          </div>
        </div>

        {/* Total count */}
        {!loading && contests.length > 0 && (
          <p className="text-xs text-[#555] text-right">{contests.length} contest{contests.length !== 1 ? 's' : ''} total</p>
        )}
      </div>
    </>
  );
}
