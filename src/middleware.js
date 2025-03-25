import { NextResponse } from 'next/server';
import { supabase } from './app/lib/supabase';

export async function middleware(req) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/blogCreation', req.url));
  }

  return NextResponse.next();
}

// Apply middleware only on /admin routes
export const config = {
  matcher: '/admin/:path*',
};
