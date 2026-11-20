import {test,expect} from '@playwright/test';

test('game arena references live instructions and announces round results',async ({page})=>{
  await page.goto('/');
  const arena=page.locator('#arena');
  const instruction=page.locator('#instruction');
  const outcome=page.locator('#overlay-message');
  await expect(arena).toHaveAttribute('aria-describedby','instruction');
  await expect(instruction).toHaveAttribute('role','status');
  await expect(instruction).toHaveAttribute('aria-live','polite');
  await expect(instruction).toHaveAttribute('aria-atomic','true');
  await expect(outcome).toHaveAttribute('role','status');
  await expect(outcome).toHaveAttribute('aria-live','polite');
  await expect(outcome).toHaveAttribute('aria-atomic','true');
  await page.getByRole('button',{name:/Shadow Thief/}).first().click();
  await expect(instruction).not.toBeEmpty();
});
