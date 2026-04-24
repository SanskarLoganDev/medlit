export interface FlagItem {
  level: 'red' | 'amber' | 'green'
  text: string
}

export interface MedCardData {
  drugName: string
  genericName: string | null
  purpose: string
  dose: string
  frequency: string
  instructions: string
  warnings: string[]
  interactions: string[]
  detectedLanguage: string
  flags: FlagItem[]
  error?: string
}

export interface SkipSimResult {
  whatToDo: string
  risk: string
}

export interface ReminderPayload {
  email: string
  card: MedCardData
}
