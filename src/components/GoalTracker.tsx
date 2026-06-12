import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Goal } from '../types';
import { 
  Award, Flame, Check, Plus, Trash2, ShieldCheck, HelpCircle, 
  Sparkles, Shield, ToggleLeft, ToggleRight, Power, Activity 
} from 'lucide-react';

export const GoalTracker: React.FC = () => {
  const { 
    goals, setGoals, badges, logGoalProgress, toggleGoalStatus,
    activityLogs, completedLessons 
  } = useApp();
  
  // Dynamic current streak calculation (matches DashboardHome logic)
  const currentStreak = React.useMemo(() => {
    if (activityLogs.length === 0) return 0;
    const dates = Array.from(new Set(activityLogs.map(log => log.createdAt.split('T')[0]))) as string[];
    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0];
    
    let current = 0;
    const hasLogToday = dates.includes(todayStr);
    const hasLogYesterday = dates.includes(yesterdayStr);
    
    if (hasLogToday || hasLogYesterday) {
      let checkDate = new Date();
      if (!hasLogToday && hasLogYesterday) {
        checkDate = new Date(Date.now() - 24 * 3600 * 1000);
      }
      
      let checkStr = checkDate.toISOString().split('T')[0];
      while (dates.includes(checkStr)) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = checkDate.toISOString().split('T')[0];
      }
    }
    return current;
  }, [activityLogs]);

  // Dynamic Badge Progress calculation
  const getBadgeProgress = (badgeId: string) => {
    let current = 0;
    let target = 1;
    let unit = "";

    switch (badgeId) {
      case 'b_first_log':
        target = 1;
        current = activityLogs.length >= 1 ? 1 : 0;
        unit = "log";
        break;
      case 'b_streak_3':
        target = 3;
        current = Math.min(3, currentStreak);
        unit = "days";
        break;
      case 'b_commute':
        target = 20;
        current = Math.round(
          Math.abs(
            activityLogs
              .filter(l => l.category === 'transport' && l.estimatedEmission < 0)
              .reduce((acc, log) => acc + log.estimatedEmission, 0)
          )
        );
        unit = "kg CO₂";
        break;
      case 'b_eater':
        target = 5;
        current = activityLogs.filter(l => l.category === 'food' && (l.actionType === 'vegetarian_meal' || l.actionType === 'vegan_meal')).length;
        unit = "meals";
        break;
      case 'b_energy':
        target = 4;
        current = activityLogs.filter(l => l.category === 'home').length;
        unit = "saves";
        break;
      case 'b_waste':
        target = 10;
        current = activityLogs.filter(l => l.category === 'waste').length;
        unit = "times";
        break;
      case 'b_saving_50':
        target = 50;
        current = Math.round(
          Math.abs(
            activityLogs
              .filter(log => log.estimatedEmission < 0)
              .reduce((acc, log) => acc + log.estimatedEmission, 0)
          )
        );
        unit = "kg CO₂";
        break;
      case 'b_truth_seeker':
        target = 3;
        current = completedLessons.length;
        unit = "lessons";
        break;
      default:
        break;
    }

    const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    return { current, target, percent, unit };
  };

  // Custom goal parameters
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'transport' | 'food' | 'home' | 'shopping' | 'waste'>('transport');
  const [newTarget, setNewTarget] = useState<number>(4);
  const [newReduction, setNewReduction] = useState<number>(20);
  const [newSavings, setNewSavings] = useState<number>(10);
  const [success, setSuccess] = useState('');

  // Streak protection shields local persistence
  const [weekendShield, setWeekendShield] = useState(() => localStorage.getItem('cc_weekend_shield') === 'true');
  const [travelShield, setTravelShield] = useState(() => localStorage.getItem('cc_travel_shield') === 'true');

  const handleToggleShield = (type: 'weekend' | 'travel') => {
    if (type === 'weekend') {
      const next = !weekendShield;
      setWeekendShield(next);
      localStorage.setItem('cc_weekend_shield', String(next));
    } else {
      const next = !travelShield;
      setTravelShield(next);
      localStorage.setItem('cc_travel_shield', String(next));
    }
  };

  // Dynamic habit metrics calculations
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const onTrackGoals = goals.filter(g => g.progress > 0 && g.status !== 'completed').length;
  const inactiveGoals = goals.filter(g => g.progress === 0).length;

  const completionRatio = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 105) : 0;
  const adjustedCompletion = Math.min(100, completionRatio); // capped at 100

  // Celebratory Milestone unlock triggers
  const recentEarnedBadge = React.useMemo(() => {
    const earned = badges.filter(b => b.earnedAt);
    if (earned.length === 0) return null;
    // return most recently earned
    return [...earned].sort((a,b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())[0];
  }, [badges]);

  const handleAddNewGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: Goal = {
      id: `custom_g_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      targetValue: newTarget,
      progress: 0,
      estimatedReduction: newReduction,
      status: 'active',
      streak: 0,
      moneySaved: newSavings
    };

    setGoals(prev => [created, ...prev]);
    setNewTitle('');
    setSuccess('Splendid! Custom habit goal successfully configured.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-2 animate-fade-in" id="goal-tracker-view">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-stone-900 dark:text-stone-50">
          Goals & Habits Center
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          Plan, track, and complete sustainable routine milestones. Build momentum to earn certified planetary badges.
        </p>
      </div>

      {success && (
        <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
          {success}
        </div>
      )}

      {/* Milestone Celebrations Box */}
      {recentEarnedBadge && (
        <div className="mb-6 p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/5 dark:bg-emerald-900/10 shadow-lg relative overflow-hidden animate-fade-in flex items-center justify-between" id="milestone-celebration-banner">
          <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none"></div>
          <div className="flex gap-4 items-center">
            <span className="text-4xl animate-bounce">🏆</span>
            <div>
              <span className="text-[10px] uppercase font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-450 px-2 py-0.5 rounded font-bold">Milestone Achievement Unlocked!</span>
              <h3 className="font-display font-extrabold text-stone-900 dark:text-stone-100 text-base mt-1.5 flex items-center gap-1.5">
                <span>Earned planetary badge: "{recentEarnedBadge.title}"!</span>
                <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
              </h3>
              <p className="text-[11.5px] text-stone-550 dark:text-stone-400 mt-1 leading-relaxed">
                {recentEarnedBadge.description}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono text-stone-400">Awarded recently</span>
          </div>
        </div>
      )}

      {/* Main split: active goals vs achievement trophy cabinet */}
      <div className="grid gap-8 lg:grid-cols-3">

        {/* Column 1 & 2: Habits lists, performance, streak protect, and custom form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Performance & Streak Protective Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Habit Performance Panel */}
            <div className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-md dark:border-stone-850 dark:bg-stone-900 flex flex-col justify-between" id="habit-performance-panel">
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-forest-700 dark:text-emerald-400 font-bold" />
                  <span>Habit Performance Metrics</span>
                </span>
                <p className="text-xs text-stone-400 dark:text-stone-550 leading-snug mt-1">
                  Compliance and completion statistics computed across your active carbon promises.
                </p>

                <div className="flex items-end justify-between mt-5">
                  <div>
                    <span className="text-3xl font-display font-extrabold text-stone-900 dark:text-stone-50 leading-none">
                      {adjustedCompletion}%
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 block mt-1 font-bold">
                      {adjustedCompletion >= 75 ? "★ HIGH COMPLIANCE" : adjustedCompletion >= 40 ? "✦ MODERATE COMPLIANCE" : "⚠ LOW COMPLIANCE"}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-stone-505 dark:text-stone-305 space-y-0.5">
                    <div>Completed: <strong>{completedGoals}</strong></div>
                    <div>On Track: <strong>{onTrackGoals}</strong></div>
                    <div>Inactive: <strong>{inactiveGoals}</strong></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${adjustedCompletion}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Streak Protection Panel */}
            <div className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-md dark:border-stone-850 dark:bg-stone-900 flex flex-col justify-between" id="streak-protection-panel">
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-amber-500" />
                  <span>Streak Protection Shield</span>
                </span>
                <p className="text-xs text-stone-400 dark:text-stone-550 leading-snug mt-1">
                  Safeguard active consecutive logged choices streak and protect progress records when away.
                </p>

                <div className="space-y-3 mt-4">
                  
                  {/* Freeze weekend shield */}
                  <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-950/60 p-2.5 rounded-xl border border-stone-150 dark:border-stone-850">
                    <div>
                      <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 block leading-tight">Weekend Freeze Shield</span>
                      <span className="text-[9.5px] text-stone-400">Protects active streaks on Sat & Sun</span>
                    </div>
                    <button 
                      onClick={() => handleToggleShield('weekend')}
                      className={`p-1 rounded cursor-pointer transition-colors ${weekendShield ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-300 dark:text-stone-705'}`}
                      id="btn-toggle-weekend-shield"
                    >
                      {weekendShield ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
                    </button>
                  </div>

                  {/* Travel protection shield */}
                  <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-950/60 p-2.5 rounded-xl border border-stone-150 dark:border-stone-850">
                    <div>
                      <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 block leading-tight">Travel Protection Shield</span>
                      <span className="text-[9.5px] text-stone-400">Freeze streaks during holiday periods</span>
                    </div>
                    <button 
                      onClick={() => handleToggleShield('travel')}
                      className={`p-1 rounded cursor-pointer transition-colors ${travelShield ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-300 dark:text-stone-705'}`}
                      id="btn-toggle-travel-shield"
                    >
                      {travelShield ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* Active Goals list cards */}
          <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-md dark:border-stone-850 dark:bg-stone-900">
            <h3 className="font-display font-bold text-stone-900 dark:text-stone-50 text-base mb-3 flex items-center justify-between">
              <span>My Active Habit Checklist</span>
              <span className="text-xs font-mono font-bold text-forest-600 bg-forest-50 dark:bg-forest-950/30 px-2 py-0.5 rounded uppercase">
                {goals.filter(g => g.status === 'active').length} Active
              </span>
            </h3>

            <div className="space-y-4">
              {goals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.progress / goal.targetValue) * 100));
                const isCompleted = goal.status === 'completed';
                return (
                  <div 
                    key={goal.id} 
                    className={`p-4 rounded-xl border transition-all ${
                      isCompleted 
                        ? 'border-emerald-200 bg-emerald-50/5 dark:border-emerald-950/30 dark:bg-emerald-950/5' 
                        : 'border-stone-150/60 hover:bg-stone-50/30 dark:border-stone-800'
                    }`}
                    id={`goal-progress-card-${goal.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="capitalize bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 text-[9px] font-bold font-mono px-2 py-0.5 rounded">
                            {goal.category}
                          </span>
                          {goal.streak > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-orange-600 dark:text-orange-400 text-[10px] font-bold">
                              <Flame className="h-3 w-3 fill-orange-600" />
                              <span>{goal.streak}x streak</span>
                            </span>
                          )}
                        </div>
                        <h4 className={`text-sm font-bold text-stone-900 dark:text-stone-50 mt-1.5 leading-tight ${isCompleted ? 'line-through text-stone-400 dark:text-stone-500' : ''}`}>
                          {goal.title}
                        </h4>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-stone-400 font-sans mt-1">
                          <span>CO₂ reduction: <span className="text-emerald-600 font-mono font-semibold">↓ {goal.estimatedReduction} kg/mo</span></span>
                          {goal.moneySaved ? <span>Financial save: <span className="font-mono text-stone-700 dark:text-stone-300 font-semibold">${goal.moneySaved}/mo</span></span> : null}
                        </div>
                      </div>

                      {/* Log Action trigger block */}
                      <div className="flex items-center gap-2">
                        {!isCompleted ? (
                          <button
                            id={`btn-log-goal-prog-${goal.id}`}
                            onClick={() => logGoalProgress(goal.id)}
                            className="bg-forest-600 hover:bg-forest-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Log Progress (+1)</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] uppercase font-bold font-mono bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-1 rounded">
                            <Check className="h-3.5 w-3.5" /> Completed
                          </span>
                        )}

                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Delete Goal"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress slider bar */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center text-[10px] text-stone-400 mb-1.5 font-mono font-bold">
                        <span>GAUGE PREVIEW</span>
                        <span>{goal.progress} / {goal.targetValue} TIMES COMPLETED</span>
                      </div>
                      <div className="h-2 w-full bg-stone-100 dark:bg-stone-850 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-forest-600'}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>
                );
              })}

              {goals.length === 0 && (
                <div className="p-12 text-center text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
                  <span className="text-2xl block mb-2 font-mono">🏆</span>
                  My habit center has no tasks assigned. Click on action Recommendations in the "Simulator" module to populate some!
                </div>
              )}
            </div>
          </div>

          {/* Quick Custom Goal Maker Form */}
          <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-md dark:border-stone-850 dark:bg-stone-900">
            <h3 className="font-display font-semibold text-stone-900 dark:text-stone-50 text-base mb-1">
              Add Custom Habit Goal
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Pencil down a personalized sustainability promise to yourself.
            </p>

            <form onSubmit={handleAddNewGoal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">Goal Title / Milestone Name</label>
                <input
                  id="input-new-goal-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Bring a canvas shopping tote to grocery stores"
                  className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-xs focus:border-forest-600 focus:outline-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                />
              </div>

              <div className="grid gap-3.5 sm:grid-cols-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">Category</label>
                  <select
                    id="select-new-goal-cat"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-xs focus:outline-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                  >
                    <option value="transport">Transport</option>
                    <option value="food">Food</option>
                    <option value="home">Home Energy</option>
                    <option value="shopping">Shopping</option>
                    <option value="waste">Waste</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">Monthly Target Occurrences</label>
                  <input
                    id="input-new-goal-target"
                    type="number"
                    min="1"
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-xs focus:outline-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">Est. CO₂ Reduction (kg/mo)</label>
                  <input
                    id="input-new-goal-reduce"
                    type="number"
                    min="1"
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-xs focus:outline-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                    value={newReduction}
                    onChange={(e) => setNewReduction(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">Est. Cash Saved ($/mo)</label>
                  <input
                    id="input-new-goal-save"
                    type="number"
                    min="0"
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-xs focus:outline-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:bg-stone-50 dark:focus:bg-stone-950"
                    value={newSavings}
                    onChange={(e) => setNewSavings(Number(e.target.value))}
                  />
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  id="btn-custom-goal-submit"
                  type="submit"
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white px-5 py-3 text-xs font-bold shadow-md cursor-pointer cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Build Custom Goal</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Column 3: Badges shelf */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-md dark:border-stone-850 dark:bg-stone-900">
            <h3 className="font-display font-semibold text-stone-900 dark:text-stone-50 text-base mb-1.5 flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-forest-600" />
              <span>Climate Milestone Shelf</span>
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-5">
              Earn distinct badges as you log positive carbon choices inside the tracker ledger.
            </p>

            <div className="grid gap-3">
              {badges.map((badge) => {
                const isEarned = !!badge.earnedAt;
                const prog = getBadgeProgress(badge.id);
                return (
                  <div 
                    key={badge.id}
                    className={`p-3.5 rounded-xl border flex flex-col gap-2.5 transition-all ${
                      isEarned 
                        ? 'border-indigo-100 bg-indigo-50/20 dark:border-indigo-900/30 dark:bg-indigo-950/10' 
                        : 'border-stone-200/60 bg-white dark:border-stone-850 dark:bg-stone-900/60 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Badge Emoji Circle */}
                      <div className={`h-11 w-11 rounded-full shrink-0 flex items-center justify-center text-xl shadow-xs select-none ${isEarned ? 'bg-indigo-50 dark:bg-indigo-900/40 animate-pulse' : 'bg-stone-100 dark:bg-stone-800'}`}>
                        {badge.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">{badge.title}</h4>
                          {isEarned && (
                            <span className="text-[9px] uppercase tracking-wider font-bold font-mono font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0 dark:bg-indigo-950 dark:text-indigo-400">
                              Earned
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 font-sans leading-snug mt-0.5">
                          {badge.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress Slider Line for Achievements */}
                    <div className="mt-1">
                      <div className="flex justify-between items-center text-[9px] font-mono font-bold text-stone-400 dark:text-stone-550 mb-1">
                        <span>{prog.current} / {prog.target} {prog.unit}</span>
                        <span>{prog.percent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-850 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isEarned ? 'bg-emerald-500' : 'bg-forest-600'}`}
                          style={{ width: `${prog.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
