import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { rawTestModel } from '../../src/test/fixtures'
import { DEFAULT_WORKLOAD } from '../../src/lib/cost'
import { shareUrl } from '../../src/lib/share'
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
  expect(new URL(link).search).toBe('')
  await page.goto(link)
  await page.reload()
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
    await expect(page).toHaveTitle(
      new RegExp(
        {
          explore: 'Explore models',
          calculator: 'Cost calculator',
          compare: 'Compare models',
          insights: 'Price insights',
          methodology: 'Methodology',
        }[hash]!,
      ),
    )
    await expect(page.locator('main h1')).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true)
  }
})
for (const theme of ['dark', 'light']) {
  test(`axe WCAG AA checks for all five pages in ${theme}`, async ({ page }) => {
    await load(page)
    if (theme === 'light') await page.getByRole('button', { name: 'Toggle color theme' }).click()
    await page.getByRole('button', { name: 'Compare TEST ONLY Alpha', exact: true }).click()
    for (const hash of ['explore', 'calculator', 'compare', 'insights', 'methodology']) {
      await page.evaluate((value) => {
        location.hash = value
      }, hash)
      await expect(page).toHaveTitle(
        new RegExp(
          {
            explore: 'Explore models',
            calculator: 'Cost calculator',
            compare: 'Compare models',
            insights: 'Price insights',
            methodology: 'Methodology',
          }[hash]!,
        ),
      )
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

test('all scenario rules, sorts and hard filters respond to controls', async ({ page }) => {
  await load(page)
  for (const [name, count] of [
    ['Coding', 8],
    ['Everyday chat', 14],
    ['Long documents', 8],
    ['Batch processing', 8],
    ['Image understanding', 14],
    ['Budget first', 14],
  ] as const) {
    await page.getByRole('button', { name, exact: true }).click()
    await expect(page.getByText(`${count} matching models`)).toBeVisible()
    await page.getByRole('button', { name, exact: true }).click()
  }
  for (const sort of ['input', 'output', 'cost', 'context', 'newest', 'match']) {
    await page.getByLabel('Sort models', { exact: true }).selectOption(sort)
    await expect(page.locator('.model-table tbody tr')).toHaveCount(10)
    if (['input', 'output', 'cost'].includes(sort))
      await expect(page.locator('.model-table tbody tr').first()).toContainText('TEST ONLY Model 1')
  }
  await page.getByRole('button', { name: 'Filters', exact: true }).click()
  await page.getByLabel('Provider', { exact: true }).selectOption('test')
  await page.getByRole('combobox', { name: 'Input modality', exact: true }).selectOption('image')
  await page.getByRole('combobox', { name: 'API parameter', exact: true }).selectOption('tools')
  await page.getByRole('combobox', { name: 'Minimum context', exact: true }).selectOption('200000')
  await page.getByLabel('Max input $ / 1M', { exact: true }).fill('3')
  await page.getByLabel('Max output $ / 1M', { exact: true }).fill('0')
  await expect(page.locator('.model-table tbody tr')).toHaveCount(1)
  await page.getByRole('slider', { name: /Preference weighting/ }).fill('0')
  await expect(page.getByLabel('Sort models')).toHaveValue('match')
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click()
  await expect(page.getByText('14 matching models')).toBeVisible()
})

test('keyboard navigation, localized titles and invalid fields remain usable', async ({ page }) => {
  await load(page)
  await page.getByRole('navigation').getByRole('link', { name: 'Calculator', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
  await page.getByLabel('Days / month', { exact: false }).fill('')
  await expect(page.getByLabel('Days / month', { exact: false })).toHaveAttribute(
    'aria-invalid',
    'true',
  )
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(page.getByTestId('monthly-cost')).toHaveText('$900.00')
  await page.getByRole('button', { name: '切换为中文' }).click()
  await expect(page).toHaveTitle('成本计算器 · ModelValue Radar')
  await page.getByRole('navigation').getByRole('link', { name: '洞察', exact: true }).click()
  await expect(page).toHaveTitle('价格洞察 · ModelValue Radar')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('换个视角')
})

test('non-text-only and unknown-price catalogs remain selectable with explicit reasons', async ({
  page,
}) => {
  await page.route(endpoint, (route) =>
    route.fulfill({
      json: {
        data: [
          {
            ...rawTestModel,
            id: 'test/audio',
            name: 'TEST ONLY Audio',
            architecture: { input_modalities: ['text'], output_modalities: ['audio'] },
          },
          { ...rawTestModel, id: 'test/unknown', name: 'TEST ONLY Unknown', pricing: {} },
        ],
      },
    }),
  )
  await page.goto('/#calculator')
  await page.getByRole('button', { name: 'Load official catalog', exact: true }).click()
  await expect(page.getByLabel('Calculate for model')).toBeVisible()
  await expect(page.getByText('Text-token estimate unavailable for this modality.')).toBeVisible()
  await page.getByLabel('Calculate for model').selectOption('test/unknown')
  await expect(page.getByText('Token price is missing or dynamic.')).toBeVisible()
  await expect(page.getByTestId('monthly-cost')).toHaveText('—')
})

test('copied imported comparisons retain provenance and cache warnings', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('denied')) },
    }),
  )
  await page.goto('/#compare')
  await page.getByLabel('Import catalog JSON').setInputFiles({
    name: 'test.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(fixture)),
  })
  await page.getByLabel('Add model 1', { exact: true }).selectOption('test/model-2')
  await page.getByRole('link', { name: /^Edit workload/ }).click()
  await page.getByRole('slider', { name: /Input cache hit rate/ }).fill('100')
  await page
    .getByRole('navigation')
    .getByRole('link', { name: /^Compare/ })
    .click()
  await page.getByRole('button', { name: 'Copy results', exact: true }).click()
  const copy = page.getByRole('textbox', { name: 'Copy manually' })
  await expect(copy).toContainText('Source: local import; source authenticity and age unverified')
  await expect(copy).toContainText('Cache-read price missing')
  await expect(page.getByRole('rowheader', { name: 'Data source' }).locator('..')).toContainText(
    'Local import · unverified',
  )
})

test('charts load on demand, tooltips and shortlist data stay accessible', async ({ page }) => {
  const chartRequests: string[] = []
  page.on('request', (request) => {
    if (/\/Charts[.-]/.test(request.url())) chartRequests.push(request.url())
  })
  await load(page)
  expect(chartRequests).toHaveLength(0)
  await page.getByRole('button', { name: 'Compare TEST ONLY Alpha', exact: true }).click()
  await page.getByRole('navigation').getByRole('link', { name: 'Insights', exact: true }).click()
  await expect(page.locator('.scatter-chart .recharts-scatter-symbol')).not.toHaveCount(0)
  expect(chartRequests.length).toBeGreaterThan(0)
  await page.locator('.scatter-chart .recharts-scatter-symbol').last().hover({ force: true })
  await expect(page.locator('.chart-tooltip')).toBeVisible()
  await expect(page.locator('.chart-tooltip')).toContainText('Input')
  await page.getByLabel('Max input $ / 1M', { exact: true }).fill('0')
  await expect(page.getByLabel('Shortlist monthly estimates')).toContainText('$900.00')
  await page.getByLabel('Max input $ / 1M', { exact: true }).fill('10')
  await page.getByText('Accessible chart data', { exact: false }).click()
  await expect(page.locator('.comparison-table')).toContainText('$900.00')
})

test('long imported names and extreme valid workloads fit every viewport', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route(endpoint, (route) =>
    route.fulfill({
      json: {
        data: [
          {
            ...rawTestModel,
            name: 'TEST ONLY ' + 'LongName'.repeat(50),
            pricing: { ...rawTestModel.pricing, request: '10000000' },
          },
        ],
      },
    }),
  )
  await page.goto('/#calculator')
  await page.getByRole('button', { name: 'Load official catalog', exact: true }).click()
  await page.getByLabel('Daily active users', { exact: false }).fill('100000000')
  await page.getByLabel('Calls / user / day', { exact: false }).fill('1000000')
  await expect(page.getByTestId('monthly-cost')).not.toHaveText('—')
  await expect(page.getByTestId('monthly-cost')).toHaveText('≈$3.000e+22')
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true)
  await page.screenshot({ path: testInfo.outputPath('extreme-calculator.png'), fullPage: true })
  await page
    .getByRole('navigation')
    .getByRole('link', { name: /^Compare/ })
    .click()
  await page.getByLabel('Add model 1', { exact: true }).selectOption('test/alpha')
  await expect(page.locator('.chart .recharts-wrapper')).toHaveCount(2)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true)
  expect(errors).toEqual([])
})

test('review screenshots cover loaded pages in both languages and themes', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await load(page)
  await page.getByRole('button', { name: 'Compare TEST ONLY Alpha', exact: true }).click()
  await page.getByRole('button', { name: 'Compare models', exact: true }).click()
  await expect(page.locator('.chart .recharts-wrapper')).toHaveCount(2)
  await page.screenshot({ path: testInfo.outputPath('compare-dark.png'), fullPage: true })
  await page.getByRole('button', { name: 'Toggle color theme' }).click()
  await page.getByRole('button', { name: '切换为中文' }).click()
  await page.screenshot({ path: testInfo.outputPath('compare-light-zh.png'), fullPage: true })
})

test('fragment shares restore in the same tab without sending workload to the host', async ({
  page,
}) => {
  const documentUrls: string[] = []
  page.on('request', (request) => {
    if (request.resourceType() === 'document') documentUrls.push(request.url())
  })
  await load(page)
  const link = shareUrl(
    { models: ['test/alpha'], workload: { ...DEFAULT_WORKLOAD, users: 37 } },
    page.url(),
  )
  await page.goto(link)
  await expect(page.locator('.comparison-workload')).toContainText('37 users')
  await expect(page.locator('.comparison-table')).toContainText('$33.30')
  await page.reload()
  await page.getByRole('button', { name: 'Load official catalog', exact: true }).click()
  await expect(page.locator('.comparison-table')).toContainText('$33.30')
  expect(documentUrls.every((url) => !new URL(url).searchParams.has('s'))).toBe(true)
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'no-referrer')
})

test('untrusted imported names are text, filter parameters come from the catalog', async ({
  page,
}) => {
  const name = 'TEST ONLY <img src=x onerror="window.__xss=1">'
  await page.goto('/')
  await page.getByLabel('Import catalog JSON').setInputFiles({
    name: 'test.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify({
        data: [
          {
            ...rawTestModel,
            name,
            supported_parameters: ['custom_parameter', 'custom_parameter'],
          },
        ],
      }),
    ),
  })
  await expect(page.locator('.model-name-button')).toContainText(name)
  expect(await page.locator('.model-name-button img').count()).toBe(0)
  await page.getByRole('button', { name: 'Filters', exact: true }).click()
  await page
    .getByRole('combobox', { name: 'API parameter', exact: true })
    .selectOption('custom_parameter')
  await expect(page.locator('.model-table tbody tr')).toHaveCount(1)
  await page.locator('.model-name-button').click()
  await expect(page.getByRole('dialog').locator('.tag')).toHaveCount(1)
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(results.violations).toEqual([])
})

test('horizontal comparison data can be scrolled with the keyboard', async ({ page }) => {
  await load(page)
  const buttons = page.locator('.model-table button[aria-pressed="false"]')
  for (let i = 0; i < 3; i++) await buttons.first().click()
  await page.getByRole('button', { name: 'Compare models', exact: true }).click()
  const region = page.getByRole('region', { name: 'Scrollable model comparison' })
  await region.focus()
  await expect(region).toBeFocused()
  const canScroll = await region.evaluate((el) => el.scrollWidth > el.clientWidth)
  if (canScroll) {
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
  }
})
