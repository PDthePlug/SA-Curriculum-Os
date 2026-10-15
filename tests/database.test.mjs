import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
import { id, identityFixture } from './fixtures.mjs';
async function asUser(n, sql) {
  await db.exec(
    `reset role; select set_config('request.jwt.claim.sub','${n ? id(n) : ''}',false); set role ${n ? 'authenticated' : 'anon'};`,
  );
  return db.query(sql);
}
async function operator(sql) {
  await db.exec('reset role');
  return db.query(sql);
}
async function count(n, table) {
  return Number((await asUser(n, `select count(*)::integer as n from public.${table}`)).rows[0].n);
}
before(async () => {
  await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema public,auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`);
  for (const f of (await readdir('supabase/migrations')).filter((f) => f.endsWith('.sql')).sort())
    await db.exec(await readFile(`supabase/migrations/${f}`, 'utf8'));
  await db.exec(identityFixture);
});
after(async () => {
  await db.close();
});

test('every public table has RLS and clients have no direct institution writes', async () => {
  const tables = (
    await operator("select tablename from pg_tables where schemaname='public' and not rowsecurity")
  ).rows;
  assert.equal(tables.length, 0);
  await assert.rejects(
    asUser(
      1,
      `insert into public.school_memberships(school_id,user_id,role) values ('${id(101)}','${id(10)}','school_admin')`,
    ),
    /permission denied/,
  );
  await assert.rejects(
    asUser(5, `update public.school_memberships set role='school_admin' where user_id='${id(5)}'`),
    /permission denied/,
  );
});
test('anonymous users cannot see schools or execute commands', async () => {
  await assert.rejects(asUser(0, 'select * from public.schools'), /permission denied/);
  await assert.rejects(
    asUser(0, `select public.create_school_class('${id(101)}',2026,'12','Bad','${id(900)}')`),
    /permission denied/,
  );
  assert.equal(await count(0, 'curriculum_sources'), 4);
});
test('administrators see only their school and its classes', async () => {
  assert.equal(await count(1, 'schools'), 1);
  assert.equal(await count(1, 'classes'), 2);
  assert.equal(await count(2, 'classes'), 1);
  assert.equal(
    (await asUser(1, `select id from public.schools where id='${id(102)}'`)).rows.length,
    0,
  );
});
test('teacher allocation limits classes, subjects and learner rosters', async () => {
  assert.equal(await count(3, 'classes'), 1);
  assert.equal(await count(3, 'class_subjects'), 1);
  const learners = (await asUser(3, 'select learner_id from public.enrollments')).rows;
  assert.deepEqual(
    learners.map((r) => r.learner_id),
    [id(5)],
  );
  assert.deepEqual(
    (await asUser(4, 'select learner_id from public.enrollments')).rows.map((r) => r.learner_id),
    [id(6)],
  );
});
test('learners see only enrolled subjects and their own enrollment', async () => {
  assert.equal(await count(5, 'class_subjects'), 1);
  assert.equal(await count(5, 'enrollments'), 1);
  assert.equal(
    (await asUser(5, `select * from public.class_subjects where id='${id(502)}'`)).rows.length,
    0,
  );
  assert.equal(
    (await asUser(5, `select * from public.class_subjects where id='${id(503)}'`)).rows.length,
    0,
  );
});
test('parent and expired/unaffiliated users have no academic access', async () => {
  for (const user of [8, 9, 10]) assert.equal(await count(user, 'classes'), 0);
  await assert.rejects(asUser(8, 'select * from public.guardian_links'), /permission denied/);
  assert.equal(await count(9, 'schools'), 0);
});
test('cross-school foreign keys and grade mismatches fail even for operator', async () => {
  await assert.rejects(
    operator(
      `insert into public.classes(school_id,academic_year_id,grade_code,name) values ('${id(101)}','${id(202)}','12','Cross')`,
    ),
    /foreign key/,
  );
  await assert.rejects(
    operator(
      `insert into public.class_subjects(school_id,class_id,grade_code,curriculum_offering_id) values ('${id(101)}','${id(303)}','12','${id(405)}')`,
    ),
    /foreign key/,
  );
  await assert.rejects(
    operator(
      `insert into public.class_subjects(school_id,class_id,grade_code,curriculum_offering_id) values ('${id(101)}','${id(302)}','10','${id(405)}')`,
    ),
    /foreign key/,
  );
  await assert.rejects(
    operator(
      `insert into public.enrollments(school_id,class_subject_id,learner_id) values ('${id(101)}','${id(501)}','${id(7)}')`,
    ),
    /foreign key/,
  );
});
test('draft curriculum is inaccessible and publication requires named review', async () => {
  assert.equal(await count(0, 'curriculum_versions'), 1);
  await assert.rejects(
    operator(`update public.curriculum_versions set state='published' where id='${id(409)}'`),
    /check constraint/,
  );
  await assert.rejects(
    asUser(1, `update public.curriculum_versions set state='published'`),
    /permission denied/,
  );
});
test('class command persists one class and audit entry across retries', async () => {
  const q = `select public.create_school_class('${id(101)}',2027,'10','10A','${id(901)}') as id`;
  const first = (await asUser(1, q)).rows[0].id;
  assert.equal((await asUser(1, q)).rows[0].id, first);
  assert.equal(
    Number(
      (
        await operator(
          `select count(*)::int as n from private.audit_logs where resource_id='${first}'`,
        )
      ).rows[0].n,
    ),
    1,
  );
  await assert.rejects(
    asUser(1, `select public.create_school_class('${id(101)}',2027,'10','10B','${id(901)}')`),
    /Idempotency key/,
  );
  await assert.rejects(
    asUser(1, `select public.create_school_class('${id(101)}',2027,'10','10A','${id(902)}')`),
    /unique constraint/,
  );
});
test('direct RPC rejects non-admin, other-school and malformed calls', async () => {
  for (const user of [2, 3, 5, 8, 9, 10])
    await assert.rejects(
      asUser(user, `select public.create_school_class('${id(101)}',2027,'12','Bad','${id(903)}')`),
      /administrator access/,
    );
  for (const args of ["2019,'12','Name'", "2027,'13','Name'", "2027,'12',' '", "null,'12','Name'"])
    await assert.rejects(
      asUser(1, `select public.create_school_class('${id(101)}',${args},'${id(903)}')`),
      /Invalid class/,
    );
});
test('private audit/receipts and definer schema are inaccessible to clients', async () => {
  for (const table of ['audit_logs', 'command_receipts'])
    await assert.rejects(asUser(1, `select * from private.${table}`), /permission denied/);
  const def = (
    await operator(
      "select count(*)::int as n from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prosecdef",
    )
  ).rows[0].n;
  assert.equal(def, 0);
});
test('revocation immediately removes access and denies cached command receipts', async () => {
  await operator(
    `update public.teaching_allocations set status='revoked' where teacher_id='${id(3)}'`,
  );
  assert.equal(await count(3, 'enrollments'), 0);
  assert.equal(await count(3, 'class_subjects'), 0);
  await operator(`update public.enrollments set status='revoked' where learner_id='${id(5)}'`);
  assert.equal(await count(5, 'class_subjects'), 0);
  await operator(`update public.school_memberships set status='revoked' where user_id='${id(1)}'`);
  assert.equal(await count(1, 'schools'), 0);
  await assert.rejects(
    asUser(1, `select public.create_school_class('${id(101)}',2027,'10','10A','${id(901)}')`),
    /administrator access/,
  );
});
