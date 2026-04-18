import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase';
import { useAuth } from '../../../context/AuthContext';

export default function AdminBlogs() {
  const { user } = useAuth();
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('**Start writing here...**');
  
  // List State
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBlogs = async () => {
    try {
        const snap = await getDocs(collection(firestore, 'blogs'));
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        list.sort((a, b) => b.createdAt - a.createdAt);
        setBlogs(list);
    } catch (e) {
        console.error("Fetch error", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      fetchBlogs();
  }, []);

  const handleSave = async (targetStatus) => {
    if (!title || !content) return alert("Title and content are required.");
    setSaving(true);
    try {
        const payload = {
            title,
            content,
            authorName: user.displayName || user.fullName || 'Admin',
            status: targetStatus, // 'published' or 'draft'
        };

        if (editingId) {
            // Update existing
            await updateDoc(doc(firestore, 'blogs', editingId), payload);
            alert(`Blog updated and saved as ${targetStatus}!`);
        } else {
            // Create new
            payload.createdAt = Date.now();
            await addDoc(collection(firestore, 'blogs'), payload);
            alert(`New blog saved as ${targetStatus}!`);
        }
        
        resetForm();
        fetchBlogs();
    } catch (error) {
        console.error("Error saving blog:", error);
    } finally {
        setSaving(false);
    }
  };

  const handleEditClick = (blog) => {
      setEditingId(blog.id);
      setTitle(blog.title);
      setContent(blog.content);
      // scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
      setEditingId(null);
      setTitle('');
      setContent('**Start writing here...**');
  };

  const handleToggleStatus = async (blog) => {
      const newStatus = (blog.status === 'published' || !blog.status) ? 'draft' : 'published';
      try {
          await updateDoc(doc(firestore, 'blogs', blog.id), { status: newStatus });
          // Quick local update for UI snappy feel
          setBlogs(blogs.map(b => b.id === blog.id ? { ...b, status: newStatus } : b));
      } catch (e) {
          console.error("Error toggling status:", e);
      }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete blog entirely? This cannot be undone.")) return;
    try {
        await deleteDoc(doc(firestore, 'blogs', id));
        setBlogs(blogs.filter(b => b.id !== id));
        if (editingId === id) resetForm();
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6" data-color-mode="dark">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{editingId ? 'Edit Blog' : 'Write a New Blog'}</h1>
        <p className="text-[#888]">Compose technical articles natively using Markdown syntax.</p>
      </div>

      <div className="glass-card p-6 rounded-[20px] border border-[#2a2a2a] bg-[#1a1a1a]/50 flex flex-col gap-4 shadow-xl">
        <input 
            type="text" 
            placeholder="Blog Title" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-[#48D2A0] transition-colors" 
        />
        
        <div className="rounded-xl overflow-hidden border border-[#333]">
          <MDEditor
            value={content}
            onChange={setContent}
            height={400}
            preview="live"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
            {editingId ? (
               <button 
                  onClick={resetForm} 
                  disabled={saving}
                  className="bg-transparent text-[#888] font-bold py-3 px-6 rounded-xl hover:text-white transition-colors"
               >
                   Cancel Edit
               </button>
            ) : <div />}

            <div className="flex gap-3">
                <button 
                  onClick={() => handleSave('draft')} 
                  disabled={saving}
                  className="bg-[#333] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#444] transition-colors"
                >
                    {saving ? 'Saving...' : (editingId ? 'Update as Draft' : 'Save as Draft')}
                </button>
                <button 
                  onClick={() => handleSave('published')} 
                  disabled={saving}
                  className="bg-[#48D2A0] text-black font-bold py-3 px-8 rounded-xl hover:bg-[#3bb589] transition-colors"
                >
                    {saving ? 'Publishing...' : (editingId ? 'Update & Publish' : 'Publish Blog')}
                </button>
            </div>
        </div>
      </div>

      <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">All Blogs</h2>
          <div className="flex flex-col gap-4">
              {loading ? (
                  <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#48D2A0]"></div></div>
              ) : blogs.length === 0 ? (
                  <p className="text-[#888] text-center p-10 rounded-2xl bg-[#111] border border-[#222]">No blogs exist yet.</p>
              ) : blogs.map(blog => {
                  const isPublished = blog.status === 'published' || !blog.status; // legacy assume published
                  return (
                    <div key={blog.id} className="p-5 rounded-2xl border border-[#333] bg-[#1a1a1a] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#555] transition-colors">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-lg font-bold text-white">{blog.title}</h4>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${isPublished ? 'bg-[#48D2A0]/20 text-[#48D2A0]' : 'bg-[#eab308]/20 text-[#eab308]'}`}>
                                    {isPublished ? 'PUBLISHED' : 'DRAFT'}
                                </span>
                            </div>
                            <span className="text-sm text-[#666]">
                                Created {new Date(blog.createdAt).toLocaleDateString()} by {blog.authorName}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleToggleStatus(blog)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${isPublished ? 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10' : 'border-[#48D2A0]/50 text-[#48D2A0] hover:bg-[#48D2A0]/10'}`}
                            >
                                {isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                            <button 
                                onClick={() => handleEditClick(blog)}
                                className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#333] text-white hover:bg-[#333] transition-colors"
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => handleDelete(blog.id)} 
                                className="p-2 border border-transparent hover:border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                  );
              })}
          </div>
      </div>
    </div>
  );
}
