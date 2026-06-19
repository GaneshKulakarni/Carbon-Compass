import React from 'react';
import { Compass, Leaf, Heart, Globe, Scale } from 'lucide-react';

interface FooterProps {
  onOpenMethodology: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenMethodology }) => {
  return (
    <footer className="border-t border-stone-200/60 bg-stone-100 text-stone-600 dark:border-stone-800/40 dark:bg-stone-900 dark:text-stone-400 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-600 text-white">
              <Compass className="h-4.5 w-4.5" />
            </div>
            <span className="font-display font-bold text-stone-900 dark:text-stone-50">
              Carbon <span className="text-forest-600 dark:text-forest-400">Compass</span>
            </span>
          </div>

          <p className="text-center text-xs text-stone-500 dark:text-stone-400 max-w-md sm:text-left leading-relaxed">
            Leading the path to a carbon-conscious lifestyle. Built for the Universal Climate Hackathon, utilizing standard greenhouse gas metrics.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium">
            <button
              id="btn-footer-methodology"
              onClick={onOpenMethodology}
              className="flex items-center space-x-1 hover:text-forest-600 dark:hover:text-forest-400 underline decoration-dotted underline-offset-4"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Emissions Factors & Methodology</span>
            </button>
            <a 
              href="https://ghgprotocol.org" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-forest-600 dark:hover:text-forest-400 hover:underline"
            >
              GHG Protocol
            </a>
          </div>

        </div>

        <div className="mt-8 border-t border-stone-200/50 pt-8 dark:border-stone-800/40 flex flex-col items-center justify-between gap-4 sm:flex-row text-[11px] text-stone-400 dark:text-stone-500">
          <p>© {new Date().getFullYear()} Carbon Compass. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
