import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Goal } from '../types';
import { Award, Flame, Check, Plus, Trash2, ShieldCheck, HelpCircle, Sparkles } from 'lucide-react';

export const GoalTracker: React.FC = () => {
  const { goals, setGoals, badges, logGoalProgress, toggleGoalStatus } = useApp();
  
  // Custom goal parameters
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'transport' | 'food' | 'home' | 'shopping' | 'waste'>('transport');
  const [newTarget, setNewTarget] = useState<number>(4);
  const [newReduction, setNewReduction] = useState<number>(20);
  const [newSavings, setNewSavings] = useState<number>(10);
  const [success, setSuccess] = useState('');

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

      {/* Main split: active goals vs achievement trophy cabinet */}
      <div className="grid gap-8 lg:grid-cols-3">

        {/* Column 1 & 2: Habits lists and custom form */}
        <div className="lg:col-span-2 space-y-6">

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
                  className="w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs focus:border-forest-600 focus:bg-white focus:outline-hidden dark:bg-stone-950 dark:border-stone-850"
                />
              </div>

              <div className="grid gap-3.5 sm:grid-cols-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">Category</label>
                  <select
                    id="select-new-goal-cat"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs focus:outline-hidden dark:bg-stone-950 dark:border-stone-850"
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
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs focus:outline-hidden dark:bg-stone-950"
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
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs focus:outline-hidden dark:bg-stone-950"
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
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs focus:outline-hidden dark:bg-stone-950"
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
                return (
                  <div 
                    key={badge.id}
                    className={`p-3 rounded-xl border flex items-center gap-3.5 transition-all ${
                      isEarned 
                        ? 'border-indigo-100 bg-indigo-50/20 dark:border-indigo-900/30 dark:bg-indigo-950/10' 
                        : 'border-stone-100 opacity-55 dark:border-stone-850'
                    }`}
                  >
                    {/* Badge Emoji Circle */}
                    <div className={`h-11 w-11 rounded-full shrink-0 flex items-center justify-center text-xl shadow-xs select-none ${isEarned ? 'bg-indigo-50 dark:bg-indigo-900/40 animate-pulse' : 'bg-stone-100 dark:bg-stone-800'}`}>
                      {badge.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-stone-905 dark:text-stone-100 truncate">{badge.title}</h4>
                        {isEarned && (
                          <span className="text-[9px] uppercase tracking-wider font-bold font-mono font-semibold text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded shrink-0 dark:bg-indigo-950 dark:text-indigo-400">
                            Earned
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 dark:text-stone-500 font-sans leading-tight mt-0.5">
                        {badge.description}
                      </p>
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
