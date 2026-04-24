'use client'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '中文' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
]

interface Props {
  current: string
  loading: boolean
  onSwitch: (langCode: string) => void
}

export default function LanguageSwitcher({ current, loading, onSwitch }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Language</p>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSwitch(lang.code)}
            disabled={loading}
            aria-pressed={current === lang.code}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              current === lang.code
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  )
}
