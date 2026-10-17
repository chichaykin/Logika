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

    // Hint banner should appear with color preview
    await expect(page.locator('.hint-banner')).toBeVisible();
    await expect(page.locator('.hint-banner')).toContainText('Осталось вариантов');
    await expect(page.locator('.hint-guess-preview .peg')).toHaveCount(4);

    // Use hint
    await page.click('text=Подставить');
    await expect(page.locator('.hint-banner')).not.toBeVisible();

    // Check button should be enabled because hint filled all 4 slots
    await expect(submitBtn).toBeEnabled();
  });

  test('supports in-place slot popover selection and zero-scroll mobile layout', async ({ page }) => {
    // Set mobile viewport (iPhone SE dimensions)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.click('button:has-text("Играть")');
    await expect(page.locator('.board')).toBeVisible();

    // Verify palette is visible on screen without scrolling
    const palette = page.locator('.palette');
    await expect(palette).toBeInViewport();

    // Active row slots should be buttons
    const activeRow = page.locator('.row.active');
    const slotButtons = activeRow.locator('button.slot');
    await expect(slotButtons).toHaveCount(4);

    // Clicking the first slot opens the in-place popover
    await slotButtons.nth(0).click();
    const popover = page.locator('.slot-popover');
    await expect(popover).toBeVisible();

    // Popover has 6 marble buttons
    const popoverBtns = popover.locator('.popover-btn');
    await expect(popoverBtns).toHaveCount(6);

    // Close button dismisses the popover
    await popover.locator('.popover-close-btn').click();
    await expect(popover).not.toBeVisible();

    // Reopen popover on slot 0 and pick color 0
    await slotButtons.nth(0).click();
    await expect(popover).toBeVisible();
    await popoverBtns.nth(0).click();

    // Popover advances to slot 1
    await expect(popover).toBeVisible();
    await popoverBtns.nth(1).click();

    // Popover advances to slot 2
    await popoverBtns.nth(2).click();

    // Popover advances to slot 3
    await popoverBtns.nth(3).click();

    // Once all 4 slots are filled, popover auto-closes
    await expect(popover).not.toBeVisible();

    // The submit button is now enabled
    const submitBtn = page.locator('button[data-palette="1"]:has-text("Проверить")');
    await expect(submitBtn).toBeEnabled();

    // Submit guess for row 1
    await submitBtn.click();
    await expect(page.locator('.game-turn-info')).toContainText('2 / 10');

    // On row 2 (second turn), clicking a slot opens popover strictly BELOW row 2
    const secondRow = page.locator('.row.active');
    await secondRow.locator('button.slot').first().click();
    await expect(popover).toBeVisible();
    await expect(popover).toHaveClass(/popover-down/);

    const secondRowBox = await secondRow.boundingBox();
    const popoverBox = await popover.boundingBox();
    expect(popoverBox!.y).toBeGreaterThanOrEqual(secondRowBox!.y + secondRowBox!.height - 2);

    // Row 1 remains completely visible and unobstructed above row 2
    const firstRow = page.locator('.row').first();
    const firstRowBox = await firstRow.boundingBox();
    expect(popoverBox!.y).toBeGreaterThan(firstRowBox!.y + firstRowBox!.height);

    // Row 10 is completely visible above the palette without overlap
    const row10 = page.locator('.row').nth(9);
    const row10Box = await row10.boundingBox();
    const paletteBox = await palette.boundingBox();
    expect(paletteBox!.y).toBeGreaterThanOrEqual(row10Box!.y + row10Box!.height - 1);
  });

  test('supports PC keyboard shortcuts (1-6, Backspace, Enter)', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Играть")');
    await expect(page.locator('.board')).toBeVisible();

    const submitBtn = page.locator('button[data-palette="1"]:has-text("Проверить")');
    await expect(submitBtn).toBeDisabled();

    // Type 1, 2, 3
    await page.keyboard.press('1');
    await page.keyboard.press('2');
    await page.keyboard.press('3');

    // Press Backspace to clear slot 2
    await page.keyboard.press('Backspace');

    // Type 4, 5
    await page.keyboard.press('4');
    await page.keyboard.press('5');

    // Now all 4 slots are filled
    await expect(submitBtn).toBeEnabled();

    // Submit via Enter key
    await page.keyboard.press('Enter');

    // Row 1 should be committed, turn info moves to attempt 2
    await expect(page.locator('.game-turn-info')).toContainText('2 / 10');
  });
});
