import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'
import { getFoodInteractionsPrompt } from '@/lib/prompts'

export async function POST(req: NextRequest) {
  try {
    const { drugName } = await req.json()

    if (!drugName) {
      return NextResponse.json({ error: 'No drug name provided' }, { status: 400 })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: getFoodInteractionsPrompt(drugName) }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[/api/food-interactions]', err)
    return NextResponse.json({ error: 'Failed to get food interactions' }, { status: 500 })
  }
}
