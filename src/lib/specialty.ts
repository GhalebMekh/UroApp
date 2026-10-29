/**
 * Specialty colours (owner request, 2026-10-27). They mark which specialty a
 * screen, list group or procedure belongs to — navigation and headings only.
 * Results never use them: teal / amber / crimson stay reserved for risk
 * (CLAUDE.md), and these hues were picked to stay clear of those three.
 *
 * Class names are written out in full so Tailwind can find them.
 */
export type Specialty = 'oncology' | 'endourology' | 'functional' | 'andrology' | 'pediatric' | 'reconstruction' | 'general';

export interface SpecialtyStyle {
  label: string;
  /** Text colour, e.g. for an eyebrow or group heading. */
  text: string;
  /** Tinted chip: background + border + text. */
  chip: string;
}

export const SPECIALTY: Record<Specialty, SpecialtyStyle> = {
  oncology: {
    label: 'Oncology',
    text: 'text-violet-soft',
    chip: 'border-violet/40 bg-violet/[0.14] text-violet-soft',
  },
  endourology: {
    label: 'Endourology & stones',
    text: 'text-spec-endo',
    chip: 'border-spec-endo/40 bg-spec-endo/[0.14] text-spec-endo',
  },
  functional: {
    label: 'Functional & LUTS',
    text: 'text-spec-func',
    chip: 'border-spec-func/40 bg-spec-func/[0.14] text-spec-func',
  },
  andrology: {
    label: 'Andrology',
    text: 'text-spec-andro',
    chip: 'border-spec-andro/40 bg-spec-andro/[0.12] text-spec-andro',
  },
  pediatric: {
    label: 'Pediatric',
    text: 'text-spec-peds',
    chip: 'border-spec-peds/40 bg-spec-peds/[0.14] text-spec-peds',
  },
  reconstruction: {
    label: 'Reconstruction & trauma',
    text: 'text-spec-recon',
    chip: 'border-spec-recon/40 bg-spec-recon/[0.14] text-spec-recon',
  },
  general: {
    label: 'General',
    text: 'text-spec-general',
    chip: 'border-spec-general/40 bg-spec-general/[0.12] text-spec-general',
  },
};

/** The specialty for an operative-reference category (data/procedures `category`). */
export function specialtyOfProcedureCategory(category: string): Specialty {
  switch (category) {
    case 'Oncology':
      return 'oncology';
    case 'Endourology':
      return 'endourology';
    case 'Andrology':
      return 'andrology';
    case 'Pediatric':
      return 'pediatric';
    case 'Reconstruction':
    case 'Trauma':
      return 'reconstruction';
    default:
      return 'general';
  }
}
