'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import UploadZone from '@/components/UploadZone'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleImage(imageBase64: string, mimeType: string) {
    setLoading(true)
    setError(null)

    try {
      // Pass 1: extract
      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType }),
      })
      const extractedData = await extractRes.json()

      if (extractedData.error === 'not_a_prescription') {
        setError("That doesn't look like a prescription label. Please try again with a clearer photo.")
        setLoading(false)
        return
      }
      if (extractedData.error) {
        setError('Could not read the label. Please try a clearer photo.')
        setLoading(false)
        return
      }

      // Pass 2: explain
      const explainRes = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedData,
          language: extractedData.detectedLanguage ?? 'en',
        }),
      })
      const cardData = await explainRes.json()

      if (cardData.error) {
        setError('Could not generate your medication card. Please try again.')
        setLoading(false)
        return
      }

      // Store in sessionStorage and navigate to card
      sessionStorage.setItem('medCard', JSON.stringify(cardData))
      router.push('/card')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Understand your prescription
        </h1>
        <p className="text-gray-500 text-lg">
          Take a photo of your prescription label — we'll explain it in plain, simple words.
        </p>
      </div>

      <UploadZone onImage={handleImage} loading={loading} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-500 space-y-2">
          <div className="spinner mx-auto" />
          <p className="text-sm">Reading your prescription label…</p>
        </div>
      )}
    </div>
  )
}
