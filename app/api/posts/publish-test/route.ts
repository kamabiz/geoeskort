import { NextResponse } from 'next/server';
import { getStorageDiagnostics } from '@/lib/blog-store';

export async function GET() {
  return NextResponse.json({ status: 'ok', ...getStorageDiagnostics() });
}
