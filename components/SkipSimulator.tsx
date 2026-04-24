'use client'

import { useState } from 'react'

interface Props {
  drugName: string
}

export default function SkipSimulator({ drugName }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ whatToDo: string; risk: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function simulate() {
    if (result) { setOpen(true); return }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/skip-sim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugName }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      setOpen(true)
    } catch {
      setError('Could not load skip information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={simulate}
        disabled={loading}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        {loading ? <span className="spinner" /> : '❓'}
        Missed a dose?
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {open && result && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-yellow-800 mb-1">What to do right now:</p>
            <p className="text-sm text-yellow-900">{result.whatToDo}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-yellow-800 mb-1">Risk of skipping:</p>
            <p className="text-sm text-yellow-900">{result.risk}</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-yellow-600 hover:underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
