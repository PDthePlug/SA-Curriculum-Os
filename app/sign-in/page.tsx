import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Quote } from 'lucide-react';
import { Brand } from '@/components/brand';
import { SignInForm } from '@/components/sign-in-form';
export const metadata = { title: 'Sign in' };
export default function SignIn() {
  return (
    <main id="main-content" className="sign-in-page">
      <section className="auth-story">
        <Brand />
        <div className="auth-story-content">
          <span className="hero-pill">YOUR NEXT STEP STARTS HERE</span>
          <h1>
            Great learning
            <br />
            begins with
            <br />
            <em>connection.</em>
          </h1>
          <p>
            Your curriculum. Your classroom.
            <br />
            One place to move forward.
          </p>
          <div className="auth-quote">
            <Quote size={25} />
            <p>
              Every learner deserves the space to explore, the support to grow and the chance to
              understand.
            </p>
          </div>
        </div>
        <span className="auth-location">CURRICULUMOS · SOUTH AFRICA</span>
      </section>
      <section className="auth-main">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} />
          Back to overview
        </Link>
        <div className="auth-card">
          <span className="eyebrow">WELCOME TO CURRICULUMOS</span>
          <h2>Good to see you.</h2>
          <p className="muted">Sign in with the account provided by your school.</p>
          <SignInForm />
          <div className="secure-note">
            <ShieldCheck size={16} />
            Your workspace is connected to your school.
          </div>
        </div>
        <p className="auth-bottom">Teach. Explore. Understand.</p>
      </section>
    </main>
  );
}
