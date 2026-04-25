import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'
import { getSymptomCheckPrompt } from '@/lib/prompts'

export async function POST(req: NextRequest) {
  try {
    const { drugName, symptom } = await req.json()

    if (!drugName || !symptom) {
      return NextResponse.json({ error: 'Drug name and symptom are required' }, { status: 400 })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: getSymptomCheckPrompt(drugName, symptom) }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[/api/symptom-check]', err)
    return NextResponse.json({ error: 'Failed to check symptom' }, { status: 500 })
  }
}
