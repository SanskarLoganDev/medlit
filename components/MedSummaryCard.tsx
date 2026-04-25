'use client'

import { useState } from 'react'
import { MedCardData } from '@/lib/types'
import MedCard from './MedCard'

interface Props {
  card: MedCardData
  index: number
  defaultOpen?: boolean
  onUpdate: (updated: MedCardData) => void
  onRemove: () => void
}

const topFlagColor: Record<string, string> = {
  red: 'border-l-red-400',
  amber: 'border-l-amber-400',
  green: 'border-l-green-400',
}

export default function MedSummaryCard({ card, index, defaultOpen = false, onUpdate, onRemove }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  const topFlag = card.flags?.find(f => f.level === 'red') ??
    card.flags?.find(f => f.level === 'amber') ??
    card.flags?.[0]

  const borderColor = topFlag ? topFlagColor[topFlag.level] : 'border-l-blue-300'

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${borderColor} overflow-hidden`}>
      {/* Summary header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl">💊</span>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-lg leading-tight truncate">{card.drugName}</p>
            <p className="text-sm text-gray-500 truncate">{card.dose} · {card.frequency}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {topFlag && (
            <span className={`hidden sm:inline text-xs px-2 py-1 rounded-full font-medium ${
              topFlag.level === 'red' ? 'bg-red-100 text-red-700' :
              topFlag.level === 'amber' ? 'bg-amber-100 text-amber-700' :
              'bg-green-100 text-green-700'
            }`}>
              {topFlag.level === 'red' ? '🔴 Alert' : topFlag.level === 'amber' ? '⚠️ Caution' : '✅ Safe'}
            </span>
          )}
          <span className="text-gray-400 text-lg">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Full card — expanded */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-5">
          <MedCard card={card} onUpdate={onUpdate} />
          <button
            onClick={onRemove}
            className="text-xs text-red-400 hover:text-red-600 hover:underline"
          >
            Remove this medication
          </button>
        </div>
      )}
    </div>
  )
}
