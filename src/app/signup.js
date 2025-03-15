// pages/signup.js
'use client'; // Client-side component declaration
import { useState } from 'react';
import { supabase } from './lib/supabase'; // Import from the correct location
import { useRouter } from 'next/navigation'; // use next/navigation in Next.js 13+
import Link from 'next/link';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter(); // This is now imported from next/navigation

  const handleSignup = async (e) => {
    e.preventDefault();

    const { user, session, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Redirect or show success message
      alert('Sign up successful! Please check your email for confirmation.');
      router.push('/components/BlogCreation');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
  <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
  <form onSubmit={handleSignup}>
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Enter your email"
      required
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
    />
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter your password"
      required
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
    />
    <button
      type="submit"
      className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      Sign Up
    </button>
  </form>
  {error && <p className="text-red-500 text-center mt-4">{error}</p>}
  <p className="text-center mt-4">
    Already have an account? <Link href="./components/Login">Login</Link>
  </p>
</div>

  );
};

export default Signup;
