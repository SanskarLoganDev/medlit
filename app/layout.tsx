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
        <div className="min-h-screen flex flex-col bg-gray-50">
          <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
            <div className="w-full max-w-screen-xl mx-auto flex items-center gap-3">
              <span className="text-3xl">💊</span>
              <span className="text-2xl font-bold text-blue-700">MedLit</span>
              <span className="text-gray-400 text-sm hidden sm:inline">Medication Literacy Companion</span>
            </div>
          </header>

          <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-16 py-10">
            {children}
          </main>

          <footer className="text-center text-xs text-gray-400 py-5 border-t border-gray-200">
            ⚠️ This is not medical advice — see a doctor if unsure about your medication.
          </footer>
        </div>
      </body>
    </html>
  )
}
