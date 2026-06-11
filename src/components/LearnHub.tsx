import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  HelpCircle, ChevronDown, ChevronUp, BookOpen, Lightbulb, 
  Compass, Award, CheckCircle, Sparkles, Check, ShieldAlert
} from 'lucide-react';

export const LearnHub: React.FC = () => {
  const { completedLessons, completeLesson, badges } = useApp();
  const [activeMyth, setActiveMyth] = useState<number | null>(0);
  
  // Quiz selection and feedback states
  const [quizSelected, setQuizSelected] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  const myths = [
    {
      id: "myth_vegetarian",
      m: "Myth: Going paperless saves more carbon than eating vegetarian.",
      f: "Fact: Food production accounts for nearly 26% of all global greenhouse gases. Enjoying vegetarian alternatives 3 days a week shrinks your footprint by roughly 350 kg CO₂e annually. Paperless billing, while fantastic for reducing local solid garbage, offsets less than 3 kg annually. Food has a far higher carbon punch!",
      quiz: {
        q: "What percentage of global emissions does food production contribute?",
        options: ["Under 5%", "Around 12%", "Nearly 26%"],
        correctIndex: 2
      },
      believedPercent: 74,
      answeredCorrectPercent: 88
    },
    {
      id: "myth_ev_clean",
      m: "Myth: Electric vehicles (EV) are 100% emission-free right away.",
      f: "Fact: While EVs dramatically slash tailpipe emissions, their lifecycle carbon depends heavily on the utility grid power charging them. An EV charging on a coal-heavy grid offsets less than one on a wind/solar contract. However, EVs still remain at least 50% more efficient than conventional direct liquid-fuel vehicles!",
      quiz: {
        q: "What dictates the active charging emissions profile of an EV?",
        options: ["Battery casing weight", "The power mix of the local utility grid", "The age of the vehicle engine"],
        correctIndex: 1
      },
      believedPercent: 63,
      answeredCorrectPercent: 91
    },
    {
      id: "myth_extremes",
      m: "Myth: Extreme lifestyle changes are the only way to save the planet.",
      f: "Fact: Consistency overrides extreme limits. If millions of people swap 2 car drives per week and avoid 2 beef meals, it saves more carbon than a handful of folks going fully Zero-Waste immediately. Carbon Compass prioritizes small, low-friction, budget-friendly everyday wins!",
      quiz: {
        q: "What sustainability philosophy does Carbon Compass champion?",
        options: ["Instant 100% lifestyle bans", "Gradual, low-friction everyday habits", "Ignoring personal impact entirely"],
        correctIndex: 1
      },
      believedPercent: 81,
      answeredCorrectPercent: 96
    },
    {
      id: "myth_recycling",
      m: "Myth: Plastic recycling is our biggest climate mitigation.",
      f: "Fact: Waste represents under 3% of an individual's average annual footprint, whereas transport commuting and flight mileage average over 35%. While recycling prevents toxic land dump decay, routing your focus toward EV charging, bus commutes, and grid efficiency saves 100x more carbon!",
      quiz: {
        q: "Which daily category typical accounts for the largest share of personal carbon?",
        options: ["Single-use water plastics", "Transport commuting & flights", "Textile clothing purchases"],
        correctIndex: 1
      },
      believedPercent: 85,
      answeredCorrectPercent: 82
    }
  ];

  const lessons = [
    {
      id: "lesson_commuting",
      emoji: "🚗",
      title: "Why Commuting Ranks Highest",
      desc: "Burning gas in single passenger cars emits roughly 220g of carbon per kilometer. Converting just 2 commutes per week to public transit or cycling avoids 68kg of atmosphere carbon each month!"
    },
    {
      id: "lesson_diet",
      emoji: "🥩",
      title: "The Hidden Diet Multiplier",
      desc: "Ruminant livestock (like beef and lamb) require significant pasture clearance lands and release direct methane gas. Swapping out a single beef meal for a vegetarian dish saves energy equivalent to running your home's smart TV for 70 hours!"
    },
    {
      id: "lesson_grid",
      emoji: "⚡",
      title: "Grid Leakage & Heating Spikes",
      desc: "Roughly 40% of standard household electricity is tied to fossil heating and high-load A/C running. Setting cooling thermostat settings just 1°C higher or utilizing cold water wash laundry cycles bypasses high utilities billing and grid peaks."
    },
    {
      id: "lesson_composting",
      emoji: "♻️",
      title: "Composting vs Landfill rot",
      desc: "When organic food waste rots packed tightly inside landfills without oxygen, it creates heavy methane gas. Composting, on the other hand, reacts with air to bind carbon nutrients directly back to local planter soils with zero methane!"
    }
  ];

  // Dynamic calculations
  const totalPoints = completedLessons.length * 10;
  
  // Decide Knowledge Title rank based on completed lessons
  let knowledgeLevel = "Eco Novice";
  let levelColor = "text-stone-400 bg-stone-100 dark:bg-stone-950/40";
  let nextLevelGoal = 2;
  
  if (completedLessons.length >= 8) {
    knowledgeLevel = "Carbon Master";
    levelColor = "text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400";
    nextLevelGoal = 8;
  } else if (completedLessons.length >= 5) {
    knowledgeLevel = "Sustainability Specialist";
    levelColor = "text-indigo-700 bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400";
    nextLevelGoal = 8;
  } else if (completedLessons.length >= 2) {
    knowledgeLevel = "Climate Scout";
    levelColor = "text-amber-700 bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400";
    nextLevelGoal = 5;
  }

  const overallProgressPercent = Math.min(100, Math.round((completedLessons.length / 8) * 100));

  const handleQuizSelect = (mythId: string, optionIdx: number) => {
    setQuizSelected(prev => ({ ...prev, [mythId]: optionIdx }));
    setQuizSubmitted(prev => ({ ...prev, [mythId]: false }));
  };

  const handleQuizSubmit = (mythId: string, correctIdx: number, selectedIdx: number) => {
    if (selectedIdx === correctIdx) {
      completeLesson(mythId);
    }
    setQuizSubmitted(prev => ({ ...prev, [mythId]: true }));
  };

  const isLessonChecked = (lessonId: string) => completedLessons.includes(lessonId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-2 animate-fade-in" id="learn-hub-view">
      
      {/* Page Headers & Unified Game Dashboard */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        
        {/* Hub Introduction - takes 2 cols */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-display font-bold text-stone-900 dark:text-stone-50">
            Climate Insights & Myths Hub
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Deconstruct standard misconceptions, test your sustainability logic with interactive puzzles, and acquire Climate Knowledge points to level-up.
          </p>
        </div>

        {/* Truth Seeker Progression Stats and Level Widget */}
        <div className="rounded-2xl border-2 border-forest-600 bg-stone-900 p-5 text-white dark:bg-stone-950/30 relative overflow-hidden flex flex-col justify-between" id="truth-seeker-progress-widget">
          <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-forest-600/10 blur-md pointer-events-none"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono tracking-wider">Truth Seeker Progression</span>
              <h3 className="text-xl font-display font-bold text-white mt-1">
                {knowledgeLevel}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-600 text-white shadow-md text-xl">
              🧠
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-stone-300">
              <span>Lessons completed: <strong>{completedLessons.length} / 8</strong></span>
              <span>{totalPoints} KP</span>
            </div>
            
            {/* Progress Bar towards Next Rank Tiers */}
            <div className="h-2 w-full bg-stone-850 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${overallProgressPercent}%` }}
              ></div>
            </div>

            <p className="text-[9.5px] text-stone-400 font-mono tracking-wide">
              {completedLessons.length >= 8 
                ? "👑 Maximum Knowledge Rank unlocked! You are a certified Carbon Master."
                : `Complete ${nextLevelGoal - completedLessons.length} more topics to unlock the next level badge.`}
            </p>
          </div>
        </div>

      </div>

      {/* Grid: Main definitions block vs Myth expander */}
      <div className="grid gap-8 lg:grid-cols-3">

        {/* Column 1 & 2: Conceptual Definitions and reading checks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: What is my carbon footprint anyway? */}
          <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-md dark:border-stone-850 dark:bg-stone-900 space-y-3">
            <h3 className="font-display font-semibold text-stone-905 dark:text-stone-50 text-base flex items-center gap-1.5">
              <BookOpen className="h-4.5 w-4.5 text-forest-600" />
              <span>What is a Carbon Footprint?</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans mt-2">
              A carbon footprint is the cumulative quantity of greenhouse gases—primarily carbon dioxide (<span className="font-mono">CO₂</span>) and methane—released into the earth's atmosphere because of our daily activities. We measure these outputs in kilograms of carbon dioxide equivalents (<span className="font-mono font-bold">kg CO₂e</span>) to match heat-trapping potentials neatly.
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans font-medium">
              We divide an average individual's activities into 5 key emission segments: transport, food/diet, home utilities charging, lifestyle shopping waste, and recycled composting offsets.
            </p>
          </div>

          {/* Cards list: why categories matter */}
          <div className="grid gap-4.5 sm:grid-cols-2">
            {lessons.map((item, idx) => {
              const checked = isLessonChecked(item.id);
              return (
                <div 
                  key={item.id} 
                  className={`rounded-xl border p-5 transition-all duration-300 flex flex-col justify-between ${checked ? 'border-emerald-300 bg-emerald-500/5 dark:border-emerald-900/40 dark:bg-emerald-950/10' : 'border-stone-150 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-900/50'}`}
                  id={`lesson-card-${item.id}`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xl leading-none">{item.emoji}</span>
                      {checked && (
                        <span className="text-[9px] uppercase font-mono text-emerald-600 dark:text-emerald-450 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <Check className="h-2.5 w-2.5" /> Read
                        </span>
                      )}
                    </div>
                    <h4 className="font-display font-bold text-stone-900 dark:text-stone-50 text-sm mt-3">
                      {item.title}
                    </h4>
                    <p className="text-[11.5px] text-stone-505 dark:text-stone-405 leading-relaxed mt-2 font-sans">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-150/50 dark:border-stone-800/60">
                    {checked ? (
                      <div className="text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                        <span>✓ Lesson completed (+10 KP)</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => completeLesson(item.id)}
                        className="w-full text-center text-xs font-bold text-forest-700 bg-forest-100 hover:bg-forest-150 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/30 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        Mark Lesson Completed
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Column 3: Collapsible Myth vs Fact cards */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-lg dark:border-stone-850 dark:bg-stone-900" id="myth-busters-widget">
            <h3 className="font-display font-semibold text-stone-900 dark:text-stone-50 text-base mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="h-4.5 w-4.5 text-amber-500" />
              <span>Interactive Myth Busters</span>
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Explore common sustainability misconceptions. For each myth, check out user popularity stats, read details, and complete the quick mini-puzzle quiz to earn Climate points!
            </p>

            <div className="space-y-3">
              {myths.map((myth, idx) => {
                const isActive = activeMyth === idx;
                const mythCompleted = completedLessons.includes(myth.id);
                const selection = quizSelected[myth.id];
                const isCorrectVal = selection === myth.quiz.correctIndex;
                const submissionChecked = quizSubmitted[myth.id];

                return (
                  <div 
                    key={myth.id}
                    className={`border rounded-xl spill-hidden transition-all duration-300 text-xs overflow-hidden ${mythCompleted ? 'border-emerald-300 bg-emerald-500/5 dark:border-emerald-900/30' : isActive ? 'border-stone-300 dark:border-stone-750' : 'border-stone-150 dark:border-stone-800'}`}
                    id={`myth-fact-card-${myth.id}`}
                  >
                    {/* Header trigger */}
                    <button
                      onClick={() => setActiveMyth(isActive ? null : idx)}
                      className="flex w-full justify-between items-start p-3.5 text-left font-bold text-stone-850 dark:text-stone-100 bg-stone-50/50 dark:bg-stone-950/20 hover:bg-stone-100/40"
                    >
                      <span className="leading-tight pr-2">{myth.m}</span>
                      {isActive ? <ChevronUp className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" /> : <ChevronDown className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />}
                    </button>

                    {/* Collapsible details + mini-quiz */}
                    {isActive && (
                      <div className="p-3.5 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 animate-fade-in space-y-4">
                        
                        {/* Facts details block */}
                        <div className="text-[11.5px] text-stone-500 dark:text-stone-400 leading-relaxed font-sans pr-1">
                          {myth.f}
                        </div>

                        {/* Myth popularity statistics */}
                        <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-950/40 border border-stone-100 dark:border-stone-850 space-y-1.5">
                          <span className="text-[9px] uppercase font-mono text-stone-400 font-bold block">Community Statistics</span>
                          <div className="flex justify-between text-[10px] font-mono text-stone-505">
                            <span>Believed this myth initially:</span>
                            <span className="font-bold text-stone-800 dark:text-stone-300">{myth.believedPercent}%</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-mono text-stone-505">
                            <span>Answered correct first try:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-450">{myth.answeredCorrectPercent}%</span>
                          </div>
                        </div>

                        {/* Quick validation mini-quiz */}
                        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                          <div className="flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-[10px] font-bold font-mono text-stone-405 uppercase">Test My Knowledge Puzzle:</span>
                          </div>
                          <p className="text-[11px] font-bold text-stone-800 dark:text-stone-200 leading-tight">
                            {myth.quiz.q}
                          </p>

                          <div className="space-y-1.5 pt-1.5">
                            {myth.quiz.options.map((option, optIdx) => {
                              const isSelected = selection === optIdx;
                              return (
                                <button
                                  key={optIdx}
                                  disabled={mythCompleted}
                                  onClick={() => handleQuizSelect(myth.id, optIdx)}
                                  className={`w-full p-2.5 rounded-lg text-left text-[11px] font-semibold flex items-center justify-between border transition-all ${mythCompleted && optIdx === myth.quiz.correctIndex ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/60' : isSelected ? 'bg-forest-50 border-forest-500 text-forest-700 dark:bg-stone-850 dark:border-forest-600 dark:text-stone-200' : 'bg-stone-50 border-stone-150 text-stone-700 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-400 hover:bg-stone-100/50'}`}
                                >
                                  <span>{option}</span>
                                  {mythCompleted && optIdx === myth.quiz.correctIndex && (
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Action Submit */}
                          {!mythCompleted && selection !== undefined && (
                            <div className="pt-2">
                              <button
                                onClick={() => handleQuizSubmit(myth.id, myth.quiz.correctIndex, selection)}
                                className="w-full text-center text-xs font-bold bg-forest-600 text-white hover:bg-forest-700 px-3.5 py-2.5 rounded-xl cursor-pointer"
                              >
                                Submit Answer
                              </button>
                            </div>
                          )}

                          {/* Submission Feedback */}
                          {submissionChecked && !mythCompleted && (
                            <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/15 text-[10.5px] text-rose-600 dark:text-rose-400 flex items-start gap-1">
                              <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                              <span>Try again! Review the Fact statement details above for clues and hints.</span>
                            </div>
                          )}

                          {mythCompleted && (
                            <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-450 font-bold flex items-center gap-1 pt-1.5">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Verified correct! +10 KP awarded to profile.</span>
                            </p>
                          )}

                        </div>

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

