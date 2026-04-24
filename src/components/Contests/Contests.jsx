import React, { useEffect, useState, useCallback, useRef } from 'react';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';

const PAGE_SIZE = 10;
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;

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

// ─── Webhook fetch ───

async function fetchLeaderboardFromWebhook(contestId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json, text/plain, */*',
      },
      body: String(contestId),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    if (!text || text.trim() === '') return [];

    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.body)) return data.body;
      if (data && Array.isArray(data.leaderboard)) return data.leaderboard;
      if (data && Array.isArray(data.rankings)) return data.rankings;
      if (data && Array.isArray(data.data)) return data.data;
      if (data && typeof data === 'object') {
        return Object.entries(data).map(([k, v]) =>
          typeof v === 'object' ? { rank: Number(k) || undefined, ...v } : { rank: Number(k), username: String(v) }
        );
      }
      return [];
    } catch {
      return [];
    }
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ─── Status Badge ───

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

// ─── Skeleton Row ───

function SkeletonRow() {
  return (
    <tr>
      {[120, 80, 160, 90, 80, 80, 80].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3 rounded-full bg-[#2a2a2a] animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Rank Badge ───

function RankBadge({ rank }) {
  if (rank === 1) return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: 13, fontWeight: 900, boxShadow: '0 0 12px rgba(255,215,0,0.4)', textShadow: '0 1px 2px rgba(255,255,255,0.4)' }}>
      1
    </div>
  );
  if (rank === 2) return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #E0E0E0 0%, #A0A0A0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: 13, fontWeight: 900, boxShadow: '0 0 12px rgba(192,192,192,0.3)' }}>
      2
    </div>
  );
  if (rank === 3) return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 900, boxShadow: '0 0 12px rgba(205,127,50,0.3)' }}>
      3
    </div>
  );
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1c1c1e', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 12, fontWeight: 800 }}>
      {rank}
    </div>
  );
}

// ─── Leaderboard Panel ───

function LeaderboardPanel({ contest, isOpen, onClose }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const prevContestId = useRef(null);

  // Fetch when contest changes and panel is open
  useEffect(() => {
    if (!contest || !isOpen) return;
    if (prevContestId.current === contest.id) return;
    prevContestId.current = contest.id;

    setLoading(true);
    setError(null);
    setEntries([]);

    const fetchLeaderboard = async () => {
      try {
        const docRef = doc(firestore, 'contest_leaderboards', contest.id);
        const docSnap = await getDoc(docRef);

        let pulledData = [];
        if (docSnap.exists()) {
          const fetchedData = docSnap.data().leaderboard;
          if (Array.isArray(fetchedData)) {
            pulledData = fetchedData;
          }
        }

        if (pulledData.length > 0) {
          // Sort by rank if present 
          const sorted = [...pulledData].sort((a, b) => {
            const ra = Number(a.rank ?? a.Rank ?? a.position ?? 9999);
            const rb = Number(b.rank ?? b.Rank ?? b.position ?? 9999);
            return ra - rb;
          });
          setEntries(sorted);
        } else {
          setError('Leaderboard Data Not Available Yet. It will be automatically available after the contest ends.');
        }
      } catch (fbErr) {
        console.error('Firebase read error:', fbErr);
        setError('Could not load leaderboard data. Try again later.');
      }

      setLoading(false);
    };

    fetchLeaderboard();
  }, [contest, isOpen]);

  
  useEffect(() => {
    if (!contest) prevContestId.current = null;
  }, [contest]);

  
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const status = contest ? getStatus(contest.startTime, contest.endTime) : 'unknown';

  return (
    <>
      {/* ─ Global backdrop (Desktop + Mobile) ─────────────────────────── */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 300ms ease',
        }}
        onClick={onClose}
      />

      {/* ─ Mobile Panel (Right Drawer) ─────────────────────────── */}
      <div
        className="lg:hidden"
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: '100%',
          maxWidth: '420px',
          zIndex: 50,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 320ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <PanelContent
          contest={contest}
          isOpen={isOpen}
          onClose={onClose}
          loading={loading}
          error={error}
          entries={entries}
          status={status}
          mobile={true}
        />
      </div>

      {/* ─ Desktop Panel (Centered Modal Overlay) ─────────────────────────── */}
      <div
        className="hidden lg:flex fixed inset-0 z-50 items-center justify-center pointer-events-none"
      >
        <div
          className={`overflow-hidden shadow-2xl ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          style={{
            width: '600px',
            maxWidth: '90vw',
            height: '85vh',
            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            opacity: isOpen ? 1 : 0,
            transition: 'all 300ms cubic-bezier(0.4,0,0.2,1)',
            borderRadius: '24px',
            border: '1px solid #2a2a2a'
          }}
        >
          <PanelContent
            contest={contest}
            isOpen={isOpen}
            onClose={onClose}
            loading={loading}
            error={error}
            entries={entries}
            status={status}
            mobile={false}
          />
        </div>
      </div>
    </>
  );
}

// ─── Panel inner content (shared between mobile/desktop) ─────────────────────

function PanelContent({ contest, isOpen, onClose, loading, error, entries, status, mobile }) {
  if (!contest) return null;

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: '#141516',
        borderLeft: mobile ? '1px solid #2a2a2a' : 'none',
        boxShadow: mobile ? '-24px 0 60px rgba(0,0,0,0.6)' : 'none',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #2a2a2a', padding: '20px 24px 16px', flexShrink: 0, background: 'rgba(14,14,14,0.7)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', color: '#444', textTransform: 'uppercase', marginBottom: 4 }}>
              Leaderboard
            </p>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {contest.title || '—'}
            </h2>
          </div>
          <button
            onClick={onClose}
            title="Close"
            style={{ flexShrink: 0, color: '#555', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 10, padding: '6px 7px', cursor: 'pointer', transition: 'all 200ms', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#2a2a2a'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = 'transparent'; }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {contest.contestId && (
              <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: '#48D2A0', background: 'rgba(72,210,160,0.08)', border: '1px solid rgba(72,210,160,0.25)', padding: '2px 8px', borderRadius: 8 }}>
                #{contest.contestId}
              </span>
            )}
            <StatusBadge status={status} />
            <span style={{ fontSize: 10, color: '#555', fontFamily: 'monospace' }}>
              {formatDateTime(contest.startTime)}
            </span>
          </div>

          {!loading && !error && entries.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 10, color: '#888', fontWeight: 600 }}>
                {entries.length} participant{entries.length !== 1 ? 's' : ''}
              </span>
              {contest.link && (
                <a
                  href={`${contest.link}#rank`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 10, color: '#48D2A0', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'color 200ms' }}
                >
                  View full results
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

        {/* Loading skeleton */}
        {loading && (
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderBottom: '1px solid rgba(42,42,42,0.4)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2a2a2a', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ height: 11, borderRadius: 99, background: '#2a2a2a', width: '70%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: 9, borderRadius: 99, background: '#222', width: '45%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
                <div style={{ height: 11, borderRadius: 99, background: '#2a2a2a', width: 44, animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,113,108,0.08)', border: '1px solid rgba(255,113,108,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" fill="none" stroke="#FF716C" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p style={{ fontSize: 13, color: '#FF716C', fontWeight: 600 }}>{error}</p>
          
          </div>
        )}

        {/* Empty */}
        {!loading && !error && entries.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: '#1e1e20', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" fill="none" stroke="#444" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
              </div>
              <span style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(246,184,70,0.12)', border: '1px solid rgba(246,184,70,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>!</span>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 6 }}>No Rankings Available</p>
              <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6, maxWidth: 240 }}>
                Rankings haven't been uploaded for this contest yet, or the webhook returned an empty response.
              </p>
            </div>
            {contest.link && (
              <a
                href={contest.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  fontSize: 11, fontWeight: 700,
                  color: '#48D2A0',
                  background: 'rgba(72,210,160,0.08)',
                  border: '1px solid rgba(72,210,160,0.25)',
                  padding: '9px 18px', borderRadius: 12,
                  textDecoration: 'none', transition: 'all 200ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(72,210,160,0.15)'; e.currentTarget.style.borderColor = 'rgba(72,210,160,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(72,210,160,0.08)'; e.currentTarget.style.borderColor = 'rgba(72,210,160,0.25)'; }}
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                View on VJudge
              </a>
            )}
          </div>
        )}

        {/* Entries */}
        {!loading && !error && entries.length > 0 && (
          <div>
            {/* Column header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', borderBottom: '1px solid #2a2a2a', background: 'rgba(0,0,0,0.5)' }}>
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.16em', color: '#333', textTransform: 'uppercase', width: 32, textAlign: 'center' }}>#</span>
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.16em', color: '#333', textTransform: 'uppercase', flex: 1 }}>Participant</span>
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.16em', color: '#333', textTransform: 'uppercase', width: 48, textAlign: 'right' }}>Score</span>
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.16em', color: '#333', textTransform: 'uppercase', width: 52, textAlign: 'right' }}>Penalty</span>
            </div>

            {entries.map((entry, idx) => {
              const rank = Number(entry.rank ?? entry.Rank ?? entry.position ?? idx + 1);
              const isTop3 = rank <= 3;

              let rowBg = 'transparent';
              let rowHoverBg = '#202224';
              if (rank === 1) { rowBg = 'rgba(255,215,0,0.04)'; rowHoverBg = 'rgba(255,215,0,0.07)'; }
              else if (rank === 2) { rowBg = 'rgba(192,192,192,0.04)'; rowHoverBg = 'rgba(192,192,192,0.07)'; }
              else if (rank === 3) { rowBg = 'rgba(205,127,50,0.04)'; rowHoverBg = 'rgba(205,127,50,0.07)'; }

              // Build display name from possible fields
              const name = entry.username || entry.Username || entry.name || entry.user || entry.participant || `Participant ${rank}`;
              const institution = entry.institution || entry.team || entry.college || entry.school || null;
              const solved = entry.solved ?? entry.Solved ?? entry.ac ?? entry.accepted ?? null;
              const score = entry.score ?? entry.Penalty ?? entry.points ?? entry.penalty ?? entry.time ?? null;

              return (
                <EntryRow
                  key={entry.id || idx}
                  rank={rank}
                  name={name}
                  institution={institution}
                  solved={solved}
                  score={score}
                  rowBg={rowBg}
                  rowHoverBg={rowHoverBg}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .lb-panel-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// ─── Entry Row (memoised to avoid re-renders) ────────────────────────────────

const EntryRow = React.memo(function EntryRow({ rank, name, institution, solved, score, rowBg, rowHoverBg }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '13px 24px',
        borderBottom: '1px solid rgba(42,42,42,0.4)',
        background: hovered ? rowHoverBg : rowBg,
        transition: 'background 150ms ease',
        cursor: 'default',
      }}
    >
      <RankBadge rank={rank} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: hovered ? '#fff' : '#ccc', transition: 'color 150ms', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </p>
        {institution && (
          <p style={{ fontSize: 10, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
            {institution}
          </p>
        )}
      </div>

      <div style={{ width: 48, textAlign: 'right' }}>
        {solved !== null && solved !== undefined ? (
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#48D2A0' }}>{solved}</span>
        ) : (
          <span style={{ fontSize: 12, color: '#333' }}>—</span>
        )}
      </div>

      <div style={{ width: 52, textAlign: 'right' }}>
        {score !== null && score !== undefined ? (
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#e0e0e0' }}>{score}</span>
        ) : (
          <span style={{ fontSize: 12, color: '#333' }}>—</span>
        )}
      </div>
    </div>
  );
});

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [, setTick] = useState(0);
  const [selectedContest, setSelectedContest] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

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
        console.error('Error fetching contests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  // ── Automatic Background Sync for Ended Contests ─────────────────────────
  useEffect(() => {
    const autoSyncEndedContests = async () => {
      if (!contests || contests.length === 0) return;
      const endedContests = contests.filter(c => getStatus(c.startTime, c.endTime) === 'ended');
      if (endedContests.length === 0) return;

      try {
        const cachedSnap = await getDocs(collection(firestore, 'contest_leaderboards'));
        const cachedIds = new Set();
        cachedSnap.forEach(d => cachedIds.add(d.id));

        for (const contest of endedContests) {
          if (!cachedIds.has(contest.id)) {
            const contestIdStr = contest.contestId || contest.id;
            console.log(`[Background Sync] Populating missing leaderboard for ended contest: ${contest.title}`);
            try {
              const data = await fetchLeaderboardFromWebhook(contestIdStr);
              if (data && data.length > 0) {
                const ref = doc(firestore, 'contest_leaderboards', contest.id);
                await setDoc(ref, { leaderboard: data });
                console.log(`[Background Sync] Saved leaderboard to Firebase for ${contest.title}`);
              } else {
                console.warn(`[Background Sync] Webhook returned empty for ${contest.title}`);
              }
            } catch (err) {
              console.warn(`[Background Sync] Failed to fetch leaderboard for ${contest.title}`, err);
            }
          }
        }
      } catch (err) {
        console.error('Background sync failed:', err);
      }
    };
    autoSyncEndedContests();
  }, [contests]);

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

  const handleLeaderboardClick = useCallback((contest) => {
    if (selectedContest?.id === contest.id && panelOpen) {
      setPanelOpen(false);
      setTimeout(() => setSelectedContest(null), 340);
    } else {
      setSelectedContest(contest);
      setPanelOpen(true);
    }
  }, [selectedContest, panelOpen]);

  const handleClose = useCallback(() => {
    setPanelOpen(false);
    setTimeout(() => setSelectedContest(null), 340);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', gap: 20, width: '100%', alignItems: 'flex-start', minHeight: '100%' }}>

      {/* ── LEFT: Contest list ──────────────────────────────────────────── */}
      <section
        className="text-white relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-6"
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          paddingBottom: 80,
          paddingTop: 24,
          transition: 'all 320ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-1">Contests</h1>
            <p className="text-[#888] text-sm">Challenge yourself in live contests and stand above the rest.</p>
          </div>
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
          <div className="relative w-full sm:flex-1 sm:max-w-xs">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444]" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
          <div className="flex gap-2 flex-wrap">
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
        <div className="rounded-[22px] bg-[#1a1c1d] border border-[#2a2a2a] shadow-2xl overflow-hidden">
          {/* DESKTOP */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ minWidth: 720 }}>
              <thead>
                <tr className="bg-[#141516]/60 border-b border-[#2a2a2a] text-[10px] font-black text-[#444] uppercase tracking-[0.17em]">
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">Contest Name</th>
                  <th className="px-5 py-4">Contest ID</th>
                  <th className="px-5 py-4">Start</th>
                  <th className="px-5 py-4">Duration</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]/40">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : paginated.length > 0
                    ? paginated.map((c, i) => {
                      const status = getStatus(c.startTime, c.endTime);
                      const isLive = status === 'live';
                      const isSelected = selectedContest?.id === c.id && panelOpen;
                      return (
                        <tr
                          key={c.id}
                          className={`group transition-all duration-200 ${isSelected
                            ? 'bg-[#48D2A0]/6'
                            : isLive
                              ? 'hover:bg-[#48D2A0]/4'
                              : 'hover:bg-[#1f2022]'
                            }`}
                          style={isSelected ? { borderLeft: '2px solid #48D2A0' } : {}}
                        >
                          <td className="px-5 py-4 text-[#555] text-xs font-mono">
                            {(safePage - 1) * PAGE_SIZE + i + 1}
                          </td>
                          <td className="px-5 py-4">
                            <div>
                              <span className="text-sm font-semibold text-[#ccc] group-hover:text-white transition-colors">
                                {c.title || '—'}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {c.contestId
                              ? <span className="text-xs font-mono font-bold text-[#48D2A0] bg-[#48D2A0]/8 border border-[#48D2A0]/25 px-2.5 py-1 rounded-lg">#{c.contestId}</span>
                              : <span className="text-[#555] text-xs">—</span>
                            }
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs text-[#888]">{formatDateTime(c.startTime)}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-mono font-bold text-[#ccc] bg-[#111] border border-[#2a2a2a] px-2.5 py-1 rounded-lg">
                              {getDuration(c.startTime, c.endTime)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={status} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {/* Board button */}
                              <button
                                onClick={() => handleLeaderboardClick(c)}
                                title="View Leaderboard"
                                className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 rounded-xl transition-all border ${isSelected
                                  ? 'bg-[#48D2A0]/15 text-[#48D2A0] border-[#48D2A0]/40 shadow-[0_0_10px_rgba(72,210,160,0.15)]'
                                  : 'text-[#888] bg-[#111] border-[#2a2a2a] hover:text-white hover:border-[#444]'
                                  }`}
                              >
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M18 20V10M12 20V4M6 20v-6" />
                                </svg>
                                Board
                              </button>
                              {/* Participate */}
                              <a
                                href={c.link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3.5 py-2 rounded-xl transition-all ${isLive
                                  ? 'bg-[#48D2A0] text-black hover:bg-[#5ee0ad] shadow-[0_0_12px_rgba(72,210,160,0.25)]'
                                  : 'bg-[#2a2a2a] text-white hover:bg-[#333]'
                                  }`}
                              >
                                {isLive ? (
                                  <><span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />Join Live</>
                                ) : (
                                  <><svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>Participate</>
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
                          <svg className="mx-auto mb-3 text-[#333]" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                          </svg>
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
                  const isSelected = selectedContest?.id === c.id && panelOpen;
                  return (
                    <div
                      key={c.id}
                      className="p-5 flex flex-col gap-3 transition-all"
                      style={{
                        background: isSelected ? 'rgba(72,210,160,0.05)' : isLive ? 'rgba(72,210,160,0.03)' : 'transparent',
                        borderLeft: isSelected ? '2px solid #48D2A0' : '2px solid transparent',
                      }}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          {c.contestId && <span className="text-[10px] font-mono font-bold text-[#48D2A0]">#{c.contestId}</span>}
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
                        <button
                          onClick={() => handleLeaderboardClick(c)}
                          className={`flex-1 text-center text-[10px] font-bold py-2.5 rounded-xl active:scale-95 transition-all border ${isSelected
                            ? 'bg-[#48D2A0]/15 text-[#48D2A0] border-[#48D2A0]/40'
                            : 'text-[#888] bg-[#141516] border-[#2a2a2a] hover:text-white'
                            }`}
                        >
                          Leaderboard
                        </button>
                        <a
                          href={c.link || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 text-center text-[10px] font-bold py-2.5 rounded-xl active:scale-95 transition-transform ${isLive ? 'bg-[#48D2A0] text-black' : 'bg-[#2a2a2a] text-white'}`}
                        >
                          {isLive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse inline-block mr-1.5" />
                              Join Live
                            </>
                          ) : (
                            <>
                              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="inline-block mr-1.5 -mt-0.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                              Participate
                            </>
                          )}
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
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
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
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${p === safePage
                    ? 'bg-[#48D2A0] text-black shadow-[0_0_10px_rgba(72,210,160,0.3)]'
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

        {/* EMPTY STATE */}
        {!loading && contests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-[#555] rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a]/40">
            <svg width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" className="mb-4 text-[#333]">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-1">No Contests Yet</h2>
            <p className="text-sm">Weekly and Bi-weekly contests will appear here soon.</p>
          </div>
        )}
      </section>

      {/* ── RIGHT: Leaderboard panel ─────── */}
      <LeaderboardPanel
        contest={selectedContest}
        isOpen={panelOpen}
        onClose={handleClose}
      />
    </div>
  );
}