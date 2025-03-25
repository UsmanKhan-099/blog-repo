// // utils/withPrivateRoute.js
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';

// const withPrivateRoute = (WrappedComponent) => {
//   return (props) => {
//     const [loading, setLoading] = useState(true);
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const router = useRouter();
    
//     useEffect(() => {
//       // Check if window is available (i.e., client-side)
//       if (typeof window !== 'undefined') {
//         const user = localStorage.getItem('user');  // Example: check localStorage for a user object
//         setIsAuthenticated(!!user);
//         if (!user) {
//           router.push('../components/Dashboard');  // Redirect to login page if not authenticated
//         } else {
//           setLoading(false);  // Set loading to false if the user is authenticated
//         }
//       }
//     }, [router]);
    
//     if (loading) {
//       return <div>Loading...</div>;  // Optional loading state while checking authentication
//     }

//     return <WrappedComponent {...props} />;
//   };
// };

// export default withPrivateRoute;
'use client'; // Make sure this runs on the client side

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        // Fetch the user's role from the database
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (userData) {
          setRole(userData.role);
        }
      }
    };

    getUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
