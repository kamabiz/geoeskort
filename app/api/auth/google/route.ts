import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createGoogleProvider, generateState, generateCodeVerifier } from '@/lib/oauth';

export async function GET() {
  const google = createGoogleProvider();
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);

  const jar = await cookies();
  jar.set('oauth_google_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' });
  jar.set('oauth_google_cv', codeVerifier, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' });

  return NextResponse.redirect(url);
}
