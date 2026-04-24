'use client'

import { useState } from 'react'
import { MedCardData } from '@/lib/types'
import WarningBanner from './WarningBanner'
import DoseSchedule from './DoseSchedule'
import SkipSimulator from './SkipSimulator'
import LanguageSwitcher from './LanguageSwitcher'
import ReminderForm from './ReminderForm'

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
      // silently fail — card stays in current language
    } finally {
      setLangLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Drug name header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{card.drugName}</h1>
            {card.genericName && (
              <p className="text-sm text-gray-500 mt-0.5">Generic: {card.genericName}</p>
            )}
          </div>
          <span className="text-3xl">💊</span>
        </div>
        <p className="mt-3 text-gray-700">{card.purpose}</p>
      </div>

      {/* Warnings */}
      {card.flags && card.flags.length > 0 && (
        <div className="space-y-2">
          <WarningBanner flags={card.flags} />
        </div>
      )}

      {/* Dose schedule */}
      <div className="card">
        <div className="mb-2">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Dose</span>
          <p className="text-lg font-semibold text-gray-900 mt-1">{card.dose}</p>
        </div>
        <DoseSchedule frequency={card.frequency} instructions={card.instructions} />
      </div>

      {/* Warnings list */}
      {card.warnings && card.warnings.length > 0 && (
        <div className="card space-y-2">
          <h3 className="font-semibold text-gray-700">Warnings</h3>
          <ul className="space-y-1">
            {card.warnings.map((w, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span>⚠️</span> {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactions list */}
      {card.interactions && card.interactions.length > 0 && (
        <div className="card space-y-2">
          <h3 className="font-semibold text-gray-700">Drug interactions</h3>
          <ul className="space-y-1">
            {card.interactions.map((inter, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span>🔗</span> {inter}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skip simulator */}
      <div className="card">
        <SkipSimulator drugName={card.drugName} />
      </div>

      {/* Language switcher */}
      <div className="card relative">
        {langLoading && (
          <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center">
            <div className="spinner text-blue-600" />
          </div>
        )}
        <LanguageSwitcher
          current={card.detectedLanguage ?? 'en'}
          loading={langLoading}
          onSwitch={handleLanguageSwitch}
        />
      </div>

      {/* Email reminder */}
      <div className="card">
        <ReminderForm card={card} />
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-100 rounded-xl px-4 py-3 text-xs text-gray-500 text-center">
        ⚠️ This is not medical advice. Always follow your doctor's instructions and check with a pharmacist if you are unsure.
      </div>
    </div>
  )
}
