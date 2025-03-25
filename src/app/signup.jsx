'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './lib/supabase';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return setError(error.message);

    const user = data.user;
    if (user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: user.id, email: user.email, role: 'user' }]);

      if (insertError) return setError(insertError.message);
      router.push('/blogCreation');
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center  bg-[#0A0A0A] text-white relative top-[1800%]">
      <div className="max-w-md w-full bg-[#1A1A1A] p-8 rounded-2xl shadow-xl border border-gray-700 transition-all transform hover:scale-105 hover:shadow-2xl">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-100">🚀 Sign Up</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            Sign Up
          </button>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default Signup;
