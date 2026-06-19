import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Save, Trash2, ShieldAlert, CheckCircle2, Play, RefreshCw, LogOut, Cloud, Lock, Mail, User as UserIcon } from 'lucide-react';
import { calculateBaseline, generateClimatePersona } from '../constants/emissions';
import { UserProfile } from '../types';

export const SettingsView: React.FC = () => {
  const { 
    user, 
    completeOnboarding, 
    resetAllData, 
    loadDemoMode, 
    isDemoMode,
    authUser,
    authError,
    authLoading,
    signUpEmail,
    signInEmail,
    signOut,
    setActiveTab
  } = useApp();

  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmailVal, setAuthEmailVal] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [localError, setLocalError] = useState('');
  // Confirmation guard for destructive reset operation
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!authEmailVal.trim() || !authPassword.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }
    if (authPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    try {
      if (authMode === 'register') {
        if (!authName.trim()) {
          setLocalError('Name is required for registration.');
          return;
        }
        await signUpEmail(authEmailVal.trim(), authPassword, authName.trim());
      } else {
        await signInEmail(authEmailVal.trim(), authPassword);
      }
      setAuthPassword('');
    } catch (err: unknown) {
      console.error('[carbon-compass] Auth error:', err);
    }
  };

  // Settings form copies
  const [name, setName] = useState(user?.name || '');
  const [region, setRegion] = useState(user?.region || 'US');
  const [householdSize, setHouseholdSize] = useState(user?.householdSize || 2);
  const [lifestyle, setLifestyle] = useState<'urban' | 'suburban' | 'rural'>(user?.lifestyleProfile || 'urban');
  const [transport, setTransport] = useState(user?.transportHabits || 'mixed');
  const [food, setFood] = useState(user?.foodPreference || 'mixed');
  const [energy, setEnergy] = useState(user?.homeEnergy || 'grid_avg');
  const [shopping, setShopping] = useState(user?.shoppingHabits || 'average');
  const [flights, setFlights] = useState(user?.flightFrequency || 'occasional');
  const [waste, setWaste] = useState(user?.wasteHabits || 'recycles_some');
  const [goal, setGoal] = useState(user?.goalPreference || 'reduce_carbon');
  
  const [success, setSuccess] = useState('');

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Build profile settings copy
    const updatedProfile: UserProfile = {
      name: name.trim(),
      region,
      householdSize,
      lifestyleProfile: lifestyle,
      transportHabits: transport as any,
      foodPreference: food as any,
      homeEnergy: energy as any,
      shoppingHabits: shopping as any,
      flightFrequency: flights as any,
      wasteHabits: waste as any,
      goalPreference: goal as any,
      climatePersona: ''
    };

    // calculate and update profile core
    completeOnboarding(updatedProfile);
    setSuccess('Settings successfully updated! Recalculated carbon baseline footprint on-the-fly.');
    setTimeout(() => setSuccess(''), 3500);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 mt-2 animate-fade-in" id="settings-view-main">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-stone-900 dark:text-stone-50">
          User Settings & Configurations
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          Tweak your primary variables or swap between raw sandbox setups and high-fidelity demo profiles instantly.
        </p>
      </div>

      {success && (
        <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
          {success}
        </div>
      )}

      {/* Main Panel wrapper */}
      <div className="grid gap-6 md:grid-cols-3">

        {/* Left Column: Form Settings copy */}
        <div className="md:col-span-2 rounded-2xl border border-stone-200/60 bg-white p-6 shadow-md dark:border-stone-850 dark:bg-stone-900">
          <h3 className="font-display font-semibold text-stone-900 dark:text-stone-50 text-base mb-4 flex items-center gap-1.5">
            <Settings className="h-4.5 w-4.5 text-stone-400" />
            <span>Edit My Climate Parameters</span>
          </h3>

          <form onSubmit={handleSettingsSave} className="space-y-4 text-xs text-stone-600 dark:text-stone-300">
            
            <div className="grid gap-4 sm:grid-cols-2">
              
              <div className="space-y-1">
                <label className="font-bold text-stone-500 uppercase">My Profile Name</label>
                <input
                  id="settings-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs focus:outline-hidden text-stone-900 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-500 uppercase">Region / Location</label>
                <select
                  id="settings-region-select"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs focus:outline-hidden text-stone-900 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                >
                  <option value="US">United States (High Average)</option>
                  <option value="EU">European Union (Moderate average)</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="IN">India</option>
                  <option value="GLOBAL">Global average</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-500 uppercase">Household Size</label>
                <select
                  id="settings-household-select"
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(Number(e.target.value))}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs focus:outline-hidden text-stone-900 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                >
                  <option value={1}>1 person (Single)</option>
                  <option value={2}>2 people</option>
                  <option value={3}>3 people</option>
                  <option value={4}>4+ people</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-500 uppercase font-sans">Diet Preference</label>
                <select
                  id="settings-food-select"
                  value={food}
                  onChange={(e) => setFood(e.target.value as any)}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs focus:outline-hidden text-stone-900 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                >
                  <option value="meat_heavy">Meat Heavy (Beef frequently)</option>
                  <option value="mixed">Mixed standard (Pork/poultry)</option>
                  <option value="low_meat">Low Meat (Balanced vegetarian)</option>
                  <option value="vegetarian">Vegetarian (Has dairy)</option>
                  <option value="vegan">Vegan / Plant-Based</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-500 uppercase">Utility Energy grid</label>
                <select
                  id="settings-energy-select"
                  value={energy}
                  onChange={(e) => setEnergy(e.target.value as any)}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs focus:outline-hidden text-stone-900 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                >
                  <option value="coal_gas">Coal & Fossil intensive</option>
                  <option value="grid_avg">Average Public grid loop</option>
                  <option value="green_renewables">100% Clean Green certificate</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-500 uppercase">Commutes type</label>
                <select
                  id="settings-transport-select"
                  value={transport}
                  onChange={(e) => setTransport(e.target.value as any)}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs focus:outline-hidden text-stone-900 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                >
                  <option value="car_daily">Single passenger car (Daily)</option>
                  <option value="car_occasional">Car (occasional usage)</option>
                  <option value="public_transit">Public subway/bus rails</option>
                  <option value="active_transit">Active cycling/walking</option>
                  <option value="mixed">Mixed hybrid commute</option>
                </select>
              </div>

            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-850 flex justify-end">
              <button
                id="btn-settings-save"
                type="submit"
                className="inline-flex items-center space-x-1 px-5 py-3 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold shadow-md cursor-pointer cursor-pointer transition-transform hover:scale-105"
              >
                <Save className="h-4 w-4" />
                <span>Save New Parameters</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Demo triggers and deep resets */}
        <div className="space-y-6">

          {/* MongoDB Auth Synchronization Panel */}
          <div className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-md dark:border-stone-850 dark:bg-stone-900">
            <h3 className="font-display font-semibold text-stone-900 dark:text-stone-50 text-base mb-1 flex items-center gap-1.5">
              <Cloud className="h-4.5 w-4.5 text-forest-500 animate-pulse" />
              <span>Firebase & MongoDB Cloud Sync</span>
            </h3>
            <p className="text-xs text-stone-400 mb-4 leading-relaxed font-sans">
              Connect a free secure account to maintain, back up, and sync your carbon ledger entries to MongoDB dynamically across multiple sessions.
            </p>

            {authUser ? (
              <div className="space-y-4 font-sans text-xs">
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 dark:text-emerald-400">✓ Sync Active</span>
                    <span className="text-[9px] uppercase tracking-wider font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.2 rounded">MongoDB</span>
                  </div>
                  <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
                    Your baseline footprint, daily tracker items, and habits are permanently secured.
                  </p>
                  <p className="font-mono text-[10px] text-stone-700 dark:text-stone-300 border-t border-emerald-500/10 mt-2 pt-1.5 overflow-hidden text-ellipsis">
                    User: {authUser.email}
                  </p>
                </div>
                <button
                  id="btn-settings-fb-signout"
                  onClick={signOut}
                  className="w-full flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 dark:border-stone-800 dark:bg-stone-950 dark:hover:bg-stone-850 dark:text-stone-300 font-semibold transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  <span>Disconnect Cloud Profile</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 font-sans text-xs">
                {/* Form selector tabs */}
                <div className="flex bg-stone-50 dark:bg-stone-950 p-1 rounded-lg border border-stone-150/60 dark:border-stone-800/80 mb-3">
                  <button 
                    id="btn-auth-mode-signin"
                    type="button"
                    onClick={() => { setAuthMode('login'); setLocalError(''); }}
                    className={`flex-1 text-center py-1.5 rounded-md font-semibold text-[11px] transition-all capitalize select-none ${authMode === 'login' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    Sign In
                  </button>
                  <button 
                    id="btn-auth-mode-signup"
                    type="button"
                    onClick={() => { setAuthMode('register'); setLocalError(''); }}
                    className={`flex-1 text-center py-1.5 rounded-md font-semibold text-[11px] transition-all capitalize select-none ${authMode === 'register' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    Register
                  </button>
                </div>

                {localError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-[10px] text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 font-semibold">
                    {localError}
                  </div>
                )}
                {authError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-[10px] text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 font-semibold max-h-24 overflow-y-auto custom-scrollbar">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-2.5">
                  {authMode === 'register' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        <span>Display Name</span>
                      </label>
                      <input
                        id="auth-name-input"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-50"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>Email Address</span>
                    </label>
                    <input
                      id="auth-email-input"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={authEmailVal}
                      onChange={(e) => setAuthEmailVal(e.target.value)}
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>Password</span>
                    </label>
                    <input
                      id="auth-password-input"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-50"
                    />
                  </div>

                  <button
                    id="btn-auth-submit"
                    type="submit"
                    disabled={authLoading}
                    className="w-full flex items-center justify-center p-2.5 rounded-xl bg-forest-600 text-white font-bold text-xs hover:bg-forest-700 disabled:opacity-50 transition-all shadow-sm shadow-forest-600/10 hover:scale-[1.01] cursor-pointer mt-3"
                  >
                    {authLoading ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span>{authMode === 'login' ? 'Sign In and Sync' : 'Create Account & Sync'}</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Sandbox Controls panel */}
          <div className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-md dark:border-stone-850 dark:bg-stone-900">
            <h3 className="font-display font-semibold text-stone-900 dark:text-stone-50 text-base mb-1">
              Sandbox Control Room
            </h3>
            <p className="text-xs text-stone-400 mb-4 leading-relaxed font-sans">
              Designed for hackathon judges to wipe logs or seed demo users instantly.
            </p>

            <div className="space-y-3 font-sans">
              
              {!isDemoMode ? (
                <button
                  id="btn-settings-load-demo"
                  onClick={loadDemoMode}
                  className="w-full flex items-center justify-center space-x-1.5 p-3 rounded-xl border border-dashed border-amber-300 bg-amber-5 * hover:bg-amber-100 text-xs text-amber-80 * dark:border-amber-900/40 dark:bg-amber-95 * dark:text-amber-400 font-bold transition-all hover:scale-[1.01]"
                >
                  <Play className="h-3.5 w-3.5 fill-amber-70" />
                  <span>Switch to Alex (Rich Demo)</span>
                </button>
              ) : (
                <div className="p-3 text-center rounded-xl bg-emerald-50 text-[10px] text-emerald-800 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30 font-bold">
                  ✓ Viewing Active Seed Demo Profile
                </div>
              )}

              {!showResetConfirm ? (
                <button
                  id="btn-settings-hard-reset"
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full flex items-center justify-center space-x-1.5 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 hover:text-rose-800 text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Format &amp; Hard Reset data</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900/40 space-y-2">
                  <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 text-center">
                    ⚠️ This will permanently delete all your logs, goals, and settings. Are you sure?
                  </p>
                  <div className="flex gap-2">
                    <button
                      id="btn-settings-reset-cancel"
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 py-2 rounded-lg border border-stone-200 bg-white dark:bg-stone-900 dark:border-stone-800 text-stone-600 dark:text-stone-400 text-xs font-bold hover:bg-stone-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-settings-reset-confirm"
                      onClick={() => { resetAllData(); setShowResetConfirm(false); }}
                      className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all"
                    >
                      Yes, Reset Everything
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Standard warning disclaimer */}
          <div className="rounded-xl bg-stone-100 p-4 border border-stone-200 dark:bg-stone-950 dark:border-stone-850 text-xs text-stone-400 dark:text-stone-500 leading-relaxed font-sans">
            <ShieldAlert className="h-4.5 w-4.5 mb-2 text-stone-500 text-stone-400" />
            <span className="font-semibold text-stone-650 dark:text-stone-400">Security & Storage:</span> All inputs, logs, and streaks are recorded securely using your browser's offline `localStorage` key. Your data never travels to external servers, maintaining 100% cloud sovereignty.
          </div>

        </div>

      </div>

    </div>
  );
};
