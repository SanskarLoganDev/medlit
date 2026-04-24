import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'
import { getSwitchLangPrompt } from '@/lib/prompts'

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
    const { cardData, targetLanguage } = await req.json()

    if (!cardData || !targetLanguage) {
      return NextResponse.json({ error: 'Missing cardData or targetLanguage' }, { status: 400 })
    }

    const lang = LANGUAGE_MAP[targetLanguage] ?? 'English'

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: getSwitchLangPrompt(lang),
      messages: [
        {
          role: 'user',
          content: JSON.stringify(cardData),
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json({ ...parsed, detectedLanguage: targetLanguage })
  } catch (err) {
    console.error('[/api/switch-lang]', err)
    return NextResponse.json(
      { error: 'Failed to switch language' },
      { status: 500 }
    )
  }
}
