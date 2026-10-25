/** Static content for the marketing Home screen (ported from uroapp-site.html). */

import type { ScreenLink } from '@/navigation';
import { PROCEDURES } from './procedures';

export type FeatureTag = 'pro' | 'elite' | null;

export type FeatureIcon =
  | 'calculator'
  | 'guideline'
  | 'calendar'
  | 'scalpel'
  | 'consent'
  | 'drug'
  | 'oncall'
  | 'imaging'
  | 'training';

export interface Feature {
  /** Key into the inline SVG icon set — never an emoji (CLAUDE.md). */
  icon: FeatureIcon;
  /** Where tapping the card goes. */
  link: ScreenLink;
  title: string;
  blurb: string;
  tag: FeatureTag;
}

export const FEATURES: Feature[] = [
  { icon: 'calculator', link: { screen: 'calculators' }, tag: null, title: 'Validated calculators', blurb: 'IPSS, PSA toolkit, UCSF-CAPRA, EORTC, IGCCCG, R.E.N.A.L., stone scores, eGFR and more — every formula traceable to its source.' },
  { icon: 'guideline', link: { screen: 'guidelines' }, tag: null, title: 'Guideline summaries', blurb: 'AUA and EAU algorithms for 27 conditions, oncological and non-oncological — each linking to the official guideline.' },
  { icon: 'calendar', link: { screen: 'surveillance' }, tag: 'pro', title: 'Surveillance schedules', blurb: 'Risk-stratified follow-up calendars for NMIBC, prostate, renal, UTUC, testis, cystectomy, stones and testosterone — printable.' },
  { icon: 'scalpel', link: { residency: { section: 'or', orTab: 'procedures' } }, tag: null, title: 'Operative reference', blurb: `Anatomy, steps, danger zones and pre- and post-op care for ${PROCEDURES.length} procedures, each cited to its operative source.` },
  { icon: 'consent', link: { residency: { section: 'or', orTab: 'consent' } }, tag: 'pro', title: 'Bilingual consent', blurb: 'English / العربية surgical consent for common operations with procedure-specific complications — printable at the bedside.' },
  { icon: 'drug', link: { screen: 'drugs' }, tag: null, title: 'Drug interactions', blurb: 'Urology-relevant drug pairs with severity, effect and management — decision support, each entry sourced.' },
  { icon: 'oncall', link: { residency: { section: 'oncall' } }, tag: null, title: 'On-call pathways', blurb: "First-30-minutes management for torsion (+ TWIST), priapism, Fournier's and the obstructed infected kidney." },
  { icon: 'imaging', link: { screen: 'imaging' }, tag: null, title: 'Imaging references', blurb: 'PI-RADS, Bosniak and VI-RADS criteria summarised with the management each category implies.' },
  { icon: 'training', link: { screen: 'rehearsal' }, tag: 'pro', title: 'OR training', blurb: 'Rehearse the steps of an operation against the clock, and work branching intra-operative decision cases.' },
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  { q: 'Who is UroApp for?', a: 'Urology residents and practising urologists who want validated, cited bedside tools. It is built for licensed healthcare professionals, not patients.' },
  { q: 'Does it work offline?', a: 'Yes — the calculators, guideline summaries, surveillance schedules and operative reference are bundled on-device and work without a connection. A few outbound links (official guideline pages, conference sites) need the internet.' },
  { q: 'Where do the numbers and recommendations come from?', a: 'Every score, threshold and recommendation is tied to its primary source — the AUA or EAU guideline, or the original publication — with a link to verify. Nothing is written from memory, and the app summarises evidence for your judgment rather than issuing patient-specific directives.' },
  { q: 'Is any patient data stored?', a: 'No. UroApp stores no patient-identifiable information — calculator inputs and the ward-round list stay on your device and are de-identified by design.' },];
