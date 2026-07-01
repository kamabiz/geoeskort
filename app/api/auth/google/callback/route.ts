import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { decodeIdToken } from 'arctic';
import { createGoogleProvider, findOrCreateOAuthUser } from '@/lib/oauth';
import { createUserSessionToken, setUserSessionCookie } from '@/lib/community/auth';
import { touchUserActivity } from '@/lib/community/presence';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const jar = await cookies();
  const storedState = jar.get('oauth_google_state')?.value;
  const codeVerifier = jar.get('oauth_google_cv')?.value;

  jar.delete('oauth_google_state');
  jar.delete('oauth_google_cv');

  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    return NextResponse.redirect(new URL('/login/?error=oauth', request.url));
  }

  try {
    const google = createGoogleProvider();
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const claims = decodeIdToken(tokens.idToken()) as Record<string, unknown>;

    const providerAccountId = String(claims['sub'] ?? '');
    const email = typeof claims['email'] === 'string' ? claims['email'] : null;
    const name = typeof claims['name'] === 'string' ? claims['name'] : null;
    const picture = typeof claims['picture'] === 'string' ? claims['picture'] : null;

    const user = await findOrCreateOAuthUser({ provider: 'google', providerAccountId, email, name, avatarUrl: picture });

    await setUserSessionCookie(createUserSessionToken(user.id));
    await touchUserActivity(user.id);

    return NextResponse.redirect(new URL(`/u/${user.username}/`, request.url));
  } catch (e) {
    console.error('Google OAuth callback error:', e);
    return NextResponse.redirect(new URL('/login/?error=oauth', request.url));
  }
}
