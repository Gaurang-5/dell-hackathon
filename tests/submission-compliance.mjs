import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const files = [
  'src/server.ts',
  'src/components/DataSourceChips.tsx',
  'src/components/RecommendationCard.tsx',
  'design_rationale_deck.md',
  'usability_test_report.md',
  'README.md',
]

const prohibited = [
  /\bhigh probability\b/i,
  /\bmodel explainability\b/i,
  /\bshap\b/i,
  /\blime\b/i,
  /\bhuggingface\b/i,
  /\bhf_api_key\b/i,
  /\bapi-inference\b/i,
  /\bfully autonomous\b/i,
  /\bact & notify\b/i,
  /\b\d+(?:\.\d+)?%\s*(?:confidence|uptime|of the time)\b/i,
]

for (const file of files) {
  const content = readFileSync(file, 'utf8')
  for (const pattern of prohibited) {
    assert.equal(pattern.test(content), false, `${file} exposes prohibited language: ${pattern}`)
  }
}

const sourceDrawer = readFileSync('src/components/DataSourceChips.tsx', 'utf8')
assert.equal(sourceDrawer.includes('activeSource.rawData'), false, 'Data source drawer must not expose raw source payloads')

const recommendationCard = readFileSync('src/components/RecommendationCard.tsx', 'utf8')
assert.match(recommendationCard, /AI Confidence Level/, 'Each recommendation must show a qualitative confidence label')

console.log('Submission-compliance copy checks passed.')
