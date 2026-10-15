# Foundation release 0.1

Date: 15 October 2026. This release implements W01 and the first institution-access slice of W02. The approved six-engine, twelve-module vision remains unchanged. This is a deployed engineering foundation, not a school-pilot readiness declaration.

## Working functionality

- Responsive overview, school-managed email/password sign-in, protected workspace and sign-out.
- Live Supabase school membership, role-scoped class visibility, and school selection with inaccessible-school denial.
- Administrator class creation persists in PostgreSQL, creates a calendar-year container when needed, records an audit entry and deduplicates retry keys. This does not configure official term dates or teaching days.
- Official curriculum reference register loaded from the database; four sources retain retrieval, applicability and rights distinctions. No teaching unit or curriculum version is published.
- Public health endpoint checks database availability; private account endpoint validates the authenticated user and current database membership.
- Pinned Next.js/React/Supabase packages, generated database types, lockfile, CI checks, security headers and no-store session responses. Browser code receives only a publishable project key; no service-role credential is used.

## Data boundary

Tenant tables use school-scoped foreign keys and live database policies. Teachers see allocated subjects and their learner rosters; learners see enrolled subjects and their own enrollment. Parent academic access remains denied until verified-link and reporting gates are implemented. User-editable metadata never grants authority. No institution client can directly edit memberships, enrollment, curriculum publication or audit records.

The only exposed write command is the validated class-creation RPC. Its invoker wrapper calls a private definer implementation with a fixed search path, explicit authentication, an active administrator membership check, school/membership locks, validation, audit and idempotency in one transaction. Revocation is checked before returning cached receipts. Other institutional provisioning remains an operator task; broad user-management authority has not been added to this initial release.

## Verification evidence

| Check | Evidence / outcome |
| --- | --- |
| PostgreSQL migration replay | Both migrations execute in a disposable PGlite PostgreSQL database before hosted application |
| Database and input tests | 14 tests pass: tenant boundaries, subject allocation, learner ownership, parent/expired access, direct-write denial, grade/tenant foreign keys, draft curriculum denial, idempotency and live revocation |
| Hosted database verification | `tests/hosted-rls.sql` passes as real `authenticated` role on the supplied Supabase PostgreSQL 17.11 project; synthetic records rolled back |
| Authenticated browser story | Real synthetic account signs in against Supabase; administrator creates a class; reload proves persistence; another school returns 404; sign-out and subsequent private access denial verified |
| Public browser checks | Four Playwright scenarios pass: navigation/keyboard, anonymous redirect/API and CSRF denial, mobile overflow, curriculum/source state |
| Accessibility inspection | Axe 4.13 automated inspection reports no violations on overview and sign-in after contrast fixes; desktop and 390px mobile layouts visually inspected |
| Application checks | Production build, TypeScript, ESLint and source credential-pattern scan pass; production dependency audit reports zero known vulnerabilities at check time |
| Specification checks | 25 operations, 18 event fixtures, 28 rejected event fixtures, 36 gate mappings and source/reference checks still pass |
| Supabase advisors | Security advisor clear; missing foreign-key indexes repaired; remaining performance notices concern unused indexes in the newly provisioned database |

Axe checks are not a complete WCAG audit. SQL role simulations do not replace all direct REST/storage or concurrent transaction tests. Local browser requests had substantial environment/provider latency; this is not a measured production service-level objective. A transient provider sign-out failure was observed; the route fails closed with a retry message and sanitized code/status logs. No real learner data is used.

## Deployment and operating model

- Vercel project: `curriculumos-south-africa`, in the connected owner's existing team. Production runtime: Node 22; Functions region `dub1`, near the existing Supabase `eu-west-1` database.
- Production environment uses the supplied Supabase project. Preview/development credentials are deliberately separate and are not copied from production. Configure an isolated project or local Supabase for those environments.
- The GitHub workflow runs specification, source, database, lint and build checks plus public browser checks. The authenticated browser test requires a separate synthetic fixture and is skipped without it; no production credentials are stored in CI.
- The deploy command is explicit; Git integration may also create builds. No deployment-check enforcement or protected-branch policy has been claimed.
- Deployment rollback restores application code only. These migrations are additive: leave the compatible database in place on app rollback. Do not drop tables to roll back once records exist. Use reviewed forward migrations for repairs.

## Provision the first school

An authorized operator must create the administrator's account through Supabase Auth's dashboard/admin provisioning flow (no public sign-up UI is exposed here), verify the intended school and user UUID, then insert the school and its `school_admin` membership in one reviewed transaction. Never infer the membership from an email domain or profile field. The administrator can then sign in and create classes. Teacher allocations and learner enrollment currently require reviewed operator provisioning as well.

No real school has been provisioned by this release. Temporary synthetic browser account, sessions, classes and schools must be removed after deployment verification. Do not reuse their test credentials for an operator or school account.

## Next milestone

W03: database-backed curriculum nodes and expectations, versioned lesson/activity authoring, independent academic/rights/accessibility review and publication controls, followed by the first interactive Grade 12 arithmetic-sequences renderer. Extend contracts as these commands are implemented. Keep learner publication disabled until named subject and applicability review is recorded.

Remaining W02 gates include a complete provisioning/revocation interface and direct API/concurrency coverage for new commands. W04–W10 remain pending: assignments, immutable submissions, marking/moderation, evidence, reporting, offline behavior, parent/district access, recovery and school-pilot approval. Hosting-transfer review, privileged MFA, retention and restore validation remain prerequisites for real-school use.
