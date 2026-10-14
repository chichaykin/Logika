import { expect, test } from '@playwright/test';

test.describe('Solo Game Mode', () => {
  test('plays a turn and uses hint', async ({ page }) => {
    await page.goto('/');

    // Start solo game
    await page.click('button:has-text("Играть")');

    // Check we are on the game screen
    await expect(page.locator('.board')).toBeVisible();

    // Palette should have color buttons
    const palBtns = page.locator('.pal-btn');
    await expect(palBtns).toHaveCount(6);

    // Pick 4 colors
    await palBtns.nth(0).click();
    await palBtns.nth(1).click();
    await palBtns.nth(2).click();
    await palBtns.nth(3).click();

    // Check button should now be enabled
    const submitBtn = page.locator('button[data-palette="1"]:has-text("Проверить")');
    await expect(submitBtn).toBeEnabled();

    // Submit guess
    await submitBtn.click();

    // First row should now be committed
    await expect(page.locator('.row').first()).not.toHaveClass(/active/);

    // Turn info should show 2 / 10
    await expect(page.locator('.game-turn-info')).toContainText('2 / 10');

    // Request hint
    const hintBtn = page.locator('.btn-hint');
    await hintBtn.click();

    // Hint banner should appear
    await expect(page.locator('.hint-banner')).toBeVisible();
    await expect(page.locator('.hint-banner')).toContainText('Осталось вариантов');

    // Use hint
    await page.click('text=Подставить');
    await expect(page.locator('.hint-banner')).not.toBeVisible();

    // Check button should be enabled because hint filled all 4 slots
    await expect(submitBtn).toBeEnabled();
  });
});
