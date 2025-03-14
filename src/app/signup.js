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
      router.push('/components/Dashboard');
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      {error && <p>{error}</p>}
      <p>Already have an account? <Link href="./components/Login">Login</Link></p>
    </div>
  );
};

export default Signup;
