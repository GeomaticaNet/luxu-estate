import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/';
  // Only allow same-origin paths (no open redirect)
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if user is suspended or deactivated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('active, deleted_at')
          .eq('user_id', user.id)
          .single();
        
        if (userRole && (userRole.active === false || userRole.deleted_at)) {
          // User is suspended/deactivated, sign out and redirect to login with error
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login?error=deactivated`);
        }
      }
      
      await supabase.rpc('update_user_presence');
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/?error=auth`);
}
