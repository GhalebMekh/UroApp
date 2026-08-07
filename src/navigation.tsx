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
  | 'pediatrics'
  | 'guidelines'
  | 'surveillance'
  | 'conferences'
  | 'rehearsal'
  | 'scenarios'
  | 'drugs'
  | 'articles'
  | 'more';

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
