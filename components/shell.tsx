import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  LayoutGrid,
  School,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Brand } from './brand';
export function Shell({
  children,
  active,
  title,
  subtitle,
  signedIn = false,
}: {
  children: React.ReactNode;
  active: 'overview' | 'curriculum' | 'workspace';
  title: string;
  subtitle: string;
  signedIn?: boolean;
}) {
  const nav = [
    { href: '/', label: 'Overview', icon: LayoutGrid, id: 'overview' },
    { href: '/curriculum', label: 'Curriculum library', icon: BookOpen, id: 'curriculum' },
    { href: '/workspace', label: 'Workspace', icon: School, id: 'workspace' },
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <div className="side-label">YOUR LEARNING PLATFORM</div>
        <nav aria-label="Main navigation">
          {nav.map(({ href, label, icon: Icon, id }) => (
            <Link
              key={id}
              href={href}
              className={`nav-item ${active === id ? 'active' : ''}`}
              aria-current={active === id ? 'page' : undefined}
            >
              <Icon size={18} />
              {label}
              {active === id && <ChevronRight size={15} className="nav-chevron" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="side-note">
            <span className="mini-icon">
              <ShieldCheck size={19} />
            </span>
            <strong>Learning with purpose.</strong>
            <p>One connected space for learners, teachers and schools.</p>
          </div>
          <div className="south-africa">
            <span className="sa-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            Made for South Africa
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span className="breadcrumb">
            Platform <ChevronRight size={13} />
            <strong>{title}</strong>
          </span>
          <div className="top-actions">
            <span className="release-tag">
              <i />
              Foundation release
            </span>
            {signedIn ? (
              <form action="/auth/sign-out" method="post">
                <button className="text-button" type="submit">
                  Sign out
                </button>
              </form>
            ) : (
              <Link className="top-login" href="/sign-in">
                Sign in <ArrowUpRight size={15} />
              </Link>
            )}
          </div>
        </header>
        <main id="main-content" className="main-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">CURRICULUMOS SOUTH AFRICA</p>
              <h1>{title}</h1>
              <p className="muted">{subtitle}</p>
            </div>
          </div>
          {children}
        </main>
        <footer className="footer">
          <span>CurriculumOS South Africa</span>
          <span>Teach. Explore. Understand.</span>
        </footer>
      </div>
    </div>
  );
}
