import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main-content" className="standalone-message">
      <span className="eyebrow">CURRICULUMOS</span>
      <h1>This page isn’t available.</h1>
      <p>The page may have moved, or your account may not have access.</p>
      <Link href="/" className="button button-dark">
        Back to overview
      </Link>
    </main>
  );
}
