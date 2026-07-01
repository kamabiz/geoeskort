import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createFacebookProvider, generateState } from '@/lib/oauth';

export async function GET() {
  const facebook = createFacebookProvider();
  const state = generateState();

  const url = facebook.createAuthorizationURL(state, ['email', 'public_profile']);

  const jar = await cookies();
  jar.set('oauth_fb_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' });

  return NextResponse.redirect(url);
}
