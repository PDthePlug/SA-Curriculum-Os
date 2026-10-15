import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const headers = { 'Cache-Control': 'private, no-store' };
  if (error || !user)
    return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers });
  const { data, error: dbError } = await supabase
    .from('school_memberships')
    .select('school_id,role')
    .eq('user_id', user.id)
    .eq('status', 'active');
  if (dbError)
    return NextResponse.json({ error: 'Workspace unavailable' }, { status: 503, headers });
  return NextResponse.json({ user_id: user.id, memberships: data }, { headers });
}
