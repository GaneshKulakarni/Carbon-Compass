import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Laugh, 
  Sparkles, 
  RefreshCw, 
  HelpCircle, 
  BookOpen, 
  ThumbsUp, 
  Flame, 
  Wand2, 
  CheckCircle, 
  Check, 
  Share2, 
  Twitter, 
  Heart, 
  X,
  Plus
} from 'lucide-react';
import busMemeImg from '../assets/bus_meme.jpg';
import beachMemeImg from '../assets/beach_meme.png';
import soldiersMemeImg from '../assets/soldiers_meme.png';

interface EnvironmentalMeme {
  id: string;
  title: string;
  themeTopic: string;
  category: 'wholesome' | 'educational' | 'environmental' | 'physics';
  templateType: 'bus' | 'beach' | 'soldiers' | 'two-panel' | 'classic' | 'drake' | 'distracted' | 'modern-card';
  imageUrl: string;
  emojiSetup: string;
  topCaption: string;
  bottomCaption: string;
  
  // Custom templates texts
  drakeRejectText?: string;
  drakeAcceptText?: string;
  boyfriendLooksAt?: string;
  boyfriendIgnores?: string;
  boyfriendLabel?: string;
  panelLeftTitle?: string;
  panelLeftText?: string;
  panelRightTitle?: string;
  panelRightText?: string;
  socialText?: string;
  
  funnyPunchline: string;
  educationalFact: string;
  solutionTip: string;
  upvotes?: number;
  imageUrlOrDescription?: string;
}

const INITIAL_VAULT_MEMES: EnvironmentalMeme[] = [
  {
    id: "featured",
    title: "The Smallest Clean",
    themeTopic: "Micro-cleanups",
    category: "wholesome",
    templateType: "soldiers",
    imageUrl: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=1200",
    emojiSetup: "🌱🧹🧤",
    topCaption: "SOCIETY",
    bottomCaption: "PEOPLE WHO PICK UP EVERY PLASTIC CAP THEY SEE",
    funnyPunchline: "Holding up society, one bottle cap at a time.",
    educationalFact: "A single plastic bottle cap degrades into hundreds of thousands of microscopic plastic fragments. Wildlife mistakes these for food, causing starvation and chemical toxicosis. Collecting even one cap stops this multiplication.",
    solutionTip: "Adopt a '3-Piece Rule': Pick up at least three pieces of street litter every day to keep ecosystems clean.",
    upvotes: 84
  },
  {
    id: "edu-cooling",
    title: "The Cooling Canopy",
    themeTopic: "Urban Heat Islands",
    category: "educational",
    templateType: "two-panel",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1000",
    emojiSetup: "🌳🏙️🌡️",
    topCaption: "COOLING IS REAL",
    bottomCaption: "PLANT TREES, SAVE LIVES",
    panelLeftTitle: "COOLING IS REAL",
    panelLeftText: "COOLING IS REAL",
    panelRightTitle: "PLANT TREES, SAVE LIVES",
    panelRightText: "PLANT TREES, SAVE LIVES",
    funnyPunchline: "Air conditioning cools your room but heats your city. Trees cool both.",
    educationalFact: "Urban neighborhoods with mature tree canopies can be up to 12°F (7°C) cooler than surrounding asphalt areas. Trees act as natural evaporative cooling mechanisms, saving electricity from air conditioning and reducing heat-related illnesses.",
    solutionTip: "Support local urban forestry programs and plant native shade trees in your garden.",
    upvotes: 112
  },
  {
    id: "env-undo",
    title: "No Earth Undo Button",
    themeTopic: "Ecosystem Conservation",
    category: "environmental",
    templateType: "classic",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000",
    emojiSetup: "⛰️🥤🚯",
    topCaption: "NATURE DOESN'T HAVE A UNDO BUTTON",
    bottomCaption: "PROTECT WHAT YOU LOVE",
    funnyPunchline: "Computers have Ctrl+Z. Oceans just have persistent bio-accumulation.",
    educationalFact: "Over 8 million metric tons of plastics enter our water ecosystems yearly. Synthetic pollutants persist for centuries, binding with heavy toxins and entering marine food webs. Protecting natural habitats is 100x cheaper than retrofitting geo-filtration systems.",
    solutionTip: "Eliminate single-use plastics from your routine and support conservation networks.",
    upvotes: 95
  },
  {
    id: "phys-albedo",
    title: "Melting Albedo Feedback",
    themeTopic: "Albedo Effect",
    category: "physics",
    templateType: "classic",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1000",
    emojiSetup: "🌞❄️📈",
    topCaption: "ALBEDO RETENTION IS REAL",
    bottomCaption: "WHITE PLANES REFLECT SUNLIGHT",
    funnyPunchline: "Dark surfaces absorb thermal energy like a black car in summer; melting poles make the earth a giant solar collector.",
    educationalFact: "Ice sheets reflect up to 90% of solar radiation (high albedo). As they melt, exposing dark seawater, reflection drops to 10%, causing the ocean to absorb massive thermal loads. This creates a positive feedback loop that accelerates global heating.",
    solutionTip: "Advocate for cool roofs in city planning and aggressively reduce greenhouse gas outputs.",
    upvotes: 68
  }
];

const STOCK_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800",
  "https://images.unsplash.com/photo-1520315342629-6ea920342047?q=80&w=800",
  "https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=800",
  "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=800"
];

export const MemeCenter: React.FC = () => {
  const [vaultMemes, setVaultMemes] = useState<EnvironmentalMeme[]>(INITIAL_VAULT_MEMES);
  const [activeFilter, setActiveFilter] = useState<'all' | 'wholesome' | 'educational' | 'environmental' | 'physics'>('all');
  
  // Modal states
  const [selectedMeme, setSelectedMeme] = useState<EnvironmentalMeme | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  
  // Generator states
  const [customTopic, setCustomTopic] = useState('');
  const [customCategory, setCustomCategory] = useState<'wholesome' | 'educational' | 'environmental' | 'physics'>('wholesome');
  const [customTemplate, setCustomTemplate] = useState<'bus' | 'beach' | 'soldiers' | 'classic'>('bus');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [upvotes, setUpvotes] = useState<Record<string, number>>({});
  const [voted, setVoted] = useState<Record<string, boolean>>({});

  const handleUpvote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (voted[id]) return;
    setVoted(prev => ({ ...prev, [id]: true }));
    setUpvotes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleGenerateMemeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/gemini/generate-meme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic: customTopic })
      });

      if (!response.ok) {
        throw new Error('Meme AI is taking a deep breath of clean air. Try another topic!');
      }

      const data = await response.json();
      if (data && data.title) {
        const randBg = STOCK_BACKGROUNDS[Math.floor(Math.random() * STOCK_BACKGROUNDS.length)];
        const newMeme: EnvironmentalMeme = {
          id: `custom_${Date.now()}`,
          title: data.title,
          themeTopic: data.themeTopic || customTopic,
          category: customCategory,
          templateType: customTemplate,
          imageUrl: randBg,
          emojiSetup: data.emojiSetup || "🌱🤖",
          topCaption: data.topCaption || "ECO EFFORTS",
          bottomCaption: data.bottomCaption || "REAL CARBON SAVINGS",
          funnyPunchline: data.funnyPunchline,
          educationalFact: data.educationalFact,
          solutionTip: data.solutionTip,
          upvotes: 1
        };

        setVaultMemes(prev => [newMeme, ...prev]);
        setShowGenerateModal(false);
        setCustomTopic('');
        setSelectedMeme(newMeme); // Automatically highlight the newly created card
      } else {
        throw new Error('Failed to parse the response format.');
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Error generating meme.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMemes = activeFilter === 'all' 
    ? vaultMemes 
    : vaultMemes.filter(m => m.category === activeFilter);

  const featuredMeme = filteredMemes.find(m => m.id === 'featured');
  const normalMemes = filteredMemes.filter(m => m.id !== 'featured');

  // Render visual layouts
  const renderMemeLayout = (meme: EnvironmentalMeme) => {
    const type = meme.templateType;

    switch (type) {
      case 'bus':
        return (
          <div className="relative w-full aspect-square overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl bg-stone-100 dark:bg-stone-900">
            <img src={busMemeImg} alt="Bus Meme" className="w-full h-full object-cover" />
            <div className="absolute top-[18%] left-[6%] w-[40%] bg-white/95 dark:bg-black/95 text-stone-900 dark:text-white px-2.5 py-2 rounded-xl text-center font-extrabold uppercase text-[9px] sm:text-xs leading-tight flex items-center justify-center min-h-[50px] border border-stone-200 dark:border-stone-850 shadow-lg select-none">
              {meme.topCaption}
            </div>
            <div className="absolute top-[18%] right-[6%] w-[40%] bg-white/95 dark:bg-black/95 text-stone-900 dark:text-white px-2.5 py-2 rounded-xl text-center font-extrabold uppercase text-[9px] sm:text-xs leading-tight flex items-center justify-center min-h-[50px] border border-stone-200 dark:border-stone-850 shadow-lg select-none">
              {meme.bottomCaption}
            </div>
          </div>
        );

      case 'beach':
        return (
          <div className="relative w-full aspect-square overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl bg-stone-100 dark:bg-stone-900">
            <img src={beachMemeImg} alt="Beach Meme" className="w-full h-full object-cover" />
            <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[85%] bg-white/95 dark:bg-black/95 text-stone-900 dark:text-white px-3 py-2.5 rounded-xl text-center font-extrabold uppercase text-[9px] sm:text-xs leading-tight flex items-center justify-center min-h-[45px] border border-stone-200 dark:border-stone-850 shadow-lg select-none">
              {meme.topCaption}
            </div>
            <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-[85%] bg-white/95 dark:bg-black/95 text-stone-900 dark:text-white px-3 py-2.5 rounded-xl text-center font-extrabold uppercase text-[9px] sm:text-xs leading-tight flex items-center justify-center min-h-[45px] border border-stone-200 dark:border-stone-850 shadow-lg select-none">
              {meme.bottomCaption}
            </div>
          </div>
        );

      case 'soldiers':
        return (
          <div className="relative w-full aspect-square overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl bg-stone-100 dark:bg-stone-900">
            <img src={soldiersMemeImg} alt="Soldiers Meme" className="w-full h-full object-cover" />
            <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[75%] bg-white/95 dark:bg-black/95 text-stone-900 dark:text-white px-3 py-2 rounded-xl text-center font-extrabold uppercase text-[9px] sm:text-xs leading-tight flex items-center justify-center min-h-[35px] border border-stone-200 dark:border-stone-850 shadow-lg select-none">
              {meme.topCaption}
            </div>
            <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 w-[90%] bg-white/95 dark:bg-black/95 text-stone-900 dark:text-white px-3 py-2 rounded-xl text-center font-extrabold uppercase text-[8px] sm:text-[11px] leading-tight flex items-center justify-center min-h-[50px] border border-stone-200 dark:border-stone-850 shadow-lg select-none">
              {meme.bottomCaption}
            </div>
          </div>
        );

      case 'two-panel':
        return (
          <div className="relative w-full aspect-square overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl bg-stone-100 dark:bg-stone-950 flex font-sans select-none">
            {/* Split screen panels in CSS */}
            <div className="w-1/2 h-full relative overflow-hidden border-r border-stone-200 dark:border-stone-850">
              <img 
                src="https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=400" 
                alt="Green Park" 
                className="w-full h-full object-cover opacity-85" 
              />
              <div className="absolute top-[8%] inset-x-2 bg-white/90 dark:bg-black/90 text-stone-900 dark:text-white p-2 rounded-lg text-center font-black uppercase text-[8px] sm:text-[11px] leading-tight min-h-[45px] flex items-center justify-center border border-stone-200 dark:border-stone-800">
                {meme.panelLeftText || meme.topCaption}
              </div>
            </div>
            <div className="w-1/2 h-full relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=400" 
                alt="Dry Ground" 
                className="w-full h-full object-cover opacity-80" 
              />
              <div className="absolute top-[8%] inset-x-2 bg-white/90 dark:bg-black/90 text-stone-900 dark:text-white p-2 rounded-lg text-center font-black uppercase text-[8px] sm:text-[11px] leading-tight min-h-[45px] flex items-center justify-center border border-stone-200 dark:border-stone-800">
                {meme.panelRightText || meme.bottomCaption}
              </div>
            </div>
          </div>
        );

      case 'classic':
      default:
        return (
          <div className="relative w-full aspect-square overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl bg-stone-100 dark:bg-stone-950 flex flex-col justify-between p-4">
            <img src={meme.imageUrl} alt={meme.title} className="absolute inset-0 w-full h-full object-cover opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-black/85 z-0" />
            
            <div className="z-10 text-center">
              <h3 className="text-white font-black uppercase tracking-wide text-[9px] sm:text-xs leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] max-w-full truncate-2-lines">
                {meme.topCaption}
              </h3>
            </div>
            
            <div className="z-10 flex flex-col items-center justify-center py-4">
              <span className="text-4xl filter drop-shadow-md select-none">{meme.emojiSetup}</span>
            </div>

            <div className="z-10 text-center">
              <h3 className="text-white font-black uppercase tracking-wide text-[9px] sm:text-xs leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] max-w-full truncate-2-lines">
                {meme.bottomCaption}
              </h3>
            </div>
          </div>
        );
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'wholesome': return 'bg-emerald-500/10 dark:bg-emerald-500/25 border-emerald-500/30 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-400';
      case 'educational': return 'bg-indigo-500/10 dark:bg-indigo-500/25 border-indigo-500/30 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-400';
      case 'environmental': return 'bg-teal-500/10 dark:bg-teal-500/25 border-teal-500/30 dark:border-teal-500/50 text-teal-700 dark:text-teal-400';
      case 'physics': return 'bg-orange-500/10 dark:bg-orange-500/25 border-orange-500/30 dark:border-orange-500/50 text-orange-700 dark:text-orange-400';
      default: return 'bg-stone-500/10 dark:bg-stone-500/25 border-stone-500/30 dark:border-stone-500/50 text-stone-700 dark:text-stone-400';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0d0d0c] text-stone-850 dark:text-stone-100 font-sans pb-20 select-none transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block font-mono">
              THE CLIMATE MEME CENTER
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white">
              Eco-Meme Vault: Laugh, Learn, Act
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-xl font-light">
              High-fidelity environmental education through visual storytelling and climate-tech humor.
            </p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-400 dark:hover:bg-emerald-350 text-white dark:text-stone-950 font-extrabold text-xs tracking-wider uppercase transition shadow-md shadow-emerald-400/5 hover:translate-y-[-1px] cursor-pointer"
          >
            GENERATE NEW
          </button>
        </div>

        {/* Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-stone-950/60 p-2.5 rounded-2xl border border-stone-200 dark:border-stone-900/60 shadow-sm dark:shadow-none">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono shrink-0 pl-2">
            FILTER TOPICS:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Vaults' },
              { id: 'wholesome', label: 'Wholesome' },
              { id: 'educational', label: 'Educational' },
              { id: 'environmental', label: 'Environmental' },
              { id: 'physics', label: 'Physics' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setActiveFilter(pill.id as any)}
                className={`px-4.5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeFilter === pill.id 
                    ? 'bg-emerald-500 dark:bg-emerald-400 text-white dark:text-stone-950 shadow-sm font-extrabold' 
                    : 'bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 dark:bg-stone-900/60 dark:border-stone-850 dark:hover:border-emerald-500/40 dark:text-stone-300'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Vault Stage */}
        <div className="space-y-8">
          
          {/* Featured Card (Top banner) */}
          {featuredMeme && (activeFilter === 'all' || activeFilter === 'wholesome') && (
            <div 
              onClick={() => setSelectedMeme(featuredMeme)}
              className="group relative rounded-3xl border border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-950 overflow-hidden cursor-pointer shadow-xl hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all duration-300"
            >
              {/* Overlay category badge */}
              <div className="absolute top-5 left-5 z-20">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getCategoryColor('wholesome')}`}>
                  Wholesome
                </span>
              </div>

              {/* Photo & custom layout overlay */}
              <div className="grid grid-cols-1 md:grid-cols-12 items-center">
                <div className="md:col-span-7 h-64 md:h-[400px] relative overflow-hidden">
                  <img 
                    src={featuredMeme.imageUrl} 
                    alt={featuredMeme.title} 
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-white/95 dark:from-black/80 via-transparent to-transparent z-10" />
                </div>
                
                {/* Description panel */}
                <div className="md:col-span-5 p-8 flex flex-col justify-center space-y-4">
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold tracking-widest block uppercase">FEATURED Eco-Meme</span>
                  <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                    {featuredMeme.title}
                  </h2>
                  <blockquote className="border-l-2 border-emerald-500 dark:border-emerald-400 pl-3.5 italic text-stone-600 dark:text-stone-400 text-xs py-1">
                    "{featuredMeme.funnyPunchline}"
                  </blockquote>
                  <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400 font-light">
                    {featuredMeme.educationalFact.slice(0, 150)}...
                  </p>
                  
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-stone-450 dark:text-stone-500 font-mono">Click to learn the science</span>
                    <button 
                      onClick={(e) => handleUpvote('featured', e)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition ${
                        voted['featured'] 
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' 
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:text-white'
                      }`}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>{featuredMeme.upvotes ? featuredMeme.upvotes + (upvotes['featured'] || 0) : 10} Upvotes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cards Columns Grid (Bottom row cards) */}
          {filteredMemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {normalMemes.map(meme => (
                <div 
                  key={meme.id}
                  onClick={() => setSelectedMeme(meme)}
                  className="group relative rounded-3xl border border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-950 p-4 cursor-pointer hover:border-emerald-500/25 dark:hover:border-emerald-500/25 transition-all duration-300 flex flex-col justify-between gap-4 shadow-lg hover:translate-y-[-2px]"
                >
                  {/* Category Pill Tag */}
                  <div className="flex justify-between items-center z-10">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${getCategoryColor(meme.category)}`}>
                      {meme.category}
                    </span>
                    <span className="text-[10px] text-stone-400 dark:text-stone-550 font-mono">{meme.themeTopic}</span>
                  </div>

                  {/* Rendering visual layout */}
                  <div className="w-full relative overflow-hidden rounded-2xl">
                    {renderMemeLayout(meme)}
                  </div>

                  {/* Title and stats bar */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                      {meme.title}
                    </h3>
                    <div className="flex justify-between items-center pt-2 border-t border-stone-100 dark:border-stone-900 text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                      <span>Click to learn</span>
                      <button 
                        onClick={(e) => handleUpvote(meme.id, e)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                          voted[meme.id] 
                            ? 'text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20' 
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-900/60'
                        }`}
                      >
                        <ThumbsUp className="h-2.5 w-2.5" />
                        <span>{(meme.upvotes || 5) + (upvotes[meme.id] || 0)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty placeholder card (like the empty box on the right of the mockup) */
            <div className="rounded-3xl border border-dashed border-stone-300 dark:border-stone-850 p-12 text-center text-stone-500 dark:text-stone-400 text-xs">
              No vaults found matching this filter. Tap "GENERATE NEW" to create one!
            </div>
          )}
        </div>

      </div>

      {/* DETAIL MODAL (Opens when a card is clicked) */}
      {selectedMeme && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#0f0f0e] border border-stone-200 dark:border-stone-850 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative space-y-6 shadow-2xl animate-scale-up">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedMeme(null)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center justify-center border border-stone-200 dark:border-stone-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Split Detail Contents */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-4">
              
              {/* Visual Card Left Column */}
              <div className="md:col-span-6 space-y-4">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getCategoryColor(selectedMeme.category)}`}>
                  {selectedMeme.category}
                </span>
                
                {/* Meme rendering */}
                <div className="rounded-2xl border border-stone-250 dark:border-stone-800 overflow-hidden bg-stone-100 dark:bg-stone-950 p-1">
                  {renderMemeLayout(selectedMeme)}
                </div>

                <p className="text-[10px] italic text-stone-500 leading-relaxed font-sans bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-200 dark:border-stone-900 text-center">
                  <span className="font-bold not-italic text-[8px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">ARTWORK DESCRIPTION</span>
                  {selectedMeme.imageUrlOrDescription}
                </p>
              </div>

              {/* Educational content Right Column */}
              <div className="md:col-span-6 space-y-5 text-left font-sans">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">ECO-EDUCATION VAULT</span>
                  <h2 className="text-xl md:text-2xl font-bold font-serif text-stone-900 dark:text-white">{selectedMeme.title}</h2>
                  <blockquote className="border-l-3 border-emerald-500 dark:border-emerald-400 pl-3 italic text-stone-600 dark:text-stone-400 text-xs py-1">
                    "{selectedMeme.funnyPunchline}"
                  </blockquote>
                </div>

                {/* Consensus index bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-bold text-stone-500 dark:text-stone-400">
                    <span>ACADEMIC CONSENSUS LEVEL</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">100% AGREEMENT</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-900 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
                  </div>
                </div>

                {/* Scientific consensus fact detail */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
                    <span>The Real Climate Physics</span>
                  </label>
                  <p className="text-stone-750 dark:text-stone-300 leading-relaxed text-xs font-light">
                    {selectedMeme.educationalFact}
                  </p>
                </div>

                {/* Corrective action recommendation */}
                <div className="space-y-1.5 pt-3 border-t border-stone-100 dark:border-stone-900">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                    <span>Direct Corrective Action</span>
                  </label>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-xs font-light">
                    {selectedMeme.solutionTip}
                  </p>
                </div>

                {/* Actions bottom bar */}
                <div className="pt-4 border-t border-stone-100 dark:border-stone-900 flex justify-between items-center">
                  <button
                    onClick={() => handleUpvote(selectedMeme.id)}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      voted[selectedMeme.id] 
                        ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>{(selectedMeme.upvotes || 10) + (upvotes[selectedMeme.id] || 0)} Upvotes</span>
                  </button>
                  <button 
                    onClick={() => alert("Meme link copied to clipboard! Share sustainability insights with your friends.")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-300 transition cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share Insights</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* GENERATOR MODAL */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#0f0f0e] border border-stone-200 dark:border-stone-850 rounded-3xl w-full max-w-xl p-6 md:p-8 relative space-y-6 shadow-2xl animate-scale-up">
            
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowGenerateModal(false);
                setErrorMsg('');
              }}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-white flex items-center justify-center border border-stone-200 dark:border-stone-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1.5 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xl mb-1">
                🤖
              </div>
              <h2 className="text-xl md:text-2xl font-bold font-serif text-stone-900 dark:text-white">Generate New Climate Meme</h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-light">
                Ask Gemini to construct a custom ecological carbon irony or climate joke.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-600 dark:bg-rose-500/5 dark:border-rose-500/15 dark:text-rose-400 rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleGenerateMemeSubmit} className="space-y-5 text-left font-sans text-xs">
              
              {/* Input field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest font-mono">Topic Idea</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. eating beef burgers daily while driving a hybrid EV"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-250 dark:border-stone-850 px-4 py-3 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  disabled={loading}
                />
              </div>

              {/* Category selector pills */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest font-mono">Target Vault Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'wholesome', label: 'Wholesome' },
                    { id: 'educational', label: 'Educational' },
                    { id: 'environmental', label: 'Environmental' },
                    { id: 'physics', label: 'Physics' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCustomCategory(cat.id as any)}
                      className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                        customCategory === cat.id 
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/40' 
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-400 dark:hover:border-stone-750'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template selector pills */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest font-mono">Visual Meme layout</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'bus', label: 'Bus (Paths Comparison)' },
                    { id: 'beach', label: 'Beach (Excuse vs Action)' },
                    { id: 'soldiers', label: 'Soldiers (Silent Support)' },
                    { id: 'classic', label: 'Classic Text Overlay' }
                  ].map(tmpl => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setCustomTemplate(tmpl.id as any)}
                      className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                        customTemplate === tmpl.id 
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/40' 
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-400 dark:hover:border-stone-750'
                      }`}
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !customTopic.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-400 dark:hover:bg-emerald-350 disabled:opacity-50 text-white dark:text-stone-950 font-extrabold text-xs tracking-wider uppercase transition shadow-md cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-white dark:text-stone-950" />
                    <span>Compiling scientific consensus...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 text-white dark:text-stone-950" />
                    <span>Generate Meme</span>
                  </>
                )}
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
