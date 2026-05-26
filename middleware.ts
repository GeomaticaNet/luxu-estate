import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Let Server Actions (POST) pass through without any processing
  if (request.method === 'POST') {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);
  const pathname = request.nextUrl.pathname;

  // Redirect admin root and dashboard to properties
  const localeMatch = pathname.match(/^\/(es|en|pt)/);
  const locale = localeMatch?.[1];
  const pathWithoutLocale = locale ? pathname.replace(`/${locale}`, '') : pathname;
  
  if (pathWithoutLocale === '/admin' || pathWithoutLocale === '/admin/dashboard') {
    return NextResponse.redirect(new URL(`/${locale || 'es'}/admin/properties`, request.url));
  }

  // Check if route is admin
  const isAdminRoute = pathname.includes('/admin');

  if (isAdminRoute) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set({
                name,
                value,
                ...options,
              })
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role check moved to admin layout (more reliable in Server Component)
  }

  // For non-admin routes, refresh session
  if (!isAdminRoute) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set({
                name,
                value,
                ...options,
              })
            );
          },
        },
      }
    );

    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: [
    '/', 
    '/(es|en|pt)/:path*',
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)'
  ]
};
