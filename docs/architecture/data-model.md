# Logical database specification

Status: proposed schemas and constraints, not executed SQL. No migration is supplied in this architecture PR. Engineers must generate migrations with the current Supabase CLI, test them in a disposable/staging database, and run advisors before applying reviewed changes to the live project.

## Shared invariants

- UUID primary IDs; UTC `timestamptz` storage; school-local calendars use `Africa/Johannesburg` explicitly. Grade code is text (`R`, `1`…`12`); do not overload zero.
- Every tenant-owned table has `school_id NOT NULL` referencing `schools`. Every tenant-parent reference uses `(school_id, parent_id)` → `(school_id, id)` composite foreign keys. IDs alone cannot enforce tenant agreement.
- Add `UNIQUE(school_id,id)` to referenced tenant tables, plus indexes beginning with `school_id` for normal scoped queries. Unique business keys include school/year/class context.
- Authoritative user identity references `auth.users(id)`; display profile and institution records do not independently prove authorization.
- All exposed tables enable RLS before grants. Private schema stays outside the Data API. Deny direct client mutation of authorization records, content publication, scores, moderation, final submissions, audit logs and projection data.
- Draft mutable records use integer `revision >= 1`; update atomically on expected revision. A new record uses expected revision zero. Published versions and submitted snapshots are append-only; corrections supersede rather than overwrite.
- JSONB is allowed for validated activity configuration/response payloads. Referential, enrollment, version and academic state constraints remain relational.
- No cascade delete of submitted work, academic decisions or audit evidence via ordinary membership removal. Deletion is a reviewed retention workflow, including objects, projections and backups.

## Identity and institutions

| Table | Essential fields | Keys / rules |
| --- | --- | --- |
| organizations | id, name, type, status | Network/district grouping, not a data-access grant |
| schools | id, organization_id?, name, external_reference?, timezone, status | School is tenant root; external reference verified if used |
| user_profiles | user_id, display_name, preferred_language | Identity-wide minimal profile; own reads/updates with field restrictions |
| school_memberships | id, school_id, user_id, role, status, valid_from/to | Multiple role rows supported; unique active user/role per school; self-role elevation forbidden |
| academic_years | id, school_id, year, starts_on, ends_on | Unique school/year; dates ordered |
| academic_terms | id, school_id, academic_year_id, label, starts_on, ends_on | Terms validated within year; no assumed four-term rule for other curricula |
| classes | id, school_id, academic_year_id, grade_code, name, status | Unique school/year/name |
| class_subjects | id, school_id, class_id, subject_id, curriculum_version_id | Subject belongs to version/phase and grade offering |
| teaching_allocations | id, school_id, class_subject_id, teacher_id, status, valid_from/to | Active teacher membership required; dates and subject scopes enforced |
| enrollments | id, school_id, class_subject_id, learner_id, status, enrolled_at, ended_at | Active learner membership required; retain historical enrollment |
| guardian_links | id, school_id, learner_id, guardian_id, verified_by, verified_at, status, scope | Relationship evidence and revocation; consent record is not a guardian login grant |
| district_school_grants | id, school_id, district_user_id, purpose, scope, expires_at, approved_by | Explicit aggregate authority; no raw learner access by default |
| support_access_grants | id, school_id, user_id, purpose, allowed_resources, expires_at, approved_by | Time-bound elevated access; MFA and audit required |

## Curriculum domain (global, controlled publication)

| Table | Essential fields | Keys / rules |
| --- | --- | --- |
| curriculum_frameworks | id, code, jurisdiction, name | Separate curriculum framework from content product |
| curriculum_versions | id, framework_id, edition, valid_from/to, status, supersedes_id | Reviewed applicability; published versions immutable |
| curriculum_sources | id, issuer, title, url, retrieved_at, sha256, document_version, applicability_status, rights_status | Source provenance; historical document is not proof of current applicability |
| grades / subjects | id, framework_id, code, phase, name | Phase-specific subject identity; Natural Sciences is not assumed a Grade 10 subject |
| curriculum_nodes | id, version_id, subject_id, grade_id, parent_id?, kind, stable_code, title | Parent within same subject/grade/version; no cycles; kind taxonomy explicit |
| learning_expectations | id, node_id, stable_code, expectation_text, source_mapping_id, status | Reviewed educational expectation; no invented official wording |
| curriculum_source_mappings | id, node_id/expectation_id, source_id, printed_page, pdf_page, section, reviewer_id, reviewed_at | At least one traceable verified reference per official expectation |
| curriculum_prerequisites | version_id, from_node_id, prerequisite_node_id, rationale, origin, reviewer_id | No cycles; educational prerequisite inference labeled separately from official policy |
| teaching_plan_versions | id, source_id, academic_year, province_scope?, status | Review year/jurisdiction; never relabel old ATP as current |
| teaching_plan_entries | id, plan_version_id, node_id, term_label, sequence, planned_minutes? | Scheduling kept separate from topic identity; override history retained |
| assessment_requirements | id, curriculum_version_id, subject_id, grade_id, requirement_type, source_id, configuration, status | Current formal requirements verified before activation; no default SBA weights guessed |

## Content and delivery

| Table | Essential fields | Keys / rules |
| --- | --- | --- |
| lessons | id, owner_school_id?, stable_code, title | Global curated or school-authored; sharing scope explicit |
| lesson_versions | id, lesson_id, version, language, state, content_hash, created_by, published_at | draft → in_review → approved → published → retired; source edits create new version |
| lesson_expectation_links | lesson_version_id, expectation_id, relationship | Coverage is explicit; lesson existence does not imply learner mastery |
| activity_versions | id, lesson_version_id, stable_activity_id, type, schema_version, position, public_configuration | UUID identity stable within a published version; changed prompts get new versions |
| activity_items | id, activity_version_id, item_code, public_prompt, response_schema, concept_links | Response accepted only against its pinned item version |
| private.answer_rules | activity_item_id, rule_version, rule_type, configuration, reviewer_id | No learner-facing answer-rule selection or downloads |
| content_reviews | id, lesson_version_id, reviewer_id, review_type, outcome, notes, reviewed_at | Academic, accessibility and rights review records required for publish |
| media_assets | id, owner_school_id?, object_key, sha256, media_type, bytes, rights_reference, scan_state | Private until publish policy permits; no student upload enters public content accidentally |
| content_packs | id, lesson_version_ids, language, manifest_hash, size_bytes, state | Immutable pack manifest and asset hashes |
| assignments | id, school_id, class_subject_id, lesson_version_id, assessment_version_id?, due_at?, release_at, status | Teacher authorized for class/subject; pinned content; assigned expectations snapshot |
| assignment_enrollments | id, school_id, assignment_id, enrollment_id, status | Explicit recipients; roster changes do not silently attach historical work to another class |
| learner_activity_drafts | id, school_id, assignment_enrollment_id, activity_item_id, learner_id, response, revision | Unique recipient/item; server-derived owner; payload validated; not an official mark |
| learning_completions | id, school_id, assignment_enrollment_id, lesson_version_id, rule_version, completed_at | Completion checked by domain rule, not self-awarded analytics events |

Global content availability is independent of tenant access to learner work. School-authored content remains private until an explicit review and sharing decision.

## Assessment and evidence

| Table | Essential fields | Keys / rules |
| --- | --- | --- |
| assessments | id, owner_school_id?, title, purpose | Practice, formative, formal and revision purposes distinct |
| assessment_versions | id, assessment_id, version, state, max_marks, policy_version_id?, rubric_version_id?, content_hash | Approved specification and memo kept separate from learner delivery |
| assessment_items | id, assessment_version_id, public_prompt, max_marks, concept_id, marking_mode | No hidden rules or memo in learner queries |
| rubric_versions / rubric_criteria | id, rubric_id, version, criterion_code, max_marks, descriptors | Immutable version at review; total matches permitted marks |
| attempts | id, school_id, assignment_enrollment_id, assessment_version_id, learner_id, attempt_number, state, revision | Unique recipient/attempt number; attempt limit and dates checked server-side |
| attempt_drafts | id, school_id, attempt_id, assessment_item_id, response, revision | Owner edit only while attempt draft; consistent item/version membership |
| assessment_cases | id, school_id, attempt_id, current_submission_version_id, current_release_id?, revision | Mutable workflow coordinator; locks marking/release/review transitions; immutable evidence remains in separate tables |
| submission_versions | id, school_id, attempt_id, version, assessment_version_id, submitted_at, response_manifest_hash | Created atomically from drafts; immutable after commit |
| submitted_responses | id, school_id, submission_version_id, assessment_item_id, response, artifact_id? | Immutable exact evidence seen by markers |
| marking_rounds / item_marks | id, school_id, submission_version_id, marker_id, rubric_version_id, item_id, marks, rationale, state | No self-marking; marks within item maxima; total calculated server-side |
| moderation_records | id, school_id, marking_round_id, moderator_id, outcome, reason, recorded_at | Independent reviewer where policy requires; supersession retained |
| result_releases | id, school_id, submission_version_id, marking_round_id, released_by, released_at, supersedes_id? | Only validated/approved round released; no client-supplied totals |
| academic_corrections | id, school_id, release_id, reason, requested_by, approved_by, replacement_release_id | Audit chain; released mark never overwritten in place |
| academic_review_requests | id, school_id, assessment_case_id, release_id, kind, reason, requested_by, state, decided_by?, decision_reason? | Appeal/correction request; requested → under_review → approved/rejected; independent reviewer and published deadline policy |
| evidence_artifacts | id, school_id, learner_id, submitted_response_id?, object_key, scan_state, hash, retention_category | Private object scope matches relational tenant/owner; quarantine blocks signing |
| intervention_records | id, school_id, enrollment_id, concept_id, evidence_reference, teacher_id, plan, review_due_at, outcome, status | Teacher judgement and reassessment evidence, not automated discipline |
| delivery_records | id, school_id, assignment_id, teacher_id, expectation_ids, delivered_at, supersedes_id? | Explicit teaching attestation for delivered coverage; no inference from assignment creation |

## Events, governance and projections

| Table | Essential fields | Keys / rules |
| --- | --- | --- |
| private.outbox_events | event_id, school_id, aggregate_id, aggregate_revision, type, schema_version, payload, occurred_at, delivered_at? | Domain transaction inserts; append-only facts; minimal payload |
| private.consumer_receipts | consumer_name, event_id, processed_at | Unique consumer/event; atomic with projection write |
| learning_events | event_id, school_id, actor_id, type, subject_type/id, pinned_versions, received_at, occurred_at, source | Authorized accepted records; no client assertions of official decisions |
| metric_definitions | id, code, version, classification, calculation, evidence_requirements, owner | Reproducible evidence source and calculation |
| reporting_snapshots | id, school_id, scope, metric_version, population_definition, source_watermark, values, generated_at | Snapshot semantics and missing evidence included |
| mastery_estimates | id, school_id, enrollment_id, concept_id, model_version, estimate?, uncertainty?, evidence_count, calculated_at | Reserved for later calibrated model; disabled/null initially |
| sync_operations | school_id, actor_id, operation_id, request_hash, entity_id, outcome, committed_revision, received_at | Unique school/actor/operation; retry returns committed result; changed-body reuse rejected |
| privacy_processing_records | id, school_id, learner_id, purpose, lawful_basis, competent_person_reference?, notice_version, reviewed_by, valid_from/to | Reviewed basis per purpose; do not pretend consent alone solves all processing |
| consent_records | id, school_id, processing_record_id, purpose, decision, recorded_by, recorded_at, withdrawn_at? | Where consent is relied on, record scope and withdrawal |
| audit_logs | id, school_id?, actor_id, action, entity_reference, reason?, occurred_at, request_id | Server owned; no learner answer bodies or credentials |
| retention_policies / deletion_requests | id, category, duration, basis; school_id, subject_id, state, legal_hold | Legal/academic retention reviewed, not guessed |
| notification_jobs | id, school_id, recipient_id, template, reference, state, attempts | Purpose-specific recipients; no sensitive content in push/email previews |
| integration_connections | id, school_id, provider, allowed_scopes, status, secret_reference | Secrets in protected store, not JSON or client responses |

## Required database tests

Two schools, two classes/subjects per school, learner/teacher/admin/guardian/anonymous principals, expired and revoked memberships, one multi-school teacher, and a temporary support principal. Exercise tables, functions, views, storage and guessed IDs directly, not only application routes.

Prove foreign tenant references fail, learners cannot mutate roles/marks/release states, inactive teachers lose access, revoked guardians lose access, stale edits conflict, submitted evidence cannot change, outbox rollback matches transaction rollback, retries do not duplicate submission/results, views preserve caller permissions, and no public function grants bypass checks. RLS-enabled flags alone are insufficient evidence.
