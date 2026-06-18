import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, isLocale, locales } from '@/lib/i18n/config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, api, admin, sitemap, robots
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.') // favicon, txt verification, etc.
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  // Redirect /ka/... → /... (default locale has no URL prefix)
  if (first === defaultLocale) {
    const rest = segments.slice(1).join('/');
    const url = request.nextUrl.clone();
    url.pathname = rest ? `/${rest}/` : '/';
    return NextResponse.redirect(url, 308);
  }

  // /en, /ru, /tr — explicit locale prefix
  if (first && isLocale(first) && first !== defaultLocale) {
    return NextResponse.next();
  }

  // Default locale (ka): rewrite /blog/ → /ka/blog/ internally
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.png|.*\\..*).*)'],
};

// Export for static params
export { locales, defaultLocale };
