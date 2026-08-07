/**
 * Inline stroke icons for the shell + nav. Kept dependency-free and sized
 * by the parent's font-size (1em) so they inherit colour via currentColor.
 */
type IconProps = { className?: string };

const base = {
  width: '1em',
  height: '1em',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function HomeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

export function CalculatorIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8" />
      <path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01" />
    </svg>
  );
}

export function GuidelineIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <path d="M14 3v6h6" />
      <path d="M8 13h8M8 17h5" />
    </svg>
  );
}

export function DrugIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="m10.5 3.5-7 7a4.95 4.95 0 0 0 7 7l7-7a4.95 4.95 0 0 0-7-7Z" />
      <path d="m7 7 7 7" />
    </svg>
  );
}

export function ImagingIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 13c1.2-1.6 2.6-1.6 4 0s2.8 1.6 4 0" />
    </svg>
  );
}

export function OnCallIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M10.3 3.8 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function MoreIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="19" cy="12" r="1.4" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/** Clinical hub — stethoscope. */
export function ClinicalIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M6 3a1 1 0 0 0-1 1v4a4 4 0 0 0 8 0V4a1 1 0 0 0-1-1" />
      <path d="M9 12v2a5 5 0 0 0 5 5 3 3 0 0 0 3-3v-2" />
      <circle cx="17" cy="13" r="2" />
    </svg>
  );
}

/** Academic hub — graduation cap. */
export function AcademicIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 4 2 9l10 5 10-5-10-5Z" />
      <path d="M6 11v4c0 1.4 2.7 2.8 6 2.8s6-1.4 6-2.8v-4" />
      <path d="M22 9v4.5" />
    </svg>
  );
}

/* ── Oncology organ-group icons (Calculators) ─────────────────────────────── */

/** Prostate — male (Mars) symbol. */
export function ProstateIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="10" cy="14" r="5.5" />
      <path d="M14.5 9.5 20 4" />
      <path d="M15 4h5v5" />
    </svg>
  );
}

/** Bladder — droplet. */
export function BladderIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3.5c3.2 3.7 5.5 6.8 5.5 9.6a5.5 5.5 0 1 1-11 0c0-2.8 2.3-5.9 5.5-9.6Z" />
    </svg>
  );
}

/** Kidney — bean outline with a hilum notch. */
export function KidneyIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M14 4C9.6 4 6 7.6 6 12s3.6 8 8 8c2.1 0 3.4-1.3 3.4-3 0-1.6-1.2-2.6-1.2-5s1.2-3.4 1.2-5C17.4 5.3 16.1 4 14 4Z" />
    </svg>
  );
}

/** Testis — oval with a short cord. */
export function TestisIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <ellipse cx="11.5" cy="14" rx="5.5" ry="6.5" />
      <path d="M14.5 9.5c1.5-1.4 2.5-2.8 2.5-4.5" />
    </svg>
  );
}

/** General staging — concentric target. */
export function StagingIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ── Residency section icons (OR / Inpatient) ─────────────────────────────── */

/** Inpatient — hospital building with a cross. */
export function InpatientIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 21V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v15" />
      <path d="M3 21h18" />
      <path d="M12 8.5v4M10 10.5h4" />
    </svg>
  );
}

/** OR — scalpel. */
export function ScalpelIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M20.3 3.7a1.6 1.6 0 0 0-2.4-.1L9 12.5l2.5 2.5 8.9-8.9a1.6 1.6 0 0 0-.1-2.4Z" />
      <path d="M9 12.5 3.5 18a2.1 2.1 0 0 0 3 3l5-5.5" />
    </svg>
  );
}

/** External link — arrow pointing out. */
export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}
