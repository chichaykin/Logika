import { expect, test } from '@playwright/test';

test.describe('Home and Navigation', () => {
  test('displays main menu and navigates to screens', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page.locator('.logo-title')).toHaveText(/логика/i);

    // Navigate to rules
    await page.click('text=Правила');
    await expect(page.locator('h2')).toHaveText('Правила');
    await page.click('text=В меню');

    // Navigate to settings
    await page.click('text=Настройки');
    await expect(page.locator('h2')).toHaveText('Настройки');

    // Check initial theme
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'luxe');

    // Switch theme to Slate
    await page.click('button:has-text("Тёмный сланец")');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'slate');

    // Switch theme to Emerald
    await page.click('button:has-text("Изумрудное сукно")');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'emerald');

    // Switch theme to Retro
    await page.click('button:has-text("Ретро 1972")');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'retro');

    // Switch back to Luxe
    await page.click('button:has-text("Орех и мрамор")');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'luxe');

    // Switch language to English
    await page.click('button:has-text("English")');
    await expect(page.locator('h2')).toHaveText('Settings');

    // Switch back to Russian
    await page.click('button:has-text("Русский")');
    await expect(page.locator('h2')).toHaveText('Настройки');

    await page.click('text=В меню');
    await expect(page.locator('.logo-title')).toHaveText(/логика/i);
  });
});
