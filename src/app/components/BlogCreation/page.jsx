'use client'; // Client-side component declaration
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/app/context/AuthContext"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BlogCreation = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]); // Store all blogs for filtering
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]); // Store unique categories
  const [selectedCategory, setSelectedCategory] = useState('All'); // Default filter to show all
  const router = useRouter();

  // Get the user from the Auth context
  const { user, signOut } = useAuth();

  // Redirect to login page if the user is not logged in
  useEffect(() => {
    if (!user) {
      router.push("./Login")
    }
  }, [user, router]);

  // Fetch blogs and categories
  useEffect(() => {
    const fetchBlogs = async () => {
      setFetching(true);
      const { data, error } = await supabase.from('posts').select('*');
      setFetching(false);
      if (error) {
        console.error('Error fetching posts:', error.message);
      } else {
        setAllBlogs(data); // Store all blogs
        setBlogs(data);    // Display all blogs initially
        
        // Fetch categories from the database
        const { data: categoryData, error: categoryError } = await supabase.from('categories').select('*');
        
        if (categoryError) {
          console.error('Error fetching categories:', categoryError.message);
        } else {
          setCategories(['All', ...categoryData.map(cat => cat.name)]);
        }
      }
    };

    fetchBlogs();
  }, []);

  // Handle category filter change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    
    if (category === 'All') {
      setBlogs(allBlogs); // Show all blogs
    } else {
      // Filter blogs by selected category
      const filteredBlogs = allBlogs.filter(blog => 
        blog.category === category
      );
      setBlogs(filteredBlogs);
    }
  };

  // Handle blog submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!title || !description || !category) {
      alert('Please provide title, description, and category');
      return;
    }
  
    setLoading(true);
  
    const newBlog = { 
      title, 
      description, 
      category
    };
  
    if (editIndex !== null && editIndex !== undefined) {
      // If editing, update the existing blog in Supabase
      const blogId = blogs[editIndex]?.id;
  
      if (!blogId) {
        console.error("Blog ID is missing for the edit operation.");
        setLoading(false);
        return;
      }
  
      const { error } = await supabase
        .from('posts')
        .update(newBlog)
        .eq('id', blogId)
        .select();
  
      setLoading(false);
  
      if (error) {
        console.error('Error updating post:', error.message);
      } else {
        // Update the blog in both the filtered and full list
        const updatedBlog = { ...blogs[editIndex], ...newBlog };
        
        // Update both filtered and full blog lists
        const updatedFilteredBlogs = [...blogs];
        updatedFilteredBlogs[editIndex] = updatedBlog;
        setBlogs(updatedFilteredBlogs);
        
        const updatedAllBlogs = [...allBlogs];
        const allBlogsIndex = allBlogs.findIndex(blog => blog.id === blogId);
        if (allBlogsIndex !== -1) {
          updatedAllBlogs[allBlogsIndex] = updatedBlog;
          setAllBlogs(updatedAllBlogs);
        }
        
        alert('Blog updated successfully!');
      }
  
      setEditIndex(null);
    } else {
      // If creating, add the new blog to Supabase
      const { data, error } = await supabase
        .from('posts')
        .insert([newBlog])
        .select();
  
      setLoading(false);
  
      if (error) {
        console.error('Error creating post:', error.message);
      } else {
        // If data is returned successfully
        if (data && data.length > 0) {
          const newBlogData = data[0];
          
          // Add to both filtered and full blog lists
          setAllBlogs(prevAllBlogs => [...prevAllBlogs, newBlogData]);
          
          if (selectedCategory === 'All' || newBlogData.category === selectedCategory) {
            setBlogs(prevBlogs => [...prevBlogs, newBlogData]);
          }

          // Check and add new category if it doesn't exist in the categories
          if (!categories.includes(newBlogData.category)) {
            setCategories(prevCategories => [...prevCategories, newBlogData.category]);
          }
        } else {
          // Refetch all blogs if data isn't returned
          const { data: refreshedData } = await supabase.from('posts').select('*');
          if (refreshedData) {
            setAllBlogs(refreshedData);
            if (selectedCategory === 'All') {
              setBlogs(refreshedData);
            } else {
              setBlogs(refreshedData.filter(blog => blog.category === selectedCategory));
            }
            
            // Update categories list
            const uniqueCategories = [...new Set(refreshedData.map(blog => blog.category || 'Uncategorized'))];
            setCategories(['All', ...uniqueCategories]);
          }
        }
        alert('Blog created successfully!');
      }
    }
  
    // Clear inputs after submission
    setTitle('');
    setDescription('');
    setCategory('');
  };
  
  // Handle edit button click
  const handleEdit = (index) => {
    setTitle(blogs[index].title);
    setDescription(blogs[index].description);
    setCategory(blogs[index].category || '');
    setEditIndex(index);
  };

  // Handle delete button click
  const handleDelete = async (index) => {
    const blogId = blogs[index].id;

    // Delete from Supabase
    const { error } = await supabase.from('posts').delete().eq('id', blogId);

    if (error) {
      console.error('Error deleting post:', error.message);
    } else {
      // Remove the blog from both filtered and full lists
      const updatedFilteredBlogs = blogs.filter((_, i) => i !== index);
      setBlogs(updatedFilteredBlogs);
      
      const updatedAllBlogs = allBlogs.filter(blog => blog.id !== blogId);
      setAllBlogs(updatedAllBlogs);
      
      // Update categories list
      const remainingCategories = [...new Set(updatedAllBlogs.map(blog => blog.category || 'Uncategorized'))];
      setCategories(['All', ...remainingCategories]);
      
      alert('Blog deleted successfully!');
    }
  };

  const handleSignOut = async(e) => {
    e.preventDefault()
    await signOut();
    router.push("./Login")
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

        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="category-input">
            Select Category
          </label>
          <select
            id="category-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full"
          >
            {loading ? 'Submitting...' : editIndex === null ? 'Create Blog' : 'Update Blog'}
          </button>
        </div>
      </form>

      {/* Category filter */}
      <div className="mb-5">
        <label className="block mb-2 text-sm font-medium text-gray-900">Filter by Category</label>
        <select
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Display Blogs */}
      <div className="max-w-lg mx-auto">
        {fetching ? (
          <p>Loading...</p>
        ) : (
          blogs.length > 0 ? (
            blogs.map((blog, index) => (
              <div key={blog.id} className="border p-4 my-2 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold">{blog.title}</h2>
                <p>{blog.description}</p>
                <p className="text-gray-500">Category: {blog.category || 'Uncategorized'}</p>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleEdit(index)}
                    className="bg-yellow-500 text-white py-2 px-4 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="bg-red-500 text-white py-2 px-4 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No blogs available.</p>
          )
        )}
      </div>
    </div>
  );
};

export default BlogCreation;
