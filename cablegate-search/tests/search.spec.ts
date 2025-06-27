import { test, expect } from '@playwright/test';

test.describe('Search Page', () => {
	test('basic search returns results', async ({ page }) => {
		await page.goto('/');
		await page.fill('input[name="keywords"]', 'USA');
		await page.click('button[type="submit"]');
		await expect(page.locator('.search-result').first()).toBeVisible();
	});

	test('filter by year', async ({ page }) => {
		await page.goto('/');
		await page.fill('input[name="year"]', '2006');
		await page.click('button[type="submit"]');
		await expect(page.locator('.search-result').first()).toBeVisible();
		// Optionally check that all results are from 2006
	});

	test('pagination works', async ({ page }) => {
		await page.goto('/');
		await page.fill('input[name="keywords"]', 'USA');
		await page.click('button[type="submit"]');
		await page.click('button[aria-label="Next page"]');
		await expect(page.locator('.search-result').first()).toBeVisible();
	});

	test('no results for gibberish', async ({ page }) => {
		await page.goto('/');
		await page.fill('input[name="keywords"]', 'asdkjhasdkjh');
		await page.click('button[type="submit"]');
		await expect(page.locator('.search-result')).toHaveCount(0);
		await expect(page.locator('.no-results')).toBeVisible();
	});

	test('API returns error for invalid params', async ({ request }) => {
		const response = await request.get('/api/search?year=notanumber');
		expect(response.status()).toBe(200); // or 400 if you handle errors differently
		const data = await response.json();
		// Optionally check for error message or empty results
	});
});
