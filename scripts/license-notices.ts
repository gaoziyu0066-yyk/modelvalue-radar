import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'

// A conservative inventory of installed production dependency entries, including
// type-only peers. Not a claim that every listed package is in the final bundle.
const lock = z
  .object({
    packages: z.record(
      z.string(),
      z.object({ dev: z.boolean().optional(), version: z.string().optional() }),
    ),
  })
  .parse(JSON.parse(await readFile('package-lock.json', 'utf8')))
const metadata = z.object({ name: z.string(), version: z.string(), license: z.string() })
const sections = [
  'ModelValue Radar — third-party dependency notices',
  'Generated from installed production entries in package-lock.json. Includes shared/type-only peers; not a bundle analysis. Third-party terms remain in force. Regenerate with npm run licenses:generate.\n',
]
let count = 0
for (const [directory, entry] of Object.entries(lock.packages).sort(([a], [b]) =>
  a.localeCompare(b, 'en'),
)) {
  if (!directory || entry.dev) continue
  const absolute = path.resolve(directory)
  if (!absolute.startsWith(path.resolve('node_modules') + path.sep))
    throw new Error(`Unexpected dependency path: ${directory}`)
  const pkg = metadata.parse(
    JSON.parse(await readFile(path.join(absolute, 'package.json'), 'utf8')),
  )
  if (pkg.version !== entry.version)
    throw new Error(`Installed version differs from lockfile: ${pkg.name}. Run npm ci.`)
  const notices = (await readdir(absolute, { withFileTypes: true }))
    .filter((file) => file.isFile() && /^(licen[sc]e|copying|notice)(\.|$)/i.test(file.name))
    .map((file) => file.name)
    .sort()
  if (!notices.some((name) => /^(licen[sc]e|copying)/i.test(name)))
    throw new Error(`Missing license text: ${pkg.name}; review before distribution.`)
  sections.push(`\n${'='.repeat(72)}\n${pkg.name}@${pkg.version} — ${pkg.license}\n${directory}\n`)
  for (const name of notices)
    sections.push(
      `--- ${name} ---\n${(await readFile(path.join(absolute, name), 'utf8')).replaceAll('\r\n', '\n').trimEnd()}\n`,
    )
  count++
}
const content = sections.join('\n').trimEnd() + '\n'
const output = 'public/third-party-licenses.txt'
if (process.argv.includes('--check')) {
  if ((await readFile(output, 'utf8')).replaceAll('\r\n', '\n') !== content)
    throw new Error(
      'Dependency notices are stale. Run npm run licenses:generate and review the diff.',
    )
  console.log(
    `PASS: ${count} locked production dependency entries have current license/notice text.`,
  )
} else {
  await writeFile(output, content)
  console.log(`Wrote notices for ${count} locked production dependency entries to ${output}.`)
}
