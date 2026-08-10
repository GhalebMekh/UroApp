/**
 * Endoscopic instrument reference — cystoscopes, ureteroscopes and lasers.
 *
 * LICENSING/SAFETY (CLAUDE.md): every spec is SUMMARISED in our own words from
 * the cited source, never reproduced verbatim. No figure from memory — the
 * numbers below were read out of:
 *   - Sabnis, Patwardhan & Ganpule (eds), "Urology Instrumentation: A
 *     Comprehensive Guide", 1st ed 2016 (scopes, sheaths, telescopes).
 *   - Bailey, Forbes, Milner & Teichman, "Energy Modalities in Urology",
 *     Campbell-Walsh-Wein Urology 13th ed, 2025 (lasers).
 *
 * Manufacturer figures differ between makes and models. Treat these as the
 * reference values from the cited texts, and confirm against the device in
 * front of you before use.
 */
import { CITATIONS, type Citation } from '@/data/citations';

export type InstrumentGroup =
  | 'cystoscope'
  | 'semirigid'
  | 'flexible'
  | 'laser'
  | 'accessory'
  | 'drainage'
  | 'turp'
  | 'pcnl'
  | 'electrosurgery';

export interface Spec {
  label: string;
  value: string;
}

export interface Instrument {
  id: string;
  name: string;
  group: InstrumentGroup;
  summary: string;
  specs: Spec[];
  /** What it is used for. */
  uses: string[];
  /** Practical traps worth knowing before you pick it up. */
  pitfalls: string[];
  citation: Citation;
}

export interface GroupMeta {
  id: InstrumentGroup;
  label: string;
  blurb: string;
}

export const INSTRUMENT_GROUPS: GroupMeta[] = [
  {
    id: 'cystoscope',
    label: 'Cystoscope',
    blurb: 'Sheath, obturator, bridge and telescopes — and which lens angle to reach for.',
  },
  {
    id: 'semirigid',
    label: 'Semi-rigid URS',
    blurb: 'Sizing conventions, channel types and lengths for ureteroscopy.',
  },
  {
    id: 'flexible',
    label: 'Flexible URS',
    blurb: 'Fibreoptic versus digital, deflection, and the working channel.',
  },
  {
    id: 'laser',
    label: 'Lasers',
    blurb: 'Wavelengths, tissue interaction and what each one is used for.',
  },
  {
    id: 'accessory',
    label: 'Stents & access',
    blurb: 'Guidewires, JJ stents and ureteral access sheaths — sizes, lengths and how to choose.',
  },
  {
    id: 'drainage',
    label: 'Catheters & drainage',
    blurb: 'Foley tips, the French colour code, and what to leave in the kidney after PCNL.',
  },
  {
    id: 'turp',
    label: 'TURP',
    blurb: 'Resectoscope loops and electrodes — and the loop-angle rule that keeps cuts clean.',
  },
  {
    id: 'pcnl',
    label: 'PCNL',
    blurb: 'Access needles, tract dilators and retrieval accessories.',
  },
  {
    id: 'electrosurgery',
    label: 'Electrosurgery',
    blurb: 'Monopolar circuits, waveforms and what cut, coag and fulguration actually do.',
  },
];

const instr = CITATIONS.urologyInstrumentation;
const energy = CITATIONS.energyModalities;

export const INSTRUMENTS: Instrument[] = [
  // ---------- CYSTOSCOPE ----------
  {
    id: 'cysto-sheath',
    name: 'Cystoscope sheath',
    group: 'cystoscope',
    summary:
      'The outer tube that carries the telescope and irrigation into the bladder. Its shaft markings double as a ruler for the prostatic urethra.',
    specs: [
      { label: 'Length (adult)', value: '22 cm, regardless of French size' },
      { label: 'Cross-section', value: 'Oval, not circular — so "French" is strictly a misnomer here' },
      { label: 'Shaft markings', value: 'Proximal 10 cm from the vesical end unmarked, then every 1 cm for the next 13 cm' },
      { label: 'Distal tip', value: 'Bulbous dorsally, smooth and without a sharp edge, for atraumatic passage' },
      { label: 'Obturator groove', value: 'Irrigation groove present at 19 Fr and above; the 17 Fr sheath has none' },
    ],
    uses: [
      'Diagnostic cystourethroscopy and access for bladder instrumentation.',
      'Measuring prostatic urethral length: note the meatal marking at the bladder neck, withdraw to the verumontanum and note it again — the difference in markings is the length.',
    ],
    pitfalls: [
      'The VIU sheath carries markings along its whole length, unlike the cystoscope sheath — do not confuse the two when measuring.',
      'Match the obturator to the sheath: cystoscope, VIU and resectoscope obturators differ in knob shape, groove and length.',
    ],
    citation: instr,
  },
  {
    id: 'cysto-telescopes',
    name: 'Telescopes (lens angles)',
    group: 'cystoscope',
    summary:
      'Classified by viewing angle. Adult telescopes fit any adult sheath but must be used with a bridge.',
    specs: [
      { label: 'Angles available', value: '0°, 12°, 30°, 70° and 120°' },
      { label: 'Size', value: '4 mm diameter, 30 cm — fits cystoscope, VIU and resectoscope sheaths' },
      { label: 'Storz colour code', value: 'Green 0° · red 30° · yellow 70° · white 120°' },
    ],
    uses: [
      '0° straight-forward — looks directly ahead; the urethroscopy lens.',
      '30° forward-oblique — best view of the bladder base and anterolateral wall; the most commonly used telescope.',
      '70° lateral — the bladder dome, and structures around the bladder neck such as a post-prostatic pouch.',
      '120° retrospective — the anterior bladder neck viewed from inside.',
    ],
    pitfalls: [
      'Colour codes vary by manufacturer — confirm the angle engraved on the eyepiece rather than trusting the colour.',
      'With Hopkins II optics and the rise of flexible cystoscopy, the 70° and 120° telescopes are now little used.',
    ],
    citation: instr,
  },
  {
    id: 'cysto-bridge',
    name: 'Bridge & Albarran lever',
    group: 'cystoscope',
    summary:
      'The bridge couples telescope to sheath and carries the accessory channels. The Albarran lever steers a ureteric catheter towards the orifice.',
    specs: [
      { label: 'Bridge length', value: '6 cm; adult bridges are universal and fit all sheath sizes' },
      { label: 'Bridge types', value: 'No side channel, one side channel, or two side channels' },
      { label: 'Albarran deflection', value: 'Deflects the catheter up to 90°; the knob pointer reads the angle' },
      { label: 'Albarran minimum sheath', value: '19 Fr or larger' },
    ],
    uses: [
      'A detachable bridge lets you empty the bladder, pass a larger catheter, or attach an Ellik evacuator for chips, clots and fragments.',
      'Two side channels allow simultaneous instruments — e.g. bilateral ureteric catheterisation.',
    ],
    pitfalls: [
      'An integrated cystoscope has a fixed bridge and telescope: a smaller shaft and relatively larger working channel, but you lose the detachable-bridge advantages.',
    ],
    citation: instr,
  },

  // ---------- SEMI-RIGID URS ----------
  {
    id: 'semirigid-sizing',
    name: 'Sizing & length',
    group: 'semirigid',
    summary:
      'Quoted as tip/shaft French. The tapered design means the tip enters before the shaft dilates the ureter behind it.',
    specs: [
      { label: 'Common sizes', value: '6/7.5, 7/8.5, 8/9 Fr — first figure is the tip, second the shaft' },
      { label: 'Short scope', value: '≈35 cm — generally used in women' },
      { label: 'Long scope', value: '≈45 cm — generally used in men' },
      { label: 'Wolf range', value: 'Needle 4.5/6 Fr · ultrathin 6/7.5 Fr · dual-channel 6.5/8.5 Fr' },
      { label: 'Storz 7 Fr', value: 'Available in 34 cm and 43 cm; angulated, rounded distal tip' },
    ],
    uses: [
      'Inspection and treatment of the ureter, most often for stone disease.',
      'Engage the angulated tip at the orifice first, then lift the instrument to pass atraumatically.',
    ],
    pitfalls: [
      'Makes measure differently: Wolf quotes the size at the distal tip, Storz where the working channel ends — the same printed number is not the same scope.',
    ],
    citation: instr,
  },
  {
    id: 'semirigid-channels',
    name: 'Working channels',
    group: 'semirigid',
    summary: 'The channel layout decides what energy source and accessories you can pass.',
    specs: [
      { label: 'Straight channel', value: 'Takes rigid pneumatic lithotripsy probes' },
      { label: 'Oblique channel', value: 'The uretero-laser scopes' },
      { label: 'Single vs dual', value: 'One larger channel, or two separate channels' },
      { label: 'Eyepiece', value: 'Straight, oblique or lateral offset' },
    ],
    uses: [
      'A dual channel lets you run a laser fibre and a basket at the same time, and maintains irrigation while an instrument is in place.',
    ],
    pitfalls: [
      'A rigid pneumatic probe needs a straight channel — it will not pass an oblique one.',
      'Once laser lithotripsy replaced pneumatic probes the need for a large channel fell, which is why modern scopes are thinner.',
    ],
    citation: instr,
  },

  // ---------- FLEXIBLE URS ----------
  {
    id: 'flexible-design',
    name: 'Fibreoptic vs digital',
    group: 'flexible',
    summary:
      'A fibreoptic scope relays the image along a glass fibre bundle; a digital scope puts the camera sensor at the tip and sends an electrical signal — "chip on the tip".',
    specs: [
      { label: 'Fibreoptic optics', value: 'Objective lens → image guide (aligned glass fibre bundle) → ocular lens' },
      { label: 'Digital', value: 'Camera sensor at the tip; the coherent fibre bundle is replaced by electrical conductors' },
      { label: 'Size convention', value: 'Quoted by tip diameter — e.g. Storz Flex-X2 at 7.5 Fr' },
      { label: 'Working length', value: '67 cm (Storz Flex-X2)' },
    ],
    uses: [
      'Retrograde inspection and laser treatment of the pelvicalyceal system, including calyces a semi-rigid scope cannot reach.',
    ],
    pitfalls: [
      'A broken image-guide fibre shows as a permanent black dot in the fibreoptic view — it is scope damage, not debris.',
    ],
    citation: instr,
  },
  {
    id: 'flexible-deflection',
    name: 'Deflection & working channel',
    group: 'flexible',
    summary:
      'Deflection direction relative to the lever differs between makes — check it before you are inside the kidney.',
    specs: [
      { label: 'Logic type', value: 'Also intuitive / positive / American — the tip follows the lever: down is down' },
      { label: 'Anti-logic type', value: 'Also counter-intuitive / contrapositive / European — the tip moves opposite to the lever' },
      { label: 'Working channel', value: '3.6 Fr inner diameter' },
      { label: 'Instrument limit', value: 'Up to 3 Fr, with irrigation still running alongside' },
      { label: 'Secondary deflection', value: 'Shock-absorbing bend proximal to the active one; rolls the distal ~10 cm for deeper calyceal access' },
    ],
    uses: [
      'The seal is an O-ring sized to the instrument: it stops irrigation leaking around the shaft and can hold a laser fibre at a set distance from the tip.',
      'The irrigation port joins the working channel at a right angle.',
    ],
    pitfalls: [
      'Confirm logic versus anti-logic on the scope you are holding — reaching for a lower-pole calyx with the wrong mental model wastes time and risks the scope.',
      'Passing an instrument reduces deflection and irrigation flow; a fully deflected scope with a stiff fibre in the channel is how scopes get damaged.',
    ],
    citation: instr,
  },

  // ---------- LASERS ----------
  {
    id: 'laser-hoyag',
    name: 'Ho:YAG (holmium)',
    group: 'laser',
    summary:
      'The long-standing workhorse for lithotripsy and soft tissue. Mid-infrared, strongly absorbed by water, and works mainly by a photothermal mechanism.',
    specs: [
      { label: 'Wavelength', value: '2.1 µm' },
      { label: 'Mechanism', value: 'Predominantly photothermal — vaporises water in and around the stone' },
      { label: 'Pressure transients', value: '8–20 bar at pulse energies below 1.0 J; 20–40 bar at 2.0 J' },
      { label: 'Typical clinical energy', value: 'Most reported lithotripsy uses under 1.0 J per pulse' },
      { label: 'Platform power', value: 'Has grown from 20 W systems to 120 W platforms with pulse modulation' },
    ],
    uses: [
      'Stone fragmentation and dusting throughout the upper and lower tract.',
      'Soft-tissue work including enucleation of the prostate and incision of strictures.',
    ],
    pitfalls: [
      'Roughly the first 60 µs of a pulse goes into vaporising the water between fibre tip and stone; energy only couples efficiently after that.',
      'Pressure transients are far below those of photomechanical lasers (which exceed 300 bar) — Ho:YAG does not fragment by shock wave.',
    ],
    citation: energy,
  },
  {
    id: 'laser-tfl',
    name: 'Thulium fibre laser (TFL)',
    group: 'laser',
    summary:
      'A diode-pumped fibre laser at a wavelength absorbed by water even more strongly than holmium, with markedly less retropulsion.',
    specs: [
      { label: 'Wavelength', value: '1.9 µm' },
      { label: 'Water absorption', value: 'Higher than Tm:YAG (2.0 µm) or Ho:YAG (2.1 µm)' },
      { label: 'Pulse duration range', value: '50 µs to 20 ms' },
      { label: 'Typical dosimetry', value: '700–800 µs at low peak power' },
    ],
    uses: [
      'Stone fragmentation and dusting — now one of the two most widely used lithotripsy lasers alongside Ho:YAG.',
    ],
    pitfalls: [
      'Preclinical evidence favours TFL for smaller fragments and faster fragmentation, and for less retropulsion — but that is largely preclinical, so weigh it accordingly.',
      'Low peak power is what buys the reduced retropulsion; pushing peak power away gives that advantage back.',
    ],
    citation: energy,
  },
  {
    id: 'laser-others',
    name: 'Other wavelengths',
    group: 'laser',
    summary:
      'Lasers you will still meet on a list, and where they sit relative to the mid-infrared workhorses.',
    specs: [
      { label: 'Tm:YAG', value: '2.0 µm — mid-infrared, water-absorbed' },
      { label: 'Diode', value: '800–980 nm — mostly soft-tissue applications' },
      { label: 'FREDDY', value: 'Frequency-doubled double-pulse Nd:YAG — emits 1064 nm and 532 nm together, 1.2 ms pulse' },
    ],
    uses: [
      'FREDDY fragments photomechanically, via cavitation-bubble collapse rather than heat.',
      'Diode wavelengths are used chiefly for soft tissue rather than stone.',
    ],
    pitfalls: [
      'Pulse duration governs the tissue effect: beyond about 20 ms, or with a continuous-wave laser, heat spreads and you get coagulation and carbonisation of adjacent tissue.',
    ],
    citation: energy,
  },

  // ---------- ACCESSORIES ----------
  {
    id: 'accessory-guidewire',
    name: 'Guidewires',
    group: 'accessory',
    summary:
      'The rail everything else runs on. A wire is built from a spring guide wound around an inner core and mandrel — the core gives strength, the spring guide gives instruments a smooth track.',
    specs: [
      { label: 'Diameter', value: '0.018–0.038 inch' },
      { label: 'Length', value: 'Usually 150 cm' },
      { label: 'Flexible tip', value: 'Typically the distal 8 cm' },
      { label: 'Standard coating', value: 'PTFE over a stainless-steel core' },
      { label: 'Hydrophilic', value: 'Glidewire — nitinol core tapering at the tip, polyurethane with a thin hydrophilic coat' },
      { label: 'Core', value: 'Fixed (welded to the spring guide) or movable' },
    ],
    uses: [
      'Straight tip — the default working wire.',
      'Angled tip — negotiates an awkwardly placed orifice, e.g. with median-lobe hypertrophy.',
      'J tip — the leading edge is an elbow rather than a point, so it is less likely to perforate; useful with an impacted stone, a tortuous ureter, and in PCNL.',
      'Stiff PTFE-coated wires are the ones to dilate a tract or rail a stent over.',
    ],
    pitfalls: [
      'A stainless-steel wire is stable and resists slipping out, but kinks easily — and once kinked the coating can strip off.',
      'A kinked or over-forced wire is how you get a ureteric perforation or a submucosal passage.',
      'Hydrophilic wires must be kept wet, and they are slippery by design — they are for negotiating, not for holding safety access.',
    ],
    citation: instr,
  },
  {
    id: 'accessory-djstent',
    name: 'Double-J (JJ) stent',
    group: 'accessory',
    summary:
      'Sized by shaft outer diameter and by length — and length means the straight segment, not tip to tip.',
    specs: [
      { label: 'Length definition', value: 'The STRAIGHT part of the stent — not measured from tip to tip' },
      { label: 'Length range', value: '12–30 cm; a tortuous ureter needs a longer stent' },
      { label: 'Size (shaft OD)', value: '3–8 Fr' },
      { label: 'Adult length rule', value: 'Height 149.5–178.5 cm → a 22–26 cm stent' },
      { label: 'Paediatric length rule', value: 'Age + 10 (cm)' },
      { label: 'From a KUB film', value: 'At actual size, xiphisternum to pubic symphysis' },
      { label: 'From an IVP plate', value: 'At actual size, the VUJ-to-PUJ distance' },
    ],
    uses: [
      'Polyurethane — good tensile strength, rails over a wire well and resists extrinsic compression.',
      'Silicone — highly biodurable and biocompatible, and softer on the bladder.',
      'Percuflex / C-Flex / Sof-Flex copolymers — softer with less bladder irritation, a higher inner-to-outer diameter ratio so a bigger lumen, and a hydrophilic coat for easier insertion.',
      'Metallic Resonance — a solid, non-hollow cylinder for extrinsic ureteric compression; encrustation-resistant and may stay up to 12 months.',
      'Memocath (nitinol) — expands to a preset size at 65°C; used for benign and malignant strictures of varying length.',
    ],
    pitfalls: [
      'Polyurethane is rigid: more stent discomfort, more encrustation and colonisation. Do not leave beyond 6 months, and ideally remove within 3.',
      'Silicone has poor tensile strength, so it is prone to extrinsic compression, and its low lumen ratio drains less well than polyurethane. Poor coil retention also makes it migrate.',
      'Track the removal date. A forgotten stent encrusts and turns a 10-minute job into a major one.',
    ],
    citation: instr,
  },
  {
    id: 'accessory-sheath',
    name: 'Ureteral access sheath',
    group: 'accessory',
    summary:
      'An inner dilator inside an outer sheath, railed over a super-stiff wire. Its real value is pressure: irrigant returns around the scope instead of building up in the kidney.',
    specs: [
      { label: 'Inner diameter', value: '9.5–13 Fr across the common range' },
      { label: 'Outer diameter', value: '12–15 Fr' },
      { label: 'Length range', value: '13 cm (paediatric) up to 55 cm' },
      { label: 'Cook Flexor', value: 'ID 9.5/12/14 · OD 11.5/14/16 · 13/20/28/35/45/55 cm' },
      { label: 'Cook Flexor DL', value: 'ID 9.5/12 · OD 11.5/14 · same lengths, plus a 3 Fr second channel' },
      { label: 'Applied Forte', value: 'ID 10/12/14 · OD 12/14/16 · 20/28/35/45/55 cm' },
      { label: 'ACMI Uropass', value: 'ID 12 · OD 14 · 24/38/54 cm' },
      { label: 'Bard Aquaguide', value: 'ID 12/13 · OD 14/15 · 25/35/45/55 cm' },
      { label: 'Intrapelvic pressure', value: 'Held below 20 cm H₂O even with pressurised irrigation up to 200 cm H₂O' },
    ],
    uses: [
      'Place one when repeated passes of the flexible scope or a prolonged case are expected — it eases access, shortens operating time and protects the scope.',
      'Choose length by sex and build: the shorter sheaths are the female lengths, the longer ones male.',
      'Railed over a super-stiff working wire, either directly or after balloon or serial ureteric dilatation.',
      'A dual-lumen sheath adds a 3 Fr channel for a wire, basket or laser fibre.',
    ],
    pitfalls: [
      'The sheath tip carries a circular radiopaque marker — use it, and do not advance blind.',
      'Buckling at the ureteric orifice and kinking once the inner dilator comes out are the two failure modes; a reinforced sheath resists both.',
      'A sheath oversized for the ureter is the classic cause of ureteric wall injury — go smaller, or pre-stent and come back.',
    ],
    citation: instr,
  },
  {
    id: 'accessory-ureteric-catheter',
    name: 'Ureteric catheters',
    group: 'accessory',
    summary: 'For drainage, retrograde studies and getting a wire where it needs to go.',
    specs: [
      { label: 'Double-lumen', value: '10 Fr, 50 cm — two openings about 1 cm apart, one at the tip and one on the side' },
      { label: 'Double-lumen bores', value: 'Placement lumen 0.038 inch · injection lumen 0.050 inch' },
      { label: 'Echotip', value: 'Banded tip that shows up better on ultrasound and fluoroscopy' },
    ],
    uses: [
      'Double-lumen: pass a second safety wire or run a contrast study without giving up the wire already in place.',
      'Spiral tip: negotiates a tortuous or partly obstructed ureter; the large side port below the spiral passes a wire.',
      'Torqueable tip: steerable for the same problem.',
      'Angled tip for an awkward orifice; open-end for drainage and irrigation.',
    ],
    pitfalls: [
      'The double-lumen catheter exists to stop you re-catheterising repeatedly — reach for it before you lose access, not after.',
    ],
    citation: instr,
  },
  {
    id: 'accessory-dilator',
    name: 'Ureteric dilators',
    group: 'accessory',
    summary: 'Active dilators open the ureter now; a JJ stent left in place is the passive dilator.',
    specs: [
      { label: 'Nottingham (single-step)', value: '6/12 Fr or 6/14 Fr — 6 Fr tip widening along the shaft, polyethylene, 60 cm' },
      { label: 'Serial Teflon', value: '6, 8, 9, 10, 11, 12, 14, 16, 18 Fr, passed in sequence' },
      { label: 'Balloon dilator', value: '≈65 cm; balloon 4–5 mm wide and 4–6 cm long inflated; 3–7 Fr collapsed depending on make' },
    ],
    uses: [
      'Open a ureter that will not accept the scope or the access sheath.',
      'A pre-placed JJ stent passively dilates over days — often the kinder option when the ureter is tight.',
    ],
    pitfalls: [
      'Single-step dilatation is quicker, but serial dilators give you finer control on a tight ureter.',
    ],
    citation: instr,
  },
  {
    id: 'accessory-basket',
    name: 'Baskets & retropulsion devices',
    group: 'accessory',
    summary: 'Nitinol cages for retrieving fragments; tipless designs work closer to the parenchyma.',
    specs: [
      { label: 'Shaft sizes', value: '1.3–3.2 Fr across the common models' },
      { label: 'Basket sizes', value: '6–20 mm' },
      { label: 'Lengths', value: '90, 115 and 120 cm' },
      { label: 'Zerotip (Boston)', value: '1.9/2.4/3.0 Fr · 12 and 16 mm — zero tip helps entrapment near the parenchyma' },
      { label: 'Escape (Boston)', value: '1.9 Fr · 11 and 15 mm — 4-wire cage with a channel for a 200 µm laser fibre' },
      { label: 'Optiflex (Boston)', value: '1.3 Fr · 6/7/9/11 mm — rotates 360° and entraps small fragments with vision preserved' },
      { label: 'N-Circle (Cook)', value: '2.4 Fr · 10 and 20 mm — triangular, tipless, takes a large wire mass' },
      { label: 'NGage (Cook)', value: '1.7/2.2 Fr · 8 and 11 mm — allows repositioning of a grasped fragment' },
    ],
    uses: [
      'Retrieving fragments and sending stone for analysis.',
      'A basket with a laser channel lets you trap and dust a stone without swapping instruments.',
    ],
    pitfalls: [
      'A basket that will not release around an over-large fragment is a genuine emergency — know how your basket disengages before you use it.',
      'Larger shafts crowd the working channel and cut irrigation and deflection.',
    ],
    citation: instr,
  },

  // ---------- CATHETERS & DRAINAGE ----------
  {
    id: 'drainage-foley',
    name: 'Foley catheters',
    group: 'drainage',
    summary:
      'The colour at the balloon port tells you the French size — worth knowing when someone hands you a catheter in the dark.',
    specs: [
      { label: '8 Fr', value: 'Aquamarine · 3 cc balloon · 30 cm' },
      { label: '10 Fr', value: 'Black · 3 cc · 30 cm' },
      { label: '12 Fr', value: 'White · 5–10 cc · 40 cm' },
      { label: '14 Fr', value: 'Green · 5–10 cc · 40 cm' },
      { label: '16 Fr', value: 'Orange · 5–10 cc · 40 cm' },
      { label: '18 Fr', value: 'Red · 5–10 cc · 40 cm' },
      { label: '20 Fr', value: 'Yellow · 10–20 cc · 40 cm' },
      { label: '22 Fr', value: 'Purple · 10–20 cc · 40 cm' },
      { label: '24 Fr', value: 'Blue · 10–20 cc · 40 cm' },
    ],
    uses: [
      'Straight tip — the everyday catheter.',
      'Coudé (also Delinotte or Mercier) — a bent end to ride over an obstructing prostate.',
      'Couvelaire ("whistle") — an open bevel that passes debris and clot.',
      'Dufour — coudé and whistle combined.',
      'Tiemann — bulbous, gently curved and relatively rigid, easy through the prostatic urethra; same colour code as a Foley.',
      'Three-way haematuria catheters have large eyeholes to resist clot blockage and a reinforced funnel so they do not collapse when you aspirate.',
    ],
    pitfalls: [
      'Siliconized latex is limited to about 2–3 weeks: once the silicone layer wears, the latex beneath irritates the urothelium and can cause microulceration and stricture. Latex allergy matters too.',
      'All-silicone catheters are less irritant, resist encrustation and are stiffer (helpful through an obstructing prostate) — they can stay 6–8 weeks.',
      'A deflated balloon still leaves a thickening that adds a French or two to the outside diameter — that is what catches at a stricture on the way in.',
    ],
    citation: instr,
  },
  {
    id: 'drainage-nephrostomy',
    name: 'Nephrostomy tubes',
    group: 'drainage',
    summary:
      'Drains the kidney after the case, keeps a route back in for residual stone, and tamponades bleeding.',
    specs: [
      { label: 'Nelaton', value: '12–28 Fr — the preferred drainage after PCNL' },
      { label: 'Councilman', value: 'A modified Foley with an end hole — suits a tube needing frequent changes' },
      { label: "Kaye's tamponade balloon", value: 'Designed to arrest post-PCNL bleeding: the balloon tamponades, the central channel drains' },
      { label: 'Malecot', value: 'Flowered end that seats itself in the collecting system' },
    ],
    uses: [
      'Post-PCNL drainage, and a conduit back to residual stones seen on the post-operative film.',
      'Tamponade of tract bleeding.',
      'A Foley suits long-term drainage and repeat changes.',
    ],
    pitfalls: [
      'A Foley used as a nephrostomy is not radiopaque — you lose the ability to check its position on film.',
    ],
    citation: instr,
  },

  // ---------- TURP ----------
  {
    id: 'turp-loops',
    name: 'Loops & electrodes',
    group: 'turp',
    summary: 'Each electrode has one job; picking the wrong one wastes time and bleeds.',
    specs: [
      { label: 'Standard cutting loop', value: 'The TURP workhorse; adenoma work uses thicker loops so you are not swapping mid-case' },
      { label: 'Collins knife', value: 'Bladder-neck incision and TUIP — used in cutting mode for sharp linear cuts' },
      { label: 'Ball / roller electrode', value: 'Haemostasis once resection is finished' },
      { label: 'Conical electrode', value: 'Point coagulation' },
      { label: 'Blunt curette', value: 'Scraping necrotic tissue' },
      { label: 'Sharp curette', value: 'Adherent slough, and drawing calculous debris into the sheath' },
      { label: 'Mowing loop', value: 'Bladder tumours on the posterior wall' },
    ],
    uses: [
      'The loop angle matches the beak angle and the telescope window — they are designed as a set.',
      'The loop should retract less than 1 mm inside the sheath, so it never sits too close to the telescope.',
    ],
    pitfalls: [
      'A cutting loop must never sit at more than a right angle to its insulated shoulders. At an obtuse angle it will not retract into the sheath and you leave tags of uncut tissue behind.',
      'Loops wear at the convex part and usually break in the centre — check before you start, and never resect with a broken loop.',
    ],
    citation: instr,
  },

  // ---------- PCNL ----------
  {
    id: 'pcnl-access',
    name: 'Access needles & tract dilators',
    group: 'pcnl',
    summary: 'Getting into the collecting system, then opening a tract wide enough to work through.',
    specs: [
      { label: 'Two-part trocar-tip needle', value: '18 G, 20 cm — the most popular initial puncture needle' },
      { label: 'Needle colour code', value: 'Pink 18 G · yellow 20 G · black 21 G' },
      { label: 'Three-part bevel-tip needle', value: '18 G, 20 cm; takes a 0.035" wire' },
      { label: 'Chiba ("skinny") needle', value: '21 G, three-part bevel tip — for fluoroscopy-guided puncture and opacifying the system' },
      { label: 'Fascial dilators', value: 'Elongated conical tip with an end channel, passed sequentially over the wire' },
    ],
    uses: [
      'Point the bevel toward the ultrasound crystals so the needle is acoustically visible.',
      'A 21 G Chiba should in theory cause less renal damage, less bleeding and less risk of an AV fistula across multiple passes than an 18 G needle.',
    ],
    pitfalls: [
      'A bevelled needle drifts toward the bevel; a diamond tip does not deviate either way.',
      'Serial fascial dilators are cheap but each exchange releases the tamponade on the tract, so they are theoretically bloodier.',
      'The claimed safety advantage of the 21 G needle has not actually been proven in a study — treat it as rationale, not evidence.',
    ],
    citation: instr,
  },
  {
    id: 'pcnl-retrieval',
    name: 'Retrieval accessories',
    group: 'pcnl',
    summary: 'Forceps chosen by how much room you have to open them.',
    specs: [
      { label: 'Triflange', value: 'Needs the most space to open; not easily dismantled' },
      { label: 'Biflange', value: 'Opens in a smaller space; not easily dismantled' },
      { label: 'Alligator', value: 'Works in the smallest space — the one for a compact system' },
      { label: 'Suction cannula', value: 'Clears small fragments and shortens the case' },
    ],
    uses: ['Retrieving fragments through the tract once the stone is broken.'],
    pitfalls: [
      'Match the forceps to the working space: a triflange that cannot open in a narrow calyx is no use to you.',
    ],
    citation: instr,
  },

  // ---------- ELECTROSURGERY ----------
  {
    id: 'electro-generator',
    name: 'Generator & waveforms',
    group: 'electrosurgery',
    summary:
      'The generator lifts mains current to radiofrequency, which is why current can pass through a patient without causing a shock.',
    specs: [
      { label: 'Frequency conversion', value: 'Mains at 60 cycles/s raised to about 200,000 cycles/s' },
      { label: 'Why it is safe', value: 'At radiofrequency there is no neuromuscular stimulation, so no electric shock' },
      { label: 'Monopolar circuit', value: 'Generator → active electrode → patient → patient return electrode' },
      { label: 'Cut waveform', value: 'Constant — heat builds fast and vaporises tissue' },
      { label: 'Coagulation waveform', value: 'Interrupted — less heat, coagulation without vaporisation' },
      { label: 'Blend', value: 'A change of duty cycle: lower duty cycle coagulates, higher vaporises' },
      { label: 'Fulguration duty cycle', value: 'Only about 6% on-time — chars a wider area rather than cutting' },
    ],
    uses: [
      'Cutting: hold the electrode slightly off the tissue. Current concentration is highest there, and so is the cut.',
      'Fulguration for diffuse oozing over a broad surface; point coagulation for a discrete bleeder.',
    ],
    pitfalls: [
      'The patient return electrode completes the monopolar circuit — a poorly applied pad is how you get a burn at the pad site.',
      'Advanced bipolar (LigaSure, PK, EnSeal), ultrasonic and argon beam are separate modalities with different tissue effects; do not assume settings transfer.',
    ],
    citation: instr,
  },
];

export function instrumentsIn(group: InstrumentGroup): Instrument[] {
  return INSTRUMENTS.filter((i) => i.group === group);
}
