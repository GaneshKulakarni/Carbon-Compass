import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Compass, ArrowRight, Award, Footprints, ClipboardList, Share2, Printer, CheckCircle, Download, Copy, Linkedin, Mail, MessageSquare, Check, Sparkles, Send } from 'lucide-react';

export const WeeklyReport: React.FC = () => {
  const { user, footprint, activityLogs, goals } = useApp();

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

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

  const shareText = `🌿 My Weekly Carbon Report was verified on Carbon Compass! 
🎯 Actual Emission: ${actualWeeklyEmission} kg CO2e (${weeklySavingsPercent}% lower than baseline!)
📉 Saved ↓ ${savedThisWeek} kg CO2e this week.
Ecosystem Growth State: ${savedThisWeek > 30 ? 'Growing Habitat' : 'Sprouting Seedling'}

See your digital Earth restored and calculate your footprint here: ${window.location.origin}`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleDownloadReport = () => {
    const verificationId = user?.name ? `${user.name.slice(0,3).toUpperCase()}_2026_WK` : 'COMP_2026_WK';
    const content = `==================================================
        C A R B O N   C O M P A S S   R E P O R T
==================================================
Climate Action Receipt: Verified Climate Milestone
Date: ${new Date().toLocaleDateString()}
User: ${user?.name || 'Alex'}
Persona Rank: ${user?.climatePersona || 'Everyday Reducer'}
Verification ID: ${verificationId}

---------------- SUMMARY METRICS ----------------
* Weekly Emission Actual:   ${actualWeeklyEmission} kg CO2e
* Weekly Savings Offset:    ${savedThisWeek} kg CO2e
* Baseline Comparison Ratio: ${weeklySavingsPercent}% Lower!
* Traced Activity Logs:     ${weeklyLogs.length} Actions Checked

--------------- ACTIVE PROMISES ---------------
${goals.length > 0 ? goals.map(g => `- [${g.progress}/${g.targetValue} Days Done] ${g.title} (↓ ${g.estimatedReduction} kg/mo)`).join('\n') : "No active goals tracked currently."}

==================================================
🌎 Track your ecological restoration progress in real-time.
==================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user?.name || 'Alex'}_Weekly_Carbon_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Weekly Carbon Compass Milestone',
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        console.log('Mobile share dismissed:', err);
      }
    } else {
      handleCopyText();
    }
  };

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
                <span className="text-3.5xl font-display font-extrabold text-stone-900 dark:text-white">
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

          {/* Habit Success Summary */}
          <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-xs dark:border-stone-850 dark:bg-stone-900 space-y-4" id="habit-success-summary-card">
            <h3 className="font-display font-bold text-stone-900 dark:text-stone-50 text-base mb-1.5 flex items-center justify-between">
              <span>Habit Success Summary</span>
              <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded">
                {goals.length} Promises Active
              </span>
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Real-time overview of active carbon pledges and recurring habit compliance streaks:
            </p>

            <div className="space-y-4 mt-2">
              {goals.map((goal) => {
                const progressPercent = Math.min(100, Math.round(((goal.progress || 0) / (goal.targetValue || 1)) * 100));
                return (
                  <div key={goal.id} className="p-3.5 bg-stone-50 dark:bg-stone-950/40 rounded-xl border border-stone-150 dark:border-stone-850 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold font-mono tracking-wider text-forest-700 dark:text-emerald-400 capitalize bg-forest-50 dark:bg-forest-950/30 px-1.5 py-0.2 rounded font-semibold">
                        {goal.category}
                      </span>
                      <h6 className="font-bold text-stone-850 dark:text-stone-100 flex items-center gap-1.5 pt-0.5">
                        <span>{goal.title}</span>
                      </h6>
                      <div className="flex gap-2 text-[10.5px] text-stone-400 mt-0.5 font-sans">
                        <span>Progress: <strong>{goal.progress}/{goal.targetValue}</strong></span>
                        <span>•</span>
                        <span>Streak: <strong>🔥 {goal.streak || 0} days</strong></span>
                      </div>
                    </div>

                    <div className="text-right space-y-1.5 shrink-0 ml-4">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">↓ {goal.estimatedReduction} kg/mo</span>
                      <div className="h-1.5 w-16 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {goals.length === 0 && (
                <div className="text-center py-8 text-stone-400 font-sans">
                  <span className="text-2xl block mb-2">⚡</span>
                  <p className="text-xs">No active goal promises. Set some choices on the Habit Simulator tab!</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Column 3: High-Fidelity Shareable & Downloadable Badge Card */}
        <div className="space-y-6" id="badge-share-sidebar">
          
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
              Screen-captured or downloadable climate certification receipt
            </div>

          </div>

          {/* Social Broadcast Interface Controls */}
          <div className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-xs dark:border-stone-850 dark:bg-stone-900 space-y-4" id="social-sharing-console">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest font-mono">
                Real-World Sharing Suite
              </h4>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed dark:text-stone-400 font-sans">
              Export your verified climate action metrics directly. Choose a real sharing method below:
            </p>

            {/* Interactive Feedback banners */}
            {copied && (
              <div className="p-2 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/20 text-[11px] rounded-lg font-medium flex items-center gap-1.5 animate-bounce-slow" id="copied-badge-popup">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>Verified clipping text copied to your clipboard! Ready to paste.</span>
              </div>
            )}

            {downloaded && (
              <div className="p-2 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-500/20 text-[11px] rounded-lg font-medium flex items-center gap-1.5 animate-bounce-slow" id="downloaded-badge-popup">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-500 animate-spin" />
                <span>Text Receipt `.txt` generated and saved successfully!</span>
              </div>
            )}

            {/* Primary Action Buttons: Copy / Download */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleCopyText}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 bg-white hover:bg-stone-55 hover:text-stone-900 dark:bg-stone-950 dark:text-stone-300 dark:hover:bg-stone-850 dark:hover:text-white transition shadow-xs cursor-pointer"
                title="Copy ready-formatted environmental post to clipboard"
                id="btn-copy-clipboard"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-stone-400" />}
                <span>{copied ? 'Copied!' : 'Copy Snippet'}</span>
              </button>

              <button
                onClick={handleDownloadReport}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-xl text-white bg-forest-600 hover:bg-forest-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                title="Download full textual climate badge receipt"
                id="btn-download-txt-receipt"
              >
                {downloaded ? <Check className="h-3.5 w-3.5 text-emerald-200" /> : <Download className="h-3.5 w-3.5" />}
                <span>{downloaded ? 'Saved!' : 'Download TXT'}</span>
              </button>
            </div>

            {/* Native Mobile Share Button */}
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 dark:bg-stone-950/40 dark:hover:bg-stone-900 dark:border-stone-800 dark:text-stone-200 transition cursor-pointer"
              id="btn-native-share-device"
            >
              <Share2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Smart Mobile Share API</span>
            </button>

            {/* Social Broadcast links */}
            <div className="border-t border-stone-150 dark:border-stone-850 pt-4 space-y-2.5">
              <span className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase block tracking-wider">
                Direct External Broadcast
              </span>

              <div className="grid grid-cols-3 gap-2">
                
                {/* LinkedIn Share */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleCopyText}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-sky-500/5 hover:bg-sky-500/10 border border-sky-500/10 dark:border-sky-500/20 text-sky-700 dark:text-sky-400 transition"
                  id="link-linkedin-share"
                  title="Share on LinkedIn (automatically copies text to clipboard first)"
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="text-[9px] font-bold mt-1">LinkedIn</span>
                </a>

                {/* WhatsApp Share */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition"
                  id="link-whatsapp-share"
                  title="Share on WhatsApp text template"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-[9px] font-bold mt-1">WhatsApp</span>
                </a>

                {/* Email share */}
                <a
                  href={`mailto:?subject=${encodeURIComponent('My Weekly Decarbonization Achievement score!')}&body=${encodeURIComponent(shareText)}`}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 transition"
                  id="link-email-share"
                  title="Send via Email Client"
                >
                  <Mail className="h-4 w-4" />
                  <span className="text-[9px] font-bold mt-1">Email</span>
                </a>

              </div>
            </div>

            <div className="text-[9px] text-stone-400 dark:text-stone-500 leading-relaxed italic bg-stone-50 dark:bg-stone-950/40 p-2.5 rounded-lg text-center font-serif">
              "LinkedIn shares will copy verified text metrics to your clipboard automatically so you can immediately paste it into your post writer."
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
