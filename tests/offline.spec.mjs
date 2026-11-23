import { expect, test } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

test('the production arcade reloads and opens an expansion game offline', async ({ context, page }) => {
  await page.goto('/assets/icon.svg');
  await page.evaluate(async () => {
    await caches.open('another-arcade-v1');
    await caches.open('pocket-oddities-v0');
  });

  await page.goto('/');
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), {
    message: 'the service worker precaches and takes control of the production bundle'
  }).toBe(true);

  const cacheNames = await page.evaluate(() => caches.keys());
  expect(cacheNames).toContain('another-arcade-v1');
  expect(cacheNames).not.toContain('pocket-oddities-v0');

  await context.setOffline(true);
  await page.reload();
  await page.getByRole('searchbox', { name: 'Search games' }).fill('Star Cartographer');
  await page.getByRole('button', { name: 'Play Star Cartographer', exact: true }).click();
  await expect(page.locator('#game-title')).toHaveText('Star Cartographer');
  await expect(page.getByLabel('Game arena')).toBeVisible();
});
