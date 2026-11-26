# UroApp design brief

Written 2026-11-22 for version 1.1, from two passes the owner asked for: **unslop**
(Damir Sokolovsky, CC BY 4.0) and **DeSlop** (nate-zz, MIT). Every style decision in the app
should trace back to this page. If a screen needs something this page doesn't cover, add it here
first, then build it.

## Direction

- **Product.** An offline reference and shift tool for urology residents and urologists in the
  Gulf: calculators, guideline summaries, on-call pathways, ward and theatre workflow.
- **Character.** Exact, calm, on-shift.
- **World.** The hospital at night: theatre lights, monitor readouts, chart paper.
- **One bold move: readout figures.** Every clinical number (scores, doses, ranges, counts) and
  every source line is set in Apple's system font (SF Pro; owner 2026-11-26, replacing Geist
  Mono) with tabular figures, so numbers line up like a monitor readout. Everything
  else stays quiet around it.
- **Moments** (the only places with rich colour):
  1. The calculator result: the score as a large mono figure over a three-step Low / Moderate /
     High bar, where only the band reached is coloured (`ResultRow`).
  2. Home's On-call card: the six emergencies, one tap from the first screen.
- **Signature.** The mono source line under every clinical value (`CitationNote`):
  `Source · authors, journal year · PMID`, then the verify warning. Same style everywhere.
- **What survives** (owner's earlier choices): violet as the accent, Geist (SF Pro for readouts), the muted
  risk colours (brick, ochre, sage), the navy ground, glass on the navigation layer only, the
  tab-bar glide with its spring rebound (owner, from an iOS 26 recording), and the coloured
  section headers with moving bubbles (owner, 2026-11-22, after seeing them removed): violet
  everywhere, brick for On-call, pink for Paediatrics. Each is one hue with a slight tone shift,
  never two hues blended; two soft white bubbles drift slowly and lean up to 22px toward a
  touch, then float back (`HeroShell`). Reduce Motion stops both. The content sheet overlaps
  the band with rounded top corners.

## Tokens (tailwind.config.js)

- **Surfaces.** Page `navy` #0C1220, card `navy-2` #121A29, raised `steel` #1A2333, hairline
  `line` #232C3C. Depth comes from these steps and hairlines, not shadows. Raised selection gets
  `shadow-raised` (a 1px inner top highlight).
- **Text.** `ink` (primary), `muted` (secondary), `muted-2` (meta, captions).
- **Accent.** `violet` for text and selection on dark; `violet-deep` for filled buttons (white text
  reaches 4.5:1); `violet-press` for their pressed/hover state. Used rarely: the primary action,
  the selected item, a link.
- **Risk.** `teal` low, `amber` moderate, `crimson` high and emergencies. Only for meaning.
- **Specialty dots.** `spec-*`, toned to sit inside the palette; small dots in navigation only.
- **Type sizes.** 11 (tab-bar labels only), 12, 13, 14, 15, 16, 18, 20, 24, 28, 32. Weights 400
  and 500; 600 only for rare inline emphasis. No uppercase tracked labels; sentence case.
- **Space and shape.** A 4px grid for padding, gaps and sizes. Radii: 8 controls, 10 inputs and
  buttons, 12 inner blocks, 16 cards; an inner radius is the outer minus its padding.
- **Icons.** One inline stroke set (`components/icons.tsx`), 1.5 stroke, coloured by text role.
  No emoji.
- **Motion.** Colour and surface changes at 120–200ms. No looping or entrance animation. The tab
  bar and swipe rows keep their spring on purpose.

## Voice

Dry and specific, like a good registrar's handover. Sentence case. Titles and labels have no full
stop. No exclamation marks, no greetings, no hype words. Interface text avoids em dashes (use a
full stop, a comma, a colon or brackets); clinical content keeps its wording because it is tied to
a cited source. Empty states say what will appear and the one action that makes it appear.
Buttons name their object ("Add a case", "Save"). Confirmations state the consequence ("Delete
this case? This can't be undone.").

## Structure

- One thing per screen, visibly first.
- No cards inside cards: rows inside a card are separated by hairlines, not boxed.
- Pills only for real choices (chips) and the tab bar. Counts, plans and meta are quiet text.

## Checks before shipping a screen

- Could this screen belong to another app if the name were swapped? If yes, it isn't done.
- Every number in mono? Every clinical value with its source line?
- Nothing coloured that doesn't mean something?
