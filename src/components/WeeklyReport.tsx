import React from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Compass, ArrowRight, Award, Footprints, ClipboardList, Share2, Printer, CheckCircle } from 'lucide-react';

export const WeeklyReport: React.FC = () => {
  const { user, footprint, activityLogs, goals } = useApp();

  // Baseline monthly pro-rated to one week
  const baseWeekly = Math.round((footprint?.monthlyEstimate || 1200) / 4.3);

  // Filter logs associated with the past 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const weeklyLogs = activityLogs.filter(log => new Date(log.createdAt) >= sevenDaysAgo);

  // Reductions recorded this week
  const savedThisWeek = Math.abs(
    weeklyLogs
      .filter(l => l.estimatedEmission < 0)
      .reduce((acc, curr) => acc + curr.estimatedEmission, 0)
  );

  // Contributions added this week
  const addedThisWeek = weeklyLogs
    .filter(l => l.estimatedEmission > 0)
    .reduce((acc, curr) => acc + curr.estimatedEmission, 0);

  const actualWeeklyEmission = Math.max(0, Math.round(baseWeekly - savedThisWeek + addedThisWeek));
  const weeklySavingsPercent = baseWeekly > 0 ? Math.min(95, Math.round((savedThisWeek / baseWeekly) * 100)) : 0;

  // Best single log action taken this week
  const bestAction = weeklyLogs.length > 0
    ? [...weeklyLogs].filter(l => l.estimatedEmission < 0).sort((a, b) => a.estimatedEmission - b.estimatedEmission)[0]
    : null;

  // Top source this week based on category sums
  const categories = ['transport', 'food', 'home', 'shopping', 'waste'];
  const catSums = categories.map(cat => {
    const defaultBase = Math.round((footprint?.[`${cat}Score` as keyof typeof footprint] as number || 100) / 4.3);
    const added = weeklyLogs.filter(l => l.category === cat && l.estimatedEmission > 0).reduce((acc, l) => acc + l.estimatedEmission, 0);
    const saved = Math.abs(weeklyLogs.filter(l => l.category === cat && l.estimatedEmission < 0).reduce((acc, l) => acc + l.estimatedEmission, 0));
    return {
      cat,
      val: Math.max(0, defaultBase - saved + added)
    };
  });
  const topWeeklySource = [...catSums].sort((a, b) => b.val - a.val)[0];

  const handlePrintMock = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-2 animate-fade-in" id="weekly-report-view">
      
      {/* Page Headers */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-900 dark:text-stone-50">
            Weekly Climate Briefing
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            A scannable diagnostic review of actions and footprint changes compiled across the past 7 days.
          </p>
        </div>

        {/* Print / Screenshot button */}
        <button
          id="btn-report-screenshot"
          onClick={handlePrintMock}
          className="inline-flex items-center space-x-1.5 rounded-xl border border-stone-200 bg-white dark:bg-stone-900 px-4 py-2.5 text-xs font-semibold text-stone-700 dark:border-stone-850 dark:text-stone-350 hover:bg-stone-50 cursor-pointer"
        >
          <Share2 className="h-4 w-4" />
          <span>Save / Export Sheet</span>
        </button>
      </div>

      {/* Main split grid: report stats card VS printable preview mockup */}
      <div className="grid gap-8 lg:grid-cols-3">

        {/* Column 1 & 2: Diagnostic summary metrics */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid gap-5 sm:grid-cols-3">
            
            <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-850 dark:bg-stone-900">
              <span className="text-[10px] text-stone-400 font-bold uppercase font-mono tracking-wider">Weekly Emission Actual</span>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-3.5xl font-display font-extrabold text-stone-905 dark:text-white">
                  {actualWeeklyEmission}
                </span>
                <span className="text-xs font-semibold text-stone-500">kg CO₂e</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-2">Prorated baseline: {baseWeekly} kg</p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-850 dark:bg-stone-900">
              <span className="text-[10px] text-stone-400 font-bold uppercase font-mono tracking-wider">Weekly Savings Ratio</span>
              <div className="mt-2 flex items-baseline space-x-1 text-emerald-600 dark:text-emerald-400">
                <span className="text-3.5xl font-display font-extrabold">
                  {weeklySavingsPercent}%
                </span>
                <span className="text-xs font-semibold font-sans">Saved</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-2">Drawn from {weeklyLogs.length} tracked logs</p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-850 dark:bg-stone-900">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase font-mono tracking-wider">Best Single Action choice</span>
              <div className="mt-2">
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-50 leading-tight truncate">
                  {bestAction ? bestAction.label : 'None recorded'}
                </h4>
                <p className="text-[10px] text-stone-400 mt-1 font-mono">
                  {bestAction ? `Saved ↓ ${Math.abs(bestAction.estimatedEmission)} kg` : 'Log some transits!'}
                </p>
              </div>
            </div>

          </div>

          {/* Diagnostic breakdown lists */}
          <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-xs dark:border-stone-850 dark:bg-stone-900 space-y-4">
            <h3 className="font-display font-bold text-stone-900 dark:text-stone-50 text-base">
              Weekly Category Diagnosis
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Based on actions taken since {sevenDaysAgo.toLocaleDateString()}, here are your weekly carbon outputs:
            </p>

            <div className="space-y-4 pt-1">
              {catSums.map((item, i) => {
                const baseVal = Math.round((footprint?.[`${item.cat}Score` as keyof typeof footprint] as number || 100) / 4.3);
                const percent = Math.round((item.val / (baseVal || 1)) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="capitalize">{item.cat} Output</span>
                      <span className="font-mono text-stone-500">{item.val} kg ({percent}%)</span>
                    </div>
                    {/* Progress representation */}
                    <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-850 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${percent > 100 ? 'bg-rose-400' : percent < 60 ? 'bg-emerald-500' : 'bg-forest-600'}`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-stone-100 dark:border-stone-850 pt-4 text-xs text-stone-500 dark:text-stone-400 flex items-start gap-2 leading-relaxed">
              <span>💡</span>
              <p>
                Your weekly primary greenhouse gas contributor represents <span className="font-semibold text-stone-900 dark:text-stone-100 capitalize">{topWeeklySource?.cat}</span> at <span className="font-bold text-stone-800 dark:text-stone-300 font-mono">{topWeeklySource?.val} kg</span>. Keep logging composting, active transits, and setting smart cooling ranges to compress this average!
              </p>
            </div>
          </div>

        </div>

        {/* Column 3: Screenshot shareable summary mockup card */}
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-forest-600 bg-stone-900 p-6 shadow-xl text-white dark:bg-stone-950 relative overflow-hidden" id="screenshot-share-card">
            
            {/* Subtle gloss effect */}
            <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-forest-600/20 blur-lg pointer-events-none"></div>

            {/* Logo */}
            <div className="flex items-center space-x-2.5 pb-5 border-b border-stone-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-600 text-white shadow-xs">
                <Compass className="h-4.5 w-4.5 animate-spin-slow" />
              </div>
              <div>
                <span className="font-display text-sm font-extrabold tracking-tight">
                  Carbon <span className="text-emerald-400">Compass</span>
                </span>
                <span className="text-[9px] block text-stone-400 font-mono uppercase font-semibold">Climate Action Verified</span>
              </div>
            </div>

            {/* Profile info */}
            <div className="mt-5 text-center text-stone-50 space-y-1.5 pb-5 border-b border-stone-800">
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-900/40">
                {user?.climatePersona || 'Everyday Reducer'}
              </span>
              <h4 className="text-xl font-display font-bold text-white">{user?.name || 'Alex'}'s Weekly Badge</h4>
              <p className="text-xs text-stone-400">June 2026 Climate scorecard</p>
            </div>

            {/* Stats list */}
            <div className="py-5 space-y-4 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Actual Footprint:</span>
                <span className="font-mono font-bold text-white">{actualWeeklyEmission} kg CO₂e</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Weekly Savings offset:</span>
                <span className="font-mono font-bold text-emerald-400">↓ {savedThisWeek} kg Saved</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Weekly Performance Ratio:</span>
                <span className="font-mono font-bold text-emerald-400">↓ {weeklySavingsPercent}% lower</span>
              </div>
              <div className="flex justify-between text-stone-400 text-[10px] italic">
                <span>Verification ID:</span>
                <span className="font-mono">{user?.name ? `${user.name.slice(0,3).toUpperCase()}_2026` : 'COMP_2026'}</span>
              </div>
            </div>

            {/* Bottom branding footer */}
            <div className="pt-2 text-center text-[10px] text-stone-500 font-sans border-t border-stone-850">
              Screenshot & share your sustainable journey!
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
