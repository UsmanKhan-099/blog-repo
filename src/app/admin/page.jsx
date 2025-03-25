import withAdminRoute from '@/app/utils/withAdminRoute';
import AdminDashboard from '@/app/components/Dashboard'; // Assuming this is your admin panel component

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function getPosts(user) {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id); // Fetch only the logged-in user's posts

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return posts;
}

export async function getAllPosts() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*'); // Admin gets all posts

  if (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }

  return posts;
}

const AdminPage = () => {
  return <AdminDashboard />;
};

export default withAdminRoute(AdminPage);
