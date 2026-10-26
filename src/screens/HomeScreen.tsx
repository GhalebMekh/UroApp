import type { Screen, ScreenLink } from '@/navigation';
import { previewMode } from '@/lib/preview';
import { Hero } from './home/Hero';
import { Suite } from './home/Suite';
import { Faq } from './home/Faq';
import { AppCta } from './home/AppCta';
import { YourTools } from './home/YourTools';
import { Dashboard } from './home/Dashboard';

/**
 * Home. The installed app opens on a working dashboard; the public web
 * preview (the website's shop window) keeps the landing page, which only
 * shows shipped features, with the user's own tools first once they have some.
 */
export function HomeScreen({
  onNavigate,
  onOpenCalculator,
  onOpenLink,
  onOpenSearch,
  onOpenRehearsal,
}: {
  onNavigate: (s: Screen) => void;
  onOpenCalculator: (id: string) => void;
  onOpenLink: (link: ScreenLink) => void;
  onOpenSearch: () => void;
  onOpenRehearsal: (procedureId?: string) => void;
}) {
  if (!previewMode) {
    return (
      <Dashboard
        onNavigate={onNavigate}
        onOpenCalculator={onOpenCalculator}
        onOpenLink={onOpenLink}
        onOpenSearch={onOpenSearch}
        onOpenRehearsal={onOpenRehearsal}
      />
    );
  }

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
