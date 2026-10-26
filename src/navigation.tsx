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
  | 'residency'
  | 'imaging'
  | 'instruments'
  | 'mdt'
  | 'cme'
  | 'pediatrics'
  | 'guidelines'
  | 'surveillance'
  | 'conferences'
  | 'rehearsal'
  | 'scenarios'
  | 'drugs'
  | 'articles'
  | 'more';

export type ResidencySection = 'inpatient' | 'oncall' | 'or';
export type OrTab = 'logbook' | 'procedures' | 'consent';

/** Where to open the Residency screen when another screen links into it. */
export interface ResidencyTarget {
  section: ResidencySection;
  orTab?: OrTab;
  /** On-call pathway to open (an EMERGENCIES id). */
  emergency?: string;
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
