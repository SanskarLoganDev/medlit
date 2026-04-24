import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'MedLit — Medication Literacy Companion',
  description: 'Understand your prescription in plain language',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="max-w-2xl mx-auto flex items-center gap-2">
              <span className="text-2xl">💊</span>
              <span className="text-xl font-bold text-blue-700">MedLit</span>
              <span className="text-gray-400 text-sm ml-1">Medication Literacy Companion</span>
            </div>
          </header>
          <main className="max-w-2xl mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="text-center text-xs text-gray-400 py-6">
            ⚠️ This is not medical advice — see a doctor if unsure about your medication.
          </footer>
        </div>
      </body>
    </html>
  )
}
