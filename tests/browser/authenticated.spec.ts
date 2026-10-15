import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const path = process.env.CURRICULUM_QA_CREDENTIALS;
const qa = path ? JSON.parse(readFileSync(path, 'utf8')) : null;
test('school administrator signs in, creates and reloads a class, cannot enter another school, then signs out', async ({
  page,
}) => {
  test.setTimeout(120000);
  test.skip(
    !qa,
    'Requires an isolated synthetic account fixture; never use a real school account.',
  );
  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill(qa.email);
  await page.getByLabel('Password', { exact: true }).fill(qa.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/workspace$/, { timeout: 20000 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Synthetic browser QA A');
  const name = `QA 12A ${Date.now()}`;
  await page.getByLabel('Class name', { exact: true }).fill(name);
  await page.getByRole('button', { name: 'Create class', exact: true }).click();
  await expect(page.getByRole('status')).toContainText(`Class ${name} is ready.`, {
    timeout: 60000,
  });
  await page.reload();
  await expect(page.getByRole('cell', { name, exact: true })).toBeVisible();
  const me = await page.request.get('/api/me');
  expect(me.status()).toBe(200);
  expect((await me.json()).memberships).toEqual([{ school_id: qa.schoolId, role: 'school_admin' }]);
  const forbidden = await page.goto(`/workspace?school=${qa.otherSchoolId}`);
  expect(forbidden?.status()).toBe(404);
  await page.goto('/workspace');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto('/workspace');
  await expect(page).toHaveURL(/\/sign-in$/);
  expect((await page.request.get('/api/me')).status()).toBe(401);
});
