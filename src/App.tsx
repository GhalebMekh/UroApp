import { useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { DisclaimerGate } from '@/components/DisclaimerGate';
import { SearchOverlay } from '@/components/SearchOverlay';
import { EntitlementsContext, type Tier } from '@/lib/entitlements';
import { NAV_ITEMS, type Screen } from '@/navigation';
import { HomeScreen } from '@/screens/HomeScreen';
import { ClinicalHubScreen, AcademicHubScreen } from '@/screens/HubScreen';
import { CalculatorsScreen } from '@/screens/CalculatorsScreen';
import { ImagingScreen } from '@/screens/ImagingScreen';
import { PediatricsScreen } from '@/screens/PediatricsScreen';
import { ResidencyScreen } from '@/screens/ResidencyScreen';
import { GuidelinesScreen } from '@/screens/GuidelinesScreen';
import { SurveillanceScreen } from '@/screens/SurveillanceScreen';
import { ConferencesScreen } from '@/screens/ConferencesScreen';
import { OperativeRehearsalScreen } from '@/screens/OperativeRehearsalScreen';
import { IntraopScenariosScreen } from '@/screens/IntraopScenariosScreen';
import { DrugsScreen } from '@/screens/DrugsScreen';
import { ArticlesScreen } from '@/screens/ArticlesScreen';
import { MoreScreen } from '@/screens/MoreScreen';

/**
 * Master state-machine router (CLAUDE.md): a single `currentScreen` drives
 * which workspace renders between the persistent top bar and bottom nav.
 * No URL router yet — Capacitor ships as a single-screen native shell.
 */
/** Bottom-nav screens are navigation "roots" — reaching one clears back history. */
const ROOT_SCREENS = new Set<Screen>(NAV_ITEMS.map((i) => i.id));

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [history, setHistory] = useState<Screen[]>([]);
  const [tier, setTier] = useState<Tier>('resident');
  const [searchOpen, setSearchOpen] = useState(false);

  function navigate(screen: Screen) {
    if (screen === currentScreen) return;
    // A root tab starts a fresh stack; a secondary screen remembers where we came from.
    setHistory(ROOT_SCREENS.has(screen) ? [] : [...history, currentScreen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0 });
  }

  function goBack() {
    if (history.length === 0) return;
    setCurrentScreen(history[history.length - 1]!);
    setHistory(history.slice(0, -1));
    window.scrollTo({ top: 0 });
  }

  return (
    <EntitlementsContext.Provider value={{ tier, setTier }}>
      <DisclaimerGate>
        <div className="flex min-h-[100dvh] flex-col">
          <TopBar
            onOpenSearch={() => setSearchOpen(true)}
            canGoBack={history.length > 0}
            onBack={goBack}
          />
          <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={navigate} />

        {/* pb leaves room for the fixed bottom nav (~64px + safe area) */}
        <main className="flex-1 pb-24">
          {currentScreen === 'home' && <HomeScreen onNavigate={navigate} />}
          {currentScreen === 'clinical' && <ClinicalHubScreen onNavigate={navigate} />}
          {currentScreen === 'academic' && <AcademicHubScreen onNavigate={navigate} />}
          {currentScreen === 'calculators' && <CalculatorsScreen />}
          {currentScreen === 'residency' && <ResidencyScreen />}
          {currentScreen === 'imaging' && <ImagingScreen />}
          {currentScreen === 'pediatrics' && <PediatricsScreen />}
          {currentScreen === 'guidelines' && <GuidelinesScreen />}
          {currentScreen === 'surveillance' && <SurveillanceScreen />}
          {currentScreen === 'conferences' && <ConferencesScreen />}
          {currentScreen === 'rehearsal' && <OperativeRehearsalScreen />}
          {currentScreen === 'scenarios' && <IntraopScenariosScreen />}
          {currentScreen === 'drugs' && <DrugsScreen />}
          {currentScreen === 'articles' && <ArticlesScreen />}
          {currentScreen === 'more' && <MoreScreen />}
        </main>

          <BottomNav
            items={NAV_ITEMS}
            current={currentScreen}
            onNavigate={navigate}
          />
        </div>
      </DisclaimerGate>
    </EntitlementsContext.Provider>
  );
}
