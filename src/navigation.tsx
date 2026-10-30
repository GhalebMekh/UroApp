import {
  AcademicIcon,
  ClinicalIcon,
  HomeIcon,
  MoreIcon,
  OnCallIcon,
} from '@/components/icons';
import type { NavItem } from '@/components/BottomNav';

export type Screen =
  | 'home'
  | 'clinical'
  | 'academic'
  | 'calculators'
  | 'calculator'
  | 'residency'
  | 'imaging'
  | 'instruments'
  | 'mdt'
  | 'cme'
  | 'pediatrics'
  | 'pediatricTool'
  | 'guidelines'
  | 'surveillance'
  | 'conferences'
  | 'rehearsal'
  | 'scenarios'
  | 'drugs'
  | 'articles'
  | 'plans'
  | 'more';

export type ResidencySection = 'inpatient' | 'oncall' | 'or';
export type OrTab = 'logbook' | 'procedures' | 'consent';

/** Where to open the Residency screen when another screen links into it. */
export interface ResidencyTarget {
  section: ResidencySection;
  orTab?: OrTab;
  /** On-call pathway to open (an EMERGENCIES id). */
  emergency?: string;
  /** Operative reference page to open (a PROCEDURES id). */
  procedure?: string;
}

/** A link from one screen to another, optionally into a Residency tab. */
export type ScreenLink = { screen: Screen } | { residency: ResidencyTarget };

/**
 * Bottom-nav model. Order here is the on-screen order. Clinical and Academic are
 * hub screens: Clinical groups the point-of-care tools (calculators, imaging,
 * drugs, surveillance, pediatrics); Academic groups learning/reference
 * (guidelines, conferences, operative rehearsal, intra-op scenarios).
 */
export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'clinical', label: 'Clinical', Icon: ClinicalIcon },
  { id: 'academic', label: 'Academic', Icon: AcademicIcon },
  { id: 'residency', label: 'Residency', Icon: OnCallIcon },
  { id: 'more', label: 'More', Icon: MoreIcon },
];

/** The bottom-nav tab a secondary screen belongs to, so that tab stays highlighted inside it. */
export const NAV_PARENT: Partial<Record<Screen, Screen>> = {
  calculators: 'clinical',
  calculator: 'clinical',
  imaging: 'clinical',
  instruments: 'clinical',
  mdt: 'clinical',
  drugs: 'clinical',
  surveillance: 'clinical',
  pediatrics: 'clinical',
  pediatricTool: 'clinical',
  guidelines: 'academic',
  articles: 'academic',
  conferences: 'academic',
  cme: 'academic',
  rehearsal: 'academic',
  scenarios: 'academic',
  plans: 'more',
};
