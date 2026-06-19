import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { calculateBaseline, generateClimatePersona } from '../constants/emissions';
import { Compass, Leaf, ArrowLeft, ArrowRight, User, Globe, Home, Trash2, Car, ShoppingBag, Eye, Check, RefreshCw } from 'lucide-react';

export const OnboardingFlow: React.FC = () => {
  const { completeOnboarding } = useApp();
  
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [region, setRegion] = useState<string>('US');
  const [householdSize, setHouseholdSize] = useState<number>(2);
  const [lifestyleProfile, setLifestyleProfile] = useState<'urban' | 'suburban' | 'rural'>('urban');
  const [transportHabits, setTransportHabits] = useState<'car_daily' | 'car_occasional' | 'public_transit' | 'active_transit' | 'mixed'>('mixed');
  const [foodPreference, setFoodPreference] = useState<'meat_heavy' | 'mixed' | 'low_meat' | 'vegetarian' | 'vegan'>('mixed');
  const [homeEnergy, setHomeEnergy] = useState<'coal_gas' | 'grid_avg' | 'green_renewables'>('grid_avg');
  const [shoppingHabits, setShoppingHabits] = useState<'frequent' | 'average' | 'minimalist'>('average');
  const [flightFrequency, setFlightFrequency] = useState<'frequent' | 'occasional' | 'rare_never'>('occasional');
  const [wasteHabits, setWasteHabits] = useState<'recycles_all' | 'recycles_some' | 'no_recycling'>('recycles_some');
  const [goalPreference, setGoalPreference] = useState<'save_money' | 'reduce_carbon' | 'build_habits' | 'learn_sustainability'>('reduce_carbon');

  // Calculates baseline on the fly for step 5 preview
  const getPreviewBaseline = () => {
    const tempProfile: UserProfile = {
      name: name.trim() || 'Hero',
      region,
      householdSize,
      lifestyleProfile,
      transportHabits,
      foodPreference,
      homeEnergy,
      shoppingHabits,
      flightFrequency,
      wasteHabits,
      goalPreference,
      climatePersona: 'Calculating...'
    };
    const baseline = calculateBaseline(tempProfile);
    const persona = generateClimatePersona(tempProfile);
    return { baseline, persona };
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    const finalProfile: UserProfile = {
      name: name.trim() || 'Hero',
      region,
      householdSize,
      lifestyleProfile,
      transportHabits,
      foodPreference,
      homeEnergy,
      shoppingHabits,
      flightFrequency,
      wasteHabits,
      goalPreference,
      climatePersona: ''
    };
    completeOnboarding(finalProfile);
  };

  const totalSteps = 5;
  const progressPercent = Math.round(((step - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 mt-4 animate-slide-up" id="onboarding-main-container">
      
      {/* Onboarding Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-forest-700 dark:bg-forest-950 dark:text-forest-400 mb-3">
          <Leaf className="h-6 w-6 animate-pulse" />
        </div>
        <h2 className="text-2.5xl sm:text-3.5xl font-display font-extrabold text-stone-900 dark:text-stone-50">
          Unlock your custom roadmap
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
          Let's generate your baseline in under 2 minutes. Answer with your closest daily patterns.
        </p>
      </div>

      {/* Progress indicators wrapper */}
      <div className="mb-8 select-none">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-bold font-mono text-stone-400">STEP {step} OF {totalSteps}</span>
          <span className="text-xs font-bold font-mono text-forest-600 dark:text-forest-400">{progressPercent}% COMPLETED</span>
        </div>
        <div className="h-2 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-forest-600 to-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Question Cards Frame */}
      <div className="rounded-2xl border border-stone-200/60 bg-white p-6 sm:p-8 shadow-xl dark:border-stone-800/80 dark:bg-stone-900/90 transition-all">
        
        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-6" id="onboarding-step-1">
            <h3 className="text-lg font-bold font-display text-stone-900 dark:text-stone-50 border-b border-stone-100 dark:border-stone-800 pb-3">
              Step 1: The Basics
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide flex items-center gap-1">
                <User className="h-3.5 w-3.5" /> What is your name?
              </label>
              <input
                id="input-onboarding-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-forest-600 focus:outline-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950 dark:focus:border-forest-400"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" /> Geographic Region
                </label>
                <select
                  id="select-onboarding-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-forest-600 focus:outline-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                >
                  <option value="US">United States (High Average)</option>
                  <option value="EU">European Union (Moderate average)</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="IN">India (Efficiency context)</option>
                  <option value="GLOBAL">Global Baseline avg</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" /> Household Size
                </label>
                <select
                  id="select-onboarding-household"
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-forest-600 focus:outline-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                >
                  <option value={1}>1 person (Single Dweller)</option>
                  <option value={2}>2 people (Shared resources)</option>
                  <option value={3}>3 people</option>
                  <option value={4}>4+ people (Cooperative household)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide block">
                Where is your home located?
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { id: 'urban', val: 'Urban Center', desc: 'Apartment/dense grid' },
                  { id: 'suburban', val: 'Suburban Area', desc: 'Single-family house/commuter' },
                  { id: 'rural', val: 'Rural Region', desc: 'Stand-alone/high distance' }
                ].map((item) => (
                  <button
                    key={item.id}
                    id={`btn-onboarding-lifestyle-${item.id}`}
                    onClick={() => setLifestyleProfile(item.id as any)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                      lifestyleProfile === item.id 
                        ? 'border-forest-600 bg-forest-50/50 text-forest-950 ring-2 ring-forest-100 dark:border-forest-400 dark:bg-forest-950/20 dark:text-stone-50' 
                        : 'border-stone-200 hover:bg-stone-50 dark:border-stone-800'
                    }`}
                  >
                    <span className="font-semibold text-sm">{item.val}</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Commuting & Transport */}
        {step === 2 && (
          <div className="space-y-6" id="onboarding-step-2">
            <h3 className="text-lg font-bold font-display text-stone-900 dark:text-stone-50 border-b border-stone-100 dark:border-stone-800 pb-3">
              Step 2: Commutes & Air Travels
            </h3>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide block flex items-center gap-1">
                <Car className="h-3.5 w-3.5" /> What is your main method of daily transport?
              </label>
              
              <div className="space-y-2.5">
                {[
                  { id: 'car_daily', label: 'Single Occupant Car (Daily)', desc: 'I drive to work or run errands by petrol/hybrid car almost every day.' },
                  { id: 'car_occasional', label: 'Car (Occasional / Shared)', desc: 'I drive sometimes, share rides, or drive only on weekends.' },
                  { id: 'public_transit', label: 'Public Transit (Bus, Train, Metro)', desc: 'I use trains, subways, or buses for the majority of my travel.' },
                  { id: 'active_transit', label: 'Active Transport (Cycled, Walked, Skate)', desc: 'I cycle, walk, run, or utilize local active vehicles.' },
                  { id: 'mixed', label: 'Mixed Hybrid commuting', desc: 'A balance of private driving, public rails, and walking.' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    id={`btn-onboarding-transport-${opt.id}`}
                    onClick={() => setTransportHabits(opt.id as any)}
                    className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      transportHabits === opt.id 
                        ? 'border-forest-600 bg-forest-50/50 text-stone-900 dark:border-forest-400 dark:bg-forest-950/20 dark:text-stone-50' 
                        : 'border-stone-200/70 hover:bg-stone-50/50 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-stone-300 mt-0.5">
                      {transportHabits === opt.id && <div className="h-2.5 w-2.5 rounded-full bg-forest-600 dark:bg-forest-400"></div>}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100">{opt.label}</div>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide block">
                How often do you take flights? (Short or long-haul)
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { id: 'frequent', label: 'Frequent Flying', desc: '4+ flights per year' },
                  { id: 'occasional', label: 'Occasional Flyer', desc: '1 - 3 flights per year' },
                  { id: 'rare_never', label: 'Rarely / Never', desc: 'Almost never fly' }
                ].map((item) => (
                  <button
                    key={item.id}
                    id={`btn-onboarding-flight-${item.id}`}
                    onClick={() => setFlightFrequency(item.id as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      flightFrequency === item.id 
                        ? 'border-forest-600 bg-forest-50/50 text-forest-950 dark:border-forest-400 dark:bg-forest-950/20 dark:text-stone-50' 
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <span className="font-semibold text-xs leading-none">{item.label}</span>
                    <span className="text-[10px] text-stone-400 mt-1 leading-tight">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Diet & Energy */}
        {step === 3 && (
          <div className="space-y-6" id="onboarding-step-3">
            <h3 className="text-lg font-bold font-display text-stone-900 dark:text-stone-50 border-b border-stone-100 dark:border-stone-800 pb-3">
              Step 3: Food & Utility Energy
            </h3>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide block">
                Which diet preference closest defines your meal habits?
              </label>
              
              <div className="grid gap-3 sm:grid-cols-5">
                {[
                  { id: 'meat_heavy', emoji: '🥩', label: 'Meat Heavy', desc: 'Frequent beef/lamb' },
                  { id: 'mixed', emoji: '🍗', label: 'Mixed', desc: 'Pork, poultry, fish' },
                  { id: 'low_meat', emoji: '🥗', label: 'Low Meat', desc: 'Meat occasionally' },
                  { id: 'vegetarian', emoji: '🍳', label: 'Vegetarian', desc: 'No meat, has dairy' },
                  { id: 'vegan', emoji: '🥑', label: 'Plant-Based', desc: 'No animal products' }
                ].map((diet) => (
                  <button
                    key={diet.id}
                    id={`btn-onboarding-diet-${diet.id}`}
                    onClick={() => setFoodPreference(diet.id as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      foodPreference === diet.id 
                        ? 'border-forest-600 bg-forest-50/50 text-emerald-950 dark:border-forest-400 dark:bg-forest-950/20 dark:text-stone-50' 
                        : 'border-stone-200 dark:border-stone-850 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-2xl mb-1.5">{diet.emoji}</span>
                    <span className="font-bold text-[11px] leading-none mb-1">{diet.label}</span>
                    <span className="text-[9px] text-stone-400 leading-tight">{diet.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide block">
                How is your home energy grid and heating supplied?
              </label>
              
              <div className="space-y-2">
                {[
                  { id: 'coal_gas', label: 'Carbon Heavy Grid (Coal / Natural Gas heating)', desc: 'Typical standard billing, fossil heating fuels used direct.' },
                  { id: 'grid_avg', label: 'Average Public Grid mix', desc: 'Typical combination of gas, solar, hydro, nuclear, and wind.' },
                  { id: 'green_renewables', label: '100% Green / Solar / Renewable contract', desc: 'I have household solar panels or pay for a specialized carbon-neutral energy vendor.' }
                ].map((energy) => (
                  <button
                    key={energy.id}
                    id={`btn-onboarding-energy-${energy.id}`}
                    onClick={() => setHomeEnergy(energy.id as any)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      homeEnergy === energy.id 
                        ? 'border-forest-600 bg-forest-50/50 text-stone-900 dark:border-forest-400 dark:bg-forest-950/20 dark:text-stone-50' 
                        : 'border-stone-200 hover:bg-stone-50/50 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-stone-300 mt-0.5">
                      {homeEnergy === energy.id && <div className="h-2.5 w-2.5 rounded-full bg-forest-600 dark:bg-forest-400"></div>}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100">{energy.label}</div>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">{energy.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Habits & Goals preferences */}
        {step === 4 && (
          <div className="space-y-6" id="onboarding-step-4">
            <h3 className="text-lg font-bold font-display text-stone-900 dark:text-stone-50 border-b border-stone-100 dark:border-stone-800 pb-3">
              Step 4: Consumption Habits & Core Focus
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide block flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5" /> Shopping Appetite
                </label>
                <select
                  id="select-onboarding-shopping"
                  value={shoppingHabits}
                  onChange={(e) => setShoppingHabits(e.target.value as any)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-forest-600 focus:outline-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                >
                  <option value="frequent">Frequent (Buy new clothes/gadgets monthly)</option>
                  <option value="average">Normal (Buy goods only when essential)</option>
                  <option value="minimalist">Minimalist (Thrift, recycle, buy longevity items)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide block flex items-center gap-1">
                  <Trash2 className="h-3.5 w-3.5" /> Recycling & Composting
                </label>
                <select
                  id="select-onboarding-waste"
                  value={wasteHabits}
                  onChange={(e) => setWasteHabits(e.target.value as any)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-forest-600 focus:outline-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                >
                  <option value="recycles_all">Comprehensive (Recycle & compost everything)</option>
                  <option value="recycles_some">Partial (Recycle containers, but landfill food waste)</option>
                  <option value="no_recycling">None (All general items into landfill bags)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide block">
                What is your central goal with Carbon Compass?
              </label>
              
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { id: 'reduce_carbon', tag: '🌱', label: 'Cut Emissions', p: 'Maximum carbon saves' },
                  { id: 'save_money', tag: '💰', label: 'Save Money', p: 'Combined billing cuts' },
                  { id: 'build_habits', tag: '🔥', label: 'Build Habits', p: 'Daily streak goals' },
                  { id: 'learn_sustainability', tag: '📚', label: 'Learn More', p: 'Myth vs fact logs' }
                ].map((item) => (
                  <button
                    key={item.id}
                    id={`btn-onboarding-goal-${item.id}`}
                    onClick={() => setGoalPreference(item.id as any)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      goalPreference === item.id 
                        ? 'border-forest-600 bg-forest-50/50 text-forest-950 dark:border-forest-400 dark:bg-forest-950/20 dark:text-stone-50 shadow-xs' 
                        : 'border-stone-200 hover:bg-stone-50 dark:border-stone-800'
                    }`}
                  >
                    <span className="text-xl mb-1">{item.tag}</span>
                    <span className="font-bold text-[11px] leading-tight mb-0.5">{item.label}</span>
                    <span className="text-[9px] text-stone-400 leading-tight">{item.p}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Calculated Baseline & Climate Persona Generation */}
        {step === 5 && (() => {
          const { baseline, persona } = getPreviewBaseline();
          return (
            <div className="space-y-6" id="onboarding-step-5">
              <h3 className="text-lg font-bold font-display text-emerald-800 dark:text-emerald-400 border-b border-stone-100 dark:border-stone-800 pb-3 flex items-center space-x-2">
                <Check className="h-5 w-5" />
                <span>Your Personalized Carbon Baseline Ready!</span>
              </h3>

              {/* Climate Persona Profile Banner */}
              <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4.5 text-center dark:border-emerald-900/60 dark:bg-emerald-950/20">
                <span className="text-[10px] font-bold font-mono tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-2 py-0.5 rounded uppercase">
                  Your Climate Persona
                </span>
                <h4 className="text-2xl font-display font-extrabold text-stone-900 dark:text-stone-50 mt-1.5">
                  {persona}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1">
                  We've mapped your habits! You're primed to implement targeted, money-saving switches.
                </p>
              </div>

              {/* Main Score Metrics Callout */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 text-center dark:border-stone-800 dark:bg-stone-950">
                  <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">Estimated Monthly Carbon Footprint</span>
                  <div className="mt-1.5 flex items-baseline justify-center space-x-1">
                    <span className="text-4.5xl font-display font-extrabold text-stone-900 dark:text-white">
                      {baseline.monthlyEstimate}
                    </span>
                    <span className="text-sm font-semibold text-stone-500">kg CO₂e</span>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 text-center dark:border-stone-800 dark:bg-stone-950">
                  <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">Pro-rated Annual Consumption</span>
                  <div className="mt-1.5 flex items-baseline justify-center space-x-1">
                    <span className="text-4.5xl font-display font-extrabold text-stone-950 dark:text-white">
                      {(baseline.yearlyEstimate / 1000).toFixed(1)}
                    </span>
                    <span className="text-sm font-semibold text-stone-500">Tons / year</span>
                  </div>
                </div>
              </div>

              {/* Custom SVG Bar Graph of baseline metrics */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-850 space-y-3 bg-stone-50/50 dark:bg-stone-950/30">
                <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  Baseline Breakdown of Emissions:
                </h5>
                <div className="space-y-2.5 text-xs">
                  {[
                    { cat: 'Transport & Travel', val: baseline.transportScore, col: 'bg-amber-500' },
                    { cat: 'Diet & Dining', val: baseline.foodScore, col: 'bg-emerald-500' },
                    { cat: 'Home Utility load', val: baseline.homeScore, col: 'bg-blue-500' },
                    { cat: 'Lifestyle Shopping', val: baseline.shoppingScore, col: 'bg-indigo-500' },
                    { cat: 'Waste & Landfill', val: baseline.wasteScore, col: 'bg-stone-400' }
                  ].map((elem, i) => {
                    const percent = Math.round((elem.val / baseline.monthlyEstimate) * 100) || 0;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between font-bold text-stone-700 dark:text-stone-300">
                          <span>{elem.cat}</span>
                          <span>{elem.val} kg ({percent}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-stone-200 dark:bg-stone-850 overflow-hidden">
                          <div className={`h-full ${elem.col} rounded-full`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Action Insights */}
              <div className="rounded-xl bg-forest-50 border border-forest-100 p-4.5 dark:bg-forest-950/20 dark:border-forest-900/40">
                <h5 className="text-xs font-bold uppercase tracking-wider text-forest-800 dark:text-forest-400 mb-2 font-mono">
                  💡 Dynamic Coaching Insights:
                </h5>
                <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-2 list-disc list-inside">
                  {baseline.transportScore > baseline.foodScore ? (
                    <li>Your travel and flight logs are representing your highest carbon driver. Target public transits first!</li>
                  ) : (
                    <li>Meat-heavy food profiles rank highest in your layout. Target 2 vegan days to unlock significant shifts!</li>
                  )}
                  {baseline.homeScore > 300 && (
                    <li>Your cooling energy loads represent a high opportunity to switch A/C runtimes or wash cold laundry loads easily.</li>
                  )}
                  {baseline.wasteScore <= 50 ? (
                    <li>Splendid! You represent an efficient waste recycler already limitng landfill decay.</li>
                  ) : (
                    <li>Consider adding a home food composting habits bucket to save on decomposing local soil footprint.</li>
                  )}
                </ul>
              </div>
            </div>
          );
        })()}

      </div>

      {/* Onboarding controls */}
      <div className="mt-8 flex items-center justify-between">
        {step > 1 ? (
          <button
            id="btn-onboarding-back"
            onClick={handleBack}
            className="inline-flex items-center space-x-1.5 rounded-xl border border-stone-200 bg-white dark:bg-stone-900 px-5 py-3 text-sm font-semibold text-stone-700 dark:border-stone-850 dark:text-stone-300 hover:bg-stone-50 cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Go Back</span>
          </button>
        ) : (
          <div /> /* spacer */
        )}

        {step < 5 ? (
          <button
            id="btn-onboarding-next"
            onClick={handleNext}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-forest-600 px-6.5 py-3 text-sm font-bold text-white shadow-md hover:bg-forest-700 cursor-pointer ml-auto"
          >
            <span>Proceed</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        ) : (
          <button
            id="btn-onboarding-complete"
            onClick={handleComplete}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-7.5 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700 cursor-pointer ml-auto hover:translate-y-[-1px] transition-all"
          >
            <span>Enter My Carbon Compass Dashboard</span>
            <ArrowRight className="h-4.5 w-4.5 animate-bounce-horizontal" />
          </button>
        )}
      </div>

    </div>
  );
};
