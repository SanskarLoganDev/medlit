'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MedCardData } from '@/lib/types'
import MedSummaryCard from '@/components/MedSummaryCard'

export default function CardPage() {
  const router = useRouter()
  const [cards, setCards] = useState<MedCardData[]>([])

  useEffect(() => {
    const stored = sessionStorage.getItem('medCards')
    if (!stored) { router.push('/'); return }
    const parsed: MedCardData[] = JSON.parse(stored)
    if (parsed.length === 0) { router.push('/'); return }
    setCards(parsed)
  }, [router])

  function handleUpdate(index: number, updated: MedCardData) {
    setCards(prev => {
      const next = [...prev]
      next[index] = updated
      sessionStorage.setItem('medCards', JSON.stringify(next))
      return next
    })
  }

  function handleRemove(index: number) {
    setCards(prev => {
      const next = prev.filter((_, i) => i !== index)
      if (next.length === 0) {
        sessionStorage.removeItem('medCards')
        router.push('/')
        return prev
      }
      sessionStorage.setItem('medCards', JSON.stringify(next))
      return next
    })
  }

  function handleAddAnother() {
    router.push('/')
  }

  function handleClearAll() {
    sessionStorage.removeItem('medCards')
    router.push('/')
  }

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Medications
            <span className="ml-2 text-base font-normal text-gray-400">
              ({cards.length} {cards.length === 1 ? 'prescription' : 'prescriptions'})
            </span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddAnother}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
          >
            + Add another
          </button>
          <button
            onClick={handleClearAll}
            className="btn-secondary text-sm px-4 py-2"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Combined daily schedule */}
      {cards.length > 1 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
            📅 Combined Daily Schedule
          </h2>
          <ul className="space-y-2">
            {cards.map((c, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-blue-400 font-bold w-5 text-center">{i + 1}</span>
                <div>
                  <span className="font-semibold text-gray-900">{c.drugName}</span>
                  {c.dose && <span className="text-gray-500"> · {c.dose}</span>}
                  {c.frequency && <span className="text-gray-600"> — {c.frequency}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Medication cards */}
      <div className="space-y-4">
        {cards.map((card, i) => (
          <MedSummaryCard
            key={i}
            card={card}
            index={i}
            defaultOpen={i === 0}
            onUpdate={updated => handleUpdate(i, updated)}
            onRemove={() => handleRemove(i)}
          />
        ))}
      </div>

      <div className="bg-gray-100 rounded-xl px-5 py-4 text-sm text-gray-500 text-center">
        ⚠️ This is not medical advice. Always follow your doctor&apos;s instructions and check with a pharmacist if unsure.
      </div>
    </div>
  )
}
