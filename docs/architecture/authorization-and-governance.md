# Authorization and information governance

Design, not a compliance certification. Baseline principle: identity + current school membership + explicit resource relationship + permitted action. Client role labels and user-editable metadata never authorize access.

## Permission matrix

| Principal | Curriculum/content | Learner responses | Mark / moderate / release | Institution data | Reports |
| --- | --- | --- | --- | --- | --- |
| Learner | Published assigned content and permitted catalogue | Own current drafts and own submitted/released work | Cannot set marks; submit own attempt through command | Own enrollment summary | Own measured results, completion and support plan |
| Teacher | Published content; assigned authoring rights | Assigned class/subject learners only | Mark allocated work; moderate/release only with explicit allocation/policy | Assigned rosters | Assigned class/subject scope |
| Subject moderator | Reviewed assessment scope | Submitted evidence allocated for moderation | Moderate allocated rounds; cannot approve own marking where independence required | Minimal relevant roster | Moderation queue and authorized subject summaries |
| School administrator | Curriculum assignments/configuration | No unrestricted reflection access; academic access only by documented duty | Administrative role alone does not grant marking | School staff, classes and enrollments | School academic aggregates and permitted academic records |
| Guardian | Relevant released curriculum summary | Published academic feedback and evidence categories explicitly allowed | None | Verified linked learner summary only | Released results and agreed interventions; no classmates |
| District user | Public/reviewed curriculum metadata | No raw responses by default | None | Explicitly granted schools' aggregate scope | Suppressed/aggregated reports; no arbitrary drilldown |
| Curriculum reviewer | Draft content/source mappings in assigned subject | No learner work | Content approval, not learner marking | None | Content quality/coverage |
| Platform operator | Operational configuration | None by default | None by default | Provisioning metadata | Technical telemetry; exceptional tenant access needs expiring grant |
| Anonymous | Public marketing/catalogue metadata if enabled | None | None | None | None |

School staff can hold multiple scoped roles. A teacher assigned to Mathematics must not gain another subject's raw submissions merely because the learner belongs to the same school. Historical academic access after transfers must be deliberately granted and audited rather than silently inherited.

## Enforcement

1. Verify session on the server using the documented current Auth method. For privileged transitions, verify MFA level and live active authorization records; revoked membership takes effect without waiting for a refreshed JWT role claim.
2. Derive actor from verified identity. A route school ID is a requested scope, checked against database membership. Never accept client-supplied owner, role, marker identity or total mark as authoritative.
3. Domain service checks relationship and academic state, validates input, then commits mutation + outbox + audit in one transaction. RLS and database grants protect direct access independently.
   Ordinary application reads/writes use the caller's verified database identity, preserving RLS. A server-wide secret key is not a substitute for tenant authorization. Workers use narrowly scoped privileges and explicit school/resource arguments; privileged transactional helpers require the same live relationship checks and negative tests as HTTP routes.
4. Private privileged helpers use fixed/empty search paths, minimum execution grants, explicit identity/relationship checks, and security tests. Prefer invoker functions. Any necessary definer helper has a documented reason and cannot be used as a generic permissions bypass.
5. Protect reporting views with caller permissions (`security_invoker` on supported PostgreSQL) or keep inaccessible private projections behind scoped queries.
6. Storage signing checks school/resource relationship and scan status. Short-lived URLs limit but do not guarantee immediate revocation after issuance; select a short TTL and verify deletion/access behavior.
7. Support access is purpose-limited, approved, expiring and audited. There is no permanent platform-admin view of all children's work.

## Privacy controls for children

The Information Regulator's guidance describes restrictions on processing children's information and section 35 exceptions. Document the applicable lawful basis with a qualified school/privacy reviewer for each processing purpose. Do not claim that every learner must use the same legal exception or that every case requires Regulator authorization.

| Information / action | Required design control |
| --- | --- |
| School enrollment and assessment | Minimum fields, purpose record, reviewed legal basis, role-scoped access, academic retention policy |
| Guardian linkage | Verify authority/relationship independently of supplied name/email; record scope and revoke promptly |
| Optional BIS connection | Separate explicit purpose and permission; no automatic reflection transfer; no raw reflective data in school/district reports |
| AI assistance | Off by default in first unit; if enabled later, minimize provider payload, record assistance provenance and permit human correction; no official mark or psychological profile |
| District / partner reports | Minimum population threshold, complementary suppression, restricted filter combinations and export audit to reduce differencing/re-identification risk |
| Device cache | Shared-device mode defaults to no persistent learner work; opt-in trusted-device persistence has clear account scope and deletion controls |
| Correction/deletion/withdrawal | Track purpose and retention obligation; quarantine pending requests where needed; remove projections/object caches consistently without falsifying academic history |
| Hosting and subprocessors | Current database region is `eu-west-1`; review section 72 transfer basis, operator terms and onward transfer before real learner data |

Source: [Information Regulator guidance on children's information](https://inforegulator.org.za/wp-content/uploads/2020/07/GuidanceNote-Processing-PersonalInformation-Children-20210628-1.pdf). Cross-border review must use the current Act and applicable agreements; region location alone does not prove a violation or compliance.

## Threats to prove mitigated

| Threat | Required proof |
| --- | --- |
| Cross-school guessed IDs | Direct REST/RPC/storage and app-route denial fixtures |
| Self-elevation | Membership/metadata/claim tampering cannot change authority |
| Answer/memo leakage | Learner response serialization, downloads and pack assets contain no hidden rules or unreleased memo |
| Mark/feedback spoofing | Learner-origin event or command cannot create marking/release facts |
| Shared-device leakage | Account switch, logout, browser back and offline reload do not reveal previous learner's cached work |
| Malicious upload/content | Quarantine, sanitization, content restrictions, bounded math input, CSP and file tests |
| Stale authority | Revoked enrollment/guardian/support grant rejected on next server command |
| Aggregate re-identification | Low-count and complementary suppression plus restricted exports/filters |
| Credential exposure | Secret scanning; server keys absent from public builds and repo; public project URL is not authorization |

## Release governance

Before a real school pilot: approved privacy notice and processing records, content rights, current curriculum review, tested RLS/storage, MFA for privileged accounts, verified backups and restore, incident contacts, independent accessibility review, performance results and actual end-to-end acceptance evidence. Each gate has a named owner and dated evidence link. Empty advisor output is never sufficient.
