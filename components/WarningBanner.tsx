import { FlagItem } from '@/lib/types'

interface Props {
  flags: FlagItem[]
}

const CONFIG = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-800',
    icon: '🛑',
    label: 'Stop and get help',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-800',
    icon: '⚠️',
    label: 'Be careful',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-800',
    icon: '✅',
    label: 'Good to know',
  },
}

export default function WarningBanner({ flags }: Props) {
  if (!flags || flags.length === 0) return null

  return (
    <div className="space-y-2">
      {flags.map((flag, i) => {
        const c = CONFIG[flag.level] ?? CONFIG.green
        return (
          <div
            key={i}
            className={`${c.bg} ${c.border} ${c.text} border rounded-xl px-4 py-3 flex gap-3 items-start`}
            role="alert"
          >
            <span className="text-xl flex-shrink-0">{c.icon}</span>
            <div>
              <span className="font-semibold text-sm uppercase tracking-wide">{c.label}: </span>
              <span className="text-sm">{flag.text}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
