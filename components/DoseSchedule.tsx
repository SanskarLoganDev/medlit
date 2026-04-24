interface Props {
  frequency: string
  instructions: string
}

function parseTimes(frequency: string): { emoji: string; label: string }[] {
  const f = frequency.toLowerCase()
  const times: { emoji: string; label: string }[] = []

  if (f.includes('morning') || f.includes('breakfast') || f.includes('once')) {
    times.push({ emoji: '🌅', label: 'Morning' })
  }
  if (f.includes('lunch') || f.includes('noon') || f.includes('midday') || f.includes('twice')) {
    times.push({ emoji: '☀️', label: 'Midday' })
  }
  if (f.includes('evening') || f.includes('dinner') || f.includes('night') || f.includes('bed')) {
    times.push({ emoji: '🌙', label: 'Evening' })
  }
  if (times.length === 0) {
    times.push({ emoji: '🕐', label: 'As directed' })
  }
  return times
}

export default function DoseSchedule({ frequency, instructions }: Props) {
  const times = parseTimes(frequency)

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700">When to take it</h3>
      <div className="flex flex-wrap gap-3">
        {times.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2"
          >
            <span className="text-xl">{t.emoji}</span>
            <span className="text-sm font-medium text-blue-800">{t.label}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600">{frequency}</p>
      <p className="text-sm text-gray-500">{instructions}</p>
    </div>
  )
}
