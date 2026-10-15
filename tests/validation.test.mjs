import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeNext, validateClass } from '../lib/domain/validation.mjs';
test('redirects cannot leave workspace for external or injected URLs', () => {
  for (const s of [
    'https://evil.test',
    '//evil.test',
    '/workspace\\evil.test',
    '/workspace-evil',
    '/workspace\r\nLocation: https://evil.test',
  ])
    assert.equal(safeNext(s), '/workspace');
  assert.equal(safeNext('/workspace?school=123'), '/workspace?school=123');
});
test('class form validates grade, identity, calendar year and bounded name', () => {
  const valid = {
    schoolId: '00000000-0000-4000-8000-000000000001',
    operationId: '00000000-0000-4000-8000-000000000002',
    grade: '12',
    year: '2026',
    name: ' 12A ',
  };
  assert.equal(validateClass(valid).value.name, '12A');
  for (const [key, value] of [
    ['schoolId', 'bad'],
    ['year', 'NaN'],
    ['year', '2026.5'],
    ['grade', '13'],
    ['name', 'a'.repeat(81)],
  ])
    assert.ok(validateClass({ ...valid, [key]: value }).error);
});
