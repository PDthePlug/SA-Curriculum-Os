'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
export type SignInState = { error: string };
export async function signIn(_state: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !password ||
    password.length > 256
  )
    return { error: 'Enter your school account email and password.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error)
    return {
      error:
        error.status === 429
          ? 'Too many attempts. Please wait a few minutes and try again.'
          : 'We could not sign you in. Check your details or contact your school administrator.',
    };
  redirect('/workspace');
}
