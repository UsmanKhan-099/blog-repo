'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  const { fetchUserRole } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return setError('Authentication failed. Please try again.');
    }

    const { data: userRole, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (roleError || !userRole?.role) {
      return setError('Role not found, contact admin.');
    }

    fetchUserRole(userData.user.id);
    router.push(userRole.role === 'admin' ? '/adminDashboard' : '/blogCreation');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 transform hover:scale-105 transition-all duration-300">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-white drop-shadow-lg">🚀 Login to Continue</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="✉️ Email Address" 
            required 
            className="w-full px-5 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300 shadow-md"
          />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="🔑 Password" 
            required 
            className="w-full px-5 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300 shadow-md"
          />
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 px-5 rounded-lg text-lg font-bold tracking-wide shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all duration-300"
          >
            Login 🚀
          </button>
        </form>
        {error && <p className="text-red-500 font-medium text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
