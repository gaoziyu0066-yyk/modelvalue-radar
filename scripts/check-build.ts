import { build, preview } from 'vite'
import { chromium, expect } from '@playwright/test'
import { rawTestModel } from '../src/test/fixtures'
import { DEFAULT_WORKLOAD } from '../src/lib/cost'
// Deployment-path verification. Fixtures are never included in the production bundle.
const base = '/modelvalue-radar/'
await build({ base })
const server = await preview({ base, preview: { host: '127.0.0.1', port: 4180, strictPort: true } })
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined })
try {
  const page = await browser.newPage()
  const failures: string[] = []
  page.on('pageerror', (e) => failures.push(e.message))
  page.on('response', (r) => {
    if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`)
  })
  await page.route('https://openrouter.ai/api/v1/models', (route) =>
    route.fulfill({ json: { data: [rawTestModel] } }),
  )
  const state = encodeURIComponent(
    JSON.stringify({ v: 1, models: [rawTestModel.id], workload: DEFAULT_WORKLOAD }),
  )
  await page.goto(`http://127.0.0.1:4180${base}?s=${state}#compare`)
  await page.getByRole('button', { name: 'Load official catalog', exact: true }).click()
  await expect(page.locator('.comparison-table')).toContainText('$900.00')
  await expect(page.locator('.chart .recharts-wrapper')).toHaveCount(2)
  await page.getByRole('navigation').getByRole('link', { name: 'Calculator', exact: true }).click()
  await expect(page.getByTestId('monthly-cost')).toHaveText('$900.00')
  await page.reload()
  await expect(page.locator('main h1')).toContainText('An idea.')
  expect(new URL(page.url()).pathname).toBe(base)
  expect(failures).toEqual([])
  console.log(
    'PASS: production subpath assets, lazy chunks, shared state, navigation and reload; no HTTP/page errors.',
  )
} finally {
  await browser.close()
  await new Promise<void>((resolve, reject) =>
    server.httpServer.close((error) => (error ? reject(error) : resolve())),
  )
}
