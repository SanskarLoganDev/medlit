# CLAUDE.md — MedLit: Medication Literacy Companion

> This file is the single source of truth for the MedLit project.
> It is intended to be placed at the root of the repository so Claude Code
> and any contributor can understand the project at a glance.

---

## Project Overview

**MedLit** is a localhost-deployed web application that helps patients with low health
literacy and limited English proficiency understand their prescriptions.

A user photographs or uploads a prescription label. Claude's Vision API extracts the
medication data, then a second Claude call rewrites everything at a Grade 5 reading level
in the user's detected language. The result is a clean medication card with plain-language
instructions, color-coded warnings, a "What if I skip a dose?" simulator, and an email
reminder triggered by clicking a button (SMTP, localhost only).

**Target users:** patients in underserved clinics, elderly users, non-native speakers,
anyone who finds medical jargon confusing.

**Deployment:** fully local — `localhost:3000`. No cloud services, no external databases.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + React 18 |
| Styling | Tailwind CSS |
| AI — vision + text | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Image handling | Browser File API + base64 encoding |
| Readability check | `text-readability` npm package |
| Email reminders | Nodemailer + local SMTP (e.g. Mailhog on port 1025) |
| Language detection | Claude API (auto-detects from image text or user input) |
| Runtime | Node.js 20+ |
| Package manager | npm |

---

## Key Features

### 1. Vision extraction
- User captures or uploads a prescription label image
- Image sent as base64 to Claude Vision API
- Claude returns structured JSON: drug name, purpose, dose schedule, warnings

### 2. Plain-language card
- Second Claude call rewrites the JSON fields at Grade 5 reading level
- Jargon blocklist enforced in system prompt (`contraindicated`, `administer`, `adverse`, etc.)
- Dosage rewritten as daily-life analogies ("take with breakfast")
- Flesch-Kincaid score checked post-generation; if > 60 (too hard), Claude is called again

### 3. Multilingual output
- Input language auto-detected from label text or user input
- Response generated in detected language (supports EN, ES, FR, ZH, HI, AR, PT, RU, DE, JA)
- Language switcher on card — one tap re-renders in chosen language via a fresh API call

### 4. Color-coded warnings
- Red banner: stop-and-seek-help conditions
- Amber banner: "take with food / avoid alcohol" cautions
- Green banner: normal safe-use notes

### 5. "What if I skip?" simulator
- User clicks "Missed a dose?" button
- Claude returns: what to do next + risks of skipping (specific to that drug)
- Output shown inline below the card — no page navigation

### 6. Email reminder (SMTP, localhost)
- User enters their email address on the card
- Clicks "Set reminder"
- Nodemailer sends a formatted email via local SMTP server (Mailhog)
- Email contains: drug name, dosage schedule, and warnings in plain language

---

## Architecture

```
Browser
  │
  ├─ /                      → Upload screen (camera or file)
  ├─ /card                  → Medication card (rendered after scan)
  └─ /api/
       ├─ extract           → POST: image → Claude Vision → raw med JSON
       ├─ explain           → POST: raw JSON + lang → plain-language card JSON
       ├─ skip-sim          → POST: drug name → skip simulation text
       ├─ switch-lang       → POST: card JSON + new lang → translated card JSON
       └─ send-reminder     → POST: email + card JSON → Nodemailer SMTP
```

### Two-pass Claude API pattern

```
Pass 1 — extract (Vision)
  Input : base64 image
  System: "Extract medication data. Return only JSON."
  Output: { drugName, purpose, dose, frequency, warnings[], interactions[] }

Pass 2 — explain (Text)
  Input : Pass 1 JSON + detected language
  System: "Rewrite at Grade 5 reading level in {lang}.
           Never use: contraindicated, administer, adverse, dosage, titrate.
           Use daily-life analogies for timing.
           Return only JSON matching the same schema."
  Output: { drugName, purpose, dose, frequency, warnings[], interactions[] }
         (all values now in plain language / target language)
```

### Safety flag layer (inline in Pass 2 prompt)

The Pass 2 system prompt includes:

```
After generating the plain-language fields, add a "flags" array.
Each flag has: { level: "red"|"amber"|"green", text: "..." }
Red = stop taking and seek help immediately.
Amber = caution (food, alcohol, driving).
Green = normal usage note.
Always include at least one flag.
```

---

## Folder Structure

```
medlit/
├── CLAUDE.md                          ← this file
├── .env.local                         ← ANTHROPIC_API_KEY, SMTP config
├── package.json
├── next.config.js
├── tailwind.config.js
│
├── app/                               ← Next.js App Router
│   ├── layout.tsx                     ← root layout, global font/theme
│   ├── page.tsx                       ← upload screen (step 1)
│   ├── card/
│   │   └── page.tsx                   ← medication card screen (step 2)
│   └── api/
│       ├── extract/
│       │   └── route.ts               ← Vision API call (Pass 1)
│       ├── explain/
│       │   └── route.ts               ← Plain-language API call (Pass 2)
│       ├── skip-sim/
│       │   └── route.ts               ← "What if I skip?" Claude call
│       ├── switch-lang/
│       │   └── route.ts               ← Language switch re-render
│       └── send-reminder/
│           └── route.ts               ← Nodemailer SMTP email
│
├── components/
│   ├── UploadZone.tsx                 ← drag-and-drop + camera capture
│   ├── MedCard.tsx                    ← main card layout
│   ├── WarningBanner.tsx              ← red / amber / green flag banners
│   ├── DoseSchedule.tsx               ← morning/evening reminder rows
│   ├── SkipSimulator.tsx              ← "Missed a dose?" toggle + output
│   ├── LanguageSwitcher.tsx           ← pill buttons for language select
│   └── ReminderForm.tsx               ← email input + send button
│
├── lib/
│   ├── claude.ts                      ← Anthropic SDK client singleton
│   ├── prompts.ts                     ← all system prompts as constants
│   ├── readability.ts                 ← Flesch-Kincaid check wrapper
│   ├── mailer.ts                      ← Nodemailer transport setup
│   └── types.ts                       ← shared TypeScript interfaces
│
├── public/
│   └── icons/                         ← PWA icons
│
└── styles/
    └── globals.css                    ← Tailwind base + custom tokens
```

---

## Environment Variables

Create `.env.local` at the project root:

```env
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# SMTP (Mailhog defaults)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=medlit@localhost
```

---

## Phases

### Phase 0 — Setup (Day 1, ~2 hours)

- [ ] `npx create-next-app@latest medlit --typescript --tailwind --app`
- [ ] Install dependencies: `npm install @anthropic-ai/sdk nodemailer text-readability`
- [ ] Install Mailhog locally for SMTP testing
- [ ] Add `.env.local` with API key and SMTP config
- [ ] Create `lib/claude.ts` singleton and `lib/prompts.ts` with all system prompts
- [ ] Create `lib/types.ts` with `MedCardData` and `FlagItem` interfaces
- [ ] Verify API connection with a simple test call

### Phase 1 — Vision extraction (Day 1, ~3 hours)

- [ ] Build `UploadZone.tsx` — drag-and-drop + camera (use `<input type="file" capture="environment">`)
- [ ] Convert image to base64 in the browser before sending
- [ ] Build `app/api/extract/route.ts` — POST handler calling Claude Vision (Pass 1)
- [ ] Define and validate JSON schema for extracted medication data
- [ ] Test with 3–5 real prescription label photos across different formats
- [ ] Handle errors: blurry image, non-prescription image, unreadable label

### Phase 2 — Plain-language card (Day 1–2, ~4 hours)

- [ ] Build `app/api/explain/route.ts` — POST handler calling Claude text (Pass 2)
- [ ] Implement jargon blocklist enforcement in system prompt
- [ ] Implement Flesch-Kincaid check in `lib/readability.ts`; retry if score > 60
- [ ] Build `MedCard.tsx` — drug name, purpose, dose section, warnings
- [ ] Build `WarningBanner.tsx` — red/amber/green visual treatment
- [ ] Build `DoseSchedule.tsx` — morning/evening rows with plain times
- [ ] Wire up `app/card/page.tsx` to call extract → explain in sequence and render card
- [ ] Test with multilingual label (Spanish, Chinese) to confirm language pass-through

### Phase 3 — Language switcher (Day 2, ~2 hours)

- [ ] Build `app/api/switch-lang/route.ts` — accepts card JSON + new lang, returns re-rendered JSON
- [ ] Build `LanguageSwitcher.tsx` — pill buttons for 10 languages
- [ ] On tap, call switch-lang API and re-render card without page reload
- [ ] Test all 10 languages; confirm no jargon leaks in any

### Phase 4 — "What if I skip?" simulator (Day 2, ~2 hours)

- [ ] Build `app/api/skip-sim/route.ts` — POST with drug name, returns skip simulation plain text
- [ ] System prompt: "User asks what happens if they miss a dose of {drug}.
      Give: (1) what to do right now, (2) risks of skipping. Plain English. Max 80 words."
- [ ] Build `SkipSimulator.tsx` — "Missed a dose?" button, spinner, inline output below card
- [ ] Test with 5 different drug types (antibiotic, blood pressure, diabetes, painkiller, antidepressant)

### Phase 5 — Email reminder (Day 2, ~2 hours)

- [ ] Set up Mailhog: `brew install mailhog` or `go install github.com/mailhog/MailHog@latest`
- [ ] Build `lib/mailer.ts` — Nodemailer transport pointing to localhost:1025
- [ ] Build `app/api/send-reminder/route.ts` — POST with email + card JSON → send formatted email
- [ ] Email template: drug name, plain-language dose schedule, warning summary
- [ ] Build `ReminderForm.tsx` — email input + "Set reminder" button + success/error state
- [ ] Test email delivery in Mailhog UI at `http://localhost:8025`

### Phase 6 — Polish & demo prep (Day 2–3, ~3 hours)

- [ ] Add loading spinners on all async actions
- [ ] Add error states with human-readable messages (no stack traces shown to user)
- [ ] Add hard disclaimer footer on card: "This is not medical advice — see a doctor if unsure"
- [ ] Accessibility: keyboard navigation, aria-labels on all interactive elements, high-contrast warning colors
- [ ] Test full flow end-to-end with 3 personas: English speaker, Spanish speaker, low-literacy user
- [ ] Prepare live demo: real pill bottle label ready to scan in front of judges

---

## Prompts Reference

All prompts live in `lib/prompts.ts`. Key ones:

### EXTRACT_SYSTEM_PROMPT (Pass 1)
```
You are a medical data extractor. The user has sent a photo of a prescription label.
Extract the following fields and return ONLY valid JSON — no explanation, no markdown.

Schema:
{
  "drugName": "string",
  "genericName": "string or null",
  "purpose": "string",
  "dose": "string",
  "frequency": "string",
  "instructions": "string",
  "warnings": ["string"],
  "interactions": ["string"],
  "detectedLanguage": "ISO 639-1 code"
}

If a field cannot be determined from the label, set it to null.
If the image is not a prescription label, return { "error": "not_a_prescription" }.
```

### EXPLAIN_SYSTEM_PROMPT (Pass 2)
```
You are a health literacy assistant. You will receive medication data as JSON.
Rewrite every text field so a 10-year-old can understand it.
Respond in {LANGUAGE}. Return ONLY valid JSON matching the same schema.

Rules:
- Never use these words: contraindicated, administer, adverse, dosage, titrate,
  prophylaxis, indicated, efficacy, pharmacological, therapeutic
- Rewrite timing as daily-life anchors: "with breakfast", "before bed", "at lunch"
- Keep sentences under 15 words each
- Add a "flags" array: [{ "level": "red|amber|green", "text": "plain English" }]
  Red = stop and seek help. Amber = caution. Green = normal note.
  Always include at least one flag.
```

### SKIP_SIM_SYSTEM_PROMPT
```
The user takes {DRUG_NAME} and has missed a dose.
Tell them in plain English (Grade 5 level):
1. What to do right now (2–3 sentences)
2. What the risk of skipping is (1–2 sentences)
Do not exceed 80 words total. Do not say "consult your doctor" as the only answer.
```

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Mailhog (SMTP test server)
mailhog
# → Web UI at http://localhost:8025
# → SMTP at localhost:1025

# 3. Start the app
npm run dev
# → App at http://localhost:3000
```

---

## Notes for Hackathon Demo

- Have a real pill bottle ready to scan live
- Pre-load a Spanish-language label screenshot as a fallback
- Show the two-pass API calls in browser DevTools Network tab — judges love seeing Claude think
- Demo the language switcher live: scan in English, switch to Spanish in one tap
- Hit "Missed a dose?" for a blood pressure drug — the output is always compelling
- Open Mailhog at `localhost:8025` and show the email arriving in real time
