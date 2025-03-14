'use client'; // Client-side component declaration
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BlogCreation = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [fetching, setFetching] = useState(true); // Loading state for fetching blogs

  // Fetch blogs from Supabase when the component mounts or updates
  useEffect(() => {
    const fetchBlogs = async () => {
      setFetching(true);
      const { data, error } = await supabase.from('posts').select('*');
      setFetching(false);
      if (error) {
        console.error('Error fetching posts:', error.message);
      } else {
        setBlogs(data);
      }
    };

    fetchBlogs();
  }, []);

  // Update blog state when title or description changes
  useEffect(() => {
    if (editIndex !== null && editIndex !== undefined) {
      // Update the specific blog card with the live changes
      const updatedBlogs = [...blogs];
      updatedBlogs[editIndex] = { ...updatedBlogs[editIndex], title, description };
      setBlogs(updatedBlogs);
    }
  }, [title, description]); // Dependency on title and description

  // Handle blog submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      alert('Please provide both title and description');
      return;
    }

    setLoading(true);

    const newBlog = { title, description };

    if (editIndex !== null && editIndex !== undefined) {
      // If editing, update the existing blog in Supabase
      const blogId = blogs[editIndex]?.id;

      if (!blogId) {
        console.error("Blog ID is missing for the edit operation.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .update(newBlog)
        .eq('id', blogId);

      setLoading(false);

      if (error) {
        console.error('Error updating post:', error.message);
      } else {
        const updatedBlogs = [...blogs];
        updatedBlogs[editIndex] = data[0]; // Replace the updated blog in the list
        setBlogs(updatedBlogs);
        alert('Blog updated successfully!');
      }

      setEditIndex(null); // Reset edit mode
    } else {
      // If creating, add the new blog to Supabase
      const { data, error } = await supabase
        .from('posts')
        .insert([newBlog]);

      setLoading(false);

      if (error) {
        console.error('Error creating post:', error.message);
      } else {
        setBlogs((prevBlogs) => [...prevBlogs, data[0]]);
        alert('Blog created successfully!');
      }
    }

    // Clear inputs after submission
    setTitle('');
    setDescription('');
  };

  // Handle edit button click
  const handleEdit = (index) => {
    setTitle(blogs[index].title);
    setDescription(blogs[index].description);
    setEditIndex(index); // Set edit mode to the selected blog
  };

  // Handle delete button click
  const handleDelete = async (index) => {
    const blogId = blogs[index].id;

    // Delete from Supabase
    const { error } = await supabase.from('posts').delete().eq('id', blogId);

    if (error) {
      console.error('Error deleting post:', error.message);
    } else {
      // Remove the blog from the UI
      const updatedBlogs = blogs.filter((_, i) => i !== index);
      setBlogs(updatedBlogs);
      alert('Blog deleted successfully!');
    }
  };

  return (
    <div>
      <h1 className="text-center text-3xl my-4">Blog Creation</h1>

      {/* Blog Form */}
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 border border-gray-300 rounded-lg shadow-md">
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="title-input">
            Add Title
          </label>
          <input
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            id="title-input"
            type="text"
            required
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="description-input">
            Add Description
          </label>
          <input
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            id="description-input"
            type="text"
            required
          />
        </div>

        <button
          type="submit"
          className={`bg-blue-500 text-white p-2 rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Submitting...' : editIndex !== null ? 'Update Blog' : 'Create Blog'}
        </button>
      </form>

      {/* Render Blog Cards */}
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-wrap -m-4">
          {fetching ? (
            <div className="w-full text-center py-10">Loading blogs...</div>
          ) : (
            blogs.map((blog, index) => (
              <div key={index} className="p-4 md:w-1/3">
                <div className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden">
                  <img
                    alt="blog"
                    className="lg:h-48 md:h-36 w-full object-cover object-center"
                    src="https://dummyimage.com/720x400"
                  />
                  <div className="p-6">
                    <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">
                      CATEGORY
                    </h2>
                    <h1 className="title-font text-lg font-medium text-gray-900 mb-3">
                      {/* Editable title field */}
                      <input
                        type="text"
                        value={blog.title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setEditIndex(index);
                        }}
                        className="border-b border-gray-400 bg-transparent w-full"
                      />
                    </h1>
                    <p className="leading-relaxed mb-3">
                      {/* Editable description field */}
                      <input
                        type="text"
                        value={blog.description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          setEditIndex(index);
                        }}
                        className="border-b border-gray-400 bg-transparent w-full"
                      />
                    </p>
                    <div className="flex items-center flex-wrap">
                      <a className="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0">
                        Learn More
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24">
                          <path d="M5 12h14" />
                          <path d="M12 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                    <div className="flex mt-4">
                      <button
                        onClick={() => handleEdit(index)}
                        className="bg-yellow-500 text-white p-2 rounded-lg mr-2"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="bg-red-500 text-white p-2 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogCreation;
