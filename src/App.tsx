import { useCallback, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { DisclaimerGate } from '@/components/DisclaimerGate';
import { PasscodeGate } from '@/components/PasscodeGate';
import { SearchOverlay } from '@/components/SearchOverlay';
import { ProGate } from '@/components/ProGate';
import { AppLockProvider } from '@/components/AppLockProvider';
import { AccountProvider } from '@/components/AccountProvider';
import { SyncBoundary } from '@/components/SyncBoundary';
import { LockGate } from '@/components/LockGate';
import { PurchasesProvider } from '@/components/PurchasesProvider';
import { NotificationsSync } from '@/components/NotificationsSync';
import type { GatedFeature } from '@/lib/featureTiers';
import { NAV_ITEMS, NAV_PARENT, type ResidencyTarget, type Screen, type ScreenLink } from '@/navigation';
import { HomeScreen } from '@/screens/HomeScreen';
import { ClinicalHubScreen, AcademicHubScreen } from '@/screens/HubScreen';
import { CalculatorsScreen } from '@/screens/CalculatorsScreen';
import { CalculatorScreen } from '@/screens/CalculatorScreen';
import { ImagingScreen } from '@/screens/ImagingScreen';
import { InstrumentsScreen } from '@/screens/InstrumentsScreen';
import { MdtScreen } from '@/screens/MdtScreen';
import { CmeScreen } from '@/screens/CmeScreen';
import { PediatricsScreen } from '@/screens/PediatricsScreen';
import { PediatricToolScreen } from '@/screens/PediatricToolScreen';
import { ResidencyScreen } from '@/screens/ResidencyScreen';
import { GuidelinesScreen } from '@/screens/GuidelinesScreen';
import { SurveillanceScreen } from '@/screens/SurveillanceScreen';
import { ConferencesScreen } from '@/screens/ConferencesScreen';
import { OperativeRehearsalScreen } from '@/screens/OperativeRehearsalScreen';
import { IntraopScenariosScreen } from '@/screens/IntraopScenariosScreen';
import { DrugsScreen } from '@/screens/DrugsScreen';
import { ArticlesScreen } from '@/screens/ArticlesScreen';
import { MoreScreen } from '@/screens/MoreScreen';
import { PlansScreen } from '@/screens/PlansScreen';
import { AppStoreLockScreen } from '@/screens/AppStoreLockScreen';
import { isLocked, lockCopy, previewMode } from '@/lib/preview';

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
  const [searchOpen, setSearchOpen] = useState(false);
  /** The locked feature that opened the plans screen, if any. */
  const [plansFeature, setPlansFeature] = useState<GatedFeature | null>(null);
  /** The calculator shown on the single-calculator screen. */
  const [calcId, setCalcId] = useState<string | null>(null);
  /** The pediatric tool shown on the single-tool screen. */
  const [pedsToolId, setPedsToolId] = useState<string | null>(null);
  /** A Residency tab to open on arrival (set by Home cards); cleared once used. */
  const [residencyTarget, setResidencyTarget] = useState<ResidencyTarget | null>(null);
  /** Bumped per link so Residency re-opens on the target even when it is already showing. */
  const [residencyVisit, setResidencyVisit] = useState(0);
  const clearResidencyTarget = useCallback(() => setResidencyTarget(null), []);
  /** An operation the rehearsal screen should preselect (set by the Home "due" list). */
  const [rehearsalFocus, setRehearsalFocus] = useState<string | null>(null);
  const clearRehearsalFocus = useCallback(() => setRehearsalFocus(null), []);

  function navigate(screen: Screen) {
    if (screen === currentScreen) return;
    // A root tab starts a fresh stack; a secondary screen remembers where we came from.
    setHistory(ROOT_SCREENS.has(screen) ? [] : [...history, currentScreen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0 });
  }

  /** Open one calculator on its own screen, from anywhere (search, Home, MDT, the list). */
  function openCalculator(id: string) {
    setCalcId(id);
    // Already on a calculator (e.g. an "Also in" link): swap it in place, from the top.
    if (currentScreen === 'calculator') window.scrollTo({ top: 0 });
    navigate('calculator');
  }

  /** Open one pediatric tool on its own screen. */
  function openPediatricTool(id: string) {
    setPedsToolId(id);
    if (currentScreen === 'pediatricTool') window.scrollTo({ top: 0 });
    navigate('pediatricTool');
  }

  /** Follow a link to a screen, or into a specific Residency tab. */
  function openLink(link: ScreenLink) {
    if ('residency' in link) {
      setResidencyTarget(link.residency);
      setResidencyVisit((n) => n + 1);
      navigate('residency');
    } else {
      navigate(link.screen);
    }
  }

  /** Open operative rehearsal, optionally on one operation. */
  function openRehearsal(procedureId?: string) {
    setRehearsalFocus(procedureId ?? null);
    navigate('rehearsal');
  }

  /** The plans screen, from a locked feature (which it then names) or from More. */
  function openPlans(feature?: GatedFeature) {
    setPlansFeature(feature ?? null);
    navigate('plans');
  }

  function goBack() {
    if (history.length === 0) return;
    setCurrentScreen(history[history.length - 1]!);
    setHistory(history.slice(0, -1));
    window.scrollTo({ top: 0 });
  }

  return (
    <AppLockProvider>
    <AccountProvider>
    <PurchasesProvider onOpenPlans={openPlans}>
      {/* Access first, then the medical disclaimer — no reason to show clinical
          terms to someone who cannot get in. */}
      <NotificationsSync onOpen={navigate} />
      <PasscodeGate>
      <DisclaimerGate>
        <div className="flex min-h-[100dvh] flex-col px-safe">
          <TopBar
            onOpenSearch={() => setSearchOpen(true)}
            canGoBack={history.length > 0}
            onBack={goBack}
            // Every screen opens on a gradient header (PageHero) except the web preview's landing page.
            overHero={!(previewMode && currentScreen === 'home')}
          />
          <SearchOverlay
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            onNavigate={navigate}
            onOpenCalculator={openCalculator}
            onOpenPediatricTool={openPediatricTool}
            onOpenLink={openLink}
          />

        {/* pb leaves room for the fixed bottom nav (~64px + safe area) */}
        <main className="flex-1 pb-24">
          {/* A preview build withholds the workspaces that ship with the iOS
              release; the hubs still list them so the scope stays visible. */}
          {isLocked(currentScreen) ? (
            <AppStoreLockScreen {...lockCopy(currentScreen)} />
          ) : (
            <SyncBoundary>
          {currentScreen === 'home' && (
            <HomeScreen
              onNavigate={navigate}
              onOpenCalculator={openCalculator}
              onOpenLink={openLink}
              onOpenSearch={() => setSearchOpen(true)}
              onOpenRehearsal={openRehearsal}
            />
          )}
          {currentScreen === 'clinical' && <ClinicalHubScreen onNavigate={navigate} />}
          {currentScreen === 'academic' && <AcademicHubScreen onNavigate={navigate} />}
          {currentScreen === 'calculators' && (
            <CalculatorsScreen onOpen={openCalculator} />
          )}
          {currentScreen === 'calculator' && calcId && (
            <CalculatorScreen id={calcId} onOpen={openCalculator} onAll={() => navigate('calculators')} />
          )}
          {currentScreen === 'residency' && (
            <ResidencyScreen key={residencyVisit} initial={residencyTarget} onInitialHandled={clearResidencyTarget} />
          )}
          {currentScreen === 'imaging' && <ImagingScreen />}
          {currentScreen === 'instruments' && <InstrumentsScreen />}
          {currentScreen === 'mdt' && (
            <ProGate feature="mdt">
              <LockGate>
                <MdtScreen onOpenCalculator={openCalculator} />
              </LockGate>
            </ProGate>
          )}
          {currentScreen === 'cme' && (
            <ProGate feature="cme">
              <LockGate>
                <CmeScreen />
              </LockGate>
            </ProGate>
          )}
          {currentScreen === 'pediatrics' && <PediatricsScreen onOpen={openPediatricTool} />}
          {currentScreen === 'pediatricTool' && pedsToolId && (
            <PediatricToolScreen id={pedsToolId} onOpen={openPediatricTool} onAll={() => navigate('pediatrics')} />
          )}
          {currentScreen === 'guidelines' && <GuidelinesScreen />}
          {currentScreen === 'surveillance' && (
            <ProGate feature="surveillance">
              <SurveillanceScreen />
            </ProGate>
          )}
          {currentScreen === 'conferences' && <ConferencesScreen />}
          {currentScreen === 'rehearsal' && (
            <ProGate feature="rehearsal">
              <OperativeRehearsalScreen initialProcedureId={rehearsalFocus} onInitialHandled={clearRehearsalFocus} />
            </ProGate>
          )}
          {currentScreen === 'scenarios' && (
            <ProGate feature="scenarios">
              <IntraopScenariosScreen />
            </ProGate>
          )}
          {currentScreen === 'drugs' && <DrugsScreen />}
          {currentScreen === 'articles' && (
            <ProGate feature="articles">
              <ArticlesScreen />
            </ProGate>
          )}
          {currentScreen === 'plans' && <PlansScreen feature={plansFeature} onDone={goBack} />}
          {currentScreen === 'more' && <MoreScreen />}
            </SyncBoundary>
          )}
        </main>

          <BottomNav
            items={NAV_ITEMS}
            current={NAV_PARENT[currentScreen] ?? currentScreen}
            onNavigate={navigate}
          />
        </div>
      </DisclaimerGate>
      </PasscodeGate>
    </PurchasesProvider>
    </AccountProvider>
    </AppLockProvider>
  );
}
