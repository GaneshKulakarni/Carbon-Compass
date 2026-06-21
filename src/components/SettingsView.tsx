import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Save } from 'lucide-react';
import { UserProfile } from '../types';

export const SettingsView: React.FC = () => {
  const { 
    user, 
    completeOnboarding
  } = useApp();

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
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 mt-2 animate-fade-in" id="settings-view-main">
      
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-display font-bold text-stone-900 dark:text-stone-50">
          User Settings & Configurations
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Tweak your primary variables and recalculate your climate baseline footprint instantly.
        </p>
      </div>

      {success && (
        <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
          {success}
        </div>
      )}

      {/* Main Panel wrapper */}
      <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-md dark:border-stone-850 dark:bg-stone-900">
        <h3 className="font-display font-semibold text-stone-900 dark:text-stone-50 text-base mb-4 flex items-center gap-1.5 justify-center sm:justify-start">
          <Settings className="h-4.5 w-4.5 text-stone-400" />
          <span>Edit My Climate Parameters</span>
        </h3>

        <form onSubmit={handleSettingsSave} className="space-y-4 text-xs text-stone-600 dark:text-stone-300">
          
          <div className="grid gap-4 sm:grid-cols-2">
            
            <div className="space-y-1">
              <label htmlFor="settings-name-input" className="font-bold text-stone-500 uppercase">My Profile Name</label>
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
              <label htmlFor="settings-region-select" className="font-bold text-stone-500 uppercase">Region / Location</label>
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
              <label htmlFor="settings-household-select" className="font-bold text-stone-500 uppercase">Household Size</label>
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
              <label htmlFor="settings-food-select" className="font-bold text-stone-500 uppercase font-sans">Diet Preference</label>
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
              <label htmlFor="settings-energy-select" className="font-bold text-stone-500 uppercase">Utility Energy grid</label>
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
              <label htmlFor="settings-transport-select" className="font-bold text-stone-500 uppercase">Commutes type</label>
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
              className="inline-flex items-center space-x-1 px-5 py-3 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold shadow-md cursor-pointer transition-transform hover:scale-105"
            >
              <Save className="h-4 w-4" />
              <span>Save New Parameters</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
