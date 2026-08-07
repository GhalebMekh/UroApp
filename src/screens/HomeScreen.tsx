import type { Screen } from '@/navigation';
import { Hero } from './home/Hero';
import { Suite } from './home/Suite';
import { Faq } from './home/Faq';
import { AppCta } from './home/AppCta';

/** Public marketing landing page — shows only shipped features. */
export function HomeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <>
      <Hero onNavigate={onNavigate} />
      <Suite />
      <Faq />
      <AppCta />
    </>
  );
}
