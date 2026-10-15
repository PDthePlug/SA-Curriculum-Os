import type { Database } from './database.types';
import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Supabase configuration is missing.');
  const jar = await cookies();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll(values) {
        // Server Components cannot write cookies; proxy.ts performs refresh there.
        try {
          values.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          /* read-only render */
        }
      },
    },
  });
}
