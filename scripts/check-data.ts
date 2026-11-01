import { writeFile, appendFile } from 'node:fs/promises'
import { CATALOG_URL, openRouterProvider } from '../src/lib/catalog'

// Deliberately opt-in. Report metadata only; never persist or mirror a model catalog.
if (process.env.CATALOG_CHECK_ENABLED !== 'true') {
  console.log(
    'Catalog check disabled. Review source usage rights, then set CATALOG_CHECK_ENABLED=true.',
  )
} else {
  const checkedAt = new Date().toISOString()
  let report: Record<string, unknown>
  try {
    const catalog = await openRouterProvider.load()
    report = {
      status: 'ok',
      checkedAt,
      lastSuccessfulAt: catalog.fetchedAt,
      source: CATALOG_URL,
      validRecords: catalog.models.length,
      rejectedRecords: catalog.rejected,
      note: 'Retrieval time, not price-change time. No model data retained.',
    }
    console.log(
      `Catalog schema valid: ${catalog.models.length} models, ${catalog.rejected} rejected.`,
    )
  } catch (error) {
    report = {
      status: 'failed',
      checkedAt,
      source: CATALOG_URL,
      reason: error instanceof Error ? error.message : 'Unknown failure',
      note: 'Previous site and browser catalogs are not modified. See earlier successful Actions runs for the last successful check.',
    }
    console.error(report.reason)
    process.exitCode = 1
  }
  await writeFile('data-check.json', JSON.stringify(report, null, 2) + '\n')
  if (process.env.GITHUB_STEP_SUMMARY)
    await appendFile(
      process.env.GITHUB_STEP_SUMMARY,
      `## Catalog check\n\n\`\`\`json\n${JSON.stringify(report, null, 2)}\n\`\`\`\n`,
    )
}
