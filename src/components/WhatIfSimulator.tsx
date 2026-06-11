import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Goal } from '../types';
import { TrendingDown, Sparkles, DollarSign, Calendar, ChevronRight, Award, Plus, Layers, Info, HelpCircle, Check } from 'lucide-react';

export const WhatIfSimulator: React.FC = () => {
  const { footprint, goals, setGoals, recommendations, addGoalFromRecommendation } = useApp();

  // Habit Slider States
  const [commutesTv, setCommutesTv] = useState<number>(3);     // days per week commuting by transit/cycling
  const [flightsYr, setFlightsYr] = useState<number>(1);       // flights per year
  const [veggieDays, setVeggieDays] = useState<number>(4);      // vegetarian / vegan days per week
  const [shoppingReduction, setShoppingReduction] = useState<number>(25); // % reduction in online spending
  const [acUsageTemp, setAcUsageTemp] = useState<number>(1);   // Degrees C higher thermostat offset

  // Base metrics
  const baselineMonthly = footprint?.monthlyEstimate || 1200;

  // Calculators logic per habit
  // 1. Commute swaps: saves ~7.8 kg per day Swapped (calculated from standard car km baseline)
  const commuteSavingMo = Math.round(commutesTv * 7.8 * 4.3); // 4.3 weeks per month
  const commuteCostSavingMo = Math.round(commutesTv * 4.2 * 4.3); // Fuel saved in USD

  // 2. Flight reduction: typical baseline occasionally is 200kg. Reduction based on flight frequency
  const baseFlightMo = 150; // assumed avg flight load pro-rated
  // Reducing flights saves ~70kg per flight skipped
  const flightSavingMo = Math.round(Math.max(0, (4 - flightsYr) * 70));
  const flightCostSavingMo = Math.round(Math.max(0, (4 - flightsYr) * 50));

  // 3. Diet swaps: beef to veggies saves ~5.5kg per meal swapped
  const dietSavingMo = Math.round(veggieDays * 5.5 * 4.3);
  const dietCostSavingMo = Math.round(veggieDays * 3.5 * 4.3);

  // 4. Shopping cuts: saves 3.2kg per 10% reduction
  const shoppingSavingMo = Math.round((shoppingReduction / 10) * 3.2);
  const shoppingCostSavingMo = Math.round((shoppingReduction / 10) * 6.5);

  // 5. AC offset: 1 degree saves ~15% of AC load (~28kg)
  const acSavingMo = Math.round(acUsageTemp * 28);
  const acCostSavingMo = Math.round(acUsageTemp * 15);

  // Totals calculations
  const totalSavingsProjected = commuteSavingMo + flightSavingMo + dietSavingMo + shoppingSavingMo + acSavingMo;
  const totalCostSavingsProjected = commuteCostSavingMo + flightCostSavingMo + dietCostSavingMo + shoppingCostSavingMo + acCostSavingMo;
  
  const projectedFootprint = Math.max(10, baselineMonthly - totalSavingsProjected);
  const reductionPercent = Math.min(95, Math.round((totalSavingsProjected / baselineMonthly) * 100));

  const handleSimulateGoalAdd = (title: string, category: 'transport' | 'food' | 'home' | 'shopping' | 'waste', co2Save: number, usdSave: number) => {
    // Inserts custom goal directly based on slider configuration
    const customGoal: Goal = {
      id: `sim_goal_${Date.now()}`,
      title,
      category,
      targetValue: 4,
      progress: 0,
      estimatedReduction: co2Save,
      status: 'active',
      streak: 0,
      moneySaved: usdSave
    };

    setGoals(prev => [customGoal, ...prev]);
    alert(`Success: Turned custom habit "${title}" into an Active Goal! Tracking has started.`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-2 animate-fade-in" id="what-if-simulator-view">
      
      {/* Page headers */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-stone-900 dark:text-stone-50">
          What-If Carbon Habitat Simulator
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          Pro-rate habit adjustments using our interactive dials and visualize estimated savings prior to committing.
        </p>
      </div>

      {/* Top Banner: Dynamic Simulated carbon forecast */}
      <div className="rounded-2xl bg-stone-900 text-white p-6 sm:p-8 border border-emerald-900/30 shadow-xl dark:bg-stone-950 mb-8 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-radial-gradient from-forest-900/10 to-transparent pointer-events-none"></div>

        <div className="grid gap-6 md:grid-cols-3 relative items-center">
          
          {/* Base vs Projections */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-400 font-mono uppercase tracking-wider block">My Monthly Forecast</span>
            <div className="flex items-baseline space-x-1.5 pt-1">
              <span className="text-4.5xl font-display font-extrabold text-stone-50 group-hover:scale-105 transition-transform">
                {projectedFootprint}
              </span>
              <span className="text-sm font-semibold text-emerald-400">kg CO₂e</span>
            </div>
            <p className="text-xs text-stone-400">
              Down from baseline default of <span className="font-semibold text-stone-200">{baselineMonthly} kg</span>.
            </p>
          </div>

          {/* savings performance summary */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wider block">Est. Cumulative Savings</span>
            <div className="flex items-baseline space-x-1.5 pt-1 text-emerald-400">
              <span className="text-4xl font-display font-extrabold">
                {totalSavingsProjected}
              </span>
              <span className="text-xs font-bold uppercase font-mono">kg saved / mo</span>
            </div>
            <div className="text-xs text-stone-400 flex items-center space-x-1 mt-0.5">
              <DollarSign className="h-3.5 w-3.5 text-stone-400" />
              <span>Saves pro-rated <span className="font-bold text-stone-200">${totalCostSavingsProjected} USD</span> per month in bills</span>
            </div>
          </div>

          {/* progress percent reduction bar */}
          <div className="rounded-xl bg-stone-900/80 p-4 border border-stone-850">
            <div className="flex justify-between items-center text-xs font-bold mb-1">
              <span className="text-stone-300">Footprint Reduction percentage</span>
              <span className="text-emerald-400 font-mono">↓ {reductionPercent}% Saved</span>
            </div>
            <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${reductionPercent}%` }}
              ></div>
            </div>
            <span className="text-[9px] text-stone-500 font-mono tracking-wider block mt-2 text-center">
              Equivalent to planting {Math.round(totalSavingsProjected * 12 / 21)} urban trees annually!
            </span>
          </div>

        </div>
      </div>

      {/* Main split: sliders workspace vs Action Matrices */}
      <div className="grid gap-8 lg:grid-cols-2">
        
        {/* Sliders workspace */}
        <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-md dark:border-stone-850 dark:bg-stone-900 space-y-6">
          <h3 className="font-display font-bold text-stone-900 dark:text-stone-50 text-base mb-1">
            Adjust Footprint Habits
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed mb-4">
            Fine-tune daily habits below and observe the cumulative impact. Check monetary pricing reductions simulated live!
          </p>

          <div className="space-y-6">
            
            {/* Slider 1: Commutes */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-stone-700 dark:text-stone-300">
                <span>🚲 Transit/Active Commute (days/week)</span>
                <span className="font-mono text-forest-700 dark:text-forest-400">{commutesTv} days</span>
              </div>
              <input
                id="range-sim-commutes"
                type="range"
                min="0"
                max="7"
                value={commutesTv}
                onChange={(e) => setCommutesTv(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-forest-600 dark:bg-stone-800"
              />
              <div className="flex justify-between items-center text-[10px] text-stone-400">
                <span>Avoided driving savings</span>
                <span className="text-emerald-600 font-mono font-bold">↓ {commuteSavingMo} kg CO₂e • Save ${commuteCostSavingMo}/mo</span>
              </div>
            </div>

            {/* Slider 2: Veggie Days */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-stone-700 dark:text-stone-300">
                <span>🥗 Vegetarian/Vegan Meals (days/week)</span>
                <span className="font-mono text-forest-700 dark:text-forest-400">{veggieDays} days</span>
              </div>
              <input
                id="range-sim-vegdays"
                type="range"
                min="0"
                max="7"
                value={veggieDays}
                onChange={(e) => setVeggieDays(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-forest-600 dark:bg-stone-800"
              />
              <div className="flex justify-between items-center text-[10px] text-stone-400">
                <span>Replacing high-emission beef items</span>
                <span className="text-emerald-600 font-mono font-bold">↓ {dietSavingMo} kg CO₂e • Save ${dietCostSavingMo}/mo</span>
              </div>
            </div>

            {/* Slider 3: Flights skipping */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-stone-700 dark:text-stone-300">
                <span>✈️ Yearly Long-Haul Trips</span>
                <span className="font-mono text-forest-700 dark:text-forest-400">{flightsYr} flights</span>
              </div>
              <input
                id="range-sim-flights"
                type="range"
                min="0"
                max="4"
                value={flightsYr}
                onChange={(e) => setFlightsYr(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-forest-600 dark:bg-stone-800"
              />
              <div className="flex justify-between items-center text-[10px] text-stone-400">
                <span>Carbon cost per trip skipped</span>
                <span className="text-emerald-600 font-mono font-bold">↓ {flightSavingMo} kg CO₂e • Save ${flightCostSavingMo}/mo</span>
              </div>
            </div>

            {/* Slider 4: Online courier shipping reduction */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-stone-700 dark:text-stone-300">
                <span>📦 Reduce Online retail deliveries (%)</span>
                <span className="font-mono text-forest-700 dark:text-forest-400">{shoppingReduction}% cut</span>
              </div>
              <input
                id="range-sim-shopping"
                type="range"
                min="0"
                step="10"
                max="90"
                value={shoppingReduction}
                onChange={(e) => setShoppingReduction(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-forest-600 dark:bg-stone-800"
              />
              <div className="flex justify-between items-center text-[10px] text-stone-400">
                <span>Packaging & delivery logs</span>
                <span className="text-emerald-600 font-mono font-bold">↓ {shoppingSavingMo} kg CO₂e • Save ${shoppingCostSavingMo}/mo</span>
              </div>
            </div>

            {/* Slider 5: Smart ac cooling temp */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-stone-700 dark:text-stone-300">
                <span>🌡️ Thermostat temperature adjustment</span>
                <span className="font-mono text-forest-700 dark:text-forest-400">+{acUsageTemp}°C higher</span>
              </div>
              <input
                id="range-sim-actemp"
                type="range"
                min="0"
                max="4"
                value={acUsageTemp}
                onChange={(e) => setAcUsageTemp(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-forest-600 dark:bg-stone-800"
              />
              <div className="flex justify-between items-center text-[10px] text-stone-400">
                <span>Bypassing grid electricity cooling spikes</span>
                <span className="text-emerald-600 font-mono font-bold">↓ {acSavingMo} kg CO₂e • Save ${acCostSavingMo}/mo</span>
              </div>
            </div>

          </div>
        </div>

        {/* Action Matrices and Recommendation Cards quadrant */}
        <div className="space-y-6">
          
          {/* Section Heading */}
          <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-md dark:border-stone-850 dark:bg-stone-900">
            <h3 className="font-display font-semibold text-stone-900 dark:text-stone-50 text-base mb-1.5">
              Impact vs Effort matrix Recommendations
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Our intelligent climate recommendation engine ranks potential solutions dynamically based on your lifestyle settings. Adding any card triggers it as an active goal below.
            </p>

            <div className="grid gap-3.5">
              {recommendations.slice(0, 4).map((rec) => (
                <div 
                  key={rec.id} 
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    rec.isAdded 
                      ? 'bg-stone-50 border-stone-200 opacity-65 dark:bg-stone-950/40 dark:border-stone-850' 
                      : 'bg-stone-50/50 hover:bg-white dark:bg-stone-950/30'
                  }`}
                  id={`rec-item-card-${rec.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="inline-block rounded-md text-[10px] uppercase font-mono px-2 py-0.2 font-bold bg-amber-50 text-amber-80 * dark:bg-amber-950/30 dark:text-amber-400 group-hover:scale-105">
                          Effort: {rec.effort}
                        </span>
                        <span className="inline-block rounded-md text-[10px] uppercase font-mono px-2 py-0.2 font-bold bg-emerald-50 text-emerald-80 * dark:bg-emerald-950/30 dark:text-emerald-400">
                          Impact: {rec.impact}
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 pt-1 leading-tight">
                        {rec.title}
                      </h4>
                      <p className="text-[10px] text-stone-400 dark:text-stone-500 leading-relaxed font-sans mt-0.5">
                        {rec.rationale}
                      </p>
                    </div>

                    {!rec.isAdded ? (
                      <button
                        id={`btn-add-rec-${rec.id}`}
                        onClick={() => addGoalFromRecommendation(rec.id)}
                        className="rounded-lg bg-forest-600 hover:bg-forest-700 text-white p-2 text-[10px] font-bold flex shrink-0 items-center gap-1 shadow-md cursor-pointer transition-transform hover:scale-105"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Habit</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-stone-400 shrink-0 font-mono font-bold uppercase flex items-center gap-0.5 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">
                        <Check className="h-3 w-3" /> Tracked
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-5 mt-3 pt-3 border-t border-stone-200/50 dark:border-stone-800/40 text-[10px] text-stone-400">
                    <div>
                      <span>CO₂ Reduction:</span>
                      <span className="font-bold text-emerald-600 block text-xs mt-0.5">↓ {rec.carbonSaved} kg/mo</span>
                    </div>
                    <div>
                      <span>Est. Savings:</span>
                      <span className="font-bold text-stone-800 dark:text-stone-300 block text-xs mt-0.5">${rec.savings}/mo</span>
                    </div>
                    <div>
                      <span>Commitment:</span>
                      <span className="font-semibold block text-stone-700 dark:text-stone-300 mt-0.5">{rec.timeToImplement}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
          
          {/* Quick instructions indicator box */}
          <div className="p-4 rounded-xl bg-indigo-50/75 border border-indigo-100 text-xs text-indigo-950 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-300 flex items-start gap-3">
            <Info className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold mb-1 font-display">What-If Habit Planning Strategy</h5>
              <p className="leading-relaxed">
                Adjusting daily transport habits and vegan food counts provides high margin reduction curves. Click on "Add Habit" cards to transform mock designs into real progress tracking grids inside your Dashboard!
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
