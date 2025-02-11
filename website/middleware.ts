import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateRequest } from "@/lib/lucia"
import { RateLimiter } from './lib/rate-limiter';

export async function middleware(request: NextRequest) {
  // Allow access to the homepage without authentication
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next()
  }
  if(request.nextUrl.pathname === '/privacy-policy') {
    return NextResponse.next()
  }

  if(request.nextUrl.pathname === '/funding-news'){
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);
  const protocol = headers.get('x-forwarded-proto');
  const ip = headers.get('x-forwarded-for');

  if (process.env.NODE_ENV === 'production' && protocol !== 'https') {
    return NextResponse.redirect(`https://${request.nextUrl.hostname}${request.nextUrl.pathname}`, 301);
  }

  if(!ip) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  const rateLimiter = new RateLimiter({windowSize : 1000, maxRequests : 20});
  const isRateLimited = rateLimiter.limit(ip);
  
  if(isRateLimited) {
    return NextResponse.json({error : 'Too many requests'}, {status : 429});  
  }

  const { session } = await validateRequest();

  // Redirect to sign-in if not authenticated and not already on sign-in or sign-up page
  if (!session && !request.nextUrl.pathname.startsWith('/sign-in') && !request.nextUrl.pathname.startsWith('/sign-up')) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Redirect to dashboard if authenticated and trying to access sign-in or sign-up pages
  if (session && (request.nextUrl.pathname === '/sign-in' || request.nextUrl.pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/api/jobs',
    '/profile/:path*',
  ],
};