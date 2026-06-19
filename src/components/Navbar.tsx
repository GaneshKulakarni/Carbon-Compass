import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Compass, 
  BarChart3, 
  Award, 
  Flame, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  HelpCircle, 
  Settings, 
  ClipboardList, 
  TrendingUp, 
  Share2, 
  Laugh, 
  User as UserIcon, 
  Lock,
  ChevronDown,
  Wrench,
  Globe
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    user, 
    activeTab, 
    setActiveTab, 
    theme, 
    setTheme, 
    firebaseUser, 
    signOutFirebase,
    isDemoMode
  } = useApp();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  // Keep dropdown references for close-on-click-outside
  const profileRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary Navigation bar (Flat top level structure)
  const primaryPublicItems = [
    { id: 'landing', label: 'Exhibition', icon: Compass },
    { id: 'learn', label: 'Insights Hub', icon: HelpCircle },
    { id: 'memes', label: 'Eco-Meme Center', icon: Laugh },
  ];

  const primaryPremiumItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tracker', label: 'Tracker', icon: ClipboardList },
    { id: 'goals', label: 'Habits & Goals', icon: Award },
  ];

  const dropdownToolsItems = [
    { id: 'simulator', label: 'What-If Simulator', icon: TrendingUp, desc: 'Simulate household lifestyle offsets' },
    { id: 'community', label: 'Green Share Feed', icon: Share2, desc: 'Real-time social footprint logs' },
    { id: 'report', label: 'Weekly Action Report', icon: Flame, desc: 'Evaluate monthly & weekly goals' },
  ];

  const handleNav = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setToolsDropdownOpen(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'GP';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/90 backdrop-blur-md dark:border-stone-850 dark:bg-stone-900/90 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Name & Icon */}
          <div 
            onClick={() => handleNav('landing')} 
            className="flex cursor-pointer items-center space-x-2 group shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-forest-600 text-white shadow-sm group-hover:scale-102 transition-all">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-sm font-extrabold tracking-tight text-stone-900 dark:text-stone-50 select-none">
                Carbon<span className="text-forest-600 dark:text-emerald-400">Compass</span>
              </span>
              {(firebaseUser || isDemoMode) && user ? (
                <span className="text-[8px] text-stone-400 font-mono font-bold -mt-0.5 tracking-wider uppercase">
                  {user.climatePersona || 'SUSTAINABLE OBSERVER'}
                </span>
              ) : (
                <span className="text-[8px] text-stone-400 dark:text-stone-500 font-mono font-bold -mt-0.5 tracking-wider uppercase">
                  Eco-Meme Teaching Center
                </span>
              )}
            </div>
          </div>

          {/* Center Navigation: Spacious & Clean Flat design */}
          <div className="hidden lg:flex items-center space-x-2 text-stone-600 dark:text-stone-300">
            
            {/* Public Links */}
            {primaryPublicItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all select-none cursor-pointer border ${
                    isActive
                      ? 'bg-stone-100 text-stone-900 border-stone-200/60 dark:bg-stone-800 dark:text-white dark:border-stone-700/60 shadow-xs'
                      : 'border-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-850 dark:hover:bg-stone-850/60 dark:hover:text-stone-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Separator Line */}
            <div className="h-4 w-[1px] bg-stone-200 dark:bg-stone-800 mx-1"></div>

            {/* Premium Links */}
            {primaryPremiumItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all select-none cursor-pointer border ${
                    isActive
                      ? 'bg-stone-100 text-stone-900 border-stone-200/60 dark:bg-stone-800 dark:text-white dark:border-stone-700/60 shadow-xs'
                      : 'border-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-850 dark:hover:bg-stone-850/60 dark:hover:text-stone-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  {!firebaseUser && (
                    <Lock className="h-2.5 w-2.5 text-stone-400 dark:text-stone-500/80" />
                  )}
                </button>
              );
            })}

            {/* Tools Dropdown Trigger */}
            <div className="relative" ref={toolsRef}>
              <button
                id="btn-nav-tools-trigger"
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all select-none cursor-pointer border ${
                  dropdownToolsItems.some(i => i.id === activeTab)
                    ? 'bg-stone-100 text-stone-900 border-stone-200/60 dark:bg-stone-800 dark:text-white dark:border-stone-700/60 shadow-xs font-bold'
                    : 'border-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-850 dark:hover:bg-stone-850/60 dark:hover:text-stone-100'
                }`}
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>Tools</span>
                <ChevronDown className={`h-3 w-3 text-stone-400 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Tools Dropdown Card */}
              {toolsDropdownOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border border-stone-200 bg-white p-2.5 shadow-xl dark:border-stone-850 dark:bg-stone-900 animate-slide-up z-50">
                  <div className="px-2 py-1 mb-1.5 border-b border-stone-100 dark:border-stone-850/80">
                    <p className="text-[9px] uppercase font-bold tracking-wider font-mono text-stone-400">Carbon Utilities</p>
                  </div>

                  <div className="space-y-1">
                    {dropdownToolsItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          id={`nav-tools-item-${item.id}`}
                          onClick={() => handleNav(item.id)}
                          className={`w-full flex items-start space-x-3 rounded-lg p-2 text-left hover:bg-stone-50 dark:hover:bg-stone-850 transition-colors cursor-pointer group ${
                            isActive ? 'bg-stone-100/60 dark:bg-stone-800/40' : ''
                          }`}
                        >
                          <div className={`mt-0.5 p-1 rounded-md ${isActive ? 'bg-forest-100 text-forest-750 dark:bg-forest-950/40 dark:text-emerald-400' : 'bg-stone-100 text-stone-500 dark:bg-stone-800'}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-bold ${isActive ? 'text-forest-700 dark:text-emerald-400' : 'text-stone-750 dark:text-stone-200'}`}>
                                {item.label}
                              </span>
                              {!firebaseUser && (
                                <Lock className="h-2.5 w-2.5 text-stone-400" />
                              )}
                            </div>
                            <span className="text-[10px] text-stone-400 dark:text-stone-500 block leading-tight mt-0.5">
                              {item.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Section: Core Utility, Profile, Theme Toggles */}
          <div className="flex items-center space-x-2">
            
            {/* Dark mode toggle button */}
            <button
              id="btn-nav-theme-toggle"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-500 dark:hover:bg-stone-850 dark:hover:text-stone-200 transition-colors select-none cursor-pointer border border-transparent hover:border-stone-250/20"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>

            {/* Profile control or guest Auth Button */}
            {(firebaseUser || isDemoMode) ? (
              <div className="relative" ref={profileRef}>
                {/* Profile Avatar Control */}
                <button
                  id="btn-nav-profile-trigger"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-1.5 py-1.5 px-2 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-250 transition-all select-none cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-stone-800"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-emerald-600 to-forest-600 text-white font-black text-xs flex items-center justify-center border border-forest-100 dark:border-forest-900 shadow-sm">
                    {getInitials(firebaseUser?.displayName || user?.name)}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold leading-none">
                    {firebaseUser?.displayName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Member'}
                  </span>
                  <ChevronDown className={`h-3 w-3 text-stone-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Card */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-stone-200 bg-white p-2 shadow-xl dark:border-stone-850 dark:bg-stone-900 animate-slide-up z-50">
                    <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-850/80 mb-1">
                      <p className="text-[9px] uppercase font-medium tracking-wider font-mono text-stone-400">Carbon Sentinel</p>
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate">{firebaseUser?.email || "sandbox.demo@carboncompass.org"}</p>
                    </div>

                    <button
                      id="btn-dropdown-dashboard"
                      onClick={() => handleNav('dashboard')}
                      className={`w-full flex items-center space-x-2.5 rounded-lg px-2.5 py-2 text-xs text-stone-650 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-850 transition-colors text-left font-semibold ${
                        activeTab === 'dashboard' ? 'bg-stone-50 dark:bg-stone-850/60' : ''
                      }`}
                    >
                      <BarChart3 className="h-4 w-4 text-stone-400" />
                      <span>Ledger Dashboard</span>
                    </button>

                    <button
                      id="btn-dropdown-settings"
                      onClick={() => handleNav('settings')}
                      className={`w-full flex items-center space-x-2.5 rounded-lg px-2.5 py-2 text-xs text-stone-650 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-850 transition-colors text-left font-semibold ${
                        activeTab === 'settings' ? 'bg-stone-50 dark:bg-stone-850/60' : ''
                      }`}
                    >
                      <Settings className="h-4 w-4 text-stone-400" />
                      <span>Account Settings</span>
                    </button>

                    <div className="h-[1px] bg-stone-100 dark:bg-stone-850/80 my-1.5"></div>

                    <button
                      id="btn-dropdown-signout"
                      onClick={() => {
                        signOutFirebase();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2.5 rounded-lg px-2.5 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-left font-bold"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out Account</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-navbar-auth-trigger"
                onClick={() => handleNav('dashboard')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-md shadow-forest-600/10 cursor-pointer select-none transition-transform duration-100 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              id="btn-nav-mobile-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-850 dark:text-stone-500 dark:hover:bg-stone-850 lg:hidden cursor-pointer select-none border border-transparent"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 dark:border-stone-850 dark:bg-stone-900 space-y-1.5 animate-slide-up">
          
          <p className="text-[9px] uppercase font-bold text-stone-400 px-2 font-mono tracking-wider mb-1 select-none">Public Center</p>
          {primaryPublicItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-mobile-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-xs font-bold select-none cursor-pointer ${
                  isActive
                    ? 'bg-forest-600 text-white dark:bg-forest-700'
                    : 'text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-850'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <p className="text-[9px] uppercase font-bold text-stone-400 px-2 font-mono tracking-wider mt-4 mb-1 select-none">Premium Ledger</p>
          {primaryPremiumItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-mobile-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold select-none cursor-pointer ${
                  isActive
                    ? 'bg-forest-600 text-white dark:bg-forest-700'
                    : 'text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-850'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {!(firebaseUser || isDemoMode) && (
                  <Lock className="h-3.5 w-3.5 text-stone-400" />
                )}
              </button>
            );
          })}

          <p className="text-[9px] uppercase font-bold text-stone-400 px-2 font-mono tracking-wider mt-4 mb-1 select-none">Simulator & Tools</p>
          {dropdownToolsItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-mobile-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold select-none cursor-pointer ${
                  isActive
                    ? 'bg-forest-600 text-white dark:bg-forest-700'
                    : 'text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-850'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {!(firebaseUser || isDemoMode) && (
                  <Lock className="h-3.5 w-3.5 text-stone-400" />
                )}
              </button>
            );
          })}

          {(firebaseUser || isDemoMode) && (
            <div className="pt-2 mt-4 border-t border-stone-200 dark:border-stone-800 space-y-1">
              <button
                id="btn-mobile-nav-settings"
                onClick={() => handleNav('settings')}
                className="flex w-full items-center space-x-3 text-stone-650 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-850 rounded-lg px-3 py-2 text-xs font-bold select-none"
              >
                <Settings className="h-4 w-4 text-stone-400" />
                <span>Account Settings</span>
              </button>
              <button
                id="btn-mobile-nav-signout"
                onClick={() => {
                  signOutFirebase();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out Account</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
