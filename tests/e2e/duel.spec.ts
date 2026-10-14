import { expect, test } from '@playwright/test';

test.describe('Duel Mode', () => {
  test('plays duel flow between two players', async ({ page }) => {
    await page.goto('/');

    // Start duel
    await page.click('button:has-text("Дуэль вдвоём")');

    // Player 1 sets secret code
    await expect(page.locator('.duel-phase-banner h3')).toContainText('загадайте код');
    const palBtns = page.locator('.pal-btn');
    await palBtns.nth(0).click();
    await palBtns.nth(1).click();
    await palBtns.nth(2).click();
    await palBtns.nth(3).click();
    await page.click('button[data-palette="1"]:has-text("Подтвердить")');

    // Handoff screen
    await expect(page.locator('.handoff-card h3')).toContainText('Передайте устройство');
    await page.click('button:has-text("Я готов")');

    // Player 2 guesses
    await expect(page.locator('.game-turn-info')).toContainText('Игрок 2');
    await palBtns.nth(0).click();
    await palBtns.nth(1).click();
    await palBtns.nth(2).click();
    await palBtns.nth(3).click();
    await page.click('button[data-palette="1"]:has-text("Проверить")');

    // Round over
    await expect(page.locator('.roundover-card h3')).toContainText('код разгадан');
    await page.click('button:has-text("Дальше")');

    // Now roles swap: Player 2 sets secret
    await expect(page.locator('.duel-phase-banner h3')).toContainText('Игрок 2, загадайте код');
  });
});
