# Acceptance gates and implementation backlog

All gates below are **pending implementation**. Passing specification validation does not satisfy any runtime gate. Roles identify responsibilities; actual people and evidence URLs must be assigned before release.

## Acceptance register

| Gate | Executable acceptance scenario / evidence required | Owner role |
| --- | --- | --- |
| CUR-01 | Every published expectation resolves to source ID/hash, exact page/section, applicable year/jurisdiction and named reviewer/date; missing mapping blocks publishing | Curriculum lead |
| CUR-02 | Import a new curriculum/ATP version without rewriting existing assignments or evidence; compare additions/removals | Curriculum lead |
| CUR-03 | Verify 2026 retention circular, Grade 12 subject plan, later directives and assessment provisions; record applicability independently of source retrieval | Subject specialist |
| CNT-01 | Draft → independent review → approval → publication; incomplete academic/rights/accessibility reviews fail atomically | Content lead |
| CNT-02 | Assigned lesson stays unchanged when a new version is published; retired content blocks new assignment but preserves authorized historical evidence | Content lead |
| CNT-03 | Numeric, expression and written activities work with keyboard/screen reader; answer rules and unreleased memo absent from network payloads and packs | Accessibility/QA lead |
| LRN-01 | Own enrolled learner opens assignment; same-school unassigned learner and other-school learner denied through UI and direct API | QA lead |
| LRN-02 | Draft save, reload, revision conflict and validation errors preserve correct work; local pending status never says saved/submitted | QA lead |
| LRN-03 | Complete diagnostic, examples, practice and formative work; completion and correctness visibly differ | Subject/QA lead |
| TCH-01 | Allocated Mathematics teacher assigns to explicit recipients and marks that scope; another subject teacher cannot read or mark it | QA lead |
| TCH-02 | Teacher records support based on specific evidence and follows up using a new reassessment; reports link action and later evidence | Subject lead |
| ASM-01 | Submit freezes exact item/assessment/rubric versions; lost HTTP response + retry yields one submission; stale drafts reject | Backend/QA lead |
| ASM-02 | Learner cannot set marks; marker cannot exceed maxima; missing required criteria block completion; totals calculated server-side | Assessment lead |
| ASM-03 | Required moderation cannot be bypassed; marker cannot self-moderate; unreleased result inaccessible to learner/guardian | Assessment lead |
| ASM-04 | Appeal/correction records reason, authority and replacement marking/release history; old result remains immutable; report counts latest valid release once | Assessment lead |
| INT-01 | Ten-recipient fixture yields 8 submitted, 6 released, 2 awaiting release, 2 unsubmitted; academic mean uses six valid results | Analytics/QA lead |
| INT-02 | No/insufficient evidence yields null with reason; 100% completion and 20% performance coexist; mastery percentage absent | Analytics lead |
| INT-03 | Replay duplicate and out-of-order facts and rebuild projections; no double counting or stale release override; watermark shown | Backend/analytics lead |
| EVD-01 | Released mark links to exact submission/content/rubric/marker decision; private artifact scan/signing authorization tested | Evidence/security lead |
| EVD-02 | Submitted snapshots and academic history resist draft update/delete and ordinary membership removal; reviewed retention workflow demonstrated | Evidence lead |
| ADM-01 | Provision school/year/class/subject/allocations/enrollments; composite tenant FKs reject cross-school parent IDs | Database lead |
| ADM-02 | Revoking enrollment or allocation blocks next command/query; revoke racing a submission cannot commit after authorization is invalidated | Database/security lead |
| PAR-01 | Verified guardian sees only allowed released linked-learner results; unverified link, classmates and raw BIS reflection denied | Security lead |
| PAR-02 | Revoke guardian link and block next server access; short-lived signed URL limitation documented/tested | Security lead |
| RPT-01 | Teacher report exposes item/concept errors, marking queue and support due; school view has distinct coverage/distribution measures | Analytics lead |
| RPT-02 | District scope requires explicit school grants; small/complementary cells and differencing filters suppressed; exports audited | Privacy/analytics lead |
| RPT-03 | Snapshot shows population, denominator, missing evidence, metric version, watermark and freshness; unauthorized drilldown denied | Analytics lead |
| OFF-01 | Download pinned pack, verify every hash/size; expired/changed/revoked pack never silently upgrades assignment content | Offline/QA lead |
| OFF-02 | Two devices edit same revision; conflict preserves both candidates; retry and tombstone do not duplicate/resurrect work | Offline/QA lead |
| OFF-03 | Offline final submit stays pending until online receipt; client clock manipulation cannot change submission time/deadline | Offline/security lead |
| OFF-04 | Logout, account switch, browser back and offline restart expose no previous learner data on shared devices; revoked queue rejected on reconnect | Security/QA lead |
| GOV-01 | Direct REST/RPC/views/storage authorization matrix passes for two schools, multiple subjects, learner/teacher/admin/guardian/anonymous and expired grants; advisors supplemented with adversarial tests | Security lead |
| GOV-02 | Privacy/children's processing basis, hosting-transfer review, rights, notices, retention, support access and incident contacts approved for pilot | School/privacy lead |
| GOV-03 | Restore synthetic backup into isolated environment; demonstrate approved RPO/RTO, object consistency, key separation and recovery runbook | Operations lead |
| GOV-04 | Browser/API/worker trace proves full flow; supported low-cost devices, keyboard/screen-reader, throttled/offline network and p95 load targets tested | QA/operations lead |
| GOV-05 | Secret scanning, MFA for privileged actions, sanitized logs, deploy rollback, bounded jobs/dead-letter replay and alerts demonstrated | Operations/security lead |

PAR-01–02 and RPT-02 are required before enabling parent/district features, not prerequisites to a synthetic teacher/learner unit. Such features stay disabled until their gates pass. OFF-01–04 are required before a school pilot advertised as supporting offline practice.

## Dependency-ordered work packages

| ID | Concrete implementation output | Dependencies | Gates / exit | Accountable role |
| --- | --- | --- | --- | --- |
| W01 | Pin supported stack and lockfile; local/staging separation, CI contract checks, synthetic fixtures and secret scan; hosting/worker decision record | None | Reproducible clean checkout; environment inventory | Engineering lead |
| W02 | Generate and test identity/school schema, relationship authorization, private helpers, RLS/storage policies and direct bypass tests | W01 | ADM-01–02, GOV-01 | Database/security lead |
| W03 | Source ingestion, curriculum versions/mappings, authoring review/publish commands and accessible renderer for first unit | W01 | CUR-01–03, CNT-01–03 | Curriculum/content lead |
| W04 | Assignment and recipient model; learner workspace, revision-checked drafts, server completion rules and teacher roster queries | W02, W03 | LRN-01–03, TCH-01 | Application lead |
| W05 | Attempts, snapshots, rubrics, marking, moderation, releases, appeals/corrections, private evidence retrieval | W04 | ASM-01–04, EVD-01–02 | Assessment/backend lead |
| W06 | Transactional outbox/worker, shared metric projections, distinct learner/teacher/school reports, intervention and reassessment | W05 | INT-01–03, TCH-02, RPT-01/03 | Analytics lead |
| W07 | Real browser role sessions traverse first unit; direct database/security checks and rollback/failure fixtures | W02–W06 | Synthetic unit passes; defects resolved; no real learner data | QA lead |
| W08 | Trusted-device content packs, shared-device defaults, revision/idempotency sync, purge/conflict screens and network tests | W04, W07 | OFF-01–04 | Offline lead |
| W09 | Backup restore, load/accessibility/device validation, operational runbooks and privacy/rights approval evidence | W07, W08 | GOV-02–05; pilot go/no-go with named signatories | Release lead |
| W10 | Verified parent portal and suppressed district reports, each with additional endpoint contracts | W06, W09 | PAR-01–02, RPT-02 | Product/privacy lead |

W02 and W03 can be developed independently once W01 is established; their authorization/content boundaries must agree before W04. No migration is applied to the supplied live project by this architecture baseline. Each schema package needs a reviewed migration, reproducible staging execution, rollback/forward-repair plan and actual authorization evidence before promotion.

## Evidence packet required for release

For each gate record owner name, build/commit, environment, timestamp, fixture/data classification, command or browser trace, expected and actual outcome, defects/waivers, approver and durable evidence link. A screenshot, empty advisor list, source-code regex check or dashboard mock alone is insufficient runtime evidence. Current contract validation results belong to the specification review, not the runtime gate register.

## Open decisions

1. Name the pilot school, province, academic year, responsible curriculum reviewer and privacy approver before publication.
2. Select hosting/worker products and supported devices after cost, region and durability verification; inspect Auth allowlists, MFA and backup entitlement.
3. Establish authoritative BIS repository/revision when access permits; BIS reuse remains unverified and nonblocking.
4. Approve content rights and original item/rubric quality; six-page/digital lesson volume is not a quality proxy.
5. Estimate implementation capacity after W01–W03. Do not promise nationwide subject coverage based on one working unit.
