#!/usr/bin/env python3
"""Validate design contracts; this does not test the future application or database."""
import copy
import json
import re
import sys
from pathlib import Path

try:
    from jsonschema import Draft202012Validator, FormatChecker, ValidationError
    from openapi_spec_validator import validate_spec
except ImportError:
    sys.exit('Install specification dependencies: python3 -m pip install -r requirements-spec.txt')

ROOT = Path(__file__).resolve().parents[1]

def read(path):
    return json.loads((ROOT / path).read_text())

def require(value, message):
    if not value:
        raise AssertionError(message)

def walk(value):
    yield value
    if isinstance(value, dict):
        for item in value.values():
            yield from walk(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk(item)

def validate():
    api = read('contracts/openapi.json')
    validate_spec(api)
    event = read('contracts/learning-event.schema.json')
    Draft202012Validator.check_schema(event)
    validator = Draft202012Validator(event, format_checker=FormatChecker())
    fixtures = read('contracts/fixtures/events.valid.json')
    event_types = event['properties']['type']['enum']
    require({e['type'] for e in fixtures} == set(event_types), 'Every event type needs a fixture')
    require(len({e['event_id'] for e in fixtures}) == len(fixtures), 'Fixture event IDs must be unique')
    for fixture in fixtures:
        validator.validate(fixture)

    negative = []
    base = fixtures[2]
    for key, value in [('school_id', 'invalid-uuid'), ('source', 'client'), ('type', 'mark.forged'), ('schema_version', 2), ('aggregate_revision', 0), ('occurred_at', 'yesterday')]:
        sample = copy.deepcopy(base)
        sample[key] = value
        negative.append((key, sample))
    for label, mutate in [
        ('extra sensitive payload', lambda s: s['payload'].update({'learner_answer': 'private'})),
        ('missing tenant', lambda s: s.pop('school_id')),
        ('wrong payload type', lambda s: s.update({'payload': fixtures[0]['payload']})),
        ('unknown envelope field', lambda s: s.update({'raw_reflection': 'private'})),
    ]:
        sample = copy.deepcopy(base)
        mutate(sample)
        negative.append((label, sample))
    for fixture in fixtures:
        sample = copy.deepcopy(fixture)
        sample['payload'].pop(next(iter(sample['payload'])))
        negative.append((f"missing required payload reference: {fixture['type']}", sample))
    for label, sample in negative:
        require(not validator.is_valid(sample), f'Invalid event accepted: {label}')

    # Resolve every local JSON pointer rather than trusting that the documents parse.
    for doc in [api, event]:
        for node in walk(doc):
            if isinstance(node, dict) and '$ref' in node:
                pointer = node['$ref']
                require(pointer.startswith('#/'), f'Uncontrolled external reference: {pointer}')
                target = doc
                for part in pointer[2:].split('/'):
                    target = target[part.replace('~1', '/').replace('~0', '~')]

    ids = set()
    gates_doc = (ROOT / 'docs/engineering/acceptance-and-backlog.md').read_text()
    gates = set(re.findall(r'^\| ([A-Z]{3}-\d{2}) \|', gates_doc, re.M))
    traceability = read('contracts/acceptance-traceability.json')
    for path, methods in api['paths'].items():
        for method, operation in methods.items():
            if method not in {'get', 'post', 'put', 'patch', 'delete'}:
                continue
            op = operation['operationId']
            require(op not in ids, f'Duplicate operation ID: {op}')
            ids.add(op)
            require(operation['x-acceptance-gates'] == traceability[op], f'Traceability mismatch: {op}')
            require(set(traceability[op]) <= gates, f'Unknown gate in {op}')
            require(set(re.findall(r'{(\w+)}', path)) == {p['name'] for p in operation['parameters'] if p['in'] == 'path'}, f'Path parameter mismatch: {op}')
            if method != 'get':
                require(any(p['name'] == 'Idempotency-Key' and p.get('required') for p in operation['parameters']), f'Missing idempotency: {op}')
            for code in ['401', '403', '404', '409', '422', '429', '503']:
                require(code in operation['responses'], f'Missing error status {code}: {op}')
    require(ids == set(traceability), 'Orphan acceptance operation mapping')
    require(api.get('security'), 'Authenticated API security missing')

    root_validator = Draft202012Validator(api, format_checker=FormatChecker())
    def schema(n):
        return root_validator.evolve(schema={'$ref': '#/components/schemas/' + n})
    schema('SaveDraft').validate({'expected_revision': 0, 'lesson_version_id': base['aggregate_id'], 'response': {'kind': 'numeric', 'value': '38'}})
    invalid_requests = [
        ('SaveDraft', {'expected_revision': -1, 'lesson_version_id': base['aggregate_id'], 'response': {'kind': 'numeric', 'value': '38'}}),
        ('SaveDraft', {'expected_revision': 0, 'lesson_version_id': base['aggregate_id'], 'response': {'kind': 'numeric', 'value': '38'}, 'learner_id': base['actor_id']}),
        ('ResponseValue', {'kind': 'numeric', 'value': 'NaN'}),
        ('ResponseValue', {'kind': 'text', 'value': 'a' * 10001}),
        ('CreateMarkingRound', {'rubric_version_id': base['aggregate_id'], 'marks': [], 'feedback': 'x', 'total_marks': 20}),
    ]
    for n, sample in invalid_requests:
        require(not schema(n).is_valid(sample), f'Invalid request accepted: {n}')

    for path in [ROOT / 'README.md', *ROOT.glob('docs/**/*.md')]:
        for link in re.findall(r'\[[^\]]*\]\(([^)]+)\)', path.read_text()):
            if '://' in link or link.startswith('#'):
                continue
            require((path.parent / link.split('#')[0]).resolve().exists(), f'Broken link {path.relative_to(ROOT)}: {link}')

    sources = read('docs/curriculum/sources.json')
    by_id = {s['id']: s for s in sources['sources']}
    require(len(by_id) == len(sources['sources']), 'Duplicate source ID')
    for expectation in sources['expectations']:
        require(expectation['source_id'] in by_id, 'Untraceable expectation')
        require(expectation['pdf_page'] == by_id[expectation['source_id']]['location']['pdf_page'], 'Mismatched source page')
        if sources['publication_approved']:
            require(expectation['status'] == 'approved' and expectation['reviewer_id'] and expectation['reviewed_at'], 'Publication without reviewed mapping')
            require(by_id[expectation['source_id']].get('sha256'), 'Published source hash missing')
    require(not sources['publication_approved'], 'This baseline must remain unpublished')
    print(f'PASS: OpenAPI 3.1 ({len(ids)} operations), local references, {len(gates)} acceptance gates, document links and source mapping')
    print(f'PASS: {len(fixtures)} event fixtures, {len(negative)} rejected event fixtures, 1 valid and {len(invalid_requests)} rejected request fixtures')
    print('LIMIT: specification validation only; application, SQL/RLS, browser, accessibility and school-pilot gates remain pending')

if __name__ == '__main__':
    validate()
