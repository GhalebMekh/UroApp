import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Anchor content globs to this config's directory so Tailwind scans the right
// files regardless of the launching process's cwd (e.g. when a dev/preview
// runner starts Vite from a parent directory).
const here = dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
// Design tokens. Unslop pass (owner, 2026-11-22, direction "exact, calm, on-shift"):
// the navy ramp is greyer so surfaces stay neutral and content carries the colour;
// violet is the one accent (selection, primary action), with button fills on
// violet-deep so white text reaches 4.5:1. Gradients, glows and the drifting header
// circles are gone. Do not redesign these without being asked.
export default {
  content: [join(here, 'index.html'), join(here, 'src/**/*.{ts,tsx}')],
  theme: {
    extend: {
      colors: {
        // Ink-navy ramp: page, card, raised surface, hairline; three text roles.
        navy: { DEFAULT: '#0C1220', 2: '#121A29' },
        steel: '#1A2333',
        line: '#232C3C',
        ink: '#ECEFF4',
        muted: { DEFAULT: '#A3AAB8', 2: '#7D8597' },
        // The one accent. violet = text/selection on dark; violet-deep = filled buttons.
        violet: { DEFAULT: '#8B7CF6', deep: '#6D5BE0', press: '#5B4BCB', soft: '#b4a9fa' },
        // Risk colour-coding: crimson = risk/emergency, amber = moderate, teal = low/normal.
        // Muted clinical tones (owner, 2026-10-31): brick, ochre and sage replace the
        // saturated red/amber/teal. Token names are kept so every screen follows.
        crimson: '#C2655A',
        teal: '#7FA88A',
        amber: '#C9A35A',
        // Specialty colours (owner request, 2026-10-27) — identify a specialty in
        // navigation and headings only, never a result. Hues chosen clear of the
        // risk colours above. Oncology keeps the signature violet. See lib/specialty.
        spec: {
          // Toned down in the unslop pass so they sit inside the palette as small dots.
          endo: '#6E93D8', // endourology & stones — blue
          func: '#6FB0D2', // functional, LUTS & BPH — sky
          andro: '#9DB86B', // andrology & infertility — lime
          peds: '#D48DB0', // paediatric — pink
          recon: '#BC8CCB', // reconstruction & trauma — fuchsia
          general: '#8C97A8', // general, access, peri-operative — slate
        },
      },
      fontFamily: {
        // Geist for headings and UI, Geist Mono for numerics (owner, 2026-10-31,
        // replacing SF Pro + Inter + JetBrains Mono); bundled via Fontsource (OFL).
        // Arabic text is forced to a dedicated Arabic face via the
        // [dir="rtl"] rule in index.css.
        display: ['"Geist Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Geist Variable"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono Variable"', 'ui-monospace', 'monospace'],
        arabic: ['"IBM Plex Sans Arabic"', '"Geeza Pro"', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        // Neutral depth only — no coloured glows (unslop).
        device: '0 0 0 1px #232C3C, 0 32px 64px -24px rgba(0,0,0,.8)',
        raised: 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      // Section headers (owner, 2026-11-22: "the moving bubbles and colours like before,
      // with unslop edits"). Each is ONE hue with a slight tone shift inside it, never a
      // blend of two hues: violet default, brick for on-call, pink for paediatrics.
      backgroundImage: {
        'violet-hero': 'linear-gradient(160deg, #6757D9 0%, #5141BC 100%)',
        'emergency-hero': 'linear-gradient(160deg, #A9554C 0%, #8C443D 100%)',
        'peds-hero': 'linear-gradient(160deg, #B7678A 0%, #985472 100%)',
      },
      // The header bubbles drift very slowly; long, offset cycles so the two never sync.
      // Stopped by the reduced-motion rule in index.css.
      keyframes: {
        'drift-a': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-28px, 18px) scale(1.06)' },
        },
        'drift-b': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(36px, -14px)' },
        },
      },
      animation: {
        'drift-a': 'drift-a 26s ease-in-out infinite',
        'drift-b': 'drift-b 34s ease-in-out infinite',
      },
      maxWidth: {
        wrap: '1180px',
      },
    },
  },
  plugins: [],
};
