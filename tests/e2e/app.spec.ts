import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { rawTestModel } from '../../src/test/fixtures'
import { DEFAULT_WORKLOAD } from '../../src/lib/cost'
const endpoint = 'https://openrouter.ai/api/v1/models'
const fixture = {
  data: [
    rawTestModel,
    ...Array.from({ length: 13 }, (_, i) => ({
      ...rawTestModel,
      id: `test/model-${i + 1}`,
      name: `TEST ONLY Model ${i + 1}`,
      context_length: i % 2 ? 64000 : 256000,
      pricing: {
        prompt: i === 0 ? '0' : String((i + 1) * 0.000001),
        completion: i === 0 ? '0' : String((i + 1) * 0.000003),
        request: '0',
      },
      supported_parameters: i % 2 ? [] : ['tools', 'response_format'],
    })),
  ],
}
async function load(page: Page) {
  await page.route(endpoint, (route) => route.fulfill({ json: fixture }))
  await page.goto('/')
  await page.getByRole('button', { name: 'Load official catalog', exact: true }).click()
  await expect(page.getByText('14 matching models')).toBeVisible()
}
test('loads only on demand, paginates and exposes no price fiction', async ({ page }) => {
  let requests = 0
  await page.route(endpoint, (r) => {
    requests++
    return r.fulfill({ json: fixture })
  })
  await page.goto('/')
  await expect(page.getByText('Your model shortlist starts here')).toBeVisible()
  expect(requests).toBe(0)
  await page.getByRole('button', { name: 'Load official catalog', exact: true }).click()
  await expect(page.locator('.model-table tbody tr')).toHaveCount(10)
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await expect(page.locator('.model-table tbody tr')).toHaveCount(4)
  expect(requests).toBe(1)
})
test('search, empty state, free and scenario filters work together', async ({ page }) => {
  await load(page)
  await page.getByRole('textbox', { name: 'Search models' }).fill('not-a-model')
  await expect(page.getByText('No models match these filters')).toBeVisible()
  await page.getByRole('button', { name: 'Clear all filters' }).click()
  await page.getByRole('button', { name: 'Filters', exact: true }).click()
  await page.getByLabel('Free text-token pricing only').check()
  await expect(page.locator('.model-table tbody tr')).toHaveCount(1)
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click()
  await page.getByRole('button', { name: 'Coding', exact: true }).click()
  await expect(page.getByText('8 matching models')).toBeVisible()
  await page.getByLabel('Monthly budget ($)', { exact: true }).fill('0')
  await expect(page.locator('.model-table tbody tr')).toHaveCount(1)
})
test('caps shortlist at three and renders comparison, prices and savings', async ({ page }) => {
  await load(page)
  const add = page.locator('.model-table button[aria-pressed="false"]')
  for (let i = 0; i < 3; i++) await add.first().click()
  await expect(add.first()).toBeDisabled()
  await page.getByRole('button', { name: 'Compare models', exact: true }).click()
  await expect(page.locator('.compare-slots .model-identity')).toHaveCount(3)
  await expect(page.getByRole('rowheader', { name: 'Savings vs. first model' })).toBeVisible()
  await expect(page.locator('.chart .recharts-wrapper')).toHaveCount(2)
  await page.locator('.compare-slot button').first().click()
  await expect(page.locator('.compare-slots .model-identity')).toHaveCount(2)
  await expect(page.getByLabel('Add model 1', { exact: true })).toBeEnabled()
})
test('calculator follows independently computed $900 and $787.50 examples', async ({ page }) => {
  await load(page)
  await page.getByRole('navigation').getByRole('link', { name: 'Calculator', exact: true }).click()
  await page.getByLabel('Calculate for model').selectOption('test/alpha')
  await expect(page.getByTestId('monthly-cost')).toHaveText('$900.00')
  await page.getByRole('slider', { name: /Input cache hit rate/ }).fill('50')
  await expect(page.getByTestId('monthly-cost')).toHaveText('$787.50')
  await page.getByLabel('Daily active users', { exact: false }).fill('100')
  await expect(page.getByTestId('monthly-cost')).toHaveText('$78.75')
  await page.getByLabel('Days / month', { exact: false }).fill('0')
  await expect(page.getByRole('alert')).toContainText('Use non-negative whole numbers')
  await expect(page.getByTestId('monthly-cost')).toHaveText('—')
})
test('shares IDs and workload, restores them, and handles clipboard denial', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('denied')) },
      configurable: true,
    }),
  )
  await load(page)
  await page.getByRole('button', { name: 'Compare TEST ONLY Alpha', exact: true }).click()
  await page.getByRole('button', { name: 'Compare models', exact: true }).click()
  await page.getByRole('button', { name: 'Share comparison', exact: true }).click()
  const link = await page.getByRole('textbox', { name: 'Copy manually' }).inputValue()
  expect(link).not.toContain('0.000002')
  await page.goto(link)
  await page.getByRole('button', { name: 'Load official catalog', exact: true }).click()
  await expect(page.locator('.compare-slots')).toContainText('TEST ONLY Alpha')
  await expect(
    page.getByRole('rowheader', { name: 'Monthly estimate', exact: true }).locator('..'),
  ).toContainText('$900.00')
  await page.getByRole('button', { name: 'Copy results' }).click()
  await expect(page.getByRole('textbox', { name: 'Copy manually' })).toContainText(
    'text-token estimate',
  )
})
test('import is local, invalid input is rejected and failed fetch preserves data', async ({
  page,
}) => {
  await page.goto('/')
  const input = page.getByLabel('Import catalog JSON')
  await input.setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{}'),
  })
  await expect(page.getByRole('alert')).toBeVisible()
  await input.setInputFiles({
    name: 'authorized-test.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(fixture)),
  })
  await expect(page.getByText('Local import · source age unverified')).toBeVisible()
  await page.route(endpoint, (r) => r.fulfill({ status: 503, body: 'unavailable' }))
  await page.getByRole('button', { name: 'Refresh', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Keeping the last successful data')
  await expect(page.locator('.model-table tbody tr')).toHaveCount(10)
  expect(await page.evaluate(() => localStorage.length)).toBe(2)
})
test('language and color theme persist across reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '切换为中文' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('选对模型')
  await page.getByRole('button', { name: '切换主题', exact: true }).click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('html')).not.toHaveClass(/dark/)
})
test('details dialog works with Escape and restores focus', async ({ page }) => {
  await load(page)
  await page.getByRole('textbox', { name: 'Search models' }).fill('alpha')
  const button = page.locator('.model-name-button').first()
  await button.click()
  await expect(page.getByRole('dialog')).toContainText('Advertised API parameters')
  await expect(page.getByRole('dialog')).toContainText('Catalog creation date')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(button).toBeFocused()
})
test('price insights filter and accessible table show real calculations', async ({ page }) => {
  await load(page)
  await page.getByRole('navigation').getByRole('link', { name: 'Insights', exact: true }).click()
  await page.getByLabel('Max input $ / 1M', { exact: true }).fill('0')
  await expect(page.getByText('1 models with known prices', { exact: false })).toBeVisible()
  await page.getByText('Accessible chart data', { exact: false }).click()
  await expect(page.locator('.comparison-table tbody tr')).toHaveCount(1)
  await expect(page.getByText('No historical price chart is shown', { exact: false })).toBeVisible()
})
test('invalid shared states fail safely, unavailable IDs can be removed', async ({ page }) => {
  await page.goto('/?s=broken#compare')
  await expect(page.getByRole('alert')).toContainText('share link is invalid')
  const state = { v: 1, models: ['test/no-longer-listed'], workload: DEFAULT_WORKLOAD }
  await page.goto(`/?s=${encodeURIComponent(JSON.stringify(state))}#compare`)
  await expect(
    page.getByText('These shared models are not in the loaded catalog.', { exact: false }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'test/no-longer-listed' }).click()
  await expect(page.getByLabel('Add model 3', { exact: true })).toBeVisible()
})
test('six-hour refresh failure keeps previous data and marks it stale', async ({ page }) => {
  await page.clock.install()
  await load(page)
  await page.route(endpoint, (r) =>
    r.fulfill({ status: 429, headers: { 'Retry-After': '120' }, body: '' }),
  )
  await page.clock.fastForward(6 * 60 * 60 * 1000 + 60000)
  await expect(page.getByText('This catalog is over 6 hours old.', { exact: false })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('429')
  await expect(page.locator('.model-table tbody tr')).toHaveCount(10)
})
test('layout remains within viewport on all main pages', async ({ page }) => {
  await load(page)
  for (const hash of ['explore', 'calculator', 'compare', 'insights', 'methodology']) {
    await page.evaluate((value) => {
      location.hash = value
    }, hash)
    await expect(page.locator('main h1')).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true)
  }
})
for (const theme of ['dark', 'light']) {
  test(`axe WCAG AA checks for ${theme} discovery, calculator and comparison`, async ({ page }) => {
    await load(page)
    if (theme === 'light') await page.getByRole('button', { name: 'Toggle color theme' }).click()
    await page.getByRole('button', { name: 'Compare TEST ONLY Alpha', exact: true }).click()
    for (const hash of ['explore', 'calculator', 'compare']) {
      await page.evaluate((value) => {
        location.hash = value
      }, hash)
      await expect(page.locator('main h1')).toBeVisible()
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(
        results.violations,
        JSON.stringify(
          results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        ),
      ).toEqual([])
    }
  })
}
