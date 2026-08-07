/** Static content for the marketing Home screen (ported from uroapp-site.html). */

export type FeatureTag = 'pro' | 'elite' | null;

export interface Feature {
  icon: string;
  title: string;
  blurb: string;
  tag: FeatureTag;
}

export const FEATURES: Feature[] = [
  { icon: '🧮', tag: null, title: 'Validated calculators', blurb: 'IPSS, PSA toolkit, UCSF-CAPRA, EORTC, IGCCCG, R.E.N.A.L., stone scores, eGFR and more — every formula traceable to its source.' },
  { icon: '🗺️', tag: null, title: 'Guideline summaries', blurb: 'AUA and EAU algorithms for 27 conditions, oncological and non-oncological — each linking to the official guideline.' },
  { icon: '📅', tag: null, title: 'Surveillance schedules', blurb: 'Risk-stratified follow-up calendars for NMIBC, prostate, renal, UTUC, testis, cystectomy, stones and testosterone — printable.' },
  { icon: '🔪', tag: null, title: 'Operative reference', blurb: 'Anatomy, steps and complications for 15 procedures, dual-sourced to the operative literature and the society guideline.' },
  { icon: '📝', tag: null, title: 'Bilingual consent', blurb: 'English / العربية surgical consent for common operations with procedure-specific complications — printable at the bedside.' },
  { icon: '💊', tag: null, title: 'Drug interactions', blurb: 'Urology-relevant drug pairs with severity, effect and management — decision support, each entry sourced.' },
  { icon: '🚨', tag: null, title: 'On-call pathways', blurb: "First-30-minutes management for torsion (+ TWIST), priapism, Fournier's and the obstructed infected kidney." },
  { icon: '🩻', tag: null, title: 'Imaging references', blurb: 'PI-RADS, Bosniak and VI-RADS criteria summarised with the management each category implies.' },
  { icon: '🎓', tag: null, title: 'OR training', blurb: 'Rehearse the steps of an operation against the clock, and work branching intra-operative decision cases.' },
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  { q: 'Who is UroApp for?', a: 'Urology residents and practising urologists who want validated, cited bedside tools. It is built for licensed healthcare professionals, not patients.' },
  { q: 'Does it work offline?', a: 'Yes — the calculators, guideline summaries, surveillance schedules and operative reference are bundled on-device and work without a connection. A few outbound links (official guideline pages, conference sites) need the internet.' },
  { q: 'Where do the numbers and recommendations come from?', a: 'Every score, threshold and recommendation is tied to its primary source — the AUA or EAU guideline, or the original publication — with a link to verify. Nothing is written from memory, and the app summarises evidence for your judgment rather than issuing patient-specific directives.' },
  { q: 'Is any patient data stored?', a: 'No. UroApp stores no patient-identifiable information — calculator inputs and the ward-round list stay on your device and are de-identified by design.' },
  { q: 'When does the iOS app launch?', a: 'It is in active development. An iPhone (TestFlight) build is planned once the native wrap is complete; today it runs as a web preview.' },
];
