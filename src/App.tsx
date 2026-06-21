import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { DashboardHome } from './components/DashboardHome';
import { QuickTracker } from './components/QuickTracker';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { GoalTracker } from './components/GoalTracker';
import { WeeklyReport } from './components/WeeklyReport';
import { LearnHub } from './components/LearnHub';
import { SettingsView } from './components/SettingsView';
import { MethodologyModal } from './components/MethodologyModal';
import { CommunityFeed } from './components/CommunityFeed';
import { MemeCenter } from './components/MemeCenter';
import { AuthView } from './components/AuthView';
import { ErrorBoundary } from './components/ErrorBoundary';

function MainAppContent() {
  const { user, activeTab, authUser, authLoading, isDemoMode, toast } = useApp();
  const [isMethodologyOpen, setIsMethodologyOpen] = React.useState<boolean>(false);

  // Dynamically update document.title based on the active tab for SEO & A11y
  React.useEffect(() => {
    const tabTitles: Record<string, string> = {
      landing: 'Home',
      dashboard: 'Dashboard',
      tracker: 'Quick Tracker',
      simulator: 'What-If Simulator',
      goals: 'Goal Tracker',
      community: 'Community Feed',
      report: 'Weekly Report',
      learn: 'Learn Hub',
      memes: 'Eco-Meme Center',
      settings: 'Settings'
    };
    const titleSuffix = tabTitles[activeTab] || 'Your Climate Path';
    document.title = `Carbon Compass | ${titleSuffix}`;
  }, [activeTab]);

  // Show a minimal skeleton while Firebase Auth is initializing.
  // This prevents a flash of the wrong page (e.g. LandingPage briefly
  // appearing when the user is actually signed in).
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-forest-600 flex items-center justify-center shadow-lg shadow-emerald-600/20 animate-pulse">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div className="space-y-2 text-center">
            <div className="h-3 w-36 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse" />
            <div className="h-2 w-24 bg-stone-100 dark:bg-stone-850 rounded-full animate-pulse mx-auto" />
          </div>
          <p className="text-[10px] font-mono text-stone-400 tracking-widest uppercase animate-pulse">
            Carbon Compass
          </p>
        </div>
      </div>
    );
  }

  // Router dispatcher — tab-based navigation with proper auth gating
  const renderTabContent = () => {
    // 1. Static Public Pages (always visible)
    if (activeTab === 'landing') {
      return (
        <ErrorBoundary componentName="Landing Page">
          <LandingPage onOpenMethodology={() => setIsMethodologyOpen(true)} />
        </ErrorBoundary>
      );
    }
    if (activeTab === 'learn') {
      return (
        <ErrorBoundary componentName="Learn Hub">
          <LearnHub />
        </ErrorBoundary>
      );
    }
    if (activeTab === 'memes') {
      return (
        <ErrorBoundary componentName="Meme Center">
          <MemeCenter />
        </ErrorBoundary>
      );
    }

    // 2. Gate: Authentication (premium tabs require sign-in)
    if (!authUser && !isDemoMode) {
      return <AuthView />;
    }

    // 3. Gate: Profile Setup (signed in but hasn't completed onboarding)
    if (!user) {
      return (
        <ErrorBoundary componentName="Onboarding">
          <OnboardingFlow />
        </ErrorBoundary>
      );
    }

    // 4. Authenticated & Onboarded Router
    switch (activeTab) {
      case 'dashboard':
        return (
          <ErrorBoundary componentName="Dashboard">
            <DashboardHome onOpenMethodology={() => setIsMethodologyOpen(true)} />
          </ErrorBoundary>
        );
      case 'tracker':
        return (
          <ErrorBoundary componentName="Quick Tracker">
            <QuickTracker />
          </ErrorBoundary>
        );
      case 'simulator':
        return (
          <ErrorBoundary componentName="What-If Simulator">
            <WhatIfSimulator />
          </ErrorBoundary>
        );
      case 'goals':
        return (
          <ErrorBoundary componentName="Goal Tracker">
            <GoalTracker />
          </ErrorBoundary>
        );
      case 'community':
        return (
          <ErrorBoundary componentName="Community Feed">
            <CommunityFeed />
          </ErrorBoundary>
        );
      case 'report':
        return (
          <ErrorBoundary componentName="Weekly Report">
            <WeeklyReport />
          </ErrorBoundary>
        );
      case 'settings':
        return (
          <ErrorBoundary componentName="Settings">
            <SettingsView />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary componentName="Dashboard">
            <DashboardHome onOpenMethodology={() => setIsMethodologyOpen(true)} />
          </ErrorBoundary>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300">
      {/* Dynamic Navigation */}
      <Navbar />

      {/* Main Container Stage */}
      <main className="flex-1 bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
        {renderTabContent()}
      </main>

      {/* Footer Branding */}
      <Footer onOpenMethodology={() => setIsMethodologyOpen(true)} />

      {/* Methodology Popup */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      {/* Floating toast notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg border text-xs font-bold font-sans flex items-center gap-2.5 animate-slide-up transition-all ${
          toast.type === 'success' 
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/10' 
            : toast.type === 'error' 
            ? 'bg-red-650 text-white border-red-550 shadow-red-500/10' 
            : 'bg-stone-850 text-white border-stone-750 dark:bg-stone-900 dark:border-stone-800'
        }`}>
          <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠' : 'ℹ'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    // Top-level boundary catches AppProvider or context initialization errors
    <ErrorBoundary componentName="Application">
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
