'use client';
import Link from 'next/link';
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="standalone-message">
      <span className="eyebrow">CURRICULUMOS</span>
      <h1>We couldn’t load this page.</h1>
      <p>Please try again. Your access and saved information have not been changed.</p>
      <div className="hero-actions">
        <button className="button button-dark" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="text-link">
          Back to overview
        </Link>
      </div>
    </main>
  );
}
