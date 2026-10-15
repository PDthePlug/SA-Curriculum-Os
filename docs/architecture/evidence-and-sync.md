# Evidence, events, metrics and offline synchronization

This is a proposed contract. No analytics model or offline implementation is deployed.

## Distinct metric definitions

All metrics include code/version, school and subject scope, population definition, numerator, denominator, missing evidence count, generated timestamp and source watermark. Empty denominators yield `null` with `insufficient_evidence`, never zero percent.

| Metric v1 | Classification | Calculation and evidence | Limits / audience |
| --- | --- | --- | --- |
| `lesson_completion` | Observed rule-based fact | Completed required activities / required activities in the assigned immutable lesson; server checks response presence/required review steps | Interaction completion, not correctness or learning; learner/teacher |
| `delivered_coverage` | Calculated | Distinct reviewed expectations in lessons the teacher records as delivered / planned expectations for that class and period | Delivery requires teacher attestation; assignments alone do not prove teaching; class/school |
| `assessed_coverage` | Calculated | Planned expectations with at least one released marked item / planned expectations for that class/period | Indicates assessment evidence only; narrow unit cannot become whole-topic coverage |
| `released_mark` | Calculated authoritative decision | Sum of released item marks / sum of corresponding item maxima ×100, using latest valid release | Pending work shown separately; no AI or client total; learner/teacher |
| `concept_performance` | Calculated | Released earned marks / available marks for items mapped to the concept | Show item count, evidence dates, hint/attempt context, absent work; not mastery |
| `unsubmitted_count` | Observed | Explicit assignment recipients lacking a committed submission at snapshot time | Split not-due/overdue/excused; no zero academic mark inferred |
| `feedback_reviewed` | Observed interaction | Accepted learner acknowledgement tied to release ID | Records interaction, not proof of comprehension |
| `intervention_followup` | Observed + teacher judgement | Recorded support action, review date, reassessment references and teacher outcome | No causal claim that the platform caused score changes |
| `mastery_estimate` | Inferred, disabled | No value until model/evidence thresholds/uncertainty/calibration approved | Do not show experimental percentage in first pilot |

For multi-concept items, assign reviewed criterion-level marks to concepts without double counting overall marks; if not available label the mapping non-additive. Class academic means show number of valid results and number missing; do not average percentages from incompatible assessment versions without a documented weighting. School rollups use defined populations, never averages of class percentages by accident.

Teacher report: missing submissions, item/concept error patterns, marking queue and intervention follow-ups. Learner report: their work, feedback and next practice. School report: delivered/assessed coverage, results distribution and support follow-up within authorized duties. District reports are deferred until explicit grants and suppression tests pass; proposed minimum cell count 10 needs privacy review and complementary suppression. Repeated filters and exports must not reconstruct small groups.

## Event ownership and projection

The [event schema](../../contracts/learning-event.schema.json) validates server facts. A client never posts arbitrary fact envelopes. Client telemetry, if later accepted, is a separate allowlisted untrusted schema and cannot assert scores, releases or completion.

| Event type | Authoritative producer / transaction | Minimal reference |
| --- | --- | --- |
| `assignment.created` | Authorized assignment command | assignment + pinned lesson version |
| `curriculum.delivery_recorded` | Allocated teacher attestation | delivery record + assignment |
| `lesson.completed` | Domain completion rule | assignment recipient + lesson version |
| `assessment.submitted` | Snapshot commit | attempt + submission version + assessment version |
| `marking.completed` | Validated marking round | submission + marking round |
| `moderation.recorded` | Allocated moderator command | marking round + moderation record |
| `result.released` | Controlled release | submission + release + marking round |
| `result.corrected` | Superseding release command | old and new release IDs |
| `feedback.reviewed` | Authorized learner acknowledgement | release ID |
| `intervention.recorded` | Assigned teacher command | intervention + enrollment |
| `activity.draft_saved` / `activity.draft_cleared` | Authorized revision-checked save/tombstone | assignment recipient + item; no answer body |
| `assessment.attempt_created` / `assessment.response_saved` | Authorized attempt command | attempt + assessment version or item |
| `marking.round_created` | Allocated marker command | submission + marking round |
| `academic.review_requested` / `academic.review_decided` | Authorized requester / allocated independent reviewer | review request + release |
| `intervention.updated` | Assigned teacher follow-up | intervention + enrollment |

An event contains IDs and versions, not names, responses, marks arrays or reflective text. Workers obtain any needed evidence through scoped internal queries. Server timestamps are authoritative; client clocks do not determine lateness. Track event ID and aggregate revision; do not assume arrival order. Consumers persist a receipt atomically with projection updates and rebuild from immutable source state if a revision gap appears. Replaying an old event cannot replace a newer release. Dead-letter entries retain references and sanitized errors, with audited replay.

## Offline permission boundary

| Function | Offline policy for first pilot |
| --- | --- |
| Download assigned published lessons | Online authorization before pack issuance; manifest pins versions, hashes, expiry and allowed asset paths |
| Read downloaded learning content | Allowed on trusted devices within the pack policy; no hidden answers, memo or unreleased feedback |
| Practice/draft responses | Local pending drafts permitted only on explicitly trusted devices; not server evidence until accepted |
| Automatic practice marking | Online server rules initially; offline response remains unmarked until sync |
| Formal/timed assessment, final submission | Online only; local action says pending, never submitted; formative final submit also requires online acknowledgement |
| Teacher marking/moderation/release | Online only; no cached authority |
| Shared device | No persistent personal drafts or private results by default; public content cache partitioned from accounts |
| Revoked membership/content | Next online command denied; purge scoped private cache on reconnect; already downloaded bytes cannot be remotely guaranteed erased while disconnected |

Trusted-device storage must be partitioned by account + school + assignment + content version. Logout/account switch purges IndexedDB, Cache Storage, service worker personal caches and in-memory state; browser-back and offline reload are tested. The service worker must never cache auth endpoints, API private responses or signed URLs through generic cache-first rules. Encryption with a key stored beside the cache is not adequate protection on a shared device. School-managed device policy may disallow persistence entirely.

## Sync command and conflict rules

Each draft operation includes a UUID operation ID, pinned assignment/item/content IDs, expected server revision and validated response. New entity uses expected revision 0; update requires exact current revision. Server derives actor/tenant, rechecks enrollment and assignment, checks idempotency and commits accepted draft plus receipt atomically.

- Same operation and request retry returns the prior accepted result after authorization; never increments revision twice.
- Same ID with different method/route/body returns `IDEMPOTENCY_CONFLICT` (409).
- Competing edits with stale revision return `REVISION_CONFLICT` (409) and an authorized current draft. Preserve the local candidate for explicit comparison; do not silently apply last-write-wins or rebase a different answer.
- A changed prompt uses a new version. Old drafts stay tied to old assignment; no position-based answer migration.
- Offline deletion is a revision-checked tombstone; delayed retry cannot resurrect a deleted draft. Submitted snapshots cannot be deleted through draft sync.
- Revoked access returns 403/404 without leaking current response. Stop retries and purge scoped server-derived cache; show a clear rejected status. Never upload another user's pending queue after account switch.
- Apply batches per operation with per-operation outcomes; partial successes are explicit. Retry network/429/temporary 5xx with bounded exponential backoff and jitter; 409/422/403 require resolution, not endless retry.

Proposed pack expiry is seven days for trusted-device practice; school privacy review can shorten/disable it. Enforce expiry using last observed trusted server time with rollback detection, while acknowledging that a hostile offline client can bypass local expiry. Protect revocable confidential data by not placing it in packs. Academic submissions and feedback remain online.

## Report acceptance example

In a synthetic ten-learner class, eight submit and six have released marks. Report `submitted=8/10`, `released=6/10`, `awaiting_release=2`, `unsubmitted=2`; the academic average uses six released results. A learner finishing every interaction but scoring 4/20 has complete interactions and 20% measured performance. Neither fact becomes a mastery estimate. Correcting one release recalculates the snapshot once and retains its predecessor lineage.
