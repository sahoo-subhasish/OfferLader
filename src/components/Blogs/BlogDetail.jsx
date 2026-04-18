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
    <section className="flex flex-col text-white w-full max-w-4xl mx-auto pt-6 pb-20" data-color-mode="dark">
      
      <Link to="/blogs" className="flex items-center gap-2 text-[#888] hover:text-white transition-colors mb-6 w-fit">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to Blogs
      </Link>

      <div className="mb-10 text-center">
        {blog.status === 'draft' && (
           <div className="inline-block px-3 py-1 bg-[#eab308]/20 text-[#eab308] font-bold text-xs rounded mb-4 tracking-wider">DRAFT PREVIEW</div>
        )}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight text-gradient">{blog.title}</h1>
        <div className="flex items-center justify-center gap-3 text-sm text-[#888]">
          <span className="font-semibold text-white">{blog.authorName || 'Admin'}</span>
          <span>•</span>
          <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="wmde-markdown-var mb-8 rounded-2xl bg-[#0a0a0a] border border-[#2a2a2a] p-6 sm:p-10 shadow-2xl">
        <MDEditor.Markdown source={blog.content} style={{ backgroundColor: 'transparent' }} />
      </div>

      <div className="flex items-center justify-between border-y border-[#222] py-4 mb-10">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
            hasLiked 
            ? 'bg-[#48D2A0]/20 border-[#48D2A0]/50 text-[#48D2A0] shadow-[0_0_15px_rgba(72,210,160,0.2)]' 
            : 'border-[#333] hover:bg-[#1a1a1a] text-[#888] hover:text-white'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={hasLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          <span className="font-semibold">{blog.likes?.length || 0}</span>
        </button>

        <div className="flex items-center gap-2 text-[#888] font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          {comments.length} Comments
        </div>
      </div>

      <div className="w-full">
        <h3 className="text-2xl font-bold mb-6">Comments</h3>
        
        {/* Post Comment Form */}
        {user ? (
          <form onSubmit={handlePostComment} className="mb-8 flex flex-col items-end gap-3">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What are your thoughts?"
              required
              rows={3}
              className="w-full bg-[#111] border border-[#333] rounded-xl p-4 text-white focus:outline-none focus:border-[#48D2A0] resize-y custom-scrollbar"
            />
            <button 
              type="submit" 
              disabled={commenting || !newComment.trim()}
              className="bg-[#48D2A0] text-black font-bold py-2.5 px-6 rounded-xl hover:bg-[#3bb589] transition-colors disabled:opacity-50"
            >
              {commenting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-[#111] border border-[#333] rounded-xl text-[#888] text-center">
            Please <Link to="/login" className="text-[#48D2A0] hover:underline">Log in</Link> to post a comment.
          </div>
        )}

        {/* Comments List */}
        <div className="flex flex-col gap-4">
          {comments.length === 0 ? (
            <p className="text-[#555] italic">No comments yet. Be the first to start the discussion!</p>
          ) : comments.map(c => (
            <div key={c.id} className="p-5 rounded-2xl bg-[#111] border border-[#2a2a2a] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#ccc] text-sm">{c.authorName}</span>
                <span className="text-xs text-[#555]">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-[#eee] text-sm leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
