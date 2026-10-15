import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'CurriculumOS South Africa', template: '%s · CurriculumOS' },
  description:
    'A connected foundation for CAPS curriculum, teaching, learning and academic evidence in South Africa.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
