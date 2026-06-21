import React, { useEffect, useRef } from 'react';
import { X, ShieldAlert, Globe, Scale } from 'lucide-react';
import { EMISSION_FACTORS, EMISSION_FACTORS_METADATA } from '../constants/emissions';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Keyboard focus trap & Escape key dismiss for accessibility (WCAG AA Compliance)
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore later
    const previousActive = document.activeElement as HTMLElement;

    // Query all focusable tags
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modalRef.current?.querySelectorAll(focusableSelector);
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus to button that opened it
      if (previousActive) {
        previousActive.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="methodology-modal-title"
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-100 dark:border-stone-800 animate-slide-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        id="methodology-modal-container"
      >
        {/* Header decoration */}
        <div className="px-6 py-5 bg-stone-50 dark:bg-stone-850 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-100 text-forest-700 dark:bg-forest-900 dark:text-forest-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 id="methodology-modal-title" className="text-lg font-display font-bold text-stone-900 dark:text-stone-50">Calculation Methodology</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-[-2px]">How we compute Carbon Compass metrics</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            aria-label="Close calculation methodology modal"
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 text-sm text-stone-600 dark:text-stone-300">
          
          {/* Scientific Disclaimer */}
          <div className="flex items-start space-x-3.5 rounded-xl bg-amber-50/70 border border-amber-200/50 p-4.5 dark:bg-amber-950/20 dark:border-amber-900/30">
            <ShieldAlert className="h-5 w-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-amber-900 dark:text-amber-400 text-sm">Empowering Guidance, Not Direct Auditing</h4>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-xs">
                These calculations are rule-based estimates derived from household behavior templates, average geographic emissions profiles, and common spending behavior indices. They represent a representative guidance proxy rather than a scientific micro-audit, designed specifically to inspire immediate habit transformations and actionable personal reduction targets.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            
            {/* Category 1: Commute & Flight Factors */}
            <div className="rounded-xl border border-stone-200/50 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/50">
              <h5 className="font-display font-semibold text-stone-900 dark:text-stone-50 flex items-center space-x-2 border-b border-stone-100 dark:border-stone-800 pb-2 mb-3">
                <span className="text-forest-600 font-mono">🚙</span>
                <span>Transport & Travel (CO₂e / km)</span>
              </h5>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between">
                  <span>Standard Fuel Car</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.transport.car_petrol} kg</span>
                </li>
                <li className="flex justify-between">
                  <span>Hybrid Commuter Car</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.transport.car_hybrid} kg</span>
                </li>
                <li className="flex justify-between">
                  <span>Electric Vehicle (EV)</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.transport.car_electric} kg</span>
                </li>
                <li className="flex justify-between">
                  <span>Metro Subway or Bus</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.transport.bus_or_train} kg</span>
                </li>
                <li className="flex justify-between">
                  <span>Short Flight (&lt; 3hr)</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.transport.flight_short} kg / trip</span>
                </li>
                <li className="flex justify-between">
                  <span>Long-Haul Flight (&gt; 3hr)</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.transport.flight_long} kg / trip</span>
                </li>
              </ul>
            </div>

            {/* Category 2: Dietary Footprints */}
            <div className="rounded-xl border border-stone-200/50 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/50">
              <h5 className="font-display font-semibold text-stone-900 dark:text-stone-50 flex items-center space-x-2 border-b border-stone-100 dark:border-stone-800 pb-2 mb-3">
                <span className="text-forest-600 font-mono">🥩</span>
                <span>Dietary Choices (CO₂e / meal)</span>
              </h5>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between">
                  <span>Beef or Lamb Meal</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.food.beef_lamb} kg</span>
                </li>
                <li className="flex justify-between">
                  <span>Poultry, Pork, or Fish</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.food.poultry_pork} kg</span>
                </li>
                <li className="flex justify-between">
                  <span>Vegetarian Meal</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.food.vegetarian} kg</span>
                </li>
                <li className="flex justify-between">
                  <span>Vegan / Fully Plant Meal</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.food.vegan} kg</span>
                </li>
                <li className="flex justify-between">
                  <span>Dairy-Heavy Day extra</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">+{EMISSION_FACTORS.food.dairy_heavy_day} kg</span>
                </li>
              </ul>
            </div>

            {/* Category 3: Home & Electrical factors */}
            <div className="rounded-xl border border-stone-200/50 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/50">
              <h5 className="font-display font-semibold text-stone-900 dark:text-stone-50 flex items-center space-x-2 border-b border-stone-100 dark:border-stone-800 pb-2 mb-3">
                <span className="text-forest-600 font-mono">⚡</span>
                <span>Home Utility Carbon</span>
              </h5>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between">
                  <span>Standard Fuel Grid electricity</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.home.electricity_standard} kg / kWh</span>
                </li>
                <li className="flex justify-between">
                  <span>Clean/Renewable Utility Grid</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.home.electricity_clean} kg / kWh</span>
                </li>
                <li className="flex justify-between">
                  <span>AC Cooling Utility per hour</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.home.ac_cooling_hr} kg / hr</span>
                </li>
                <li className="flex justify-between">
                  <span>Hot Water Washing Cycle</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.home.laundry_hot_wash} kg / load</span>
                </li>
                <li className="flex justify-between">
                  <span>Cold Water Washing Cycle</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.home.laundry_cold_wash} kg / load</span>
                </li>
              </ul>
            </div>

            {/* Category 4: Consuming & Offsets */}
            <div className="rounded-xl border border-stone-200/50 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/50">
              <h5 className="font-display font-semibold text-stone-900 dark:text-stone-50 flex items-center space-x-2 border-b border-stone-100 dark:border-stone-800 pb-2 mb-3">
                <span className="text-forest-600 font-mono">📦</span>
                <span>Shopping & Waste Offsets</span>
              </h5>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between">
                  <span>Fast Fashion clothing piece</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.shopping.clothing_item} kg</span>
                </li>
                <li className="flex justify-between">
                  <span>Major electronic device</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.shopping.electronics_major} kg</span>
                </li>
                <li className="flex justify-between">
                  <span>Online courier shipment delivery</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.shopping.online_order_delivery} kg</span>
                </li>
                <li className="flex justify-between">
                  <span>Unrecycled landfill waste bag</span>
                  <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{EMISSION_FACTORS.waste.landfill_bag} kg</span>
                </li>
                <li className="flex justify-between text-forest-600 dark:text-forest-400">
                  <span>Recycling offset (carbon saved)</span>
                  <span className="font-semibold font-mono">{EMISSION_FACTORS.waste.recycling_offset} kg / bag</span>
                </li>
                <li className="flex justify-between text-forest-600 dark:text-forest-400">
                  <span>Composting offset (carbon saved)</span>
                  <span className="font-semibold font-mono">{EMISSION_FACTORS.waste.compost_offset} kg / kg</span>
                </li>
              </ul>
            </div>

            {/* Scientific Provenance Table */}
            <div className="rounded-xl border border-stone-200/50 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/50 md:col-span-2">
              <h5 className="font-display font-semibold text-stone-900 dark:text-stone-50 flex items-center space-x-2 border-b border-stone-100 dark:border-stone-800 pb-2 mb-3">
                <Globe className="h-4.5 w-4.5 text-forest-600 animate-pulse" />
                <span>Unified Factor Provenance & Citation Ledger</span>
              </h5>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-stone-850 text-stone-400 font-mono uppercase">
                      <th className="py-2">Category</th>
                      <th className="py-2">Coefficient Source Citation</th>
                      <th className="py-2">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 dark:divide-stone-850 text-stone-600 dark:text-stone-300 font-sans">
                    <tr>
                      <td className="py-2 font-bold">Transport (Petrol Cars)</td>
                      <td className="py-2">{EMISSION_FACTORS_METADATA.transport.car_petrol.citation}</td>
                      <td className="py-2 font-mono">{EMISSION_FACTORS_METADATA.transport.car_petrol.lastUpdated}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold">Transport (Transit / Bus)</td>
                      <td className="py-2">{EMISSION_FACTORS_METADATA.transport.bus_or_train.citation}</td>
                      <td className="py-2 font-mono">{EMISSION_FACTORS_METADATA.transport.bus_or_train.lastUpdated}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold">Diet (Beef / Lamb Meals)</td>
                      <td className="py-2">{EMISSION_FACTORS_METADATA.food.beef_lamb.citation}</td>
                      <td className="py-2 font-mono">{EMISSION_FACTORS_METADATA.food.beef_lamb.lastUpdated}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold">Home Grid Power (US/IN Average)</td>
                      <td className="py-2">{EMISSION_FACTORS_METADATA.home.electricity_standard.citation}</td>
                      <td className="py-2 font-mono">{EMISSION_FACTORS_METADATA.home.electricity_standard.lastUpdated}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold">Waste (Landfill Decay Bag)</td>
                      <td className="py-2">{EMISSION_FACTORS_METADATA.waste.landfill_bag.citation}</td>
                      <td className="py-2 font-mono">{EMISSION_FACTORS_METADATA.waste.landfill_bag.lastUpdated}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className="border-t border-stone-100 dark:border-stone-800 pt-5 space-y-3">
            <h5 className="font-display font-bold text-stone-900 dark:text-stone-50 flex items-center space-x-2">
              <Globe className="h-4.5 w-4.5 text-forest-600" />
              <span>International Baseline Data Sources</span>
            </h5>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Standard references are extracted dynamically from public environmental frameworks, including the Greenhouse Gas Protocol (GHGP), DEFRA UK Greenhouse Gas Conversion Factors, and regional utility grid calculators issued by the US Environmental Protection Agency (eGRID).
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-850 border-t border-stone-100 dark:border-stone-800 flex justify-end shrink-0">
          <button
            id="btn-methodology-dismiss"
            onClick={onClose}
            className="rounded-xl bg-forest-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-forest-600/10 hover:bg-forest-700 transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
