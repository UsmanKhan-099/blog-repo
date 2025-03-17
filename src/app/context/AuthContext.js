'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';  // Your Supabase client

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch session from Supabase when the app loads
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
      setLoading(false);  // Set loading to false once session is checked
    };

    getSession();
    

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  // Function to sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      setUser(null);  // Clear user state on sign out
    }
  };

  const value = {
    user,
    loading,
    signOut,  // Providing signOut function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
