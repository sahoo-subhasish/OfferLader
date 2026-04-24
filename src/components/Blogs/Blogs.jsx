import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import { Link } from 'react-router-dom';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const snap = await getDocs(collection(firestore, 'blogs'));
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        list.sort((a, b) => b.createdAt - a.createdAt);
        setBlogs(list);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Filter and Pagination Logic
  const filteredBlogs = blogs.filter(blog => 
    (blog.status === 'published' || !blog.status) &&
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  // Helper to strip markdown and truncate
  const getExcerpt = (markdown) => {
    if (!markdown) return '';
    const stripped = markdown.replace(/[#*`>_-]/g, '').trim();
    return stripped.length > 180 ? stripped.substring(0, 180) + '...' : stripped;
  };

  return (
    <section className="flex flex-col animate-in fade-in duration-500 max-w-[1200px] mx-auto p-4 md:p-6 mb-20 md:pt-12 w-full h-full text-white">
      <div className="mb-8 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tighter">Technical Blogs</h1>
          <p className="text-neutral-400 text-sm leading-relaxed font-medium">Read our latest articles, guides, and updates.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search blogs..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#141414] border border-[#262626] shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#48D2A0] focus:ring-1 focus:ring-[#48D2A0]/20 transition-all font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#48D2A0] mb-4"></div>
            <p className="text-sm font-medium">Loading blogs...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-neutral-500 bg-[#141414] rounded-xl border border-[#262626] shadow-sm">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-neutral-600">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <h2 className="text-lg font-semibold text-white mb-1">No Blogs Yet</h2>
          <p className="text-sm">Check back soon for new content.</p>
        </div>
      ) : (
        <>
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 font-medium bg-[#141414] border border-[#262626] rounded-xl shadow-sm">No blogs match your search.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentBlogs.map(blog => (
                <div key={blog.id} className="p-5 sm:p-6 rounded-xl border border-[#262626] bg-[#141414] hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:border-[#444] hover:bg-[#1a1a1a] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#e5e5e5] mb-2 group-hover:text-white transition-colors leading-tight line-clamp-2">{blog.title}</h2>
                    <p className="text-neutral-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {getExcerpt(blog.content)}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-[#262626] flex items-center justify-between">
                    <div className="flex items-center gap-1 text-neutral-500 text-xs font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                      {blog.likes?.length || 0}
                    </div>
                    <Link to={`/blogs/${blog.id}`} className="inline-flex items-center justify-center gap-1.5 text-[10px] font-bold text-white bg-[#2a2a2a] hover:bg-white hover:text-black px-4 py-2 rounded-lg transition-all uppercase tracking-widest active:scale-95">
                      READ
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 pb-10">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-[#262626] bg-[#141414] hover:bg-[#222] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              
              <span className="text-xs font-semibold text-neutral-500 tracking-wider">
                PAGE <span className="text-white">{currentPage}</span> OF {totalPages}
              </span>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-[#262626] bg-[#141414] hover:bg-[#222] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
