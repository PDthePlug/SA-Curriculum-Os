# CurriculumOS South Africa

A CAPS-aligned education platform for Grades 8–12, with Grade 12 examination readiness as the first implementation priority and an architecture designed for eventual Grade R–12 expansion.

The approved Concept v1.0 calls for interactive teaching and learning, controlled assessment, learner evidence, teacher interventions, and institutional reporting.

BIS and Applied Commerce remain independent products. Reuse requires source inspection and validation.

Status: architecture and engineering specification. No application has been deployed and no production readiness is claimed.

## Engineering baseline v1.0

Start with [the engineering specification](docs/engineering/implementation-specification.md), then use these companion contracts:

- [Verified discovery and reuse assessment](docs/audit/discovery-and-reuse.md)
- [System architecture and decisions](docs/architecture/system-design.md)
- [Logical database specification](docs/architecture/data-model.md)
- [Authorization and information governance](docs/architecture/authorization-and-governance.md)
- [Grade 12 Mathematics source mapping and first unit](docs/curriculum/grade12-mathematics.md)
- [Metrics, events, and offline synchronization](docs/architecture/evidence-and-sync.md)
- [Acceptance criteria and delivery backlog](docs/engineering/acceptance-and-backlog.md)
- [Source register](docs/curriculum/sources.json)
- [OpenAPI contract](contracts/openapi.json) and [learning event schema](contracts/learning-event.schema.json)

Validate from a clean checkout with Python 3.11+:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-spec.txt
.venv/bin/python scripts/validate_contracts.py
```

This validates OpenAPI 3.1, event/request fixtures (including rejection cases), document links, API references, source mapping and acceptance traceability. It does not test an application or database implementation. No production migrations or learner data are included.

The first unit is **Grade 12 Mathematics: arithmetic sequences and finite arithmetic series**, a bounded part of the official patterns, sequences, and series topic. Publication remains conditional on applicable teaching-plan verification and subject specialist review.
