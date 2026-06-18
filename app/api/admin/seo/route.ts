import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/admin-api';
import { analyzeSeo } from '@/lib/seo-analyze';

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth();
  if (auth) return auth;
  const body = await request.json();
  const analysis = analyzeSeo(body);
  return NextResponse.json(analysis);
}
