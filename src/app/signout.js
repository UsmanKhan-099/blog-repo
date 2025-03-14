// components/SignOut.js
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

const SignOut = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
};

export default SignOut;
