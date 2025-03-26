
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const { user } = useAuth();
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (user) fetchUserRole();
  }, [user]);

  useEffect(() => {
    if (role === 'admin') {
      fetchUsers();
      fetchBlogs();
    }
  }, [role]);

  const fetchUserRole = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user?.id)
      .single();

    if (data) setRole(data.role);
    else console.error('Error fetching role:', error);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('id, email, role');
    if (data) setUsers(data);
    else console.error('Error fetching users:', error);
  };

  const fetchBlogs = async () => {
    const { data, error } = await supabase.from('posts').select('id, title, content, user_id');
    if (data) setBlogs(data);
    else console.error('Error fetching blogs:', error);
  };
  const updateUserRole = async (id, newRole) => {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', id);
    if (error) {
      console.error('Error updating role:', error);
      return;
    }
    setUsers(users.map(user => (user.id === id ? { ...user, role: newRole } : user)));
  };

  const deleteUser = async (id) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      console.error('Error deleting user:', error);
      return;
    }
    setUsers(users.filter(user => user.id !== id));
  };

  const deleteBlog = async (id) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      console.error('Error deleting blog:', error);
      return;
    }
    setBlogs(blogs.filter(blog => blog.id !== id));
  };

  useEffect(() => {
    const subscription = supabase
      .channel('realtime users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchUsers)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (role !== 'admin') return <p className="text-center text-red-500 mt-10 text-lg">❌ Access Denied</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 transition-all duration-300 transform hover:scale-105">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-blue-400 drop-shadow-lg">🚀 Admin Dashboard</h2>
        <table className="w-full border-collapse bg-gray-700 rounded-xl overflow-hidden shadow-lg">
          <thead>
            <tr className="bg-gray-600 text-gray-300">
              <th className="px-4 py-3 border-b border-gray-500">📧 Email</th>
              <th className="px-4 py-3 border-b border-gray-500">🛡 Role</th>
              <th className="px-4 py-3 border-b border-gray-500">⚡ Change Role</th>
              <th className="px-4 py-3 border-b border-gray-500">🗑 Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="text-center border-b border-gray-600 hover:bg-gray-800 transition-all duration-300">
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')} 
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-300"
                  >
                    Make {user.role === 'admin' ? 'User' : 'Admin'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => deleteUser(user.id)} 
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-red-600 hover:shadow-lg transition-all duration-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="max-w-4xl w-full bg-gray-800 p-8 mt-8 rounded-2xl shadow-2xl border border-gray-700 transition-all duration-300">
        {users.map(user => (
          <div key={user.id} className="mb-8 p-6 bg-gray-700 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-center mb-4">Email: {user.email}</h3>

            <div className="grid grid-cols-1 gap-4 mt-4">
              {blogs.filter(blog => blog.user_id === user.id).length > 0 ? (
                blogs.filter(blog => blog.user_id === user.id).map(blog => (
                  <div key={blog.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                    <h4 className="text-xl font-semibold">{blog.title}</h4>
                    <p className="text-gray-300">{blog.content}</p>
                    <button 
                      onClick={() => deleteBlog(blog.id)} 
                      className="mt-2 bg-red-500 text-white px-3 py-1 rounded-lg font-semibold shadow-md hover:bg-red-600 hover:shadow-lg transition-all duration-300"
                    >
                      Delete Blog
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">Not created any blog</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleLogout} className="bg-red-600 text-white px-5 py-3 rounded-lg text-lg font-bold tracking-wide shadow-xl hover:bg-red-700 hover:shadow-2xl transition-all duration-300 mt-6">🚪 Logout</button>
    </div>
  );
};

export default AdminDashboard;
