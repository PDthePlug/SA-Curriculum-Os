import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  // Next.js may construct request.url with an internal listener hostname.
  // Host is the browser-facing authority; do not trust a forwarded host supplied by a client.
  let validOrigin = false;
  try {
    const parsed = new URL(origin || '');
    validOrigin =
      ['https:', 'http:'].includes(parsed.protocol) &&
      parsed.host === request.headers.get('host') &&
      parsed.origin === origin;
  } catch {
    /* malformed origin */
  }
  if (!validOrigin || !origin)
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) {
    console.error('auth.sign_out_failed', {
      code: error.code,
      status: error.status,
      name: error.name,
    });
    return NextResponse.json(
      { error: 'Sign out could not be completed. Please try again.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  const response = NextResponse.redirect(new URL('/sign-in', origin), 303);
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Clear-Site-Data', '"cache", "storage"');
  return response;
}
