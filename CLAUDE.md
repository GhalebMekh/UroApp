# CLAUDE.md — UroApp

Standing instructions for Claude Code. Read at the start of every session.
Keep this file updated: when you correct me, add the rule here so it doesn't repeat.

## What this is
UroApp — a clinical intelligence app for urologists and urology residents (Gulf/MENA focus,
Arabic + English). React 18 + TypeScript + Vite + Tailwind, wrapped with Capacitor for iOS.
Owner: Dr. Ghaleb Al-Mekhlafi, urology resident, Jeddah. Built around the 18-workspace
blueprint and the prioritized roadmap in `/docs/PRD_v2.md`.

## Commands
- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npx cap sync ios` — copy web build into the iOS project
- `npx cap run ios` — run on simulator / device

## Architecture
- `src/App.tsx` — master state-machine router (`currentScreen`); persistent top bar + bottom nav
- `src/screens/` — one file per workspace (Dashboard, ProTools, Calculators, Guidelines, Drugs, etc.)
- `src/components/` — shared UI; `ProGate.tsx` gates Pro/Elite features
- `src/lib/` — `storage.ts` (Capacitor Preferences), `entitlements.ts` (RevenueCat tiers)
- `src/data/` — clinical datasets (modules, drugs, questions) bundled for offline use
- `server/` — separate deploy: AI evidence proxy (key stays server-side)
- Tiers: resident (free) / pro / elite — gated via RevenueCat entitlements, never local flags

## Conventions
- TypeScript strict; no `any` in core logic. Functional components + hooks.
- Tailwind utility classes only (no separate CSS modules) except `src/styles/native.css`.
- Mobile-first; touch targets ≥ 44pt. Test at phone width before desktop.
- Use `100dvh` not `100vh`. Respect safe-area insets on top bar and bottom nav.
- Use `@capacitor/preferences` for any persisted state — never raw `localStorage`.
- Commit messages: imperative mood, ≤ 72 chars.

## Design system (match exactly — do not redesign without being asked)
- Ground: dark navy `#0A1628`; cards `#0F1F38`; steel `#1B2B45`; lines `#26384f`
- Signature accent: violet `#8B7CF6` (oncology). Crimson `#E5556B` reserved for risk/calculus
  cues only. Teal `#3FB6A8` = board prep / low-risk. Amber `#E5A23F` = moderate.
- Type (owner change 2026-07): Times New Roman (serif display/headings, `font-display`) +
  Inter (UI/body) + JetBrains Mono (numerics). Arabic/RTL text is forced to IBM Plex Sans
  Arabic (`font-arabic`) via the `[dir="rtl"]` rule in index.css — Times has no usable Arabic.
- Icons: inline stroke SVGs in `src/components/icons.tsx` (1em, currentColor, 1.8 stroke).
  Do NOT use emoji as UI icons.
- Risk categories are always color-coded low=teal / moderate=amber / high=crimson

## Clinical safety rules (NON-NEGOTIABLE)
- Every clinical score, threshold, or factual claim MUST cite its primary source with a
  working link (PubMed/DOI/guideline). No numbers from memory — verify before writing.
- Never reproduce copyrighted material verbatim (AUA/EAU guideline text, AJCC TNM tables,
  ACR PI-RADS). Summarize the criteria and cite + link the source. Licensing needed before
  shipping any verbatim guideline/staging content in a paid tier.
- The Evidence AI must: cite every claim, state when evidence is conflicting or absent,
  and never give patient-specific directives — only evidence summaries for clinician judgment.
- Store NO patient-identifiable data anywhere. Calculator inputs stay on-device.
- Show a medical disclaimer at first launch; keep a visible Restore Purchases action.

## Build order (see /docs/PRD_v2.md for full detail)
Sprint 1 (P0, offline, no backend): IPSS ✓, PSA toolkit, PI-RADS/Bosniak/VI-RADS,
TNM quick staging, on-call emergency module (incl. TWIST), surveillance schedule generator,
pediatric essentials.
Sprint 2: convert residents to Pro — on-call + surveillance polish.
Sprint 3: Capacitor wrap → TestFlight with DSFH colleagues.
Sprint 4+: accounts + cloud sync → HCP verification → full Arabic → CME tracker → RAG.

## Working style
- For a non-trivial feature, interview me with clarifying questions BEFORE writing code.
- Keep changes scoped to what I asked; preserve existing templates/screens unless I say otherwise.
- After changes: run `npm run typecheck` and `npm run lint` before declaring done.
- One calculator/screen at a time; each must work offline and carry its citation.
