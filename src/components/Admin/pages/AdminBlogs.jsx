import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase';
import { useAuth } from '../../../context/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ published }) {
  return published ? (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-[#48D2A0]/10 border-[#48D2A0]/25 text-[#48D2A0]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#48D2A0]" />
      Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-[#F6B846]/10 border-[#F6B846]/25 text-[#F6B846]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#F6B846]" />
      Draft
    </span>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {[40, 200, 100, 120, 80, 100].map((w, i) => (
        <td key={i} className="px-6 py-5">
          <div className="h-3 rounded-full bg-[#2a2a2a] animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Blog Editor Modal ────────────────────────────────────────────────────────

function BlogEditorModal({ editingBlog, user, onClose, onSaved }) {
  const [title, setTitle] = useState(editingBlog?.title || '');
  const [content, setContent] = useState(editingBlog?.content || '**Start writing here...**');
  const [saving, setSaving] = useState(false);

  const isEditing = !!editingBlog;

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = async (targetStatus) => {
    if (!title.trim() || !content.trim()) return alert('Title and content are required.');
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        content,
        authorName: user?.displayName || user?.fullName || 'Admin',
        status: targetStatus,
      };
      if (isEditing) {
        await updateDoc(doc(firestore, 'blogs', editingBlog.id), payload);
      } else {
        payload.createdAt = Date.now();
        await addDoc(collection(firestore, 'blogs'), payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving blog:', err);
      alert('Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-4xl bg-[#141516] border border-[#2a2a2a] rounded-[24px] shadow-2xl overflow-hidden mb-8"
        data-color-mode="dark"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#2a2a2a]">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isEditing ? 'Edit Blog' : 'Write a New Blog'}
            </h2>
            <p className="text-xs text-[#555] mt-0.5">
              Compose using Markdown. Use the preview pane to check formatting.
            </p>
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

        {/* Editor body */}
        <div className="px-7 py-6 flex flex-col gap-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#555] uppercase tracking-widest mb-2">Blog Title</label>
            <input
              type="text"
              placeholder="Enter an engaging title…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#1a1c1d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#48D2A0]/60 transition-all placeholder:text-[#444] tracking-tight"
            />
          </div>

          {/* Markdown Editor */}
          <div>
            <label className="block text-xs font-bold text-[#555] uppercase tracking-widest mb-2">Content</label>
            <div className="rounded-xl overflow-hidden border border-[#2a2a2a] focus-within:border-[#48D2A0]/40 transition-colors">
              <MDEditor
                value={content}
                onChange={setContent}
                height={300}
                preview="live"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-6 border-t border-[#2a2a2a]">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center items-center text-[11px] font-bold text-[#aaa] bg-[#111] hover:bg-white hover:text-black px-6 py-2.5 rounded-xl transition-all uppercase tracking-widest border border-[#2a2a2a] hover:border-white"
            >
              CANCEL
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="inline-flex justify-center items-center text-[11px] font-bold text-[#ccc] bg-[#222] hover:bg-white hover:text-black px-6 py-2.5 rounded-xl transition-all uppercase tracking-widest border border-[#333] hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'SAVING…' : isEditing ? 'UPDATE AS DRAFT' : 'SAVE AS DRAFT'}
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="inline-flex justify-center items-center gap-2 text-[11px] font-bold text-white bg-[#2a2a2a] hover:bg-white hover:text-black px-6 py-2.5 rounded-xl transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    PUBLISHING…
                  </span>
                ) : isEditing ? 'UPDATE & PUBLISH' : 'PUBLISH BLOG'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminBlogs() {
  const { user } = useAuth();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalState, setModalState] = useState(null);

  const fetchBlogs = async () => {
    try {
      const snap = await getDocs(collection(firestore, 'blogs'));
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => b.createdAt - a.createdAt);
      setBlogs(list);
    } catch (e) {
      console.error('Fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const openNew = () => setModalState({ editingBlog: null });
  const openEdit = (blog) => setModalState({ editingBlog: blog });
  const closeModal = () => setModalState(null);

  const handleToggleStatus = async (blog) => {
    const isPublished = blog.status === 'published' || !blog.status;
    const newStatus = isPublished ? 'draft' : 'published';
    try {
      await updateDoc(doc(firestore, 'blogs', blog.id), { status: newStatus });
      setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, status: newStatus } : b));
    } catch (e) {
      console.error('Error toggling status:', e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(firestore, 'blogs', id));
      setBlogs(prev => prev.filter(b => b.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const published = blogs.filter(b => b.status === 'published' || !b.status).length;
  const drafts = blogs.filter(b => b.status === 'draft').length;

  const filtered = blogs.filter(b => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (b.title || '').toLowerCase().includes(q) ||
      (b.authorName || '').toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Modal */}
      {modalState && (
        <BlogEditorModal
          editingBlog={modalState.editingBlog}
          user={user}
          onClose={closeModal}
          onSaved={fetchBlogs}
        />
      )}

      <div className="flex flex-col gap-8 text-white w-full max-w-[1200px] mx-auto px-4 md:px-6 py-6 mb-20">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-1">Manage Blogs</h1>
            <p className="text-[#888] text-sm">Write, edit and publish technical articles.</p>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center justify-center gap-2 text-[11px] font-bold text-white bg-[#2a2a2a] hover:bg-white hover:text-black px-6 py-2.5 rounded-xl transition-all uppercase tracking-widest active:scale-95 self-start sm:self-auto"
          >
            WRITE BLOG
          </button>
        </div>

        {/* STATS + SEARCH */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Stats pills */}
          {!loading && (
            <div className="flex gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border bg-[#48D2A0]/10 border-[#48D2A0]/25 text-[#48D2A0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#48D2A0]" />
                {published} Published
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border bg-[#F6B846]/10 border-[#F6B846]/25 text-[#F6B846]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F6B846]" />
                {drafts} Draft{drafts !== 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border bg-[#2a2a2a] border-[#333] text-[#888]">
                {blogs.length} Total
              </span>
            </div>
          )}

          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444]" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              id="admin-blog-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or author…"
              className="w-full bg-[#141516] border border-[#2a2a2a] rounded-xl py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#48D2A0]/50 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* MATRIX TABLE */}
        <div className="rounded-[24px] bg-[#1a1c1d] border border-[#2a2a2a] shadow-2xl overflow-hidden">

          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[#141516]/60 border-b border-[#2a2a2a] text-[10px] font-black text-[#444] uppercase tracking-[0.18em]">
                  <th className="px-6 py-5">#</th>
                  <th className="px-6 py-5">Title</th>
                  <th className="px-6 py-5">Author</th>
                  <th className="px-6 py-5">Published On</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]/40">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.length > 0
                    ? filtered.map((blog, i) => {
                      const isPublished = blog.status === 'published' || !blog.status;
                      return (
                        <tr key={blog.id} className="group hover:bg-[#202224] transition-all duration-200">
                          <td className="px-6 py-5 text-[#555] text-xs font-mono">{i + 1}</td>
                          <td className="px-6 py-5 max-w-[280px]">
                            <span className="text-sm font-semibold text-[#ccc] group-hover:text-white transition-colors line-clamp-1">
                              {blog.title || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-xs text-[#888] font-medium">{blog.authorName || '—'}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-xs text-[#888]">{formatDate(blog.createdAt)}</span>
                          </td>
                          <td className="px-6 py-5">
                            <StatusBadge published={isPublished} />
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2">
                              {/* Toggle publish */}
                              <button
                                onClick={() => handleToggleStatus(blog)}
                                className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3.5 py-2 rounded-xl border transition-all ${isPublished
                                  ? 'text-[#F6B846] bg-[#F6B846]/8 border-[#F6B846]/25 hover:bg-[#F6B846]/15'
                                  : 'text-[#48D2A0] bg-[#48D2A0]/8 border-[#48D2A0]/25 hover:bg-[#48D2A0]/15'
                                  }`}
                              >
                                {isPublished ? 'Unpublish' : 'Publish'}
                              </button>
                              {/* Edit */}
                              <button
                                onClick={() => openEdit(blog)}
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#888] bg-[#111] border border-[#2a2a2a] hover:text-white hover:border-[#444] px-3.5 py-2 rounded-xl transition-all"
                              >
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(blog.id)}
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-500/5 border border-red-500/20 hover:bg-red-500/15 hover:border-red-500/40 px-3.5 py-2 rounded-xl transition-all"
                              >
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                    : (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center text-[#555]">
                          <svg className="mx-auto mb-3 text-[#333]" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          {search
                            ? <p className="text-sm">No blogs match <span className="text-white font-medium">"{search}"</span></p>
                            : (
                              <>
                                <p className="text-sm mb-3">No blogs yet. Start writing!</p>
                                <button onClick={openNew} className="text-xs font-bold text-[#48D2A0] hover:underline">
                                  + Write your first blog
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
              : filtered.length > 0
                ? filtered.map((blog) => {
                  const isPublished = blog.status === 'published' || !blog.status;
                  return (
                    <div key={blog.id} className="p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-3">
                        <span className="text-[15px] font-bold text-white leading-snug flex-1 min-w-0 line-clamp-2">
                          {blog.title || '—'}
                        </span>
                        <StatusBadge published={isPublished} />
                      </div>
                      <div className="text-xs text-[#666]">
                        <span>{blog.authorName || '—'}</span>
                        <span className="mx-2 text-[#333]">·</span>
                        <span>{formatDate(blog.createdAt)}</span>
                      </div>
                      <div className="flex gap-2 pt-1 flex-wrap">
                        <button
                          onClick={() => handleToggleStatus(blog)}
                          className={`flex-1 text-center text-[10px] font-bold py-2 rounded-xl border transition-all ${isPublished
                            ? 'text-[#F6B846] bg-[#F6B846]/8 border-[#F6B846]/25'
                            : 'text-[#48D2A0] bg-[#48D2A0]/8 border-[#48D2A0]/25'
                            }`}
                        >
                          {isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => openEdit(blog)}
                          className="flex-1 text-center text-[10px] font-bold text-[#888] bg-[#111] border border-[#2a2a2a] py-2 rounded-xl active:scale-95 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="flex-1 text-center text-[10px] font-bold text-red-400 bg-red-500/5 border border-red-500/20 py-2 rounded-xl active:scale-95 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
                : (
                  <div className="p-10 text-center text-[#555] text-sm flex flex-col items-center gap-3">
                    {search ? `No blogs match "${search}"` : 'No blogs yet.'}
                    {!search && (
                      <button onClick={openNew} className="text-xs font-bold text-[#48D2A0] hover:underline">
                        + Write your first blog
                      </button>
                    )}
                  </div>
                )
            }
          </div>
        </div>

        {/* Footer count */}
        {!loading && blogs.length > 0 && (
          <p className="text-xs text-[#555] text-right">
            {filtered.length} of {blogs.length} blog{blogs.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </>
  );
}
