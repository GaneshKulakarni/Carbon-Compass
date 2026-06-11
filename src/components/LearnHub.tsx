import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, Lightbulb, Compass, Heart, Scale } from 'lucide-react';

export const LearnHub: React.FC = () => {
  const [activeMyth, setActiveMyth] = useState<number | null>(0);

  const myths = [
    {
      m: "Myth: Going paperless saves more carbon than eating vegetarian.",
      f: "Fact: Food production accounts for nearly 26% of all global greenhouse gases. Enjoying vegetarian alternatives 3 days a week shrinks your footprint by roughly 350 kg CO₂e annually. Paperless billing, while fantastic for reducing local solid garbage, offsets less than 3 kg annually. Food has a far higher carbon punch!"
    },
    {
      m: "Myth: Electric vehicles (EV) are 100% emission-free right away.",
      f: "Fact: While EVs dramatically slash tailpipe emissions, their lifecycle carbon depends heavily on the utility grid power charging them. An EV charging on a coal-heavy grid offsets less than one on a wind/solar contract. However, EVs still remain at least 50% more efficient than conventional direct liquid-fuel vehicles!"
    },
    {
      m: "Myth: Extreme lifestyle changes are the only way to save the planet.",
      f: "Fact: Consistency overrides extreme limits. If millions of people swap 2 car drives per week and avoid 2 beef meals, it saves more carbon than a handful of folks going fully Zero-Waste immediately. Carbon Compass prioritizes small, low-friction, budget-friendly everyday wins!"
    },
    {
      m: "Myth: Plastic recycling is our biggest climate mitigation.",
      f: "Fact: Waste represents under 3% of an individual's average annual footprint, whereas transport commuting and flight mileage average over 35%. While recycling prevents toxic land dump decay, routing your focus toward EV charging, bus commutes, and grid efficiency saves 100x more carbon!"
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-2 animate-fade-in" id="learn-hub-view">
      
      {/* Headers */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-stone-900 dark:text-stone-50">
          Climate Insights & Myths Hub
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          Deconstruct standard misconceptions and discover the actual weights behind routine sustainability behaviors.
        </p>
      </div>

      {/* Grid: Main definitions block vs Myth expander */}
      <div className="grid gap-8 lg:grid-cols-3">

        {/* Column 1 & 2: Conceptual Definitions and Highlights */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: What is my carbon footprint anyway? */}
          <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-md dark:border-stone-850 dark:bg-stone-900 space-y-3">
            <h3 className="font-display font-semibold text-stone-905 dark:text-stone-50 text-base flex items-center gap-1.5">
              <BookOpen className="h-4.5 w-4.5 text-forest-600" />
              <span>What is a Carbon Footprint?</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans mt-2">
              A carbon footprint is the cumulative quantity of greenhouse gases—primarly carbon dioxide (<span className="font-mono">CO₂</span>) and methane—released into the earth's atmosphere because of our daily activities. We measure these outputs in kilograms of carbon dioxide equivalents (<span className="font-mono font-bold">kg CO₂e</span>) to match heat-trapping potentials neatly.
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              Every transport ride you take, heating system you program, and package shipment you order consumes fossil energy, creating an invisible trail.
            </p>
          </div>

          {/* Cards list: Why categories matter */}
          <div className="grid gap-4.5 sm:grid-cols-2">

            {/* Travel metrics card */}
            <div className="rounded-xl border border-stone-150 bg-stone-50/50 p-5 dark:border-stone-800 dark:bg-stone-900/50">
              <span className="text-lg leading-none">🚗</span>
              <h4 className="font-display font-semibold text-stone-900 dark:text-stone-105 text-sm mt-2">Why Commuting Ranks Highest</h4>
              <p className="text-[11px] text-stone-400 leading-relaxed mt-2 font-sans">
                Burning gas in single passenger cars emits roughly 220g of carbon per kilometer. Converting just 2 commutes per week to public transit or cycling avoids 68kg of atmosphere carbon each month—making transport your highest direct lever!
              </p>
            </div>

            {/* Food metrics card */}
            <div className="rounded-xl border border-stone-150 bg-stone-50/50 p-5 dark:border-stone-800 dark:bg-stone-900/50">
              <span className="text-lg leading-none">🥩</span>
              <h4 className="font-display font-semibold text-stone-900 dark:text-stone-105 text-sm mt-2">The Hidden Diet Multiplier</h4>
              <p className="text-[11px] text-stone-400 leading-relaxed mt-2 font-sans">
                Ruminant livestock (like beef and lamb) require significant pasture clearance lands and release direct methane gas. Swapping out a single beef meal for a vegetarian dish saves energy equivalent to running your home's smart TV for 70 hours!
              </p>
            </div>

            {/* Home utility metrics */}
            <div className="rounded-xl border border-stone-150 bg-stone-50/50 p-5 dark:border-stone-800 dark:bg-stone-900/50">
              <span className="text-lg leading-none">⚡</span>
              <h4 className="font-display font-semibold text-stone-900 dark:text-stone-105 text-sm mt-2">Grid Leakage & Heating Spikes</h4>
              <p className="text-[11px] text-stone-400 leading-relaxed mt-2 font-sans">
                Roughly 40% of standard household electricity is tied to fossil heating and high-load A/C running. Setting cooling thermostat settings just 1°C higher or utilizing cold water wash laundry cycles bypasses high utilities billing and grid peaks.
              </p>
            </div>

            {/* Composting info */}
            <div className="rounded-xl border border-stone-150 bg-stone-50/50 p-5 dark:border-stone-800 dark:bg-stone-900/50">
              <span className="text-lg leading-none">♻️</span>
              <h4 className="font-display font-semibold text-stone-900 dark:text-stone-105 text-sm mt-2">Composting vs Landfill rot</h4>
              <p className="text-[11px] text-stone-400 leading-relaxed mt-2 font-sans">
                When organic food waste rots packed tightly inside landfills without oxygen, it creates heavy methane gas. Composting, on the other hand, reacts with air to bind carbon nutrients directly back to local planter soils with zero methane!
              </p>
            </div>

          </div>

        </div>

        {/* Column 3: Collapsible Myth vs Fact cards */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-md dark:border-stone-850 dark:bg-stone-900">
            <h3 className="font-display font-semibold text-stone-900 dark:text-stone-50 text-base mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="h-4.5 w-4.5 text-amber-500" />
              <span>Interactive Myth busters</span>
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Explore common sustainability misconceptions by toggling the cards below.
            </p>

            <div className="space-y-3">
              {myths.map((myth, idx) => {
                const isActive = activeMyth === idx;
                return (
                  <div 
                    key={idx}
                    className="border border-stone-150 dark:border-stone-800 rounded-xl overflow-hidden transition-all text-xs"
                    id={`myth-fact-card-${idx}`}
                  >
                    <button
                      onClick={() => setActiveMyth(isActive ? null : idx)}
                      className="flex w-full justify-between items-center p-3.5 text-left font-bold text-stone-850 dark:text-stone-100 bg-stone-50/50 dark:bg-stone-950/20 hover:bg-stone-100/40"
                    >
                      <span className="leading-tight">{myth.m}</span>
                      {isActive ? <ChevronUp className="h-4 w-4 text-stone-400 ml-1.5" /> : <ChevronDown className="h-4 w-4 text-stone-400 ml-1.5" />}
                    </button>
                    {isActive && (
                      <div className="p-3.5 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed bg-white dark:bg-stone-900 animate-fade-in font-sans">
                        {myth.f}
                      </div>
                    )}
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
