import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EMISSION_FACTORS } from '../constants/emissions';
import { ClipboardList, Plus, Compass, Sparkles, Check, CheckCircle2, TrendingDown, Trash2, Calendar, ShoppingBag } from 'lucide-react';

export const QuickTracker: React.FC = () => {
  const { logActivity, activityLogs, deleteLog } = useApp();

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
    setSuccessMsg(`Success: logged "${preset.label}"! Saved ${Math.abs(preset.displayFactor)} kg CO₂e.`);
    setTimeout(() => setSuccessMsg(''), 3500);
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

    setSuccessMsg(`Successfully saved manually logged entry! Impact: ${finalFactor < 0 ? '-' : '+'}${Math.abs(Number(finalFactor.toFixed(1)))} kg CO₂e.`);
    setLabel('');
    setTimeout(() => setSuccessMsg(''), 4000);
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
                    className="w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3.5 py-2 text-xs focus:border-forest-600 focus:bg-white focus:outline-hidden dark:bg-stone-950 dark:border-stone-850"
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
                    className="w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3.5 py-2 text-xs focus:border-forest-600 focus:bg-white focus:outline-hidden dark:bg-stone-950 dark:border-stone-850"
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
                  className="w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3.5 py-2 text-xs focus:border-forest-600 focus:bg-white focus:outline-hidden dark:bg-stone-950 dark:border-stone-850"
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
                    <td className="py-3 px-3 font-semibold text-stone-800 dark:text-stone-250">
                      {log.label}
                    </td>
                    <td className="py-3 px-3 text-stone-500 font-mono">
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
