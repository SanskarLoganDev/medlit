/**
 * Flesch-Kincaid Reading Ease — implemented inline to avoid ESM import issues.
 * Score >= 60 = plain English (Grade 5–6 level), which is our target.
 *
 * Formula: 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
 */

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (word.length <= 3) return 1
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')
  const matches = word.match(/[aeiouy]{1,2}/g)
  return matches ? matches.length : 1
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function countSentences(text: string): number {
  const matches = text.match(/[.!?]+/g)
  return matches ? matches.length : 1
}

function totalSyllables(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .reduce((sum, word) => sum + countSyllables(word), 0)
}

export function readingEase(text: string): number {
  const words = countWords(text)
  const sentences = countSentences(text)
  const syllables = totalSyllables(text)
  if (words === 0 || sentences === 0) return 70
  return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
}

/** Returns true if text is readable at Grade 5 level or easier (score >= 60) */
export function isReadable(text: string): boolean {
  return readingEase(text) >= 60
}

export function cardTextForCheck(card: Record<string, unknown>): string {
  return ['purpose', 'dose', 'frequency', 'instructions']
    .map((f) => (typeof card[f] === 'string' ? (card[f] as string) : ''))
    .join(' ')
}
