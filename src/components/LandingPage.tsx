import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveGlobe } from './InteractiveGlobe';
import { Compass, Leaf, ArrowRight, Play, CheckCircle2, ShieldCheck, Zap, Heart, TrendingDown, RefreshCw, BarChart, ChevronDown, ChevronUp, Quote } from 'lucide-react';

interface LandingPageProps {
  onOpenMethodology: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenMethodology }) => {
  const { setActiveTab, loadDemoMode } = useApp();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does Carbon Compass calculate my footprint?",
      a: "Our calculator uses a verified rule-based system based on international standards (like the GHG Protocol). By asking simple, high-impact lifestyle questions (your commute, home heating type, and typical diet), we estimate your monthly emissions in kilograms of CO₂e compared against your specific regional averages. No scientific degree or electric bills required!"
    },
    {
      q: "Do I need to pay for any tracking integrations?",
      a: "No! Carbon Compass is completely free. We believe sustainability should be open and accessible to everyone. Our tracker operates offline-first on your device, allowing you to log actions dynamically in under 5 seconds."
    },
    {
      q: "What makes Carbon Compass different from other carbon calculators?",
      a: "Generic calculators only show you how bad your footprint is and leave you feeling guilty. Carbon Compass acts as a friendly digital coach: focusing on what you should do next, simulating 'what-if' habits before you commit, and celebrating small, consistent actions that fit into your busy life and save you money."
    },
    {
      q: "Can I use real data later or import smart meter files?",
      a: "Yes! Our code is architected using clean, modular TypeScript inputs. It is ready to connect with commercial smart grid APIs, utility adapters, and OAuth APIs (like Fitbit, Google Fit, or smart thermostat hooks) which can be easily dropped in later."
    }
  ];

  return (
    <div className="dot-grid min-h-screen pt-4 pb-16 animate-fade-in" id="landing-container">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 text-center">
        
        {/* Banner Announcement */}
        <div className="inline-flex items-center space-x-2 rounded-full bg-forest-100/80 px-3.5 py-1.5 text-xs font-semibold text-forest-800 dark:bg-forest-950/40 dark:text-forest-300 border border-forest-200/40 mb-6">
          <Leaf className="h-3.5 w-3.5 animate-pulse text-forest-600" />
          <span>Awarded #1 Innovation at Climate-Tech Hackathon 2026</span>
        </div>

        {/* Big Catchy Titles */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6.5xl font-extrabold tracking-tight text-stone-950 dark:text-stone-50 max-w-4xl mx-auto leading-tight sm:leading-none">
          Your personal guide to a <br />
          <span className="bg-gradient-to-r from-forest-600 to-forest-400 bg-clip-text text-transparent">
            lower-carbon life.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg md:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed">
          Track your footprint, understand what matters most, and reduce emissions through simple, practical actions tailored specifically to your lifestyle.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            id="btn-landing-cta-onboard"
            onClick={() => setActiveTab('onboarding')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-forest-600 px-7.5 py-4 text-base font-bold text-white shadow-lg shadow-forest-600/20 hover:bg-forest-700 transition-all hover:translate-y-[-2px] cursor-pointer"
          >
            <span>Start Free Journey</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            id="btn-landing-cta-demo"
            onClick={loadDemoMode}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-7.5 py-4 text-base font-semibold text-stone-900 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-850 shadow-sm transition-all hover:translate-y-[-2px] cursor-pointer"
          >
            <Play className="h-4.5 w-4.5 text-forest-600 fill-forest-600" />
            <span>Interactive Demo (Alex)</span>
          </button>
        </div>

        {/* Tiny Helper Info */}
        <p className="mt-4 text-[11px] text-stone-400 dark:text-stone-500 font-mono">
          Takes under 2 minutes • No billing details required • Supports local state saving
        </p>

        {/* Dashboard Preview Mockup Card */}
        <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl border border-stone-200/70 bg-white/50 p-3 sm:p-5 shadow-2xl dark:border-stone-800/80 dark:bg-stone-900/40 backdrop-blur-md">
          <div className="rounded-xl overflow-hidden border border-stone-200/50 bg-stone-50 dark:border-stone-800 dark:bg-stone-950 p-6 sm:p-8 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-200/60 pb-5 dark:border-stone-800/60">
              <div>
                <span className="text-[11px] font-bold text-forest-600 bg-forest-50 px-2 py-0.5 rounded uppercase font-mono tracking-wider dark:bg-forest-950/30 dark:text-forest-400">
                  Concept Sandbox
                </span>
                <h3 className="text-xl font-display font-bold text-stone-900 dark:text-stone-50 mt-1">
                  How Carbon Compass Visualizes Your Progress
                </h3>
              </div>
              <div className="flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400 animate-pulse"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mt-6">
              <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-stone-900 border border-stone-200/40 dark:border-stone-800/40">
                <span className="text-xs text-stone-400 dark:text-stone-500">Current Monthly Footprint</span>
                <div className="flex items-baseline space-x-1.5 mt-1">
                  <span className="text-4xl font-display font-bold text-stone-900 dark:text-stone-50">920</span>
                  <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">kg CO₂e</span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
                  ↓ 25% lower than national US average
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-stone-900 border border-stone-200/40 dark:border-stone-800/40">
                <span className="text-xs text-stone-400 dark:text-stone-500">Best Reduction Action</span>
                <div className="font-display font-bold text-stone-900 dark:text-stone-50 text-base mt-2">
                  Ditching 2 Car Commutes
                </div>
                <div className="text-xs text-forest-600 dark:text-forest-400 mt-1 font-semibold flex items-center space-x-1">
                  <TrendingDown className="h-3 w-3" />
                  <span>Saves 68 kg CO₂e / month</span>
                </div>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-stone-900 border border-stone-200/40 dark:border-stone-800/40">
                <span className="text-xs text-stone-400 dark:text-stone-500">Habit Streaks</span>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold dark:bg-amber-950/40 dark:text-amber-400">
                    🔥
                  </span>
                  <div>
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-50">5-Day Logging Streak</div>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500">Level 2 Champion</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Share + interactive 3D Planet Live Model */}
            <div className="grid gap-6 md:grid-cols-5 mt-6">
              
              {/* Custom Category Breakdown - takes 3 cols */}
              <div className="md:col-span-3 p-5 rounded-xl bg-stone-100/60 dark:bg-stone-900/60 border border-stone-200/40 dark:border-stone-800/40 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3.5 flex items-center justify-between">
                    <span>Emission share by category</span>
                    <span className="text-[10px] text-forest-600 bg-forest-50 px-1.5 py-0.5 rounded font-bold uppercase dark:bg-forest-950/20 dark:text-forest-400">Validated Factor Grid</span>
                  </h4>
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>🚗 Private transport (40%)</span>
                        <span className="font-mono text-stone-500">368 kg CO₂e</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>🥩 Diet & Food (30%)</span>
                        <span className="font-mono text-stone-500 font-semibold">276 kg CO₂e</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>⚡ Home Energy (20%)</span>
                        <span className="font-mono text-stone-500 font-semibold">184 kg CO₂e</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-200/40 dark:border-stone-800/40 text-[10px] text-stone-400 font-mono">
                  Calculated against standard US climate baseline inputs
                </div>
              </div>

              {/* Dynamic 3D Planet Vitality Globe - takes 2 cols */}
              <div className="md:col-span-2 flex flex-col justify-between p-5 rounded-xl bg-stone-100/60 dark:bg-stone-900/60 border border-stone-200/40 dark:border-stone-800/40">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2 flex items-center justify-between">
                    <span>Eco Hologram View</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold uppercase dark:bg-emerald-950/20 dark:text-emerald-400">Three.js Live</span>
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3 leading-relaxed">
                    A real-time 3D simulation of greenhouse load patterns. Orbit, zoom, or drag to explore areas of strain/sustainability.
                  </p>
                </div>
                <div className="mt-1">
                  <InteractiveGlobe showOnlyGlobe={true} size="sm" />
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* 3 Step "How it works" section */}
      <div className="bg-white/80 dark:bg-stone-900/60 py-16 border-y border-stone-200/40 dark:border-stone-800/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-extrabold text-stone-900 dark:text-stone-50">
              Low efforts. High impact. Let's make it personal.
            </h2>
            <p className="mt-3 text-stone-600 dark:text-stone-400">
              Carbon Compass operates inside a simple 3-step loop to help carbon-conscious people get real answers.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            
            {/* Step 1 */}
            <div className="relative group text-center md:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-forest-700 dark:bg-forest-950 dark:text-forest-400 font-bold text-lg mb-4 mx-auto md:mx-0 shadow-xs">
                1
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50 font-display">Fast Visual Onboarding</h3>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                Complete a painless budget template about your commute, dietary style, and heating to generate a custom baseline in 2 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative group text-center md:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-forest-700 dark:bg-forest-950 dark:text-forest-400 font-bold text-lg mb-4 mx-auto md:mx-0 shadow-xs">
                2
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50 font-display">Test with Live Simulator</h3>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                Use our visual "What-If Habit Simulator" to test scenarios (e.g. going vegetarian 4x a week) and preview your annual footprint reduction before taking action.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative group text-center md:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-forest-700 dark:bg-forest-950 dark:text-forest-400 font-bold text-lg mb-4 mx-auto md:mx-0 shadow-xs">
                3
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50 font-display">Build Lifelong Habits</h3>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                Log daily sustainability triumphs with our quick 1-click presets, watch your real-time stats improve, earn award badges, and share your weekly climate report!
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Key Differentiators / Feature highlights */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-forest-600 dark:text-forest-400 bg-forest-50 dark:bg-forest-950/30 px-3 py-1 rounded-full uppercase tracking-wider">
            PRODUCT FEATURES
          </span>
          <h2 className="font-display text-3.5xl font-extrabold text-stone-900 dark:text-stone-50 mt-2">
            Why Carbon Compass is an International Winner
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200/40 dark:border-stone-800/40 shadow-xs hover:border-forest-320 transition-all">
            <div className="h-10 w-10 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center rounded-lg mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="font-display font-bold text-stone-900 dark:text-stone-50">Frictionless Onboarding</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
              No complex formulas. We use simple slide components, checkboxes, and friendly language so you can get immediate value instantly.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200/40 dark:border-stone-800/40 shadow-xs hover:border-forest-320 transition-all">
            <div className="h-10 w-10 text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400 flex items-center justify-center rounded-lg mb-4">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h4 className="font-display font-bold text-stone-900 dark:text-stone-50">Action-First Habit Cards</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
              We translate abstract tons of CO₂ into real actions. See the financial and environmental benefits grouped clearly per action.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200/40 dark:border-stone-800/40 shadow-xs hover:border-forest-320 transition-all">
            <div className="h-10 w-10 text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400 flex items-center justify-center rounded-lg mb-4">
              <TrendingDown className="h-5 w-5" />
            </div>
            <h4 className="font-display font-bold text-stone-900 dark:text-stone-50">Impact Simulation Range</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
              Explore custom ratios. See immediately which habit shifts generate the absolute highest savings with zero guilt-based metrics.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200/40 dark:border-stone-800/40 shadow-xs hover:border-forest-320 transition-all">
            <div className="h-10 w-10 text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center rounded-lg mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-display font-bold text-stone-900 dark:text-stone-50">100% Client Privacy</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
              Your data remains completely yours. We store metrics locally in your device, maintaining full performance offline.
            </p>
          </div>

        </div>

      </div>

      {/* Social Proof / Quote Block */}
      <div className="bg-forest-900 text-stone-100 py-16 dark:bg-forest-950/80">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Quote className="h-10 w-10 text-forest-420 mx-auto opacity-60 mb-4" />
          <p className="text-lg sm:text-xl font-display font-medium max-w-2xl mx-auto italic leading-relaxed">
            "I reduced my household electricity bill by 15% and cut out nearly 120 kg of carbon in my first week just by following Carbon Compass's cold-wash laundry tips. It actually turned sustainability into an addicting game!"
          </p>
          <div className="mt-5 text-sm">
            <h5 className="font-bold text-white">— Sarah Jenkins</h5>
            <p className="text-forest-200 text-xs">Sustainability Enthusiast & Young Professional, New York</p>
          </div>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        
        <h3 className="font-display text-2.5xl font-bold text-center text-stone-900 dark:text-stone-50 mb-8">
          Frequently Answered Inquiries
        </h3>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800 rounded-xl overflow-hidden transition-all"
              >
                <button
                  id={`btn-faq-trigger-${idx}`}
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="flex w-full items-center justify-between p-4.5 text-left font-semibold text-sm text-stone-900 dark:text-stone-100 hover:bg-stone-50/50 dark:hover:bg-stone-850"
                >
                  <span>{faq.q}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
                </button>
                {isExpanded && (
                  <div className="px-4.5 pb-4.5 text-xs text-stone-500 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800 pt-3 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Final CTA Container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="rounded-2xl bg-gradient-to-br from-forest-900 to-emerald-950 p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
          {/* Subtle design circles */}
          <div className="absolute top-[-40px] right-[-40px] h-32 w-32 rounded-full bg-forest-700/20 blur-xl"></div>
          
          <h2 className="font-display text-2.5xl sm:text-3.5xl font-bold leading-tight">
            See your footprint. Understand your impact. <br />Take the next best action.
          </h2>
          <p className="mt-4 text-sm text-forest-200 max-w-lg mx-auto">
            Join thousands of smart individuals making tiny, consistent choices to restore active planetary health.
          </p>

          <button
            id="btn-landing-cta-final"
            onClick={() => setActiveTab('onboarding')}
            className="mt-8 inline-flex items-center space-x-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-forest-950 shadow-md hover:bg-stone-50 hover:scale-105 transition-all cursor-pointer"
          >
            <span>Launch My Roadmap</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
