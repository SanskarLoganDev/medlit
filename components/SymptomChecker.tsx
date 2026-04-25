'use client'

import { useState } from 'react'
import { SymptomCheckResult } from '@/lib/types'

interface Props {
  drugName: string
}

const severityConfig = {
  normal: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '✅',
    label: 'Common side effect',
    labelColor: 'text-green-700',
    textColor: 'text-green-900',
  },
  monitor: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: '👀',
    label: 'Keep an eye on this',
    labelColor: 'text-amber-700',
    textColor: 'text-amber-900',
  },
  'seek-help': {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '🚨',
    label: 'Get help now',
    labelColor: 'text-red-700',
    textColor: 'text-red-900',
  },
}

export default function SymptomChecker({ drugName }: Props) {
  const [open, setOpen] = useState(false)
  const [symptom, setSymptom] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SymptomCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function check() {
    if (!symptom.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/symptom-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugName, symptom: symptom.trim() }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch {
      setError('Could not check your symptom. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setSymptom('')
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => { setOpen(o => !o); if (open) reset() }}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        🤒 I feel a side effect
      </button>

      {open && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={symptom}
              onChange={e => { setSymptom(e.target.value); setResult(null) }}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder="e.g. dizzy, nausea, headache..."
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
            <button
              onClick={check}
              disabled={loading || !symptom.trim()}
              className="btn-primary px-4 py-2 text-sm rounded-xl disabled:opacity-50"
            >
              {loading ? <span className="spinner" /> : 'Check'}
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {result && (() => {
            const cfg = severityConfig[result.severity]
            return (
              <div className={`${cfg.bg} border ${cfg.border} rounded-xl p-4 space-y-2`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cfg.icon}</span>
                  <span className={`text-sm font-semibold ${cfg.labelColor}`}>{cfg.label}</span>
                </div>
                <p className={`text-sm ${cfg.textColor}`}>{result.explanation}</p>
                <p className={`text-sm font-medium ${cfg.textColor}`}>{result.advice}</p>
                <button onClick={reset} className={`text-xs ${cfg.labelColor} hover:underline`}>
                  Check another symptom
                </button>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
