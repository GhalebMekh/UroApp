import type { ComponentType } from 'react';
import {
  AdrenalIcon,
  BladderIcon,
  KidneyIcon,
  ProstateIcon,
  ScalpelIcon,
  StagingIcon,
  StoneIcon,
  TestisIcon,
} from '@/components/icons';
import type { BenignTopic, OncologyOrgan } from './registry';

type Icon = ComponentType<{ className?: string }>;

/** Heading icon for each oncology organ group. */
export const ORGAN_ICON: Record<OncologyOrgan, Icon> = {
  prostate: ProstateIcon,
  bladder: BladderIcon,
  kidney: KidneyIcon,
  adrenal: AdrenalIcon,
  testis: TestisIcon,
  general: StagingIcon,
};

/** Heading icon for each benign topic group. */
export const TOPIC_ICON: Record<BenignTopic, Icon> = {
  luts: BladderIcon,
  stones: StoneIcon,
  andrology: TestisIcon,
  'kidney-function': KidneyIcon,
  periop: ScalpelIcon,
};
