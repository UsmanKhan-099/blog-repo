// 'use client';
// import { createContext, useContext, useEffect, useState } from 'react';
// import { supabase } from '../lib/supabase';  // Your Supabase client

// const AuthContext = createContext();

// export const useAuth = () => {
//   return useContext(AuthContext);
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Fetch session from Supabase when the app loads
//     const getSession = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (session) {
//         setUser(session.user);
//       }
//       setLoading(false);  // Set loading to false once session is checked
//     };

//     getSession();
    

//     // Listen for auth state changes
//     const { data: authListener } = supabase.auth.onAuthStateChange(
//       (event, session) => {
//         if (session) {
//           setUser(session.user);
//         } else {
//           setUser(null);
//         }
//       }
//     );

//     // Cleanup listener on component unmount
//     return () => {
//       authListener?.unsubscribe();
//     };
//   }, []);

//   // Function to sign out
//   const signOut = async () => {
//     const { error } = await supabase.auth.signOut();
//     if (error) {
//       console.error('Error signing out:', error.message);
//     } else {
//       setUser(null);  // Clear user state on sign out
//     }
//   };

//   const value = {
//     user,
//     loading,
//     signOut,  // Providing signOut function
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        fetchUserRole(session.user.id);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => authListener?.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    const { data, error } = await supabase.from('users').select('role').eq('id', userId).single();
    if (data) setRole(data.role);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut, fetchUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};  