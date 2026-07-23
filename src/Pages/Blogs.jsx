/**
 * src/Pages/Blogs.jsx - THE PUBLIC VIEW (ENHANCED VERSION)
 * 1. 0% Reliance on defaultBlogs.
 * 2. Elegant Loading & Empty States.
 * 3. Error State with Retry Capability.
 * 4. Responsive Grid with Safe Data Mapping.
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBlogs } from "../lib/cms";
import Nav from "../Header/Nav";
import Footer from "../Footer/Footer";
import { Loader2, BookOpen, Calendar, User, RefreshCw } from "lucide-react";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBlogs();
      setBlogs(data || []);
    } catch (err) {
      console.error("❌ Blogs Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Nav />
      
      {/* HERO SECTION */}
      <div className="relative bg-blue-950 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Medical Insights & <span className="text-blue-400">Pathology Updates</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto font-medium opacity-90">
            Latest advancements in precision cancer medicine, molecular diagnostics, and histopathology.
          </p>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-16 w-full">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-900" />
            <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Accessing Archives...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-white rounded-[40px] shadow-inner border-2 border-dashed border-red-100">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-800">Server is waking up...</h3>
            <p className="text-gray-400 mt-3 font-medium mb-8">Network or server error. Please try again.</p>
            <button
              onClick={fetchBlogs}
              className="bg-blue-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg"
            >
              Retry Loading
            </button>
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {blogs.map((blog) => (
              <article key={blog.id} className="group bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500 flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={blog.coverImage || "https://images.unsplash.com/photo-1532187863486-abf9fb3a021c?auto=format&fit=crop&q=80"} 
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-1.5 bg-blue-900/90 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">
                      {blog.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-gray-400 text-xs mb-4 font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {blog.date}</div>
                    <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {blog.author}</div>
                  </div>
                  
                  <h2 className="text-xl font-black text-gray-900 mb-4 line-clamp-2 leading-snug group-hover:text-blue-900 transition-colors">
                    {blog.title}
                  </h2>
                  
                  <p className="text-gray-500 mb-8 line-clamp-3 text-sm leading-relaxed font-medium">
                    {blog.content}
                  </p>
                  
                  <div className="mt-auto">
                    <Link 
                      to={`/blogs/${blog.id}`} 
                      className="inline-flex items-center gap-2 text-blue-900 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all"
                    >
                      Read Full Analysis <span className="text-lg">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[40px] shadow-inner border-2 border-dashed border-gray-100">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-800">No blog posts found in our vault.</h3>
            <p className="text-gray-400 mt-3 font-medium">We are currently preparing new research papers. Check back soon.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Blogs;