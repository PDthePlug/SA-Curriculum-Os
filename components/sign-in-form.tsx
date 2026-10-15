'use client';
import { useActionState, useState } from 'react';
import { Eye, EyeOff, ArrowRight, LoaderCircle } from 'lucide-react';
import { signIn } from '@/app/sign-in/actions';
export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, { error: '' });
  const [visible, setVisible] = useState(false);
  return (
    <form action={action} className="auth-form">
      <label htmlFor="email">Email address</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="username"
        placeholder="you@school.co.za"
        required
        maxLength={254}
      />
      <label htmlFor="password">Password</label>
      <div className="password-field">
        <input
          id="password"
          name="password"
          type={visible ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Enter your password"
          required
          maxLength={256}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="form-error">
          {state.error}
        </p>
      )}
      <button type="submit" className="button button-orange auth-submit" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="spin" size={17} />
            Signing in…
          </>
        ) : (
          <>
            Sign in <ArrowRight size={17} />
          </>
        )}
      </button>
      <p className="auth-help">
        Need an account or help with access? Contact your school administrator.
      </p>
    </form>
  );
}
