# Discovery and reuse assessment

Initial inspection: 2026-10-14; CurriculumOS project, public table and migration inventories rechecked 2026-10-15 with the same empty baseline. Scope: repository and schema discovery, followed by a targeted Applied Commerce reuse assessment. This is not a full security audit or production certification of either existing product.

## Verified starting point

| Resource | Evidence | Finding | Consequence |
| --- | --- | --- | --- |
| `PDthePlug/SA-Curriculum-Os` | GitHub metadata, root contents request, `git ls-remote` | Empty public repository before initialization | No application, inherited schema, or prior implementation to preserve |
| CurriculumOS Supabase | Project details, table inventory, migration inventory, PostgreSQL catalog query | Active project; PostgreSQL 17.11; no public application tables or migrations; no custom application relations returned | Design the schema from first principles; empty advisor results do not prove security |
| Hosting region | Supabase project details | `eu-west-1` | Review cross-border processing and hosting agreements before real learner data |
| Security advisor | Supabase security advisors | No notices on the empty starting schema | Repeat after schema creation and supplement with adversarial tests |
| BIS | Two candidate repositories discovered; limited repository metadata inspected | Clone blocked by automatic approval review; production repository identity not established | No BIS code reuse is approved by this assessment |
| Applied Commerce | Source checkout at `e838dcaa2826284d335afcce58a93f4fe370287d` | South African baseline confirmed by README and code | Candidate patterns can be considered; no database or learner data copied |
| `Applied-Commerce-Za` | README at `c28fdabef6748190f25247e59017d92c241d775c` | Zimbabwe adaptation; references South African baseline | Excluded from the South African reuse candidate set |

Only CurriculumOS was initialized. Other repositories were read, not changed remotely. The connected CurriculumOS database received read-only inspection queries; no schema was applied.

## Applied Commerce: concrete reuse boundaries

Source links below point to the inspected commit, not a moving branch.

| Candidate | Source evidence | Decision | Required adaptation / verification |
| --- | --- | --- | --- |
| Stable response identities | [`lib/response-identity.ts`](https://github.com/PDthePlug/Applied-Commerce-/blob/e838dcaa2826284d335afcce58a93f4fe370287d/lib/response-identity.ts), `tests/response-identity.test.mjs` | Adapt the identity principle | Use immutable activity/item version IDs and enrollment/assignment context. Never map a changed question by position |
| Revision reconciliation | [`lib/learning-sync.ts`](https://github.com/PDthePlug/Applied-Commerce-/blob/e838dcaa2826284d335afcce58a93f4fe370287d/lib/learning-sync.ts), `tests/learning-sync.test.mjs` | Candidate pure algorithm | Add school, account, device, assignment and content version scopes; deletion tombstones; operation idempotency; revoked access handling |
| Answer-bound reviews | [`lib/evidence/current-reviews.ts`](https://github.com/PDthePlug/Applied-Commerce-/blob/e838dcaa2826284d335afcce58a93f4fe370287d/lib/evidence/current-reviews.ts), `supabase/migrations/20261012091449_protect_assessment_decisions.sql` | Adapt review snapshot rule | Tie marks to immutable submission versions, assessment versions and rubric versions; add moderation, release and correction history |
| Controlled writes | [`supabase/migrations/20261012103733_require_revision_checked_writes.sql`](https://github.com/PDthePlug/Applied-Commerce-/blob/e838dcaa2826284d335afcce58a93f4fe370287d/supabase/migrations/20261012103733_require_revision_checked_writes.sql) | Adapt command-boundary pattern | Reimplement against new tenant model. Test direct Data API bypass, membership revocation, live session checks, and function grants |
| SSR client patterns | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/proxy.ts` | Inspect further before extracting | Validate current official SSR docs, cookies, cache isolation and server identity verification; no blanket copy |
| Reader / semantic activities | `lib/curriculum.ts`, README semantic rendering contracts | Reuse interaction design selectively | New activity registry with explicit types, accessible math and bounded expressions; do not import workbook parser semantics as CAPS requirements |
| Evidence taxonomy | `lib/evidence/engine.ts`, `lib/evidence/types.ts`, `lib/evidence/taxonomy.ts` | Rebuild domain definitions | Existing engine infers evidence kind from text and uses a five-year developmental taxonomy; this is not an academic mastery model |
| Curriculum loader | `lib/curriculum.ts` | Replace data delivery design | Current compiled grade bundles and release constant are product-specific; build source-reviewed versioned curriculum records and immutable content packs |
| Teacher data loading | `lib/facilitator/supabase-data-source.ts` | Reuse workflow ideas only | Current flow reconstructs learner records and permits broad platform-admin reads. CurriculumOS needs subject/class scopes, paginated server aggregates, and restricted support access |
| Production migrations | `supabase/migrations`, `supabase/legacy-production-migrations` | Do not transplant | Historical product schema, seeded releases and permissions belong to Applied Commerce |
| Content / manuscripts | `content/source-books`, `public/curriculum` | Excluded | Authoring rights, CAPS mapping and academic review require their own approval; no content license inferred |

## Verification actually performed

- Inspected repository identities, commit, scripts, content loading, response identity, reconciliation, evidence types, answer snapshots, facilitator loader, and selected SQL access boundaries.
- Reran `tests/evidence-engine.test.mjs`, `tests/learning-sync.test.mjs` and `tests/response-identity.test.mjs` on 2026-10-15: **25 checks passed** (11 sync behavior, eight identity/portfolio/loading/merge behavior, six source-contract checks). The source-contract checks are not runtime proof of dashboard or database behavior.
- Resolved the earlier missing TypeScript dependency using an isolated temporary harness with the repository-pinned `typescript@5.9.3`. Tests were copied unmodified and referenced the inspected checkout's source/assets through local links; initial harness omissions were corrected before the passing run. No source dependency ranges or remote Applied Commerce files changed. These results validate candidate behavior in the existing product, not adaptation to CurriculumOS.
- Did not run a full Applied Commerce dependency installation, build, browser acceptance suite, or live database tests. No production readiness conclusion follows.
- Retrieved the Supabase changelog and reviewed relevant TLS and PostgreSQL 17.11 notices. Low-cost device testing must cover supported TLS stacks; use plain relational prerequisites initially, avoiding unnecessary extension dependencies.

## Unresolved items

1. Confirm which BIS repository and deployed revision is authoritative, then complete its code/security/data-separation audit once access is permitted.
2. Existing candidate algorithm checks now pass; extraction still requires CurriculumOS-specific tests for tenant/account scoping, revocation, immutable versions, tombstones and operation idempotency before adoption.
3. Verify CurriculumOS Auth configuration, redirect allowlists, MFA enforcement, storage policies, backup/PITR entitlement, alerting, and deployment environments. Project status alone verifies none of these.
4. Complete a rights review before moving any existing content or shared component into this public repository.
5. Keep credentials, learner examples, real school rosters, restricted manuscripts and sensitive BIS evidence out of this public repository.
