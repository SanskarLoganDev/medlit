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

      const existing = sessionStorage.getItem('medCards')
      const cards = existing ? JSON.parse(existing) : []
      cards.push(cardData)
      sessionStorage.setItem('medCards', JSON.stringify(cards))
      router.push('/card')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] gap-8">
      {/* Hero text */}
      <div className="text-center space-y-3 max-w-2xl px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
          Understand your prescription
        </h1>
        <p className="text-gray-500 text-lg sm:text-xl">
          Take a photo of your prescription label — we&apos;ll explain it in plain, simple words.
        </p>
      </div>

      {/* Upload zone — full width up to a generous max */}
      <div className="w-full max-w-3xl px-4">
        <UploadZone onImage={handleImage} loading={loading} />
      </div>

      {/* Error */}
      {error && (
        <div className="w-full max-w-3xl px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-base">Reading your prescription label…</p>
        </div>
      )}

      {/* Feature hints */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl px-4 mt-2">
          {[
            { icon: '🔍', label: 'Extracts all details' },
            { icon: '📖', label: 'Plain language' },
            { icon: '🌍', label: '10 languages' },
            { icon: '💌', label: 'Email to yourself' },
          ].map((f) => (
            <div key={f.label} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="text-xs text-gray-500 font-medium">{f.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
