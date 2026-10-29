import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Anchor content globs to this config's directory so Tailwind scans the right
// files regardless of the launching process's cwd (e.g. when a dev/preview
// runner starts Vite from a parent directory).
const here = dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
// Design tokens per UroApp_Development_Spec_v1.md §3 (supersedes the original
// CLAUDE.md hex values for crimson/amber/teal, updated 2026-07). Navy and violet
// are unchanged between the two documents. Do not redesign these without being asked.
export default {
  content: [join(here, 'index.html'), join(here, 'src/**/*.{ts,tsx}')],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0A1628', 2: '#0F1F38' },
        steel: '#1B2B45',
        line: '#26384f',
        ink: '#E8EEF6',
        muted: { DEFAULT: '#92A4BD', 2: '#62748d' },
        // Signature accent: violet = oncology
        violet: { DEFAULT: '#8B7CF6', deep: '#6D5BE0', soft: '#b4a9fa' },
        // Risk colour-coding: crimson = risk/emergency, amber = moderate, teal = low/normal
        crimson: '#DC2626',
        teal: '#14B8A6',
        amber: '#F59E0B',
        // Specialty colours (owner request, 2026-10-27) — identify a specialty in
        // navigation and headings only, never a result. Hues chosen clear of the
        // risk colours above. Oncology keeps the signature violet. See lib/specialty.
        spec: {
          endo: '#3B82F6', // endourology & stones — blue
          func: '#38BDF8', // functional, LUTS & BPH — sky
          andro: '#A3E635', // andrology & infertility — lime
          peds: '#F472B6', // paediatric — pink
          recon: '#E879F9', // reconstruction & trauma — fuchsia
          general: '#94A3B8', // general, access, peri-operative — slate
        },
      },
      fontFamily: {
        // System sans (SF Pro on iPhone/iPad) = display/headings (owner request,
        // 2026-10-27, replacing Times New Roman), Inter = UI/body, JetBrains Mono =
        // numerics. Arabic text is forced to a dedicated Arabic face via the
        // [dir="rtl"] rule in index.css.
        display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        arabic: ['"IBM Plex Sans Arabic"', '"Geeza Pro"', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        'violet-glow': '0 12px 30px -10px rgba(139,124,246,.7)',
        'violet-ring': '0 0 0 1px rgba(139,124,246,.4), 0 8px 24px -8px rgba(139,124,246,.6)',
        device:
          '0 0 0 2px #1f3251, 0 40px 80px -30px rgba(0,0,0,.9), 0 0 90px -30px rgba(139,124,246,.5)',
      },
      backgroundImage: {
        'violet-mark': 'linear-gradient(135deg, #8B7CF6, #6D5BE0)',
        // Page headers (components/PageHero): signature violet into a deep blue.
        'violet-hero': 'linear-gradient(135deg, #8B7CF6 0%, #6D5BE0 48%, #3B4FD8 100%)',
        // On-call: crimson is the emergency colour (CLAUDE.md), easing into violet.
        'emergency-hero': 'linear-gradient(135deg, #E5484D 0%, #B4234A 50%, #5B2BB5 100%)',
        // Pediatrics: its specialty pink into violet.
        'peds-hero': 'linear-gradient(135deg, #F472B6 0%, #C35BD8 50%, #6D5BE0 100%)',
        'ai-soft':
          'linear-gradient(135deg, rgba(139,124,246,.16), rgba(109,91,224,.06))',
      },
      maxWidth: {
        wrap: '1180px',
      },
    },
  },
  plugins: [],
};
