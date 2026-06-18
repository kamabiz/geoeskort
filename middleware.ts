import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, isLegacyLocalePrefix } from '@/lib/i18n/config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.')
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

  // Redirect legacy locale URLs → Georgian paths without prefix
  if (first && isLegacyLocalePrefix(first)) {
    const rest = segments.slice(1).join('/');
    const url = request.nextUrl.clone();
    url.pathname = rest ? `/${rest}/` : '/';
    return NextResponse.redirect(url, 308);
  }

  // Rewrite to internal /ka/... route segment
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.png|favicon\\.ico|.*\\..*).*)'],
};

export { defaultLocale };
