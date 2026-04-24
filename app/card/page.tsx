'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MedCardData } from '@/lib/types'
import MedCard from '@/components/MedCard'

export default function CardPage() {
  const router = useRouter()
  const [card, setCard] = useState<MedCardData | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('medCard')
    if (!stored) {
      router.push('/')
      return
    }
    setCard(JSON.parse(stored))
  }, [router])

  function handleCardUpdate(updated: MedCardData) {
    setCard(updated)
    sessionStorage.setItem('medCard', JSON.stringify(updated))
  }

  if (!card) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.push('/')}
        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
      >
        ← Scan another prescription
      </button>
      <MedCard card={card} onUpdate={handleCardUpdate} />
    </div>
  )
}
