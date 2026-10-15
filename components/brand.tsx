import Link from 'next/link';
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="CurriculumOS home">
      <span className="brand-mark" aria-hidden="true">
        <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
          <path
            d="M4 5.5C7 5.2 9.8 6.1 12.5 8.2C15.2 6.1 18 5.2 21 5.5V19C18 18.7 15.2 19.6 12.5 21.7C9.8 19.6 7 18.7 4 19V5.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M12.5 8.5V21" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      </span>
      <span>
        Curriculum<span className="brand-os">OS</span>
        {!compact && <small>SOUTH AFRICA</small>}
      </span>
    </Link>
  );
}
