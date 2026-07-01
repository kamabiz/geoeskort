import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createFacebookProvider, findOrCreateOAuthUser } from '@/lib/oauth';
import { createUserSessionToken, setUserSessionCookie } from '@/lib/community/auth';
import { touchUserActivity } from '@/lib/community/presence';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const jar = await cookies();
  const storedState = jar.get('oauth_fb_state')?.value;

  jar.delete('oauth_fb_state');

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/login/?error=oauth', request.url));
  }

  try {
    const facebook = createFacebookProvider();
    const tokens = await facebook.validateAuthorizationCode(code);

    const accessToken = tokens.accessToken();
    const meRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`,
    );
    const me = (await meRes.json()) as { id?: string; name?: string; email?: string; picture?: { data?: { url?: string } } };

    if (!me.id) {
      return NextResponse.redirect(new URL('/login/?error=oauth', request.url));
    }

    const user = await findOrCreateOAuthUser({
      provider: 'facebook',
      providerAccountId: me.id,
      email: me.email ?? null,
      name: me.name ?? null,
      avatarUrl: me.picture?.data?.url ?? null,
    });

    await setUserSessionCookie(createUserSessionToken(user.id));
    await touchUserActivity(user.id);

    return NextResponse.redirect(new URL(`/u/${user.username}/`, request.url));
  } catch (e) {
    console.error('Facebook OAuth callback error:', e);
    return NextResponse.redirect(new URL('/login/?error=oauth', request.url));
  }
}
