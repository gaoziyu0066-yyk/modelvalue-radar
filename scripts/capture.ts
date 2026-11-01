import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
// Captures the running app with a real direct API response. Never substitutes test fixtures.
const proxyUrl =
  process.env.CAPTURE_USE_PROXY === 'true' && process.env.HTTPS_PROXY
    ? new URL(process.env.HTTPS_PROXY)
    : null
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
  proxy: proxyUrl
    ? {
        server: proxyUrl.origin,
        username: decodeURIComponent(proxyUrl.username),
        password: decodeURIComponent(proxyUrl.password),
        bypass: '127.0.0.1,localhost',
      }
    : undefined,
})
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1,
})
await page.emulateMedia({ reducedMotion: 'reduce' })
const errors: string[] = []
page.on('pageerror', (error) => errors.push(error.message))
await mkdir('docs/screenshots', { recursive: true })
try {
  await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:4173/')
  if (process.env.CAPTURE_IMPORT === 'true') {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      signal: AbortSignal.timeout(20000),
    })
    if (!response.ok) throw new Error(`Official API HTTP ${response.status}`)
    await page.getByLabel('Import catalog JSON').setInputFiles({
      name: 'official-session.json',
      mimeType: 'application/json',
      buffer: Buffer.from(await response.text()),
    })
  } else {
    await page.getByRole('button', { name: 'Load official catalog', exact: true }).click()
  }
  await page.locator('.model-table tbody tr').first().waitFor({ timeout: 30000 })
  const stamp = await page.locator('.timestamp').innerText()
  const count = await page.locator('.table-note').innerText()
  await page.screenshot({ path: 'docs/screenshots/explore-dark.png', fullPage: true })
  await page.getByRole('button', { name: 'Toggle color theme' }).click()
  await page.screenshot({ path: 'docs/screenshots/explore-light.png', fullPage: true })
  await page.getByRole('button', { name: 'Toggle color theme' }).click()
  // Compare paid, currently listed models by selecting the first three Anthropic candidates.
  const providers = await page
    .getByLabel('Provider', { exact: true })
    .locator('option')
    .allTextContents()
  if (providers.includes('anthropic'))
    await page.getByLabel('Provider', { exact: true }).selectOption('anthropic')
  const addButtons = page.locator('.model-table button[aria-pressed="false"]')
  for (let i = 0; i < 3 && (await addButtons.count()); i++) await addButtons.first().click()
  await page.getByRole('button', { name: 'Compare models', exact: true }).click()
  await page.locator('.comparison-table').waitFor()
  await page.locator('.recharts-surface').first().waitFor()
  await page.screenshot({ path: 'docs/screenshots/compare.png', fullPage: true })
  await page.getByRole('navigation').getByRole('link', { name: 'Calculator', exact: true }).click()
  await page.getByTestId('monthly-cost').waitFor()
  await page.screenshot({ path: 'docs/screenshots/calculator.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'docs/screenshots/mobile-calculator.png', fullPage: true })
  await page.getByRole('navigation').getByRole('link', { name: 'Explore', exact: true }).click()
  await page.getByRole('button', { name: 'Clear comparison' }).click()
  await page.getByRole('button', { name: '切换为中文' }).click()
  await page.screenshot({ path: 'docs/screenshots/mobile-zh.png', fullPage: true })
  if (errors.length) throw new Error(errors.join('\n'))
  await writeFile(
    'docs/screenshots/README.md',
    `# Product captures\n\nCaptured from the running application with a real OpenRouter response at ${new Date().toISOString()}. Mode: ${process.env.CAPTURE_IMPORT === 'true' ? 'manual import of a freshly fetched official response; browser connection was intermittent' : 'direct browser fetch'}.\n\n${stamp}. ${count.replaceAll('\n', ' ')}.\n\nThese images document the UI, not current price guarantees. No test fixture or generated mockup was used. The model catalog was not saved. Third-party names and metadata retain their own rights.\n`,
  )
  console.log(
    JSON.stringify(
      {
        captured: true,
        timestamp: stamp,
        summary: count,
        browser: await browser.version(),
        pageErrors: errors,
      },
      null,
      2,
    ),
  )
} finally {
  await browser.close()
}
