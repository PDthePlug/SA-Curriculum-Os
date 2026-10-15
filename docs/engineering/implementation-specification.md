# CurriculumOS implementation specification v1.0

Date: 2026-10-15. Status: engineering baseline for review; application implementation pending.

## Authorized product and first outcome

Implement the approved Concept v1.0 as a modular, multi-tenant curriculum platform. Grades 8–12 are the initial architectural scope; Grade 12 examination readiness is the first delivery priority. Grade identifiers and curriculum versioning must allow eventual R–12 expansion without claiming that content already exists.

The first complete workflow is **teacher assignment → learner activity → immutable submission → marking and feedback → evidence → actionable reporting → teacher intervention and reassessment**. Prove it with Grade 12 Mathematics arithmetic sequences and finite arithmetic series. This is a formative teaching unit supporting examination preparation, not a complete Grade 12 subject or an approved formal SBA task.

The twelve modules remain the product scope. A single unit is the first acceptance boundary, not a replacement product definition. BIS and Applied Commerce stay independent. No psychological profiling, automated academic decisions or raw BIS reflections enter the pilot.

## Evidence and specification index

| Decision surface | Controlling specification |
| --- | --- |
| What exists and what may be reused | [Discovery and reuse](../audit/discovery-and-reuse.md) |
| Domain boundaries and deployment | [System design](../architecture/system-design.md) |
| Tables, keys, constraints and immutable versions | [Logical data model](../architecture/data-model.md) |
| Roles, relationships, privacy and tenant enforcement | [Authorization and governance](../architecture/authorization-and-governance.md) |
| Official source traceability and teaching unit | [Grade 12 Mathematics](../curriculum/grade12-mathematics.md), [source register](../curriculum/sources.json) |
| HTTP request/response shapes | [OpenAPI 3.1 contract](../../contracts/openapi.json) |
| Server fact envelope | [Event JSON Schema](../../contracts/learning-event.schema.json) |
| Metrics, event ownership, retries and offline behavior | [Evidence and synchronization](../architecture/evidence-and-sync.md) |
| Verification gates, dependencies and accountable roles | [Acceptance and backlog](acceptance-and-backlog.md) |

The OpenAPI contract covers the first unit's operational commands and reads, including a teacher queue, support follow-up and appeal/correction decisions. Identity provisioning, source ingestion, studio review screens and administrative APIs require additional contracts in their implementation work packages; this baseline does not imply every twelve-module API has been specified. Logical schemas are not executable migrations.

## First unit experience

1. A school administrator provisions a synthetic pilot school, Grade 12 class, Mathematics offering, learner enrollments and teacher allocation. No role is inferred from a profile field.
2. A curriculum reviewer checks the source mapping, year applicability, teaching plan, original worked examples and marking rules. An authorized publisher releases an immutable lesson and assessment version only after required review records exist.
3. An allocated teacher selects that version, assigns it to explicit enrolled recipients and sees the planned expectations and due date. Later content edits do not change assigned questions.
4. A learner opens only their assignment, completes a short prerequisite diagnostic, explores worked examples and practices with feedback. Drafts visibly distinguish local, synchronizing, saved, conflicted and rejected states.
5. The learner creates a formative attempt, saves responses and confirms an online submission. The server locks the exact response snapshot and returns a durable receipt. A timeout never creates a second attempt/submission on retry.
6. An allocated teacher marks the snapshot using the pinned rubric. Where moderation is required, another allocated moderator approves the marking round. Feedback remains private until the permitted release command succeeds.
7. The learner reads the released results and accessible feedback; the evidence view links those results to the exact work, content and marking versions. A correction issues a superseding release.
8. The teacher sees concept performance, missing evidence and unsubmitted work as different categories, records an intervention and assigns a fresh reassessment. Reports identify their denominators and calculation version.

## Assessment state contract

| Aggregate/state | Permitted next action | Conditions and durable history |
| --- | --- | --- |
| Content: draft | Request review | Complete source mappings, valid item schemas and bounded payloads |
| Content: in_review | Approve or return to draft | Assigned reviewer; academic, rights and accessibility records; author cannot self-approve required independent review |
| Content: approved | Publish | Authorized publisher; applicable sources reviewed; server calculates content hash |
| Content: published | Retire or create new draft version | No in-place prompt, rule or rubric edits |
| Attempt: draft | Save or submit | Current enrollment, dates/attempt policy, pinned items, optimistic revision check |
| Attempt: submitted | Start marking | Submission snapshot immutable; learner cannot reopen it |
| Marking round: draft | Complete | Allocated marker; criterion marks bounded; all required items resolved; total server-calculated |
| Marking round: completed | Moderate or release | Moderation required by pinned assessment policy; no skipped gate |
| Moderation: changes_requested | Create replacement marking round | Reason and predecessor retained; no silent edit of approved marks |
| Moderation: approved | Release | Independent moderator where required; releasing permission verified live |
| Result: released | Request appeal/correction | Learner can request review within published policy; cannot alter marks |
| Appeal/correction: requested | Approve/reject with reason | Allocated independent reviewer; replacement marking/moderation/release follows same controls |
| Result: superseded | Read historical version | Replacement release references prior release; metrics use latest valid release once |

An attempt's immutable submission and its marking/release states are separate records. Do not overload a single mutable status to erase earlier academic decisions. Submission revision mismatch, duplicate state transitions, missing moderation and unauthorized actors fail atomically with no outbox fact.

## Command transaction contract

Verify session and current relationships, lock the aggregate/authorization records consistently, check expected revision and state, validate pinned item/version membership, persist the domain mutation, append audit and outbox facts, and record the idempotency result in one transaction. Prevent revocation/transition races using row locks or an equivalent demonstrated serialization strategy. Never commit first and create the fact in a separate request.

Each mutating endpoint requires an `Idempotency-Key` UUID. Scope deduplication to school + verified actor + operation ID; hash canonical method, route and payload. Same key/same request returns its prior result after rechecking live read authorization; same key/different request returns 409. Authorization failures never return cached private receipts. Keep academic submission/release operation identities for the academic record lifetime; disposable practice operations have a separately documented retention policy.

Revision scope is explicit: activity save/clear uses the item draft revision; attempt response save/submit uses the attempt revision; marking completion/moderation uses the marking-round revision; result release and review/correction request use the `assessment_cases.revision` returned as `workflow_revision` by authorized submission/result reads. Completion and feedback acknowledgement use unique facts and idempotency without accepting a client completion percentage. A workflow revision can change without mutating its immutable submission or release.

Review-decision commands use the review-request revision; intervention follow-up uses the intervention revision. Approved appeals/corrections authorize a replacement marking round linked by `review_request_id` and `supersedes_round_id`. A replacement release must reference that approved request and `supersedes_release_id`, preserve required independent moderation and emit `result.corrected` instead of double-emitting an initial `result.released`. The initial release rejects supersession fields. Review approval itself never changes an academic mark. Intervention completion must link reassessment evidence or explicitly record why it was closed without reassessment.

Common HTTP semantics: 401 invalid session, 403 known scope but forbidden action, 404 inaccessible or missing resource without disclosing another tenant's existence, 409 revision/state/idempotency conflict, 422 invalid shape/domain content, 429 throttled. Cookie-authenticated mutations require same-origin/CSRF defenses. Logs use request IDs, never answer bodies or credentials.

## Build entry and exit

Begin with W01–W03 in the [backlog](acceptance-and-backlog.md): reproducible development/CI, tested school isolation, then source-reviewed immutable content. A synthetic end-to-end unit must pass W04–W07 before calling the flow complete. Offline support, operational recovery and privacy/content approvals must pass before real school use.

Do not treat the indicative Concept v1.0 weeks as commitments. Effort estimates follow subject review, environment choices, team capacity and implementation discovery. The supplied Supabase project is empty and active in `eu-west-1`; it is not a prevalidated production environment. No application, SQL migration, school data or deployment is introduced by this specification.
