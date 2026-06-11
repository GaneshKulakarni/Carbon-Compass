import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Save, Trash2, ShieldAlert, CheckCircle2, Play, RefreshCw, LogOut } from 'lucide-react';
import { calculateBaseline, generateClimatePersona } from '../constants/emissions';
import { UserProfile } from '../types';

export const SettingsView: React.FC = () => {
  const { user, completeOnboarding, resetAllData, loadDemoMode, isDemoMode } = useApp();

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
                  className="w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs focus:outline-hidden dark:bg-stone-950 dark:border-stone-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-500 uppercase">Region / Location</label>
                <select
                  id="settings-region-select"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs focus:outline-hidden dark:bg-stone-950 dark:border-stone-800"
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
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs focus:outline-hidden dark:bg-stone-950 dark:border-stone-800"
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
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs focus:outline-hidden dark:bg-stone-950 dark:border-stone-800"
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
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs focus:outline-hidden dark:bg-stone-950 dark:border-stone-800"
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
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs focus:outline-hidden dark:bg-stone-950 dark:border-stone-800"
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

              <button
                id="btn-settings-hard-reset"
                onClick={resetAllData}
                className="w-full flex items-center justify-center space-x-1.5 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-450 hover:text-rose-800 text-xs font-bold transition-all cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Format & Hard Reset data</span>
              </button>

            </div>
          </div>

          {/* Standard warning disclaimer */}
          <div className="rounded-xl bg-stone-100 p-4 border border-stone-200 dark:bg-stone-905 dark:border-stone-850 text-xs text-stone-400 dark:text-stone-500 leading-relaxed font-sans">
            <ShieldAlert className="h-4.5 w-4.5 mb-2 text-stone-500 text-stone-400" />
            <span className="font-semibold text-stone-650 dark:text-stone-400">Security & Storage:</span> All inputs, logs, and streaks are recorded securely using your browser's offline `localStorage` key. Your data never travels to external servers, maintaining 100% cloud sovereignty.
          </div>

        </div>

      </div>

    </div>
  );
};
