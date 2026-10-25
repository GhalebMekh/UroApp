import type { Screen, ScreenLink } from '@/navigation';
import { Hero } from './home/Hero';
import { Suite } from './home/Suite';
import { Faq } from './home/Faq';
import { AppCta } from './home/AppCta';
import { YourTools } from './home/YourTools';

/** Landing page — shows only shipped features, with the user's own tools first once they have some. */
export function HomeScreen({
  onNavigate,
  onOpenCalculator,
  onOpenLink,
}: {
  onNavigate: (s: Screen) => void;
  onOpenCalculator: (id: string) => void;
  onOpenLink: (link: ScreenLink) => void;
}) {
  return (
    <>
      <YourTools onOpenCalculator={onOpenCalculator} />
      <Hero onNavigate={onNavigate} />
      <Suite onOpenLink={onOpenLink} />
      <Faq />
      <AppCta />
    </>
  );
}
