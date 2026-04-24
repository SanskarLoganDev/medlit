import { NextRequest, NextResponse } from 'next/server'
import { sendReminderEmail, buildReminderHtml } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const { email, card } = await req.json()

    if (!email || !card) {
      return NextResponse.json({ error: 'Missing email or card data' }, { status: 400 })
    }

    const html = buildReminderHtml(card)

    await sendReminderEmail(
      email,
      `💊 MedLit: Your medication info for ${card.drugName}`,
      html
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/send-reminder]', err)
    return NextResponse.json(
      { error: 'Failed to send email. Check your SMTP credentials.' },
      { status: 500 }
    )
  }
}
