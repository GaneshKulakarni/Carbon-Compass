import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Laugh, 
  Sparkles, 
  RefreshCw, 
  HelpCircle, 
  BookOpen, 
  ThumbsUp, 
  Award, 
  Flame, 
  Wand2, 
  CheckCircle, 
  Check, 
  ArrowRight, 
  Share2, 
  Send, 
  Zap,
  Twitter,
  Heart
} from 'lucide-react';

interface EnvironmentalMeme {
  title: string;
  themeTopic: string;
  templateType: 'drake' | 'two-panel' | 'distracted' | 'classic' | 'modern-card';
  imageUrlOrDescription: string;
  emojiSetup: string;
  topCaption: string;
  bottomCaption: string;
  
  // Drake template
  drakeRejectText?: string;
  drakeAcceptText?: string;
  
  // Distracted Boyfriend
  boyfriendLooksAt?: string;
  boyfriendIgnores?: string;
  boyfriendLabel?: string;
  
  // Two panel
  panelLeftTitle?: string;
  panelLeftText?: string;
  panelRightTitle?: string;
  panelRightText?: string;
  
  // Modern tweeter/social card
  socialText?: string;
  
  funnyPunchline: string;
  educationalFact: string;
  solutionTip: string;
}

const PRESET_TOPICS = [
  { id: 'totes', label: 'Reusable Totes', query: 'buying novelty canvas bags instead of using old plastic ones' },
  { id: 'straws', label: 'Paper Straws', query: 'drinking from plastic cup using paper straws' },
  { id: 'phantom', label: 'Standby Power', query: 'leaving laptop and tv chargers plugged in 24 hours a day' },
  { id: 'electric', label: 'Heavy EV Hummer', query: 'driving a massive electric truck on a coal grid' },
  { id: 'diet', label: 'Veggie Burgers', query: 'eating red beef three times a day while driving a hybrid car' }
];

const EXAMPLE_PROMPTS = [
  "flying 4,000 miles to attend a 1-hour climate change panel speech",
  "buying organic strawberries flown in individually wrapped in polystyrene",
  "turning A/C down to 60°F while wearing a wool sweater indoors",
  "recycling cardboards but throwing food leftovers straight into plastic trash"
];

const DEFAULT_MEME: EnvironmentalMeme = {
  title: "The Novelty Ecobag Hype",
  themeTopic: "Reusable Totes",
  templateType: "drake",
  imageUrlOrDescription: "A massive wardrobe completely overloaded with 45 different novelty custom logo canvas tote bags, as a person buys yet another eco-bag instead of bringing an old backpack.",
  emojiSetup: "🛍️🐢🥑🛍️",
  topCaption: "Owns 45 reusable grocery totes to prevent ocean waste",
  bottomCaption: "Never brings them to the store and buys another custom one instead",
  drakeRejectText: "Renting/reusing simple backpacks and using existing old plastic or paper bags for grocery carriage",
  drakeAcceptText: "Buying another custom embroider organic designers canvas tote bag for $25 because 'it protects marine life'",
  funnyPunchline: "Buying cotton eco-tote bags repeatedly is the ultimate luxury irony.",
  educationalFact: "According to lifecycle greenhouse analysis, a single cotton reusable tote has high resource demands. It must be used at least 50 to 150 times to offset its crop production carbon footprint before overtaking simple recycling bags. Buying shiny new ones continually adds to the footprint!",
  solutionTip: "Do not buy custom brand new cotton canvas totes. Settle down with your existing backpacks, old grocery bags, or simple pouches!"
};

export const MemeCenter: React.FC = () => {
  const [activeMeme, setActiveMeme] = useState<EnvironmentalMeme>(DEFAULT_MEME);
  const [loading, setLoading] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [upvotes, setUpvotes] = useState<Record<string, number>>({});
  const [voted, setVoted] = useState<Record<string, boolean>>({});

  const generateMeme = async (topicQuery: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/gemini/generate-meme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic: topicQuery })
      });

      if (!response.ok) {
        throw new Error('Meme service was tired of environmental cognitive dissonance. Try another topic!');
      }

      const data = await response.json();
      if (data && data.title) {
        setActiveMeme(data);
      } else {
        throw new Error('Received unformatted payload.');
      }
    } catch (e: unknown) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : 'Failed to generate meme. Try again!';
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    generateMeme(userQuery.trim());
  };

  const handleUpvote = (memeTitle: string) => {
    if (voted[memeTitle]) return;
    setVoted(prev => ({ ...prev, [memeTitle]: true }));
    setUpvotes(prev => ({ ...prev, [memeTitle]: (prev[memeTitle] || 0) + 1 }));
  };

  // Renderer matching meme template styles
  const renderMemeLayout = () => {
    const type = activeMeme.templateType || 'classic';

    switch (type) {
      case 'drake':
        return (
          <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col font-sans divide-y divide-stone-250/20 shadow-md">
            {/* Top row: Reject */}
            <div className="grid grid-cols-12 md:min-h-[140px]">
              <div className="col-span-4 bg-rose-500/10 dark:bg-rose-950/20 flex flex-col items-center justify-center p-3 text-center border-r border-stone-200/50 dark:border-stone-850">
                <span className="text-4xl text-rose-500 font-black mb-1 select-none">🙅‍♂️</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-rose-600 dark:text-rose-400">NO WAY</span>
              </div>
              <div className="col-span-8 p-5 flex items-center bg-stone-50/55 dark:bg-stone-900">
                <p className="text-xs md:text-sm font-bold text-stone-750 dark:text-stone-200 leading-relaxed">
                  {activeMeme.drakeRejectText || activeMeme.topCaption}
                </p>
              </div>
            </div>

            {/* Bottom row: Accept */}
            <div className="grid grid-cols-12 md:min-h-[140px]">
              <div className="col-span-4 bg-emerald-500/15 dark:bg-emerald-950/30 flex flex-col items-center justify-center p-3 text-center border-r border-stone-200/50 dark:border-stone-850 text-emerald-600">
                <span className="text-4xl font-black mb-1 select-none">👈🤩</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400">YES PLEASE</span>
              </div>
              <div className="col-span-8 p-5 flex items-center bg-emerald-50/20 dark:bg-emerald-950/20">
                <p className="text-xs md:text-sm font-extrabold text-emerald-800 dark:text-emerald-350 leading-relaxed">
                  {activeMeme.drakeAcceptText || activeMeme.bottomCaption}
                </p>
              </div>
            </div>
          </div>
        );

      case 'two-panel':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Panel */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900 overflow-hidden flex flex-col shadow-sm">
              <div className="bg-sky-50 dark:bg-sky-950/20 px-4 py-2 border-b border-stone-200 dark:border-stone-850 text-center font-bold text-xs uppercase tracking-wider text-sky-700 dark:text-sky-400">
                {activeMeme.panelLeftTitle || "My Expectation ☀️"}
              </div>
              <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-3 text-center">
                <span className="text-5xl">🧘‍♂️🌿</span>
                <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 leading-relaxed">
                  {activeMeme.panelLeftText || activeMeme.topCaption}
                </p>
              </div>
            </div>

            {/* Right Panel */}
            <div className="rounded-2xl border border-amber-200 dark:border-stone-800 bg-amber-500/5 overflow-hidden flex flex-col shadow-sm">
              <div className="bg-amber-100/40 dark:bg-amber-950/20 px-4 py-2 border-b border-amber-200 dark:border-stone-800 text-center font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400">
                {activeMeme.panelRightTitle || "The Ironical Reality 🌧️"}
              </div>
              <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-3 text-center">
                <span className="text-5xl">🚜🌪️</span>
                <p className="text-xs font-extrabold text-stone-900 dark:text-stone-100 leading-relaxed">
                  {activeMeme.panelRightText || activeMeme.bottomCaption}
                </p>
              </div>
            </div>
          </div>
        );

      case 'distracted':
        return (
          <div className="space-y-4">
            <div className="text-center font-mono text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              The Distracted Boyfriend Scenario
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Ignored choice (The Left Girl) */}
              <div className="rounded-xl p-4 border border-stone-200 bg-stone-100/60 dark:border-stone-850 dark:bg-stone-950 flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-3xl">🚶‍♀️😢</span>
                <p className="text-[11px] font-bold text-stone-400">The Simple, low-carbon option they ignore:</p>
                <p className="text-xs font-bold text-stone-600 dark:text-stone-300">
                  {activeMeme.boyfriendIgnores || activeMeme.bottomCaption}
                </p>
              </div>

              {/* The Subject (Boyfriend) */}
              <div className="rounded-xl p-4 border border-amber-300 bg-amber-500/5 flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-3xl">👀🤔</span>
                <p className="text-[11px] uppercase tracking-wider font-extrabold text-amber-700 dark:text-amber-500">
                  {activeMeme.boyfriendLabel || "Average Consumer"}
                </p>
                <div className="flex gap-1.5 justify-center">
                  <div className="h-1.5 w-6 bg-rose-500 rounded-full"></div>
                  <div className="h-1.5 w-3 bg-rose-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Distraction (Right Girl) */}
              <div className="rounded-xl p-4 border border-emerald-500/30 bg-emerald-500/10 dark:border-emerald-950/30 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
                <span className="text-3xl animate-bounce">😍🔥</span>
                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">The shiny hypocritical choice they stare at:</p>
                <p className="text-xs font-extrabold text-stone-900 dark:text-stone-50">
                  {activeMeme.boyfriendLooksAt || activeMeme.topCaption}
                </p>
              </div>
            </div>
          </div>
        );

      case 'modern-card':
        return (
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-850 dark:bg-stone-900 font-sans text-xs">
            {/* Social Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-850">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-forest-600 text-white flex items-center justify-center">
                  <Twitter className="h-4 w-4 fill-white text-forest-600" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-stone-950 dark:text-stone-50">Sarcastic Eco Tracker</span>
                    <span className="text-sky-500 text-xs">✓</span>
                  </div>
                  <p className="text-[10px] text-stone-400">@carbon_compass_ironies</p>
                </div>
              </div>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">Web Meme</span>
            </div>

            {/* Social Content Post */}
            <div className="py-4">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-50 leading-relaxed md:text-base">
                {activeMeme.socialText || `${activeMeme.topCaption} but then ${activeMeme.bottomCaption} 🤡`}
              </p>
            </div>

            {/* Real stats and counts */}
            <div className="pt-3 border-t border-stone-150/65 dark:border-stone-850/60 flex items-center justify-between text-[11px] text-stone-400 font-bold select-none">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 hover:text-rose-500 cursor-pointer">
                  <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                  <span>2.4K Likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="h-3.5 w-3.5" />
                  <span>453 Shares</span>
                </div>
              </div>
              <span>7:23 AM · Jun 18, 2026</span>
            </div>
          </div>
        );

      case 'classic':
      default:
        return (
          <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-950 p-6 flex flex-col justify-between min-h-[280px]">
            {/* Top text overlay */}
            <div className="text-center z-10">
              <h2 className="font-serif font-black uppercase text-lg leading-7 text-white tracking-wide text-shadow-meme md:text-xl">
                {activeMeme.topCaption}
              </h2>
            </div>

            <div className="my-6 flex flex-col items-center justify-center space-y-2 z-10">
              <div className="text-5xl drop-shadow-md tracking-wider">
                {activeMeme.emojiSetup}
              </div>
            </div>

            {/* Bottom text overlay */}
            <div className="text-center z-10">
              <h2 className="font-serif font-black uppercase text-lg leading-7 text-white tracking-wide text-shadow-meme md:text-xl">
                {activeMeme.bottomCaption}
              </h2>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-200/50 pb-5 dark:border-stone-850">
        <div className="flex items-center space-x-3">
          <div className="rounded-2xl bg-forest-50 p-2.5 border border-forest-100 text-forest-600 dark:bg-forest-950/40 dark:border-forest-900/40">
            <Laugh className="h-6 w-6 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-3xl tracking-tight text-stone-900 dark:text-stone-50">
              Eco-Meme Teaching Center
            </h1>
            <p className="text-xs text-stone-400 mt-1 max-w-xl">
              Debunk carbon ironies and learn genuine sustainability science through viral web memes backed by academic consensus.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] bg-stone-100 px-3 py-1.5 rounded-lg dark:bg-stone-950 text-stone-400 select-none">
          <Zap className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          <span>Generator Online: 3.5 Flash</span>
        </div>
      </div>

      {/* Topics row */}
      <div className="space-y-2">
        <span className="text-[9px] font-sans font-extrabold text-stone-400 uppercase tracking-widest block mb-2">Popular Debunk Topics:</span>
        <div className="flex flex-wrap gap-2">
          {PRESET_TOPICS.map((p) => (
            <button
              key={p.id}
              id={`btn-preset-topic-${p.id}`}
              onClick={() => {
                setUserQuery(p.query);
                generateMeme(p.query);
              }}
              disabled={loading}
              className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-bold font-sans transition-all active:scale-95 ${activeMeme.themeTopic === p.label ? 'bg-forest-600 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-850'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main split dashboard section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
        
        {/* Left Column: Generator Form and Meme viewer (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Creative AI-powered generator block */}
          <div className="rounded-3xl border border-stone-200/60 bg-white p-6 shadow-sm dark:border-stone-850 dark:bg-stone-900">
            <h3 className="text-xs font-extrabold text-stone-400 uppercase tracking-wider mb-3">AI Sustainability Joke Generator</h3>
            
            <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                id="meme-generation-topic-input"
                type="text"
                required
                placeholder="e.g. flying 4,000 miles to give a speech about car emissions..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:outline-none focus:ring-1 focus:ring-forest-500 transition-all font-medium"
                disabled={loading}
              />
              <button
                id="btn-meme-generate-trigger"
                type="submit"
                disabled={loading || !userQuery.trim()}
                className="sm:px-6 py-3 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-md shadow-forest-600/10 w-full sm:w-36 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 text-white" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </form>

            {/* Clickable prompt templates block */}
            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-850/80">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Example Prompts (Tap to Load):</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setUserQuery(prompt);
                      generateMeme(prompt);
                    }}
                    disabled={loading}
                    className="text-[10px] bg-stone-50 hover:bg-stone-100 dark:bg-stone-950 dark:hover:bg-stone-850 text-stone-500 border border-stone-150/40 px-2.5 py-1 rounded-lg text-left transition-colors font-medium truncate max-w-full"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {/* Meme Viewer Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-stone-400 font-mono">Rendered Meme Template ({activeMeme.templateType || 'classic'})</span>
              <span className="text-[10px] text-stone-500 font-bold italic">Interactive Illustration Below ↡</span>
            </div>

            <div className="relative rounded-3xl border border-stone-200 bg-stone-55/60 p-6 min-h-[350px] flex flex-col justify-center dark:border-stone-850 dark:bg-stone-950">
              {loading && (
                <div className="absolute inset-0 bg-stone-950/85 z-20 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 text-white">
                  <SpinnerMemeWheel />
                  <h3 className="font-bold text-emerald-400 text-sm animate-pulse flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    <span>Gemini is generating ironical template facts...</span>
                  </h3>
                  <p className="text-[10px] text-stone-400 max-w-xs leading-relaxed">
                    Stripping down carbon hypocrises, executing layout parameters, and configuring micro-narratives.
                  </p>
                </div>
              )}

              {/* Meme visual */}
              {renderMemeLayout()}

              {/* Visual artwork description caption */}
              <p className="text-[10px] italic text-stone-400 text-center max-w-md mx-auto mt-4 font-sans bg-white dark:bg-stone-900/50 p-2.5 rounded-xl border border-stone-200/50 dark:border-stone-850/60 leading-relaxed">
                <span className="font-bold not-italic text-[9px] tracking-wider uppercase text-forest-500 block mb-0.5">Meme Caricature Concept</span>
                {activeMeme.imageUrlOrDescription}
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Educational facts and science lesson (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Vote and Feedback indicator */}
          <div className="flex items-center justify-between rounded-xl bg-white border border-stone-200 px-4 py-3 dark:bg-stone-900 dark:border-stone-850 shadow-sm">
            <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Meme Credibility Index</span>
            <button
              onClick={() => handleUpvote(activeMeme.title)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold select-none cursor-pointer transition-all ${voted[activeMeme.title] ? 'bg-forest-50 text-forest-700 dark:bg-forest-950/30' : 'bg-stone-100 hover:bg-stone-200 text-stone-600 dark:bg-stone-850'}`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{upvotes[activeMeme.title] || 15 + activeMeme.title.length % 7} Eco Upvotes</span>
            </button>
          </div>

          {/* Educational panel */}
          <div className="rounded-3xl border border-stone-200/60 bg-white p-6 shadow-sm dark:border-stone-850 dark:bg-stone-900">
            <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-400 mb-4 border-b border-stone-100 dark:border-stone-850 pb-3">
              <BookOpen className="h-4.5 w-4.5 text-forest-500" />
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">The Scientific Consensus</h3>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <h4 className="font-extrabold text-stone-800 dark:text-stone-100 mb-1">
                  Meme Topic: <span className="text-forest-600 font-mono text-[11px] bg-forest-50 dark:bg-forest-950/30 px-2 py-0.5 rounded-md capitalize">{activeMeme.themeTopic || 'General Ecology'}</span>
                </h4>
                <p className="text-[10px] text-stone-400 font-mono font-bold uppercase tracking-wider mb-1">Title Concept: {activeMeme.title}</p>
                <blockquote className="border-l-3 border-amber-400 pl-3 italic text-stone-500 dark:text-stone-400 leading-relaxed py-1.5 bg-stone-50 dark:bg-stone-950 rounded-r-xl">
                  &ldquo;{activeMeme.funnyPunchline}&rdquo;
                </blockquote>
              </div>

              {/* Progress Index bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-stone-400">
                  <span>SCIENTIFIC CONSENSUS LEVEL</span>
                  <span className="text-emerald-500">100% AGREEMENT</span>
                </div>
                <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-emerald-500 rounded-full"></div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-stone-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
                  <span>The Real Climate Physics</span>
                </label>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-[11px]">
                  {activeMeme.educationalFact}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-850 space-y-1">
                <label className="font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Direct Corrective Action</span>
                </label>
                <p className="text-stone-500 dark:text-stone-400 font-medium leading-relaxed text-[11px]">
                  {activeMeme.solutionTip}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Callout */}
          <div className="rounded-2xl bg-amber-500/5 p-4 border border-amber-500/10 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400 mb-1">
              <HelpCircle className="h-4 w-4" />
              <span>Debunking Greenwashing Labels</span>
            </div>
            Humorous carbon memes strips away cosmetic green claims. True decarbonization is determined strictly by physical resources, heat loads, and direct lifecycle statistics.
          </div>

        </div>

      </div>

    </div>
  );
};

/* Spinner loading wheel graphic */
const SpinnerMemeWheel: React.FC = () => {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-4 border-dashed border-stone-850 animate-spin"></div>
      <div className="absolute inset-1.5 rounded-full border-4 border-emerald-500/20 animate-pulse"></div>
      <div className="absolute inset-1.5 rounded-full border-4 border-t-emerald-500 animate-spin duration-300"></div>
      <span className="text-2xl animate-pulse">🌍</span>
    </div>
  );
};
