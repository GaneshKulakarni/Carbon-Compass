import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EMISSION_FACTORS } from '../constants/emissions';
import { ClipboardList, Plus, Compass, Sparkles, Check, CheckCircle2, TrendingDown, Trash2, Calendar, ShoppingBag } from 'lucide-react';

export const QuickTracker: React.FC = () => {
  const { logActivity, activityLogs, deleteLog } = useApp();

  // Daily checked habits local tracking state
  const [checkedHabits, setCheckedHabits] = useState<Record<string, boolean>>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`cc_daily_habits_${todayStr}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [shareCopied, setShareCopied] = useState(false);

  // Manual logging form state
  const [category, setCategory] = useState<'transport' | 'food' | 'home' | 'shopping' | 'waste'>('transport');
  const [actionType, setActionType] = useState<string>('cycled');
  const [value, setValue] = useState<number>(10);
  const [label, setLabel] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // 1-Click quick presets
  const presets = [
    {
      id: "preset_wfh",
      label: "Worked from Home",
      desc: "Zero transit commute offset",
      category: "transport" as const,
      action: "wfh_day",
      val: 25,
      unit: "km",
      displayFactor: -5.5, // 25km * Petrol car average offset saved
      logLabel: "WFH Day — avoided car commute"
    },
    {
      id: "preset_vegan_burger",
      label: "Plant-Based Breakfast/Lunch",
      desc: "Vegan burger / veggie salad swap",
      category: "food" as const,
      action: "vegan_meal",
      val: 1,
      unit: "meal",
      displayFactor: -6.7, // Saved by replacing a beef serving
      logLabel: "Plant-based vegan meal choice"
    },
    {
      id: "preset_subway",
      label: "Commuted via Subway / Metro",
      desc: "Aided rail system vs traffic congestion",
      category: "transport" as const,
      action: "metro",
      val: 15,
      unit: "km",
      displayFactor: -2.7,
      logLabel: "Took subway transit instead of private car"
    },
    {
      id: "preset_cold_laundry",
      label: "Cold-Water Laundry cycle",
      desc: "Thermal heater heating bypass",
      category: "home" as const,
      action: "laundry_cold_wash",
      val: 1,
      unit: "load",
      displayFactor: -0.5,
      logLabel: "Ran rapid cold laundry cycle"
    },
    {
      id: "preset_compost",
      label: "Composted Organic food waste",
      desc: "Diverted landfill rotting methane",
      category: "waste" as const,
      action: "composted",
      val: 2,
      unit: "kg",
      displayFactor: -1.6,
      logLabel: "Composted household organic food scraps"
    }
  ];

  // Daily checklist toggler action
  const handleToggleHabitCheck = (preset: typeof presets[0]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isCurrentlyChecked = !!checkedHabits[preset.id];

    // Toggle
    const nextCheckState = { ...checkedHabits, [preset.id]: !isCurrentlyChecked };
    setCheckedHabits(nextCheckState);
    localStorage.setItem(`cc_daily_habits_${todayStr}`, JSON.stringify(nextCheckState));

    if (!isCurrentlyChecked) {
      logActivity(
        preset.category,
        preset.action,
        preset.val,
        preset.unit,
        `Daily Habit check-in: "${preset.label}"`,
        preset.displayFactor
      );

      const saveKgs = Math.abs(preset.displayFactor);
      let feedback = "";
      if (saveKgs >= 5) {
        feedback = `🌟 Incredible milestone! Activating "${preset.label}" saved ${saveKgs} kg CO₂e. That avoids equivalent greenhouse impact to 24 hours of coal-grid power!`;
      } else if (saveKgs >= 2) {
        feedback = `🌿 Marvelous! Activating "${preset.label}" avoided ${saveKgs} kg CO₂e. Every consistent routine shrinks our warming trend.`;
      } else {
        feedback = `🌱 Great habit loop! Swan to "${preset.label}" avoided ${saveKgs} kg. Constant micro-habits yield macro impacts!`;
      }
      setSuccessMsg(feedback);
      setTimeout(() => setSuccessMsg(''), 5500);
    } else {
      setSuccessMsg(`Turned off: un-checked the daily routine card "${preset.label}".`);
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  // Helper trigger for presets
  const handlePresetTrigger = (preset: typeof presets[0]) => {
    logActivity(
      preset.category,
      preset.action,
      preset.val,
      preset.unit,
      preset.logLabel,
      preset.displayFactor
    );

    const saveKgs = Math.abs(preset.displayFactor);
    let feedback = "";
    if (saveKgs >= 5) {
      feedback = `🌟 Premium Action! Logged "${preset.label}" saved ${saveKgs} kg CO₂e! This equals keeping a refrigerator powered off for a month!`;
    } else if (saveKgs >= 2) {
      feedback = `🌿 Eco Champion! You bypassed ${saveKgs} kg CO₂e greenhouse gas. High-five!`;
    } else {
      feedback = `🌱 Positive check! Swapped to "${preset.label}" saved ${saveKgs} kg CO₂e. Keep building momentum!`;
    }
    setSuccessMsg(feedback);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Get dynamic unit based on category/action selection
  const getUnitAndFactor = () => {
    switch (actionType) {
      // transport
      case 'drove_car': return { unit: 'km', factor: EMISSION_FACTORS.transport.car_petrol, save: false };
      case 'cycled': return { unit: 'km', factor: -EMISSION_FACTORS.transport.car_petrol, save: true }; // Saving relative to car
      case 'bus_or_train': return { unit: 'km', factor: -(EMISSION_FACTORS.transport.car_petrol - EMISSION_FACTORS.transport.bus_or_train), save: true };
      // food
      case 'beef_serving': return { unit: 'servings', factor: EMISSION_FACTORS.food.beef_lamb, save: false };
      case 'vegan_meal': return { unit: 'servings', factor: -EMISSION_FACTORS.food.beef_lamb + EMISSION_FACTORS.food.vegan, save: true };
      case 'vegetarian_meal': return { unit: 'servings', factor: -EMISSION_FACTORS.food.beef_lamb + EMISSION_FACTORS.food.vegetarian, save: true };
      // home
      case 'ac_eco': return { unit: 'hours', factor: -EMISSION_FACTORS.home.ac_cooling_hr, save: true };
      case 'laundry_cold_wash': return { unit: 'loads', factor: -EMISSION_FACTORS.home.laundry_hot_wash + EMISSION_FACTORS.home.laundry_cold_wash, save: true };
      // shopping
      case 'clothing_purchase': return { unit: 'items', factor: EMISSION_FACTORS.shopping.clothing_item, save: false };
      case 'electronics_major': return { unit: 'items', factor: EMISSION_FACTORS.shopping.electronics_major, save: false };
      // waste
      case 'recycled': return { unit: 'loads', factor: EMISSION_FACTORS.waste.recycling_offset, save: true };
      case 'composted': return { unit: 'kg', factor: EMISSION_FACTORS.waste.compost_offset, save: true };
      default: return { unit: 'units', factor: 0, save: true };
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { unit, factor } = getUnitAndFactor();
    const finalFactor = factor * value;
    const finalLabel = label.trim() || `Recorded ${actionType.replace('_', ' ')} log entry`;

    logActivity(
      category,
      actionType,
      value,
      unit,
      finalLabel,
      finalFactor
    );

    const saveKgs = Math.abs(finalFactor);
    let feedback = "";
    if (finalFactor < 0) {
      if (saveKgs >= 5) {
        feedback = `🌟 High-Lever Save! Logging "${finalLabel}" bypassed ${saveKgs.toFixed(1)} kg CO₂e. Incredible sustainability stewardship!`;
      } else if (saveKgs >= 2) {
        feedback = `🌿 Active Offset! Logging "${finalLabel}" successfully avoided ${saveKgs.toFixed(1)} kg CO₂e. Premium choice!`;
      } else {
        feedback = `🌱 Positive wave! Bypassed ${saveKgs.toFixed(1)} kg CO₂e with this habit. Micro-actions compound to macro solutions!`;
      }
    } else {
      feedback = `Logged: recorded "${finalLabel}" (+${saveKgs.toFixed(1)} kg CO₂e additive footprint). Try balancing this with commuter or plant-based dining presets.`;
    }

    setSuccessMsg(feedback);
    setLabel('');
    setTimeout(() => setSuccessMsg(''), 5500);
  };

  const { unit, factor } = getUnitAndFactor();
  const calculatedLiveFootprint = Number((factor * value).toFixed(1));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-2 animate-fade-in" id="quick-tracker-view">
      
      {/* Tracker Headers */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-stone-900 dark:text-stone-50">
          Daily Carbon Action Tracker
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          Log both absolute emission inputs or carbon-saving alternatives to update your active score metrics instantly.
        </p>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200/50 p-4 font-sans text-xs text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Workspace Grid splits */}
      <div className="grid gap-8 lg:grid-cols-2">

        {/* Column 1: 1-Click Quick presets panel */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-md dark:border-stone-850 dark:bg-stone-900">
            <h3 className="font-display font-bold text-stone-900 dark:text-stone-50 text-base mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-forest-600" />
              <span>1-Click Saved Presets</span>
            </h3>
            <p className="text-xs text-stone-400 dark:text-stone-400 mb-5 leading-relaxed">
              Standard recurring actions formatted into immediate triggers for seamless tracking speed. Just click any preset below to log savings instantly!
            </p>

            <div className="space-y-3">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  id={`btn-preset-trigger-${preset.id}`}
                  onClick={() => handlePresetTrigger(preset)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-950/40 text-left hover:border-forest-420 hover:bg-forest-50/20 dark:hover:bg-forest-950/10 cursor-pointer group transition-all"
                >
                  <div>
                    <span className="text-[10px] font-bold font-mono tracking-wider font-semibold text-forest-700 dark:text-forest-400 uppercase bg-forest-50 dark:bg-forest-950/30 px-1.5 py-0.2 rounded">
                      {preset.category} alternative
                    </span>
                    <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100 mt-1 leading-tight group-hover:text-forest-700 dark:group-hover:text-forest-400">
                      {preset.label}
                    </h5>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500">{preset.desc}</p>
                  </div>

                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded">
                    Save: {Math.abs(preset.displayFactor)} kg
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Habit Section */}
          <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-md dark:border-stone-850 dark:bg-stone-900" id="daily-checklist-card">
            <h3 className="font-display font-bold text-stone-900 dark:text-stone-50 text-base mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
              <span>My Daily Habit Checklist</span>
            </h3>
            <p className="text-xs text-stone-400 dark:text-stone-400 mb-4 leading-relaxed">
              Check off recurring sustainable micro-actions you completed today. Checking logs their relative carbon savings score automatically!
            </p>

            <div className="space-y-3">
              {presets.map((preset) => {
                const isChecked = !!checkedHabits[preset.id];
                return (
                  <div 
                    key={`chk-${preset.id}`}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isChecked ? 'bg-emerald-500/5 border-emerald-300 dark:border-emerald-900/40' : 'bg-stone-50/40 border-stone-150/80 dark:border-stone-850'}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => handleToggleHabitCheck(preset)}
                        className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 border mt-0.5 cursor-pointer select-none transition-colors ${isChecked ? 'bg-emerald-500 text-white border-emerald-500' : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950'}`}
                        id={`chk-box-${preset.id}`}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </button>
                      <div>
                        <h6 className={`text-xs font-bold ${isChecked ? 'text-emerald-800 dark:text-emerald-400' : 'text-stone-800 dark:text-stone-150'}`}>
                          {preset.label}
                        </h6>
                        <p className="text-[10px] text-stone-400 leading-none mt-0.5 font-sans">{preset.desc}</p>
                      </div>
                    </div>
                    <span className="text-[10.5px] font-mono text-stone-500 dark:text-stone-400 font-bold shrink-0 ml-1">
                      {Math.abs(preset.displayFactor)} kg
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Impact Share Card */}
          <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-md dark:border-stone-850 dark:bg-stone-900" id="impact-share-card">
            <h3 className="font-display font-bold text-stone-900 dark:text-stone-50 text-base mb-1.5 flex items-center gap-1.5">
              <Compass className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
              <span>My Shareable Impact Summary</span>
            </h3>
            <p className="text-xs text-stone-400 dark:text-stone-400 mb-4 leading-relaxed">
              Generate high-visibility social network snippets highlighting your total verified carbon saves on Carbon Compass.
            </p>

            {/* Share Card mockup */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/50 to-indigo-50/45 dark:from-stone-950 dark:to-stone-900/60 border border-stone-150 dark:border-stone-850 relative overflow-hidden">
              <div className="relative z-10 space-y-3.5">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-stone-400 tracking-wider">
                  <span>CARBON COMPASS PROFILE</span>
                  <span className="text-emerald-600 dark:text-emerald-400">VERIFIED OFFSET</span>
                </div>

                <div>
                  <h4 className="text-2xl font-display font-black text-stone-900 dark:text-stone-50 leading-none">
                    {Math.round(activityLogs.filter(l => l.estimatedEmission < 0).reduce((acc, l) => acc + Math.abs(l.estimatedEmission), 0))} kg Saved!
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed font-sans">
                    "I avoided {Math.round(activityLogs.filter(l => l.estimatedEmission < 0).reduce((acc, l) => acc + Math.abs(l.estimatedEmission), 0))} kg of CO₂ carbon emissions today with @CarbonCompass! Join me in tracking and reducing your environmental impact!"
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-stone-200/50 dark:border-stone-800/80 text-[10px] text-stone-400 font-mono">
                  <span>🔥 Streak Record Active</span>
                  <span className="text-indigo-600 font-bold dark:text-indigo-400">#ClimateHackathon</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  const totalSavedKgs = Math.round(activityLogs.filter(l => l.estimatedEmission < 0).reduce((acc, l) => acc + Math.abs(l.estimatedEmission), 0));
                  const copyText = `I avoided ${totalSavedKgs} kg of CO₂ emissions with @CarbonCompass! Join me in tracking and carbon-saving!`;
                  navigator.clipboard.writeText(copyText);
                  setShareCopied(true);
                  setTimeout(() => setShareCopied(false), 3000);
                }}
                className="w-full text-center text-xs font-bold bg-forest-600 hover:bg-forest-700 text-white py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                id="btn-copy-share-snippet"
              >
                <span>{shareCopied ? "📋 Shared Snippet Copied!" : "Share My Carbon Savings"}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Column 2: Precise Diagnostic entry Form */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-md dark:border-stone-850 dark:bg-stone-900">
            <h3 className="font-display font-semibold text-stone-900 dark:text-stone-50 text-base mb-1">
              Manual Carbon Action Entry
            </h3>
            <p className="text-xs text-stone-400 mb-5 leading-relaxed">
              Log particular, detailed events and override general presets easily.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              
              <div className="grid gap-3.5 sm:grid-cols-2">
                {/* Category select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Category</label>
                  <select
                    id="select-tracker-category"
                    value={category}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setCategory(cat);
                      // Update sensible default actions
                      if (cat === 'transport') setActionType('cycled');
                      else if (cat === 'food') setActionType('vegan_meal');
                      else if (cat === 'home') setActionType('laundry_cold_wash');
                      else if (cat === 'shopping') setActionType('clothing_purchase');
                      else if (cat === 'waste') setActionType('composted');
                    }}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-xs focus:border-forest-600 focus:outline-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                  >
                    <option value="transport">Transport / Travel</option>
                    <option value="food">Diet / Dining</option>
                    <option value="home">Home / Energy utilities</option>
                    <option value="shopping">Lifestyle / Shopping</option>
                    <option value="waste">Waste / Recyc & Compost</option>
                  </select>
                </div>

                {/* Event Select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Select Action / Swap</label>
                  <select
                    id="select-tracker-action"
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-xs focus:border-forest-600 focus:outline-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                  >
                    {category === 'transport' && (
                      <>
                        <option value="cycled">Cycled / Walked instead of driving</option>
                        <option value="bus_or_train">Took Bus or train instead of driving</option>
                        <option value="drove_car">Drove a typical fuel car (Car Additive)</option>
                      </>
                    )}
                    {category === 'food' && (
                      <>
                        <option value="vegan_meal">Enjoyed vegan meal (replaced beef serving)</option>
                        <option value="vegetarian_meal">Enjoyed vegetarian meal (replaced beef serving)</option>
                        <option value="beef_serving">Beef/Lamb serving consumed (Beef Additive)</option>
                      </>
                    )}
                    {category === 'home' && (
                      <>
                        <option value="laundry_cold_wash">Washed laundry on cold (saved hot load)</option>
                        <option value="ac_eco">Ran smart AC eco-mode thermostat adjustment</option>
                      </>
                    )}
                    {category === 'shopping' && (
                      <>
                        <option value="clothing_purchase">Fast fashion item bought (Purchase Additive)</option>
                        <option value="electronics_major">Major electric laptop bought (Purchase Additive)</option>
                      </>
                    )}
                    {category === 'waste' && (
                      <>
                        <option value="composted">Recycled/Composted kitchen scraps (Carbon saved)</option>
                        <option value="recycled">Recycled a household waste bag (Carbon saved)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Slider for Quantity value adjustment */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1.5">
                  <span>Numeric Quantity / Distance</span>
                  <span>{value} {unit}</span>
                </div>
                <input
                  id="range-tracker-quantity"
                  type="range"
                  min="1"
                  max={category === 'transport' ? "100" : "15"}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-forest-600 dark:bg-stone-800"
                />
              </div>

              {/* Title log label input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Custom Log Memo Note (Optional)</label>
                <input
                  id="input-tracker-memo"
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={`e.g. Completed ${value} ${unit} action`}
                  className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-xs focus:border-forest-600 focus:outline-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                />
              </div>

              {/* Live Calculator Preview and submit button */}
              <div className="pt-3.5 border-t border-stone-100 dark:border-stone-850 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] text-stone-400 font-mono block">Calculated Carbon Impact</span>
                  <div className="flex items-baseline justify-center sm:justify-start space-x-1 mt-0.5">
                    <span className={`text-2xl font-display font-extrabold ${calculatedLiveFootprint < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-700 dark:text-stone-300'}`}>
                      {calculatedLiveFootprint < 0 ? '-' : '+'}{Math.abs(calculatedLiveFootprint)}
                    </span>
                    <span className="text-xs font-semibold text-stone-400">kg CO₂e</span>
                  </div>
                </div>

                <button
                  id="btn-tracker-submit"
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-1 px-5 py-3 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Log Activity Entry</span>
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>

      {/* Audit Log database history drawer below */}
      <div className="mt-8 rounded-2xl border border-stone-200/60 bg-white p-6 shadow-md dark:border-stone-850 dark:bg-stone-900">
        <h3 className="font-display font-bold text-stone-900 dark:text-stone-50 text-base mb-1 flex items-center gap-1.5">
          <Calendar className="h-4.5 w-4.5 text-stone-400" />
          <span>My Historical Activity Ledger ({activityLogs.length} logs)</span>
        </h3>
        <p className="text-xs text-stone-400 mb-4 font-sans">
          A list of all documented actions. Deleting any historical log recalculates your carbon budget metrics in real time.
        </p>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-mono">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Memo Note</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Carbon Impact</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
              {activityLogs.map((log) => {
                const isSave = log.estimatedEmission < 0;
                return (
                  <tr key={log.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-950/20" id={`table-row-${log.id}`}>
                    <td className="py-3 px-3 text-stone-400 font-mono">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono capitalize tracking-wide bg-stone-100 text-stone-700 dark:bg-stone-850 dark:text-stone-300">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-800 dark:text-stone-150">
                      {log.label}
                    </td>
                    <td className="py-3 px-3 text-stone-500 dark:text-stone-400 font-mono">
                      {log.value} {log.unit}
                    </td>
                    <td className={`py-3 px-3 font-mono font-bold ${isSave ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500'}`}>
                      {isSave ? `↓ ${Math.abs(log.estimatedEmission)} kg` : `↑ ${log.estimatedEmission} kg`}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => deleteLog(log.id)}
                        className="p-1 px-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25"
                        title="Delete entry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {activityLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <span className="text-2xl block mb-2">📥</span>
                    No active recordings inside the ledger file. Log some presets above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
