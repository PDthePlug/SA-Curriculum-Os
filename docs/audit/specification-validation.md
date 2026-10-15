# Specification validation record

Checked: 2026-10-15. Scope: architecture documents and machine-readable contracts, plus targeted tests of existing Applied Commerce reuse candidates. This is not runtime acceptance of CurriculumOS.

| Check | Result | Limit |
| --- | --- | --- |
| OpenAPI 3.1 validation | Passed: 25 operations | Endpoints are designs, not deployed handlers |
| JSON Schema validation | Passed: 18 valid event fixtures and 28 invalid cases rejected | Shape/provenance restrictions alone cannot authenticate a producer |
| Request fixtures | Passed: one valid draft and five invalid requests | Domain relationships, mark maxima and state transitions need database/application tests |
| Contract references and document links | Passed | External links may change; source IDs/hashes preserve provenance |
| Acceptance traceability | Passed: referenced API gates exist in the 36-gate register | All runtime gates remain pending |
| Source mappings | Passed: five authored expectations resolve to inspected CAPS source/page; publication false | Reviewer approval, later directives, rights and assessment policy remain open |
| Applied Commerce targeted checks | Passed: 25 (19 behavior, six source-contract checks) | Candidate source behavior only; no CurriculumOS integration or security proof |
| Whitespace/conflict check | `git diff --check` passed before commit | No application build is applicable to a specification-only change |
| CurriculumOS Supabase read-only recheck | Active, PostgreSQL 17.11, `eu-west-1`, no public application tables or migrations | Auth, backups, configuration and compliance not certified; no schema changes executed |

Reproduce specification checks using the README's virtual environment instructions. Reuse checks use Applied Commerce commit `e838dcaa2826284d335afcce58a93f4fe370287d`, its pinned `typescript@5.9.3`, and `node --test tests/learning-sync.test.mjs tests/response-identity.test.mjs tests/evidence-engine.test.mjs`. A complete declared-dependency checkout is preferred outside the temporary isolated harness used for this inspection.

Outstanding production proofs: actual migrations and RLS/storage tests; real browser role sessions; assessment transaction/concurrency/retry tests; offline/account switching tests; accessibility/device/load tests; backup restoration; school/privacy/content approvals. The implementation backlog orders those checks and their dependencies.
