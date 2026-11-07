import type { ComponentType } from 'react';
import type { ScreenLink } from '@/navigation';
import type { GatedFeature } from '@/lib/featureTiers';
import {
  AcademicIcon,
  CalculatorIcon,
  CalendarIcon,
  ClockIcon,
  ConsentIcon,
  DrugIcon,
  GuidelineIcon,
  ImagingIcon,
  InpatientIcon,
  OnCallIcon,
  PersonIcon,
  ScalpelIcon,
  StagingIcon,
  StentIcon,
  TrainingIcon,
} from '@/components/icons';

export interface Tile {
  id: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  link: ScreenLink;
  /** Set for paid workspaces, so the tile can show its tier while locked. */
  feature?: GatedFeature;
}

/** Every workspace that can be pinned to Quick access; the first eight are the default. */
export const TILES: Tile[] = [
  { id: 'calculators', label: 'Calculators', Icon: CalculatorIcon, link: { screen: 'calculators' } },
  { id: 'guidelines', label: 'Guidelines', Icon: GuidelineIcon, link: { screen: 'guidelines' } },
  { id: 'procedures', label: 'Procedures', Icon: ScalpelIcon, link: { residency: { section: 'or', orTab: 'procedures' } } },
  { id: 'consent', label: 'Consent', Icon: ConsentIcon, link: { residency: { section: 'or', orTab: 'consent' } }, feature: 'consent' },
  { id: 'imaging', label: 'Imaging', Icon: ImagingIcon, link: { screen: 'imaging' } },
  { id: 'drugs', label: 'Drugs', Icon: DrugIcon, link: { screen: 'drugs' } },
  { id: 'followup', label: 'Follow-up', Icon: CalendarIcon, link: { screen: 'surveillance' }, feature: 'surveillance' },
  { id: 'rehearsal', label: 'Rehearsal', Icon: TrainingIcon, link: { screen: 'rehearsal' }, feature: 'rehearsal' },
  { id: 'ward', label: 'Ward list', Icon: InpatientIcon, link: { residency: { section: 'inpatient' } }, feature: 'inpatient' },
  { id: 'oncall', label: 'On-call', Icon: OnCallIcon, link: { residency: { section: 'oncall' } } },
  { id: 'logbook', label: 'Logbook', Icon: ClockIcon, link: { residency: { section: 'or', orTab: 'logbook' } }, feature: 'logbook' },
  { id: 'stents', label: 'Stents', Icon: StentIcon, link: { residency: { section: 'or', orTab: 'stents' } }, feature: 'stents' },
  { id: 'mdt', label: 'MDT', Icon: StagingIcon, link: { screen: 'mdt' }, feature: 'mdt' },
  { id: 'cme', label: 'CME', Icon: AcademicIcon, link: { screen: 'cme' }, feature: 'cme' },
  { id: 'conferences', label: 'Conferences', Icon: CalendarIcon, link: { screen: 'conferences' } },
  { id: 'articles', label: 'Articles', Icon: GuidelineIcon, link: { screen: 'articles' }, feature: 'articles' },
  { id: 'pediatrics', label: 'Pediatrics', Icon: PersonIcon, link: { screen: 'pediatrics' } },
];

export const DEFAULT_QUICK = TILES.slice(0, 8).map((t) => t.id);
export const TILE_IDS: ReadonlySet<string> = new Set(TILES.map((t) => t.id));
export const tileById = (id: string) => TILES.find((t) => t.id === id);
