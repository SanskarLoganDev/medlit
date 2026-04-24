import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD,
  },
})

export async function sendReminderEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  await transporter.sendMail({
    from: `"MedLit" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  })
}

export function buildReminderHtml(card: {
  drugName: string
  dose: string
  frequency: string
  instructions: string
  warnings: string[]
  flags: Array<{ level: string; text: string }>
}): string {
  const flagsHtml = card.flags
    .map((f) => {
      const color =
        f.level === 'red' ? '#DC2626' : f.level === 'amber' ? '#D97706' : '#16A34A'
      return `<li style="color:${color}; margin-bottom:4px;">&#9632; ${f.text}</li>`
    })
    .join('')

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
      <h1 style="font-size: 22px; color: #1e3a5f; margin-bottom: 4px;">💊 MedLit</h1>
      <p style="color: #6b7280; margin-top: 0;">Your medication information in plain language</p>

      <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
        <h2 style="font-size: 18px; margin: 0 0 8px;">${card.drugName}</h2>
        <p style="margin: 4px 0;"><strong>How much:</strong> ${card.dose}</p>
        <p style="margin: 4px 0;"><strong>When:</strong> ${card.frequency}</p>
        <p style="margin: 4px 0;"><strong>How to take it:</strong> ${card.instructions}</p>
      </div>

      <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
        <h3 style="margin: 0 0 12px;">Important notes:</h3>
        <ul style="padding-left: 0; list-style: none; margin: 0;">${flagsHtml}</ul>
      </div>

      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px;">
        ⚠️ This is not medical advice — see a doctor if unsure about your medication.
      </p>
    </div>
  `
}
