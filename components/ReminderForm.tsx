'use client'

import { useState } from 'react'
import { MedCardData } from '@/lib/types'

interface Props {
  card: MedCardData
}

export default function ReminderForm({ card }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function sendEmail() {
    if (!email) return
    setLoading(true)
    setStatus('idle')

    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, card }),
      })
      const data = await res.json()
      if (data.error) {
        setErrorMsg(data.error)
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setErrorMsg('Could not reach the server. Please try again.')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">📧 Send medication info to your email</p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label="Email address"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendEmail}
          disabled={loading || !email}
          className="btn-primary flex items-center gap-1"
        >
          {loading ? <span className="spinner" /> : '📤'}
          Send
        </button>
      </div>

      {status === 'success' && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          ✅ Email sent to {email}!
        </p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          ❌ {errorMsg}
        </p>
      )}
    </div>
  )
}
