import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const withAdminRoute = (Component) => {
  return (props) => {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && (!user || !isAdmin)) {
        router.push('/dashboard'); // Redirect non-admins
      }
    }, [user, isAdmin, loading, router]);

    if (loading) return <p>Loading...</p>;

    return <Component {...props} />;
  };
};

export default withAdminRoute;
