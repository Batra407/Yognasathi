const { test, expect } = require('@playwright/test');

test.describe('End-to-End Application Test Suite', () => {

  // TEST 1: Open application -> homepage loads successfully.
  test('TEST 1: Homepage renders successfully with header, hero, and workflow section', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/YojanaSathi|Government Scheme|Multilingual/i);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByText(/Democratizing Access to Public Welfare/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Try Speaking Now/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Try Typing Now/i })).toBeVisible();
  });

  // TEST 2: Text input -> submit user request -> assistant processes request -> results appear.
  test('TEST 2: Text input requirement submission returns assistant results', async ({ page }) => {
    await page.goto('/');

    await page.click('button:has-text("Try Typing Now")');
    const textarea = page.locator('#text-requirement');
    await expect(textarea).toBeVisible();

    await textarea.fill('I am a 35 year old farmer from Punjab with income 2 lakh and need a scheme');
    await page.click('button:has-text("Search Assistant")');

    await expect(page.getByText(/Extracted User Profile/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Recommended Schemes/i)).toBeVisible();
  });

  // TEST 3: English multilingual flow -> input -> processing -> results.
  test('TEST 3: English multilingual flow', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Try Typing Now")');

    await page.locator('#text-requirement').fill('I am a student with annual income 2 lakh looking for scholarship');
    await page.click('button:has-text("Search Assistant")');

    await expect(page.getByText(/Extracted User Profile/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Recommended Schemes/i)).toBeVisible();
  });

  // TEST 4: Hindi multilingual flow -> input -> processing -> results.
  test('TEST 4: Hindi multilingual flow', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Try Typing Now")');

    await page.locator('#text-requirement').fill('मैं पंजाब का 35 साल का किसान हूँ। मेरी सालाना आय 2 लाख है। मुझे सरकारी योजना चाहिए।');
    await page.click('button:has-text("Search Assistant")');

    await expect(page.getByText(/Extracted User Profile/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Recommended Schemes/i)).toBeVisible();
  });

  // TEST 5: Punjabi multilingual flow -> input -> processing -> results.
  test('TEST 5: Punjabi multilingual flow', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Try Typing Now")');

    await page.locator('#text-requirement').fill('ਮੈਂ 35 ਸਾਲ ਦਾ ਪੰਜਾਬ ਦਾ ਕਿਸਾਨ ਹਾਂ ਅਤੇ ਮੇਰੀ ਸਾਲਾਨਾ ਆਮਦਨ 2 ਲੱਖ ਹੈ।');
    await page.click('button:has-text("Search Assistant")');

    await expect(page.getByText(/Extracted User Profile/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Recommended Schemes/i)).toBeVisible();
  });

  // TEST 6: Search schemes -> search -> results.
  test('TEST 6: Search schemes in Admin Schemes Explorer', async ({ page }) => {
    await page.goto('/admin/schemes');

    await expect(page.getByText(/Government Schemes Explorer/i)).toBeVisible();

    const searchInput = page.locator('input[placeholder*="Crop Insurance"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Kisan');

    await expect(page.getByText(/Pradhan Mantri Kisan/i).first()).toBeVisible({ timeout: 10000 });
  });

  // TEST 7: Department filtering -> select department -> results.
  test('TEST 7: Department filtering in Admin Schemes Explorer', async ({ page }) => {
    await page.goto('/admin/schemes');

    const deptSelect = page.locator('select').first();
    await expect(deptSelect).toBeVisible();
    await deptSelect.selectOption({ index: 1 });

    await expect(page.getByText(/Showing/i)).toBeVisible({ timeout: 10000 });
  });

  // TEST 8: Open individual scheme -> scheme details displayed.
  test('TEST 8: Scheme API and scheme details inspection', async ({ page }) => {
    const res = await page.request.get('/api/schemes?limit=1');
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    const schemeId = json.data[0].id;

    const detailRes = await page.request.get(`/api/schemes/${schemeId}`);
    expect(detailRes.ok()).toBeTruthy();
    const schemeData = await detailRes.json();
    expect(schemeData.id).toBe(schemeId);
    expect(schemeData.schemeName).toBeDefined();
  });

  // TEST 9: No matching result -> proper empty-state message.
  test('TEST 9: No matching result empty-state', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Try Typing Now")');

    await page.locator('#text-requirement').fill('xyz_nonexistent_random_query_123456789');
    await page.click('button:has-text("Search Assistant")');

    await expect(page.getByText(/No matching schemes found in Dataset A/i)).toBeVisible({ timeout: 10000 });
  });

  // TEST 10: Backend/API failure -> frontend displays proper error state.
  test('TEST 10: API failure error handling display', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Try Typing Now")');

    await page.route('/api/schemes/assistant', route => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Simulated backend database error' })
    }));

    await page.locator('#text-requirement').fill('Testing error handling');
    await page.click('button:has-text("Search Assistant")');

    await expect(page.locator('div').filter({ hasText: 'Simulated backend database error' }).first()).toBeVisible({ timeout: 10000 });
  });

});
