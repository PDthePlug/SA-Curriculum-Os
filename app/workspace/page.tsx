import Link from 'next/link';
import { randomUUID } from 'node:crypto';
import { notFound } from 'next/navigation';
import {
  School,
  Users,
  BookOpen,
  LockKeyhole,
  GraduationCap,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Shell } from '@/components/shell';
import { CreateClassForm } from '@/components/create-class-form';
import { requireUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'School workspace' };
type SchoolRecord = { id: string; name: string };
type ClassRecord = {
  id: string;
  name: string;
  grade_code: string;
  academic_years: { year: number } | null;
};
type Membership = { school_id: string; role: string };
export default async function Workspace({
  searchParams,
}: {
  searchParams: Promise<{ school?: string }>;
}) {
  const { supabase, user } = await requireUser();
  const [{ data: schools, error }, { data: memberships, error: membershipError }] =
    await Promise.all([
      supabase.from('schools').select('id,name').order('name'),
      supabase
        .from('school_memberships')
        .select('school_id,role')
        .eq('user_id', user.id)
        .eq('status', 'active'),
    ]);
  if (error || membershipError) throw new Error('Your school workspace could not be loaded.');
  const available = (schools || []) as SchoolRecord[];
  const requested = (await searchParams).school;
  const school = requested ? available.find((s) => s.id === requested) : available[0];
  if (requested && !school) notFound();
  const roles = ((memberships as Membership[]) || [])
    .filter((m) => m.school_id === school?.id)
    .map((m) => m.role);
  const admin = roles.includes('school_admin');
  const academic = roles.some((r) => ['school_admin', 'teacher', 'learner'].includes(r));
  let classes: ClassRecord[] = [];
  let offeringCount = 0;
  if (school && academic) {
    const [{ data: rows, error: classError }, { count, error: offeringError }] = await Promise.all([
      supabase
        .from('classes')
        .select('id,name,grade_code,academic_years(year)')
        .eq('school_id', school.id)
        .eq('status', 'active')
        .order('name'),
      supabase
        .from('class_subjects')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', school.id),
    ]);
    if (classError || offeringError) throw new Error('Class information could not be loaded.');
    classes = (rows || []) as unknown as ClassRecord[];
    offeringCount = count ?? 0;
  }
  return (
    <Shell
      active="workspace"
      title={school?.name || 'Your school workspace'}
      subtitle={
        school
          ? 'Your school, classes and next steps in one place.'
          : 'Your account is signed in. School access is managed by your institution.'
      }
      signedIn
    >
      {!school ? (
        <section className="empty-state">
          <span className="icon-box green">
            <School size={27} />
          </span>
          <h2>Your school connection starts here.</h2>
          <p>
            Your account has no active school membership yet. Ask your school administrator to add
            your account and assign your access.
          </p>
          <p className="account-label">Signed in as {user.email}</p>
        </section>
      ) : (
        <>
          {available.length > 1 && (
            <nav className="school-switch" aria-label="Select school">
              {available.map((s) => (
                <Link
                  href={`/workspace?school=${s.id}`}
                  key={s.id}
                  aria-current={s.id === school.id ? 'page' : undefined}
                >
                  {s.name}
                </Link>
              ))}
            </nav>
          )}
          <div className="workspace-banner">
            <span className="icon-box green">
              <School size={23} />
            </span>
            <div>
              <strong>Your school connection is active</strong>
              <p>{roles.map((r) => r.replace('_', ' ')).join(' · ')} access</p>
            </div>
            <span className="badge badge-green">Connected</span>
          </div>
          {academic ? (
            <>
              <div className="workspace-metrics">
                <article>
                  <School size={20} />
                  <strong>{classes.length}</strong>
                  <span>{admin ? 'Active classes' : 'Your classes'}</span>
                </article>
                <article>
                  <BookOpen size={20} />
                  <strong>{offeringCount}</strong>
                  <span>{admin ? 'Subject offerings' : 'Your subject offerings'}</span>
                </article>
                <article className="metric-note">
                  <LockKeyhole size={20} />
                  <h3>School-scoped access</h3>
                  <p>You see the classes connected to your current permissions.</p>
                </article>
              </div>
              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">YOUR SCHOOL</p>
                    <h2>{admin ? 'Manage your classes' : 'Your classes'}</h2>
                  </div>
                  <span className="subtle-label">{classes.length} active</span>
                </div>
                {classes.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Class</th>
                          <th>Grade</th>
                          <th>Calendar year</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classes.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <span className="class-icon">
                                <Users size={16} />
                              </span>
                              <strong>{c.name}</strong>
                            </td>
                            <td>Grade {c.grade_code}</td>
                            <td>{c.academic_years?.year ?? '—'}</td>
                            <td>
                              <span className="badge badge-green">Active</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-inline">
                    <GraduationCap size={28} />
                    <h3>
                      {admin ? 'Make room for your first class.' : 'No classes assigned yet.'}
                    </h3>
                    <p>
                      {admin
                        ? 'Create a class below to begin setting up your school.'
                        : 'Your school administrator will connect you to your subjects.'}
                    </p>
                  </div>
                )}
              </section>
              {admin && (
                <section className="form-card">
                  <div className="form-title">
                    <span className="icon-box orange">
                      <Plus size={21} />
                    </span>
                    <div>
                      <h2>Create a class</h2>
                      <p>
                        Set up a class for a calendar year. Subject allocations follow in the next
                        release.
                      </p>
                    </div>
                  </div>
                  <CreateClassForm
                    key={school.id}
                    schoolId={school.id}
                    operationId={randomUUID()}
                    year={new Date().getFullYear()}
                  />
                </section>
              )}
            </>
          ) : (
            <section className="empty-state">
              <span className="icon-box green">
                <LockKeyhole size={25} />
              </span>
              <h2>Parent access is being prepared.</h2>
              <p>
                Your school connection is active. Learner reports will become available after the
                verified parent-link workflow is released.
              </p>
            </section>
          )}
          <div className="info-strip">
            <BookOpen size={20} />
            <div>
              <strong>Learning units are being prepared</strong>
              <p>
                Curriculum and content reviews must be complete before teachers can assign the first
                unit.
              </p>
            </div>
            <Link href="/curriculum">
              View curriculum sources <ArrowRight size={16} />
            </Link>
          </div>
        </>
      )}
    </Shell>
  );
}
