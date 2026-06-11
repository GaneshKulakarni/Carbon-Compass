import React from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveGlobe } from './InteractiveGlobe';
import { 
  BarChart3, TrendingDown, Flame, Compass, Award, Plus, Trash2, 
  ArrowRight, ShieldCheck, Footprints, AlertTriangle, Lightbulb, 
  Sparkles, Calendar, Zap, DollarSign, RefreshCw, HelpCircle
} from 'lucide-react';

interface DashboardHomeProps {
  onOpenMethodology: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onOpenMethodology }) => {
  const { 
    user, footprint, activityLogs, goals, recommendations, badges, deleteLog, setActiveTab, isDemoMode 
  } = useApp();

  // Pre-calculations
  const baselineMonthly = footprint?.monthlyEstimate || 1200;
  
  // Total saved in logged history (negative values)
  const savedThisMonth = Math.abs(
    activityLogs
      .filter(l => l.estimatedEmission < 0)
      .reduce((acc, curr) => acc + curr.estimatedEmission, 0)
  );

  // Total added in logged history if any (positive direct entries over baseline)
  const addedThisMonth = activityLogs
    .filter(l => l.estimatedEmission > 0)
    .reduce((acc, curr) => acc + curr.estimatedEmission, 0);

  // Current balance footprint
  const currentActual = Math.max(0, Math.round(baselineMonthly - savedThisMonth + addedThisMonth));
  const progressPercent = Math.min(100, Math.round((currentActual / baselineMonthly) * 100));

  // Category values after saved offsets
  const activeTransport = Math.max(0, Math.round((footprint?.transportScore || 380) - Math.abs(activityLogs.filter(l => l.category === 'transport' && l.estimatedEmission < 0).reduce((acc, l) => acc + l.estimatedEmission, 0))));
  const activeFood = Math.max(0, Math.round((footprint?.foodScore || 240) - Math.abs(activityLogs.filter(l => l.category === 'food' && l.estimatedEmission < 0).reduce((acc, l) => acc + l.estimatedEmission, 0))));
  const activeHome = Math.max(0, Math.round((footprint?.homeScore || 350) - Math.abs(activityLogs.filter(l => l.category === 'home' && l.estimatedEmission < 0).reduce((acc, l) => acc + l.estimatedEmission, 0))));
  const activeShopping = Math.max(0, Math.round((footprint?.shoppingScore || 180) - Math.abs(activityLogs.filter(l => l.category === 'shopping' && l.estimatedEmission < 0).reduce((acc, l) => acc + l.estimatedEmission, 0))));
  const activeWaste = Math.max(0, Math.round((footprint?.wasteScore || 80) - Math.abs(activityLogs.filter(l => l.category === 'waste' && l.estimatedEmission < 0).reduce((acc, l) => acc + l.estimatedEmission, 0))));

  // Biggest category contributor
  const categories = [
    { name: 'Transport & Travel', val: activeTransport, emoji: '🚗', color: 'bg-amber-500' },
    { name: 'Diet & Food', val: activeFood, emoji: '🥩', color: 'bg-emerald-500' },
    { name: 'Home Utilities', val: activeHome, emoji: '⚡', color: 'bg-blue-500' },
    { name: 'Lifestyle Shopping', val: activeShopping, emoji: '📦', color: 'bg-indigo-500' },
    { name: 'Waste Decaging', val: activeWaste, emoji: '♻️', color: 'bg-stone-400' },
  ];
  const sortedCategories = [...categories].sort((a, b) => b.val - a.val);
  const primaryDriver = sortedCategories[0];

  // Best opportunities (highest recommendation not yet added)
  const pendingRecs = recommendations.filter(r => !r.isAdded);
  const bestOpportunity = pendingRecs.length > 0 
    ? pendingRecs.sort((a, b) => b.carbonSaved - a.carbonSaved)[0]
    : recommendations[0];

  // Earned badges score
  const earnedBadgesCount = badges.filter(b => b.earnedAt).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-2 animate-fade-in" id="dashboard-home-view">
      
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-[11px] font-bold font-mono text-forest-700 bg-forest-100 dark:bg-forest-950/40 dark:text-forest-400 px-2.5 py-1 rounded">
            {user?.climatePersona || 'Everyday Reducer'}
          </span>
          <h1 className="text-3xl font-display font-bold text-stone-900 dark:text-stone-50 mt-2">
            Welcome back, {user?.name || 'Alex'}!
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-0.5 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>Tracking active footprint for June 2026.</span>
          </p>
        </div>

        {/* Action button trigger toolbar */}
        <div className="flex items-center gap-3">
          <button
            id="btn-dash-tracker-lnk"
            onClick={() => setActiveTab('tracker')}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white px-5 py-3 text-sm font-bold shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>Log Daily Carbon Save</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid - carbon budget pairing with 3D Hologram Globe */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        
        {/* Footprint Balance Ring Card- takes 2 cols */}
        <div className="md:col-span-2 rounded-2xl border border-stone-200/60 bg-white p-6 shadow-md dark:border-stone-850 dark:bg-stone-900 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">My Carbon Budget Remaining</span>
              <button 
                onClick={onOpenMethodology}
                className="text-stone-400 hover:text-stone-600 text-xs font-mono flex items-center gap-0.5"
              >
                <HelpCircle className="h-3.5 w-3.5" /> Factors
              </button>
            </div>

            <div className="flex items-center gap-6 mt-4">
              {/* Circular Gauge natively drawn with SVG */}
              <div className="relative h-28 w-28 shrink-0 select-none">
                <svg className="h-full w-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="#e2ede6"
                    strokeWidth="9"
                    fill="transparent"
                    className="dark:stroke-stone-800"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="#10b981"
                    strokeWidth="9"
                    fill="transparent"
                    strokeDasharray={289}
                    strokeDashoffset={289 - (289 * progressPercent) / 100}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-display font-extrabold text-stone-900 dark:text-stone-50">
                    {progressPercent}%
                  </span>
                  <span className="text-[9px] text-stone-400 font-bold uppercase">Expenditure</span>
                </div>
              </div>

              <div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-display font-extrabold text-stone-900 dark:text-white">
                    {currentActual}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">kg CO₂e</span>
                </div>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Actual emissions this month vs. baseline of <span className="font-semibold text-stone-700 dark:text-stone-200">{baselineMonthly} kg</span>.
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                  <TrendingDown className="h-4 w-4" />
                  <span>Saves: ↓ {savedThisMonth.toFixed(1)} kg saved this month</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Planet Vitality Globe Card - takes 2 cols */}
        <div className="md:col-span-2 rounded-2xl border border-stone-200/60 bg-white p-6 shadow-md dark:border-stone-850 dark:bg-stone-900 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">interactive planetary model</span>
              <span className="text-[10px] uppercase font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold dark:bg-emerald-950/20 dark:text-emerald-400">Carbon Response Live</span>
            </div>
            <p className="text-[11.5px] text-stone-500 dark:text-stone-400 leading-relaxed mt-1">
              Holographic model representing ecological balance. Point cluster colors shift globally in real-time as you log energy saves or transport offsets.
            </p>
          </div>
          <div className="mt-3.5">
            <InteractiveGlobe progressPercent={progressPercent} size="sm" />
          </div>
        </div>

      </div>

      {/* Habit Momentum and Achievements row */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        
        {/* Milestone Streak Widget */}
        <div className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-xs dark:border-stone-850 dark:bg-stone-900 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">Habit Momentum</span>
            <div className="flex items-center gap-3.5 mt-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 text-2xl font-bold font-mono shadow-xs animate-bounce-slow">
                🔥
              </div>
              <div>
                <div className="text-xl font-display font-bold text-stone-900 dark:text-stone-50">
                  {activityLogs.length > 0 ? '5-Day Streak' : '0-Day Streak'}
                </div>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Consecutive logged days</p>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-100 dark:border-stone-800 pt-3.5 mt-4 flex justify-between items-center text-[11px]">
            <span className="text-stone-500 font-medium">Daily Goals Active:</span>
            <span className="font-bold text-stone-900 dark:text-stone-300">
              {goals.filter(g => g.status === 'active').length} on track
            </span>
          </div>
        </div>

        {/* Carbon Coins / Badge widget */}
        <div className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-xs dark:border-stone-850 dark:bg-stone-900 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">Achievements</span>
            <div className="flex items-center gap-3.5 mt-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 text-2xl font-bold font-mono shadow-xs">
                🎖️
              </div>
              <div>
                <div className="text-xl font-display font-bold text-stone-900 dark:text-stone-50">
                  {earnedBadgesCount} / {badges.length} Earned
                </div>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Badges unlocked</p>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-100 dark:border-stone-800 pt-3.5 mt-4 flex justify-between items-center text-[11px]">
            <span className="text-stone-500 font-medium">Latest:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {badges.filter(b => b.earnedAt).reverse()[0]?.title || 'Awaiting First log'}
            </span>
          </div>
        </div>

      </div>

      {/* Main Split Layout: Category breakdown AND recommendation highlight */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        
        {/* Left col: Current month Breakdown (custom SVG bars visualization) */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200/60 bg-white p-6 shadow-xs dark:border-stone-850 dark:bg-stone-900">
          <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-850 pb-3 mb-5">
            <h3 className="font-display font-bold text-stone-900 dark:text-stone-50 text-base">
              Monthly Emissions Breakdown
            </h3>
            <span className="text-xs text-stone-400 font-mono">Actual kg CO₂e</span>
          </div>

          <div className="space-y-4.5">
            {[
              { label: '🚙 Transport & Flights', current: activeTransport, base: footprint?.transportScore || 380, color: 'bg-amber-400' },
              { label: '🥩 Dining & Groceries', current: activeFood, base: footprint?.foodScore || 240, color: 'bg-emerald-400' },
              { label: '⚡ Home Utility Grid', current: activeHome, base: footprint?.homeScore || 350, color: 'bg-blue-400' },
              { label: '📦 Shopping Purchases', current: activeShopping, base: footprint?.shoppingScore || 180, color: 'bg-indigo-400' },
              { label: '♻️ Organic Food & Trash Waste', current: activeWaste, base: footprint?.wasteScore || 80, color: 'bg-stone-400' }
            ].map((item, i) => {
              const reduction = Math.max(0, item.base - item.current);
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-stone-700 dark:text-stone-300">
                    <span>{item.label}</span>
                    <span className="font-mono text-stone-500">
                      {item.current} kg <span className="text-stone-400 font-medium font-sans">/ {item.base} baseline</span>
                    </span>
                  </div>
                  {/* Layered custom double bar to visually represent saves */}
                  <div className="h-3 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden relative">
                    <div 
                      className={`h-full ${item.color} rounded-full absolute left-0 transition-all duration-300`}
                      style={{ width: `${Math.min(100, Math.round((item.current / item.base) * 100))}%` }}
                    ></div>
                    {reduction > 0 && (
                      <div 
                        className="h-full bg-emerald-200/55 dark:bg-emerald-800/40 border-l border-dashed border-emerald-400 absolute transition-all duration-300"
                        style={{ 
                          left: `${Math.round((item.current / item.base) * 100)}%`, 
                          width: `${Math.round((reduction / item.base) * 100)}%` 
                        }}
                        title={`${reduction} kg saved in this category`}
                      ></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-4.5 rounded-xl bg-stone-50 border border-stone-100 dark:bg-stone-950/20 dark:border-stone-850 flex items-start gap-3">
            <Lightbulb className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              <span className="font-semibold text-stone-800 dark:text-stone-200">Aesthetic comparison:</span> Standard solid bar lines represent your actual live emissions. The <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold">light stripe zones</span> represent carbon saves you have logged!
            </p>
          </div>
        </div>

        {/* Right col: Insights sidebar layout */}
        <div className="flex flex-col gap-6">

          {/* Biggest carbon source insight card */}
          <div className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-xs dark:border-stone-850 dark:bg-stone-900">
            <span className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
              <span>Highest Footprint Source</span>
            </span>
            <h4 className="text-lg font-display font-bold mt-2.5 text-stone-900 dark:text-stone-100">
              {primaryDriver?.emoji} {primaryDriver?.name} ({Math.round(primaryDriver?.val / (currentActual || 1) * 100)}%)
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mt-2">
              Our analysis indicates {primaryDriver?.name} represents your current month's highest carbon footprint source at <span className="font-mono font-bold text-stone-800 dark:text-stone-250">{primaryDriver?.val} kg CO₂e</span>. Try logging transits regularly or checking our "What-If" sliders to discover active mitigations.
            </p>
          </div>

          {/* Next best recommended action card */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-xs dark:border-emerald-950/40 dark:bg-emerald-950/20 flex-1 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Next Best Action Plan</span>
              </span>
              <h4 className="text-base font-display font-bold mt-2.5 text-emerald-950 dark:text-stone-50 leading-tight">
                {bestOpportunity?.title}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mt-1.5">
                {bestOpportunity?.personalizedReason}
              </p>
              
              <div className="flex gap-4 mt-3">
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase font-mono">Potential Save</span>
                  <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">↓ {bestOpportunity?.carbonSaved} kg /mo</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase font-mono">Financial Save</span>
                  <span className="font-mono font-bold text-xs text-stone-700 dark:text-stone-300">${bestOpportunity?.savings} / mo</span>
                </div>
              </div>
            </div>

            <button
              id="btn-dash-best-rec-add"
              onClick={() => setActiveTab('simulator')}
              className="mt-6 flex w-full items-center justify-center space-x-1.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white p-2.5 text-xs font-semibold"
            >
              <span>Explore Action Simulator</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Grid: Goals on progress & recent logging history (Dual layout) */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Left Side: Active sustainability goals tracker */}
        <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-xs dark:border-stone-850 dark:bg-stone-900">
          <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-850 pb-3 mb-4">
            <h3 className="font-display font-bold text-stone-900 dark:text-stone-50 text-base">
              My Active Habits & Goals
            </h3>
            <button 
              onClick={() => setActiveTab('goals')}
              className="text-xs text-forest-600 dark:text-forest-400 font-bold hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3.5">
            {goals.filter(g => g.status === 'active').slice(0, 3).map((goal) => {
              const percent = Math.min(100, Math.round((goal.progress / goal.targetValue) * 100));
              return (
                <div key={goal.id} className="p-3.5 rounded-xl border border-stone-150 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-900/50 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-snug">{goal.title}</h4>
                      <span className="text-[10px] text-stone-400 font-mono inline-block mt-0.5 capitalize">
                        Category: {goal.category} • Target: {goal.targetValue} logs/mo
                      </span>
                    </div>
                    {/* Progress percentage pill */}
                    <span className="text-[10px] uppercase tracking-wider font-bold font-mono px-2 py-0.5 rounded bg-forest-100 text-forest-700 dark:bg-forest-950 dark:text-forest-300 whitespace-nowrap">
                      {goal.progress} / {goal.targetValue} ({percent}%)
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 w-full bg-stone-200/70 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-forest-600 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}

            {goals.filter(g => g.status === 'active').length === 0 && (
              <div className="p-10 text-center text-stone-400 border border-dashed border-stone-200 rounded-xl">
                <span className="text-xl">🏆</span>
                <p className="text-xs mt-2">All active goals complete or none added yet!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Logged history logs tracker */}
        <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-xs dark:border-stone-850 dark:bg-stone-900 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-850 pb-3 mb-4">
              <h3 className="font-display font-bold text-stone-900 dark:text-stone-50 text-base">
                Recent Climate Actions Logged
              </h3>
              <button 
                onClick={() => setActiveTab('tracker')}
                className="text-xs text-forest-600 dark:text-forest-400 font-bold hover:underline"
              >
                Log New
              </button>
            </div>

            <div className="space-y-3 max-h-[290px] overflow-y-auto custom-scrollbar pr-1">
              {activityLogs.slice(0, 5).map((log) => {
                const isSave = log.estimatedEmission < 0;
                return (
                  <div 
                    key={log.id} 
                    className="flex justify-between items-center p-2.5 rounded-lg border border-stone-150/60 hover:bg-stone-50/50 dark:border-stone-850 dark:hover:bg-stone-950/30 transition-all text-xs"
                    id={`active-log-${log.id}`}
                  >
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-1.5 leading-snug">
                        <span>{log.label}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
                        Value: {log.value} {log.unit} • {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold text-xs whitespace-nowrap ${isSave ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500'}`}>
                        {isSave ? `-${Math.abs(log.estimatedEmission)} kg` : `+${log.estimatedEmission} kg`}
                      </span>
                      <button
                        onClick={() => deleteLog(log.id)}
                        className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                        title="Delete log"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {activityLogs.length === 0 && (
                <div className="p-10 text-center text-stone-400 border border-dashed border-stone-200 rounded-xl">
                  <span className="text-xl">📋</span>
                  <p className="text-xs mt-2">No climate logging events entered yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
