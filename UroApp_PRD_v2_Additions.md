# UroApp — PRD v2 Addendum: Path to a Complete Urology Platform

**Owner:** Dr. Ghaleb Al-Mekhlafi · **Date:** June 2026
**Scope:** Additions to the existing 18-workspace blueprint, prioritized by clinical value vs. build effort.
**Principle:** Ship daily-use clinical value first (no servers needed), then infrastructure, then differentiators.

---

## Priority P0 — must be in v1 (offline, no backend needed)

| # | Feature | Why | Effort | Tier |
|---|---------|-----|--------|------|
| 1 | **IPSS + QoL score** | The single most-used questionnaire in urology; absence is a credibility gap. (Barry et al., J Urol 1992 — https://pubmed.ncbi.nlm.nih.gov/1279218/) | S | Free |
| 2 | **PSA toolkit** | PSA density, velocity, doubling time — daily clinic use | S | Free |
| 3 | **Radiology reporting references** | PI-RADS v2.1, Bosniak (2019), VI-RADS — summary tables with management implication per category | M | Free |
| 4 | **TNM quick staging** | Prostate, kidney, bladder, testis — tap-through staging | M | Free |
| 5 | **On-call emergency module** | Torsion pathway + TWIST score, priapism algorithm, Fournier's, obstructed infected kidney → "what to do in the next 30 minutes" format | M | Pro |
| 6 | **Surveillance schedule generator** | Input diagnosis (e.g., NMIBC risk group, post-PN RCC, stone former) → full follow-up calendar, exportable to phone calendar | M | Pro |
| 7 | **Pediatric essentials** | Weight-based dosing + SFU hydronephrosis grading + UTI workup pathway | M | Pro |

**Licensing note (important):** TNM is copyright AJCC/ACS; PI-RADS is ACR. Ship *summarized criteria with citation and link*, never verbatim reproductions, until/unless licensed. Same rule as guideline content.

## Priority P1 — v1.1 (needs backend)

| # | Feature | Why | Effort |
|---|---------|-----|--------|
| 8 | **Accounts + cloud sync** | Today everything is on-device; a lost phone = lost surgical log. Supabase auth + sync | L |
| 9 | **HCP verification at signup** | OpenEvidence model; legal protection + credibility + App Review safety | M |
| 10 | **Global search** | One search bar across drugs, guidelines, calculators, questions | M |
| 11 | **Full Arabic localization** | Entire UI, not just consent forms — Gulf differentiator | L |
| 12 | **Guideline-update notifications** | Push when EAU/AUA issue amendments | S |

## Priority P2 — v2 (differentiators)

| # | Feature | Why | Effort |
|---|---------|-----|--------|
| 13 | **SCFHS CME tracker** | No competitor offers it; every Saudi practitioner needs it | M |
| 14 | **Patient education leaflets (Arabic)** | Printable from clinic; huge goodwill feature | M |
| 15 | **ER Smart Note integration** | Already built as a React app — port into the suite | S |
| 16 | **Evidence AI + RAG layer** | Licensed/open-access corpus with page-level citations | L |
| 17 | **Department/Elite analytics** | Multi-user dashboards for program directors | L |

## Recommended build order

1. **Sprint 1 (2–3 wks):** IPSS, PSA toolkit, PI-RADS/Bosniak/VI-RADS, TNM — pure local logic, fills the credibility gaps
2. **Sprint 2 (2–3 wks):** On-call module + surveillance generator — these convert residents to Pro
3. **Sprint 3 (3–4 wks):** Capacitor wrap → TestFlight with DSFH colleagues (plan already delivered)
4. **Sprint 4+:** Accounts/sync → HCP verification → Arabic → then P2

## Definition of "complete" for v1 launch

- Every advertised calculator works offline with primary-source citation
- On-call module covers the 4 commonest urological emergencies
- Surveillance generator covers NMIBC, RCC post-surgery, and stone metabolic follow-up
- Medical disclaimer at first launch; Restore Purchases visible; no patient-identifiable data stored
