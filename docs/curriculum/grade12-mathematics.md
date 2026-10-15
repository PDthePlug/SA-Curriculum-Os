# Grade 12 Mathematics: first teaching unit

Unit code: `ZA-CAPS-MATH-G12-ARITH-01`. Working language: English, with language metadata and accessible mathematical alternatives. State: draft specification; no learner-facing publication approval.

## Source and applicability

The DBE 2011 Mathematics CAPS Grades 10–12 PDF identifies the Grade 12 patterns, sequences and series topic, including arithmetic/geometric sequences, sigma notation, and deriving and applying sum formulae. The detailed row is on **printed page 40, PDF page 45 (one-based)**. The three weeks in that row refer to the broader topic, not this arithmetic-only unit. The locally inspected PDF SHA-256 is recorded in [sources.json](sources.json).

The official DBE ATP landing page links Circular S19 of 2025, dated 11 December 2025. Its paragraph 5 retains Circular S33 of 2022 for 2026 with stated subject/phase exclusions. Grade 12 Mathematics is outside the listed exclusions; this is an applicability interpretation supported by the circular, not a subject-specialist publication sign-off. The official Grade 12 Mathematics ATP was retrieved and visually inspected: overview p.1 places number patterns, sequences and series in Term 1 weeks 1–4; detailed p.2 includes arithmetic/geometric sequences, sigma notation and arithmetic sum formulae. This differs from the broader 2011 CAPS three-week allocation, so schedule metadata must preserve both sources and use the applicable plan. The retained plan must still be checked together with the retained assessment provisions, any later directive, provincial context and the pilot year.

Do not use a September 2010 draft found by search instead of the inspected 2011 CAPS publication. Sources are reference material, not an inferred redistribution license. No source PDF, existing textbook or restricted manuscript is copied into this public repository.

## Authored expectations and traceability

These are product-authored decompositions of the official topic, not quoted DBE outcome codes. All use source `DBE-CAPS-MATH-2011`, printed p.40 / PDF p.45, Grade 12 Term 1 topic row. Each needs a named reviewer, date and approved mapping before publication.

| Expectation ID | Learner should demonstrate | Source relationship | Evidence |
| --- | --- | --- | --- |
| AR-01 | Identify a constant difference, including negative or fractional differences | Arithmetic sequence component | Diagnostic and practice responses |
| AR-02 | Use and explain `T_n = a + (n-1)d`; solve for a missing term or valid term index | Arithmetic sequence component; formula taught by authored decomposition | Numeric answer plus method |
| AR-03 | Derive the finite arithmetic sum by pairing first and last terms | Derivation requirement, arithmetic portion | Teacher-reviewed written reasoning |
| AR-04 | Apply `S_n = n/2[2a+(n-1)d] = n/2(a+l)` and interpret the result | Arithmetic series formula/application | Calculation and contextual explanation |
| AR-05 | Translate and evaluate finite arithmetic sums using sigma notation, checking bounds | Sigma notation, bounded arithmetic portion | Expansion and finite total |

Geometric sequences, finite/infinite geometric series and the rest of Grade 12 Mathematics remain outside this unit. Completing this unit cannot count as completing the whole patterns/sequences/series topic.

## Interaction sequence

| Stage | Activity type and behavior | Evidence and feedback |
| --- | --- | --- |
| Prerequisite diagnostic | Six numeric/choice questions on signed arithmetic, substitution and linear patterns | Practice only; no formal mark; tag observed errors without diagnosing ability |
| Arithmetic sequence lesson | Accessible term table; vary first term/difference; display equivalent symbolic and text forms | Exploration is engagement evidence; not a correct-answer score |
| Guided examples | Explain first-term indexing and unknown term problems; expose steps on demand | Hints recorded separately from independent responses |
| Practice | Eight numeric/expression items including negative differences and invalid indices | Reviewed server rules; bounded parser, no `eval`; feedback labels wrong method hypotheses as suggestions |
| Finite sum lesson | Pairing demonstration and written derivation; alternative text explanation | Written derivation reviewed by teacher |
| Sigma activity | Expand a finite sum with explicit inclusive bounds | Distinguish term count, indexing and total errors |
| Formative assessment | Five items, 20 authored marks, rubric-pinned; online submission | Immutable snapshot; teacher marking and optional policy-required moderation; no SBA weight asserted |
| Support and reassessment | Teacher chooses worked examples and a new short assessment version | Compare like concepts; retain initial and later results rather than overwriting |

## Original acceptance fixtures

These synthetic examples are authored for engineering checks, not copied official exam questions or an approved item bank. Keep answer rules server-side in the application.

| Fixture | Expected result | Purpose |
| --- | --- | --- |
| `a=5,d=3,n=12`: find term and sum | `T_12=38`, `S_12=258` | Basic sequence versus sum distinction |
| `a=20,d=-2,n=8` | `T_8=6`, `S_8=104` | Negative difference |
| `sum(k=0..4, 2+3k)` | `40`, five terms | Zero-based bound; avoid confusing upper bound with count |
| `a=5,d=3,T_n=39`: is it a term? | No positive integer index | Domain of term number |
| Explain arithmetic sum derivation | Pair `a` with `l`, two copies total `n(a+l)`, divide by two | Human-reviewed method, not keyword auto-marking |

Proposed 20-mark formative blueprint: identify/explain difference (2); general term/term calculation (4); sum derivation (5); contextual finite-sum application (5); sigma expansion/evaluation (4). A Mathematics specialist must approve mathematical correctness, cognitive demand, distractors, accessibility, partial credit and fit for the pilot class. This blueprint does not establish official examination cognitive weightings.

## Publication checklist

CUR-01–03 and CNT-01–03 must pass: source hashes and locations recorded, current year and jurisdiction confirmed, assessment provisions reviewed, named subject approval, original/cleared content rights, accessible math and language review, independent marking verification. Review status is currently pending. A future year requires a fresh applicability record; retaining content does not automatically retain the teaching schedule or formal assessment policy.
