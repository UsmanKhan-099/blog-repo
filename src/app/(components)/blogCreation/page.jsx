'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BlogCreation = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [editBlog, setEditBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      fetchBlogs();
      fetchCategories();
    }
  }, [user, authLoading]);

  const fetchBlogs = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase.from('posts').select('*').eq('user_id', user.id);
    if (!error) setBlogs(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    setCategories(data || []);
  };

  const fetchUserBlogs = async () => {
    if (!user) return;
  
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id); // Fetch only blogs of the logged-in user
  
    if (error) {
      console.error('Error fetching blogs:', error);
    } else {
      setBlogs(data);
    }
  };
  
  useEffect(() => {
    if (user) fetchUserBlogs();
  }, [user]);
  

  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('posts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setBlogs((prev) => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setBlogs((prev) => prev.map((blog) => (blog.id === payload.new.id ? payload.new : blog)));
        } else if (payload.eventType === 'DELETE') {
          setBlogs((prev) => prev.filter((blog) => blog.id !== payload.old.id));
          toast.error('Blog post deleted! 🗑️');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !category) {
      toast.error('Please provide title, description, and category');
      return;
    }

    setLoading(true);
    const categoryObj = categories.find((cat) => cat.name === category);
    if (!categoryObj) {
      toast.error('Invalid category selected');
      setLoading(false);
      return;
    }

    const newBlog = { title, description, category_id: categoryObj.id, user_id: user.id };
    let error;

    if (editBlog) {
      ({ error } = await supabase.from('posts').update(newBlog).eq('id', editBlog.id));
    } else {
      ({ error } = await supabase.from('posts').insert([newBlog]));
    }

    setLoading(false);
    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success(editBlog ? 'Blog updated successfully!' : 'Blog created successfully!');
      setEditBlog(null);
      setTitle('');
      setDescription('');
      setCategory('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col items-center py-12 px-6">
      <h1 className="text-5xl font-bold mb-8 text-white text-center border-b-4 border-gray-700 pb-4">📝 Blog Management</h1>
      {!user ? (
        <p className="text-red-400 text-center">🚫 Please log in to manage your blogs.</p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="bg-[#1E1E1E] rounded-2xl shadow-lg p-6 mb-8 w-full max-w-3xl hover:shadow-2xl transition-all">
            <input onChange={(e) => setTitle(e.target.value)} value={title} className="w-full mb-4 p-3 border rounded-lg bg-gray-900 text-white focus:ring-2 focus:ring-blue-400" type="text" placeholder="Title" required />
            <textarea onChange={(e) => setDescription(e.target.value)} value={description} className="w-full mb-4 p-3 border rounded-lg bg-gray-900 text-white focus:ring-2 focus:ring-blue-400" placeholder="Description" required />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mb-4 p-3 border rounded-lg bg-gray-900 text-white focus:ring-2 focus:ring-blue-400" required>
              <option value="">📂 Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-all">
              {loading ? 'Processing...' : editBlog ? 'Update Blog' : 'Create Blog'}
            </button>
          </form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-[#1E1E1E] p-5 shadow-lg rounded-2xl hover:shadow-2xl hover:scale-105 transition-all relative">
                <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-lg">{categories.find(c => c.id === blog.category_id)?.name || 'Unknown'}</span>
                <h2 className="text-2xl font-semibold text-blue-400">{blog.title}</h2>
                <p className="text-gray-400">{blog.description}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setEditBlog(blog)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">✏️ Edit</button>
                  <button onClick={async () => {
                      const { error } = await supabase.from('posts').delete().eq('id', blog.id);
                      if (error) toast.error('Failed to delete blog');
                    }} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
          <button 
        onClick={handleLogout} 
        className="bg-red-600 text-white px-5 py-3 rounded-lg text-lg font-bold tracking-wide shadow-xl hover:bg-red-700 hover:shadow-2xl transition-all duration-300 mt-6"
      >
        🚪 Logout
      </button>
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default BlogCreation;
