'use client'

import { useState } from 'react'
import { MedCardData } from '@/lib/types'
import WarningBanner from './WarningBanner'
import DoseSchedule from './DoseSchedule'
import SkipSimulator from './SkipSimulator'
import LanguageSwitcher from './LanguageSwitcher'
import ReminderForm from './ReminderForm'
import FoodInteractionCards from './FoodInteractionCards'
import SymptomChecker from './SymptomChecker'

interface Props {
  card: MedCardData
  onUpdate: (updated: MedCardData) => void
}

export default function MedCard({ card, onUpdate }: Props) {
  const [langLoading, setLangLoading] = useState(false)

  async function handleLanguageSwitch(langCode: string) {
    if (langCode === card.detectedLanguage) return
    setLangLoading(true)
    try {
      const res = await fetch('/api/switch-lang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardData: card, targetLanguage: langCode }),
      })
      const updated = await res.json()
      if (!updated.error) onUpdate(updated)
    } catch {
      // silently fail
    } finally {
      setLangLoading(false)
    }
  }

  const warnings = card.warnings ?? []
  const interactions = card.interactions ?? []
  const flags = card.flags ?? []

  return (
    <div className="space-y-6">

      {/* Top row: drug name + dose side by side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{card.drugName}</h1>
              {card.genericName && (
                <p className="text-sm text-gray-500 mt-1">Generic: {card.genericName}</p>
              )}
            </div>
            <span className="text-4xl">💊</span>
          </div>
          <p className="mt-4 text-gray-700 text-base leading-relaxed">{card.purpose}</p>
        </div>

        <div className="card">
          <div className="mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Dosage</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.dose ?? '—'}</p>
          </div>
          <DoseSchedule frequency={card.frequency} instructions={card.instructions} />
        </div>
      </div>

      {/* Flags — full width */}
      {flags.length > 0 && <WarningBanner flags={flags} />}

      {/* Warnings + Interactions */}
      {(warnings.length > 0 || interactions.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {warnings.length > 0 && (
            <div className="card space-y-3">
              <h3 className="font-semibold text-gray-700 text-base">⚠️ Warnings</h3>
              <ul className="space-y-2">
                {warnings.map((w, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed">{w}</li>
                ))}
              </ul>
            </div>
          )}
          {interactions.length > 0 && (
            <div className="card space-y-3">
              <h3 className="font-semibold text-gray-700 text-base">🔗 Drug interactions</h3>
              <ul className="space-y-2">
                {interactions.map((inter, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed">{inter}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Food interactions + Symptom checker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <FoodInteractionCards drugName={card.drugName} />
        </div>
        <div className="card">
          <SymptomChecker drugName={card.drugName} />
        </div>
      </div>

      {/* Skip simulator + email */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <SkipSimulator drugName={card.drugName} />
        </div>
        <div className="card">
          <ReminderForm card={card} />
        </div>
      </div>

      {/* Language switcher */}
      <div className="card relative">
        {langLoading && (
          <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center z-10">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}
        <LanguageSwitcher
          current={card.detectedLanguage ?? 'en'}
          loading={langLoading}
          onSwitch={handleLanguageSwitch}
        />
      </div>

      <div className="bg-gray-100 rounded-xl px-5 py-4 text-sm text-gray-500 text-center">
        ⚠️ This is not medical advice. Always follow your doctor&apos;s instructions and check with a pharmacist if unsure.
      </div>
    </div>
  )
}
