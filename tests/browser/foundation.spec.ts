import { test, expect } from '@playwright/test';
test('overview and sign-in navigation work with keyboard', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A place for every next step.');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.getByRole('link', { name: 'Enter your workspace' }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByLabel('Email address')).toBeVisible();
  await page.getByRole('button', { name: 'Show password' }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text');
});
test('anonymous workspace redirects and private API denies access', async ({ page, request }) => {
  await page.goto('/workspace');
  await expect(page).toHaveURL(/\/sign-in$/);
  const response = await request.get('/api/me');
  expect(response.status()).toBe(401);
  expect(response.headers()['cache-control']).toContain('no-store');
  const signout = await request.post('/auth/sign-out', {
    headers: { origin: 'https://invalid.example' },
  });
  expect(signout.status()).toBe(403);
});
test('mobile overview and sign-in have no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/sign-in']) {
    await page.goto(path);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});
test('source page is honest about publication and responds to database failure', async ({
  page,
}) => {
  await page.goto('/curriculum');
  await expect(page.getByRole('heading', { name: 'Official source register' })).toBeVisible();
  await expect(
    page.getByText(
      /No learning units are published yet|Publication status is temporarily unavailable/,
    ),
  ).toBeVisible();
});
