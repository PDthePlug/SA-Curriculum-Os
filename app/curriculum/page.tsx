import { createClient } from '@/lib/supabase/server';
import { Shell } from '@/components/shell';
import { BookOpen, ExternalLink, FileText, ShieldCheck } from 'lucide-react';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Curriculum library' };
type Source = {
  id: string;
  title: string;
  issuer: string;
  url: string;
  edition: string | null;
  retrieved_at: string;
  applicability: string;
  rights: string;
};
export default async function Curriculum() {
  const supabase = await createClient();
  const [{ data, error }, { count, error: versionError }] = await Promise.all([
    supabase
      .from('curriculum_sources')
      .select('id,title,issuer,url,edition,retrieved_at,applicability,rights')
      .order('id'),
    supabase
      .from('curriculum_versions')
      .select('id', { head: true, count: 'exact' })
      .eq('state', 'published'),
  ]);
  return (
    <Shell
      active="curriculum"
      title="Curriculum library"
      subtitle="A clear connection between learning and its official sources."
    >
      <section className="library-banner">
        <span className="icon-box green">
          <BookOpen size={26} />
        </span>
        <div>
          <p className="eyebrow">STARTING WITH GRADE 12 MATHEMATICS</p>
          <h2>
            Grounded in the curriculum.
            <br />
            Built for understanding.
          </h2>
          <p>
            Official references inform the learning units. Each unit needs subject, applicability
            and content review before it opens to learners.
          </p>
        </div>
        <span className="badge badge-amber">Review in progress</span>
      </section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">TRACEABLE FOUNDATIONS</p>
          <h2>Official source register</h2>
        </div>
        <span className="subtle-label">
          {error ? 'Unavailable' : `${data?.length || 0} references`}
        </span>
      </div>
      {error ? (
        <div role="alert" className="empty-inline">
          <h3>Sources could not be loaded.</h3>
          <p>Please refresh or try again shortly.</p>
        </div>
      ) : (
        <div className="source-list">
          {((data as Source[]) || []).map((s) => (
            <article key={s.id} className="source-card">
              <span className="source-icon">
                <FileText size={22} />
              </span>
              <div className="source-body">
                <div className="source-meta">
                  <span>{s.issuer}</span>
                  {s.edition && <span>{s.edition}</span>}
                </div>
                <h3>{s.title}</h3>
                <p>{s.applicability}</p>
                <details>
                  <summary>Source details</summary>
                  <p>
                    Retrieved: {s.retrieved_at}
                    <br />
                    {s.rights}
                  </p>
                  <code>{s.id}</code>
                </details>
              </div>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="source-link"
                aria-label={`Open official source: ${s.title}`}
              >
                <ExternalLink size={19} />
              </a>
            </article>
          ))}
        </div>
      )}
      <div className="info-strip">
        <ShieldCheck size={23} />
        <div>
          <strong>
            {versionError
              ? 'Publication status is temporarily unavailable.'
              : count
                ? `${count} curriculum versions published.`
                : 'No learning units are published yet.'}
          </strong>
          <p>
            Source retrieval records do not constitute curriculum approval. Original lessons and
            assessments require independent review.
          </p>
        </div>
      </div>
    </Shell>
  );
}
