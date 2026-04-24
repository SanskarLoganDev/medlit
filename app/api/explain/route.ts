import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'
import { getExplainSystemPrompt } from '@/lib/prompts'
import { isReadable, cardTextForCheck } from '@/lib/readability'

const LANGUAGE_MAP: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  zh: 'Chinese (Simplified)',
  fr: 'French',
  ar: 'Arabic',
  hi: 'Hindi',
  pt: 'Portuguese',
  ru: 'Russian',
  de: 'German',
  ja: 'Japanese',
}

export async function POST(req: NextRequest) {
  try {
    const { extractedData, language } = await req.json()

    if (!extractedData) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 })
    }

    const lang = LANGUAGE_MAP[language] ?? 'English'
    const systemPrompt = getExplainSystemPrompt(lang)

    const callClaude = async () => {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: JSON.stringify(extractedData),
          },
        ],
      })
      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const clean = text.replace(/```json|```/g, '').trim()
      return JSON.parse(clean)
    }

    let card = await callClaude()

    // Flesch-Kincaid check — retry once if too hard (only for English)
    if (language === 'en' || !language) {
      const checkText = cardTextForCheck(card)
      if (!isReadable(checkText)) {
        card = await callClaude()
      }
    }

    return NextResponse.json(card)
  } catch (err) {
    console.error('[/api/explain]', err)
    return NextResponse.json(
      { error: 'Failed to generate plain-language card' },
      { status: 500 }
    )
  }
}
