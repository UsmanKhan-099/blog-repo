// pages/dashboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Next.js 13+ and beyond (useRouter from 'next/navigation')
import { supabase } from './lib/supabase'; // Make sure you have a supabase client initialized

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if the user is logged in when the page is loaded
  useEffect(() => {
    const session = supabase.auth.session(); // Get the session from supabase

    if (!session) {
      // If there's no session (user not logged in), redirect them to login
      router.push('/login');
    } else {
      // If the user is logged in, update state with user info
      setUser(session.user);
      setLoading(false); // Once user data is set, stop loading
    }
  }, [router]);

  if (loading) return <p>Loading...</p>; // Display a loading message while checking session

  return (
    <div>
      <h2>Welcome to your Dashboard, {user.email}</h2>
      <p>This is your personalized dashboard where you can manage your account.</p>

    
      
      <button
        onClick={async () => {
          await supabase.auth.signOut(); // Log the user out of the app
          router.push('/login'); // Redirect them to the login page
        }}
      >
        Log Out
      </button>
    </div>
  );
};

export default Dashboard;
