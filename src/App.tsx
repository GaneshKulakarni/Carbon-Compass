import React, { useState } from 'react';
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

function MainAppContent() {
  const { user, activeTab, firebaseUser, setAuthError } = useApp();
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);

  // Router dispatcher
  const renderTabContent = () => {
    // 1. Static Public Pages (visible always)
    if (activeTab === 'landing') {
      return <LandingPage onOpenMethodology={() => setIsMethodologyOpen(true)} />;
    }
    if (activeTab === 'learn') {
      return <LearnHub />;
    }
    if (activeTab === 'memes') {
      return <MemeCenter />;
    }

    // 2. Gate Authentication (Premium tabs)
    if (!firebaseUser) {
      return <AuthView />;
    }

    // 3. Gate Profile Setup (User signed in but hasn't completed onboarding)
    if (!user) {
      return <OnboardingFlow />;
    }

    // 4. Authenticated & Onboarded Router
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome onOpenMethodology={() => setIsMethodologyOpen(true)} />;
      case 'tracker':
        return <QuickTracker />;
      case 'simulator':
        return <WhatIfSimulator />;
      case 'goals':
        return <GoalTracker />;
      case 'community':
        return <CommunityFeed />;
      case 'report':
        return <WeeklyReport />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardHome onOpenMethodology={() => setIsMethodologyOpen(true)} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
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
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
