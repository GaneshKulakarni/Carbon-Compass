import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Leaf, BarChart3, Award, Flame, LogOut, Sun, Moon, Menu, X, Play, HelpCircle, AlertCircle, Settings, ClipboardList, TrendingUp } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, activeTab, setActiveTab, resetAllData, loadDemoMode, isDemoMode, theme, setTheme } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tracker', label: 'Tracker', icon: ClipboardList },
    { id: 'simulator', label: 'Simulator', icon: TrendingUp },
    { id: 'goals', label: 'Habits & Goals', icon: Award },
    { id: 'report', label: 'Weekly Report', icon: Flame },
    { id: 'learn', label: 'Insights Hub', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNav = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/90 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-900/90 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Name */}
          <div 
            onClick={() => handleNav(user ? 'dashboard' : 'landing')} 
            className="flex cursor-pointer items-center space-x-2.5 group"
            id="nav-logo-container"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-600 text-white shadow-md shadow-forest-600/20 group-hover:scale-105 transition-transform">
              <Compass className="h-5.5 w-5.5 animate-spin-slow" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-forest-950 dark:text-stone-50">
                Carbon <span className="text-forest-600 dark:text-forest-400">Compass</span>
              </span>
              {user && (
                <div className="hidden sm:flex items-center space-x-1.5 mt-[-4px]">
                  <span className="inline-block text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.2 rounded bg-forest-100 text-forest-800 dark:bg-forest-900/50 dark:text-forest-200 uppercase font-semibold">
                    {user.climatePersona}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {user && (
            <div className="hidden lg:flex items-center space-x-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => handleNav(item.id)}
                    className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-forest-50 text-forest-700 dark:bg-forest-950/40 dark:text-forest-400 shadow-sm border border-forest-100 dark:border-forest-900/30'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/50 dark:hover:text-stone-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Action buttons list */}
          <div className="flex items-center space-x-3">
            {/* Quick Demo button if landing or onboarding */}
            {!user && (
              <button
                id="btn-nav-try-demo"
                onClick={loadDemoMode}
                className="hidden sm:flex items-center space-x-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-800 px-3.5 py-1.5 text-xs font-semibold hover:bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 transition-all hover:scale-[1.02]"
              >
                <Play className="h-3 w-3 fill-emerald-800 dark:fill-emerald-400" />
                <span>Instant Demo Mode</span>
              </button>
            )}

            {/* Indicator of Demo Mode */}
            {isDemoMode && user && (
              <span className="flex items-center space-x-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-medium text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-400 uppercase tracking-wide">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Demo User Profile</span>
              </span>
            )}

            {/* Dark mode switch */}
            <button
              id="btn-nav-theme-toggle"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-50 transition-colors"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Reset / Logout if user is exists */}
            {user && (
              <button
                id="btn-nav-logout"
                onClick={resetAllData}
                className="hidden lg:flex items-center justify-center rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Reset Application"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}

            {/* Mobile menu trigger */}
            {user && (
              <button
                id="btn-nav-mobile-trigger"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 lg:hidden"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}

            {!user && activeTab === 'landing' && (
              <button
                id="btn-nav-get-started"
                onClick={() => handleNav('onboarding')}
                className="rounded-lg bg-forest-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-forest-600/10 hover:bg-forest-700 transition-all"
              >
                Start Free
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && user && (
        <div className="lg:hidden border-t border-stone-200/60 bg-white px-2 pt-2 pb-4 dark:border-stone-800/60 dark:bg-stone-950 space-y-1.5 animate-slide-up">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-mobile-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`flex w-full items-center space-x-3 rounded-lg px-4 py-2.5 text-base font-medium transition-all ${
                  isActive
                    ? 'bg-forest-50 text-forest-700 dark:bg-forest-950/40 dark:text-forest-400 border-l-4 border-forest-600'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={resetAllData}
              className="flex w-full items-center space-x-3 rounded-lg px-4 py-2.5 text-base font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <LogOut className="h-5 w-5" />
              <span>Reset & Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
