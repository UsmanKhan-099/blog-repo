// utils/withPrivateRoute.js
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const withPrivateRoute = (WrappedComponent) => {
  return (props) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    
    useEffect(() => {
      // Check if window is available (i.e., client-side)
      if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user');  // Example: check localStorage for a user object
        setIsAuthenticated(!!user);
        if (!user) {
          router.push('../components/Dashboard');  // Redirect to login page if not authenticated
        } else {
          setLoading(false);  // Set loading to false if the user is authenticated
        }
      }
    }, [router]);
    
    if (loading) {
      return <div>Loading...</div>;  // Optional loading state while checking authentication
    }

    return <WrappedComponent {...props} />;
  };
};

export default withPrivateRoute;
