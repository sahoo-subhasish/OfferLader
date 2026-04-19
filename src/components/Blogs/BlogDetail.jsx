import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
import MDEditor from '@uiw/react-md-editor';

export default function BlogDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const docRef = doc(firestore, 'blogs', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBlog({ id: docSnap.id, ...docSnap.data() });
        } else {
          setBlog(null);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();

    // Listen to comments
    const q = query(collection(firestore, 'blogs', id, 'comments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
      setComments(list);
    });

    return () => unsubscribe();
  }, [id]);

  const handleLike = async () => {
    if (!user) return alert("You must be logged in to like a blog.");
    const blogRef = doc(firestore, 'blogs', id);
    const hasLiked = blog.likes?.includes(user.uid);
    try {
      if (hasLiked) {
        await updateDoc(blogRef, { likes: arrayRemove(user.uid) });
        setBlog(prev => ({ ...prev, likes: prev.likes.filter(uid => uid !== user.uid) }));
      } else {
        await updateDoc(blogRef, { likes: arrayUnion(user.uid) });
        setBlog(prev => ({ ...prev, likes: [...(prev.likes || []), user.uid] }));
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setCommenting(true);
    try {
      await addDoc(collection(firestore, 'blogs', id, 'comments'), {
        uid: user.uid,
        authorName: user.displayName || user.fullName || user.email?.split('@')[0] || 'User',
        text: newComment.trim(),
        createdAt: Date.now()
      });
      setNewComment('');
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-[#888]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#48D2A0] mb-4"></div>
        <p>Loading blog...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-[#888]">
        <h2 className="text-2xl font-bold mb-2">Blog Not Found</h2>
        <Link to="/blogs" className="text-[#48D2A0] hover:underline">Back to Blogs</Link>
      </div>
    );
  }

  if (blog.status === 'draft' && user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-[#888]">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-[#eab308]"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        <h2 className="text-2xl font-bold mb-2 text-white">Access Denied</h2>
        <p>This blog is currently a draft.</p>
        <Link to="/blogs" className="text-[#48D2A0] hover:underline mt-4">Back to Blogs</Link>
      </div>
    );
  }

  const hasLiked = blog.likes?.includes(user?.uid);

  return (
    <section className="flex flex-col animate-in fade-in duration-500 max-w-[1200px] mx-auto p-4 md:p-6 mb-20 md:pt-12 w-full h-full text-white" data-color-mode="dark">
      
      <Link to="/blogs" className="group flex items-center gap-2 text-neutral-500 hover:text-white transition-all mb-12 w-fit text-sm font-bold tracking-widest uppercase hover:-translate-x-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
        Back to Blogs
      </Link>

      <header className="mb-12 pb-10 border-b border-[#262626]">
        {blog.status === 'draft' && (
           <div className="inline-flex items-center px-2.5 py-1 bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/20 font-bold text-[10px] rounded mb-6 tracking-widest uppercase">Draft Preview</div>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-[1.15] tracking-tight text-white">{blog.title}</h1>
        
        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <div className="w-12 h-12 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-base font-bold text-white uppercase shadow-sm">
            {(blog.authorName || 'A').charAt(0)}
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-semibold text-neutral-200 text-base leading-tight mb-0.5">{blog.authorName || 'Admin'}</span>
            <div className="flex items-center gap-2 text-[13px] font-medium">
              <span>{new Date(blog.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
              <span>{Math.ceil((blog.content?.length || 100) / 1200)} min ago</span>
            </div>
          </div>
        </div>
      </header>

      <div className="wmde-markdown-var mb-16 rounded-xl bg-transparent">
        <MDEditor.Markdown source={blog.content} style={{ backgroundColor: 'transparent' }} />
      </div>

      <div className="flex items-center justify-between border-y border-[#262626] py-5 mb-16 px-2 sm:px-4">
        <button 
          onClick={handleLike}
          className={`group flex items-center gap-3 px-5 py-2.5 rounded-full transition-all font-semibold border ${
            hasLiked 
            ? 'bg-red-500/10 border-red-500/30 text-red-500' 
            : 'border-transparent hover:border-[#333] hover:bg-[#1a1a1a] text-neutral-400 hover:text-white'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={hasLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={hasLiked ? 'scale-110 transition-transform' : 'group-hover:scale-110 transition-transform'}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          <span className="text-sm">{blog.likes?.length || 0} Likes</span>
        </button>

        <div className="flex items-center gap-2.5 text-neutral-400 font-medium text-sm pr-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          {comments.length} Comments
        </div>
      </div>

      <div className="w-full">
        <h3 className="text-xl font-bold mb-5 pl-2 border-l-2 border-[#48D2A0] text-white">Discussion</h3>
        
        {/* Post Comment Form */}
        {user ? (
          <form onSubmit={handlePostComment} className="mb-10 flex flex-col gap-3">
            <div className="w-full bg-[#141414] border border-[#262626] rounded-xl focus-within:border-[#48D2A0] focus-within:ring-1 focus-within:ring-[#48D2A0]/20 transition-all shadow-sm overflow-hidden flex flex-col">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts or ask a question..."
                required
                rows={3}
                className="w-full bg-transparent border-none p-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-0 resize-y min-h-[100px] custom-scrollbar"
              />
              <div className="flex justify-between items-center px-4 py-2.5 bg-[#1a1a1a] border-t border-[#262626]">
                <div className="text-[11px] text-neutral-500 font-medium flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    Join the dialogue
                </div>
                <button 
                  type="submit" 
                  disabled={commenting || !newComment.trim()}
                  className="inline-flex justify-center items-center text-[10px] font-bold text-white bg-[#2a2a2a] hover:bg-white hover:text-black px-5 py-2 rounded-lg transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {commenting ? 'POSTING...' : 'ADD COMMENT'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-10 p-5 bg-[#141414] border border-[#262626] shadow-sm rounded-xl text-neutral-400 text-center text-sm font-medium">
            Please <Link to="/login" className="text-[#48D2A0] hover:text-[#3bb589] hover:underline px-1">Log in</Link> to join the dialogue.
          </div>
        )}

        {/* Comments List */}
        <div className="flex flex-col gap-4">
          {comments.length === 0 ? (
            <div className="p-8 text-center bg-[#141414]/50 border border-[#262626] rounded-xl border-dashed">
                <p className="text-neutral-500 font-medium text-sm">No comments yet. Be the first to start the discussion!</p>
            </div>
          ) : comments.map(c => (
            <div key={c.id} className="p-4 sm:p-5 rounded-xl bg-[#141414] border border-[#262626] shadow-sm flex flex-col gap-2 relative">
              <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#222] border border-[#333] flex items-center justify-center text-[10px] font-bold text-white uppercase">{c.authorName?.charAt(0) || 'U'}</div>
                    <span className="font-semibold text-white text-sm tracking-tight">{c.authorName}</span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed mt-1">{c.text}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
