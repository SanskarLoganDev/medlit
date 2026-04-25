'use client'

import { useState } from 'react'
import { FoodInteraction } from '@/lib/types'

interface Props {
  drugName: string
}

const severityConfig = {
  avoid: {
    label: 'Avoid',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
  caution: {
    label: 'Caution',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
  timing: {
    label: 'Not at same time',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
}

export default function FoodInteractionCards({ drugName }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [interactions, setInteractions] = useState<FoodInteraction[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    if (interactions !== null) { setOpen(o => !o); return }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/food-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugName }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setInteractions(data)
      setOpen(true)
    } catch {
      setError('Could not load food interactions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={load}
        disabled={loading}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        {loading ? <span className="spinner" /> : '🍽️'}
        {open ? 'Hide food interactions' : 'What foods should I avoid?'}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {open && interactions !== null && (
        <div className="space-y-2">
          {interactions.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              ✅ No known food interactions for this medication.
            </div>
          ) : (
            interactions.map((item, i) => {
              const cfg = severityConfig[item.severity]
              return (
                <div key={i} className={`${cfg.bg} border ${cfg.border} rounded-xl p-3 flex items-start gap-3`}>
                  <span className="text-2xl leading-none mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{item.food}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{item.reason}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
