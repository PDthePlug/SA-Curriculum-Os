import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Users,
  Layers,
  Check,
  Sparkles,
  FileCheck2,
  Compass,
  LockKeyhole,
} from 'lucide-react';
import { Shell } from '@/components/shell';
export default function Home() {
  return (
    <Shell
      active="overview"
      title="A place for every next step."
      subtitle="Connecting the curriculum, the classroom and the learner."
    >
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-pill">
            <span />
            CAPS ALIGNED BY DESIGN
          </span>
          <h2>
            More than lessons.
            <br />A foundation for
            <br />
            <em>understanding.</em>
          </h2>
          <p>
            Bring teaching, exploration and evidence of learning into one connected school
            experience.
          </p>
          <div className="hero-actions">
            <Link className="button button-orange" href="/sign-in">
              Enter your workspace <ArrowRight size={17} />
            </Link>
            <Link className="hero-link" href="/curriculum">
              Explore the curriculum <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="hero-footnote">
            <span className="tiny-stack">
              <GraduationCap size={15} />
              <Users size={15} />
              <SchoolIcon />
            </span>
            Built for learners. Guided by teachers.
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-star star-one">✳</div>
          <div className="art-star star-two">+</div>
          <div className="art-caption">
            <span>THE BIGGER PICTURE</span>
            <strong>
              Every concept.
              <br />
              Connected.
            </strong>
          </div>
          <div className="floating-label label-one">
            <span className="float-dot green" />
            Explore
          </div>
          <div className="floating-label label-two">
            <span className="float-dot orange" />
            Understand
          </div>
          <div className="book-art">
            <div className="book-left">
              <div className="book-line" />
              <div className="book-line short" />
              <div className="math-art">a + (n − 1)d</div>
              <div className="sequence-art">
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="book-right">
              <svg viewBox="0 0 130 130" fill="none">
                <path d="M15 110H120M20 115V15" stroke="#b5c6bc" strokeWidth="1.5" />
                <path d="M20 100L45 85L70 61L95 44L120 20" stroke="#206e50" strokeWidth="3" />
                {[
                  [20, 100],
                  [45, 85],
                  [70, 61],
                  [95, 44],
                  [120, 20],
                ].map(([x, y]) => (
                  <circle key={x} cx={x} cy={y} r="4" fill="#206e50" />
                ))}
              </svg>
              <div className="book-line" />
              <div className="book-line short" />
            </div>
          </div>
          <div className="art-badge">
            <Check size={16} /> A little clearer, every day
          </div>
        </div>
      </section>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ONE PLATFORM. CONNECTED LEARNING.</p>
            <h2>Built around the way learning happens</h2>
          </div>
          <span className="subtle-label">The product vision</span>
        </div>
        <div className="pillar-grid">
          {[
            {
              icon: BookOpen,
              no: '01',
              title: 'Curriculum with direction',
              text: 'A structured path through grades, subjects and concepts, grounded in official sources.',
              color: 'green',
            },
            {
              icon: Compass,
              no: '02',
              title: 'Room to explore',
              text: 'Worked examples, investigations and subject-specific activities that make ideas tangible.',
              color: 'orange',
            },
            {
              icon: FileCheck2,
              no: '03',
              title: 'Evidence that matters',
              text: 'Connect learner work, teacher feedback and the next useful step in learning.',
              color: 'blue',
            },
          ].map(({ icon: Icon, ...p }) => (
            <article className="pillar-card" key={p.no}>
              <div className="pillar-top">
                <span className={`icon-box ${p.color}`}>
                  <Icon size={22} />
                </span>
                <span className="card-number">{p.no}</span>
              </div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="focus-grid">
        <article className="focus-card">
          <div className="focus-header">
            <span className="icon-box green">
              <GraduationCap size={23} />
            </span>
            <span className="badge badge-amber">First unit · in development</span>
          </div>
          <p className="eyebrow">GRADE 12 · MATHEMATICS</p>
          <h2>
            Start with a pattern.
            <br />
            Build a deeper understanding.
          </h2>
          <p className="muted">
            Arithmetic sequences and finite arithmetic series are the first teaching unit in the
            approved implementation plan.
          </p>
          <div className="focus-bottom">
            <span>
              <Layers size={15} /> Source mapping prepared
            </span>
            <Link href="/curriculum">
              View sources <ArrowRight size={16} />
            </Link>
          </div>
        </article>
        <article className="release-card">
          <div className="release-icon">
            <Sparkles size={20} />
          </div>
          <p className="eyebrow">GROWING WITH INTENTION</p>
          <h2>
            A strong start.
            <br />A bigger ambition.
          </h2>
          <p>
            This foundation release introduces school access and class setup. Teaching units open
            after curriculum and content reviews.
          </p>
          <div className="release-detail">
            <LockKeyhole size={17} />
            <span>
              School-managed accounts
              <br />
              <small>Access is assigned by your institution.</small>
            </span>
          </div>
          <Link href="/sign-in" className="text-link">
            Sign in to your school <ArrowUpRight size={16} />
          </Link>
        </article>
      </section>
    </Shell>
  );
}
function SchoolIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <path d="M3 17V7L10 3L17 7V17H3Z M8 17V12H12V17" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
