import { expect, test } from '@playwright/test';

test.describe('Computer Guesses Mode', () => {
  test('auto mode solves the code step by step', async ({ page }) => {
    await page.goto('/');

    // Navigate to computer mode
    await page.click('button:has-text("Компьютер угадывает")');

    // Switch to auto mode
    await page.click('button:has-text("Ввести код в игру")');

    // Pick a secret code: 0, 1, 2, 3
    const palBtns = page.locator('.pal-btn');
    await palBtns.nth(0).click();
    await palBtns.nth(1).click();
    await palBtns.nth(2).click();
    await palBtns.nth(3).click();

    // Click start
    await page.click('button:has-text("Начать")');

    // Computer should solve it in <= 5 turns
    await expect(page.locator('.game-over-title.solved')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.game-over-title.solved')).toContainText('Компьютер угадал код');
  });
});
