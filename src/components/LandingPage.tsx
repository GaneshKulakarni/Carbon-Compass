import React, { useState, useEffect, Suspense } from 'react';
import { useApp } from '../context/AppContext';
import plasticShroudImg from '../assets/plastic_shroud.png';
// Lazy-load the Three.js globe — defers the ~400KB Three.js bundle until needed
const InteractiveGlobe = React.lazy(() => import('./InteractiveGlobe').then(m => ({ default: m.InteractiveGlobe })));
import { 
  Compass, Leaf, ArrowRight, Play, CheckCircle2, ShieldCheck, 
  Zap, Heart, TrendingDown, RefreshCw, BarChart, ChevronDown, 
  ChevronUp, Quote, AlertTriangle, ExternalLink, Globe, 
  ChevronLeft, ChevronRight, HelpCircle, UploadCloud, 
  Sparkles, Trash2, Loader2, Camera, Info
} from 'lucide-react';

interface LandingPageProps {
  onOpenMethodology: () => void;
}

interface TragedySlide {
  title: string;
  subtitle: string;
  description: string;
  significance: string;
  quote: string;
  author: string;
  imageUrl: string;
  stat: string;
  statLabel: string;
  isUserUploaded?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenMethodology }) => {
  const { 
    setActiveTab, 
    loadDemoMode,
    userTragedy,
    setUserTragedy,
    selectedFileBase64,
    setSelectedFileBase64
  } = useApp();
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeViewMode, setActiveViewMode] = useState<'scars' | 'healing'>('scars');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showGlobeHint, setShowGlobeHint] = useState(false);

  // Upload & Scan state
  const [selectedMimeType, setSelectedMimeType] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatusMsg, setScanStatusMsg] = useState('Initiating spectrum check...');

  // Active status log loop for Gemini analyzing
  const systemLogsMsg = [
    "Preparing image buffer...",
    "Scanning microplastic indices...",
    "Analyzing industrial soot plumes...",
    "Querying deep climatic databases...",
    "Drafting conservation citations...",
    "Synthesizing raw emotional manifesto..."
  ];

  useEffect(() => {
    let logInterval: NodeJS.Timeout;
    if (isScanning) {
      let index = 0;
      setScanStatusMsg(systemLogsMsg[0]);
      logInterval = setInterval(() => {
        index = (index + 1) % systemLogsMsg.length;
        setScanStatusMsg(systemLogsMsg[index]);
      }, 2500);
    }
    return () => clearInterval(logInterval);
  }, [isScanning]);

  // Handle uploaded files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError("Please provide a valid image file.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Image must be smaller than 8MB.");
      return;
    }

    setUploadError(null);
    setUserTragedy(null);
    setSelectedMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFileBase64(reader.result as string);
    };
    reader.onerror = () => {
      setUploadError("Error reading image file.");
    };
    reader.readAsDataURL(file);
  };

  // Run the Realtime Gemini Scan
  const triggerGeminiScan = async () => {
    if (!selectedFileBase64) return;
    setIsScanning(true);
    setUploadError(null);

    try {
      const response = await fetch("/api/gemini/analyze-scar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedFileBase64,
          mimeType: selectedMimeType || "image/jpeg"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to scan image.");
      }

      const data = await response.json();
      
      const newTragedy: TragedySlide = {
        title: data.title || "The Unseen Scar",
        subtitle: data.subtitle || "A human-induced environmental anomaly",
        description: data.description || "An image depicting the ongoing shift of our natural biosphere due to synthetic footprints.",
        significance: data.significance || "Reflects local ecological imbalances captured by user exploration.",
        quote: data.quote || "Our choice lies not in ignoring the scar, but in building the active compass to reverse it.",
        author: data.author || "Carbon Compass AI Curator",
        imageUrl: selectedFileBase64,
        stat: data.stat || "100%",
        statLabel: data.statLabel || "Urgent attention status",
        isUserUploaded: true
      };

      setUserTragedy(newTragedy);
      // Automatically switch slide view to this newly uploaded scar as index 0
      setActiveSlide(0);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Could not connect to Gemini server. Please check your network or key.";
      setUploadError(errMsg);
    } finally {
      setIsScanning(false);
    }
  };

  // Remove the currently custom curated file
  const removeUploadedFile = () => {
    setSelectedFileBase64(null);
    setSelectedMimeType('');
    setUploadError(null);
    setUserTragedy(null);
    setActiveSlide(0);
  };

  // Local Offline Curator Fallback Template calibration
  const applyOfflineCurationTemplate = (category: 'plastic' | 'industry' | 'landfill' | 'urban') => {
    if (!selectedFileBase64) return;
    
    let templateData: Partial<TragedySlide> = {};
    if (category === 'plastic') {
      templateData = {
        title: "The Silent Strangulation",
        subtitle: "Unregulated single-use synthetic polymers choke our waterways",
        description: "An evocative perspective highlighting how ubiquitous plastic films and packaging wrap around organic structures, restricting access to clean nutrition and trapping vital aquatic life.",
        significance: "More than 14 million metric tons of plastic enter our rivers and oceans annually. Curated as part of your local environmental observation routine.",
        quote: "The ocean is not a bottomless waste receptacle. What we discard on land inevitably floats back to define our future.",
        author: "Earthday Network Campaign",
        stat: "14,000,000 t",
        statLabel: "Annual global marine plastic inflow"
      };
    } else if (category === 'industry') {
      templateData = {
        title: "The Industrial Vapor",
        subtitle: "Atmospheric accumulation of heavy particulate exhaust plumes",
        description: "A striking, high-contrast look at the dense carbonaceous plumes ascending over our communities. Evaporative cooling systems and greenhouse chimneys alter the local moisture-saturation vectors.",
        significance: "Industrial combustion and transportation are responsible for over 72% of annual greenhouse gas metrics.",
        quote: "We are putting 110 million tons of heat-trapping pollution into the sky every 24 hours.",
        author: "Al Gore, Climate Reality Project",
        stat: "421.3 ppm",
        statLabel: "Current carbon-dioxide saturation"
      };
    } else if (category === 'landfill') {
      templateData = {
        title: "Accumulation Mountain",
        subtitle: "Domestic and commercial solid waste pile overflowing",
        description: "A stark physical look at consumer culture. When items are thrown 'away', they reside in monumental geometric coordinates outside our city lines, leaking methane and non-degradable chemical components into our fertile soils.",
        significance: "Methane released by food waste and standard organic landfill decompositions is 28 times more potent than carbon dioxide.",
        quote: "Production must join regeneration. There can be no linear discard on a finite, spherical planet.",
        author: "Ellen MacArthur Foundation",
        stat: "2.5x",
        statLabel: "Methane warming potency factor"
      };
    } else if (category === 'urban') {
      templateData = {
        title: "Concrete Heat Spheres",
        subtitle: "Micro-climatic asphalt structures absorbing solar radiation",
        description: "An urban observation of the sparse organic coverage. Sprawling dark-colored cement roadways and vertical walls retain massive thermal heat loads during the day, producing stressful microclimates.",
        significance: "Urban areas can feel up to 12°F warmer than surrounding natural wilderness corridors due to artificial materials.",
        quote: "Trees in our neighborhoods act as organic cooling mechanisms. Shade is a fundamental matter of climatic justice.",
        author: "World Resources Institute (WRI)",
        stat: "+12°F",
        statLabel: "Urban heat island temperature offset"
      };
    }

    const newTragedy: TragedySlide = {
      title: templateData.title || "The Curated Observation",
      subtitle: templateData.subtitle || "Environmental observation curated locally",
      description: templateData.description || "A user-uploaded image demonstrating human ecosystem impact.",
      significance: templateData.significance || "Reflects everyday ecological actions registered by personal tracking.",
      quote: templateData.quote || "To see the scar is to begin building its active resolution roadmap.",
      author: templateData.author || "Carbon Compass Offline Curator",
      imageUrl: selectedFileBase64,
      stat: templateData.stat || "100%",
      statLabel: templateData.statLabel || "Custom analysis status",
      isUserUploaded: true
    };

    setUserTragedy(newTragedy);
    setUploadError(null);
    setActiveSlide(0);
  };

  // The default 5 tragedies
  const tragedies: TragedySlide[] = [
    {
      title: "The Plastic Shroud",
      subtitle: "Marine Life Trapped Inside Discarded Human Plastic",
      description: "A vibrant clownfish seeking refuge inside a transparent, human surgical plastic glove floating listlessly in the deep oceanic abyss. Unable to escape, innocent species are physically and chemically confined by our synthetic legacy.",
      significance: "This photograph depicts our everyday synthetic footprint suffocating marine ecosystems from inside out. Microparticles and single-use polymer waste now dominate coral habitats globally.",
      quote: "Every single piece of plastic ever created still exists somewhere on this planet. It has found its way to the hearts of our pristine seas.",
      author: "World Wildlife Fund (WWF)",
      imageUrl: plasticShroudImg,
      stat: "8,000,000 t",
      statLabel: "Plastic dumped in oceans yearly"
    },
    {
      title: "The Divided Horizon",
      subtitle: "The Ash-Choked Earth vs. The Legacy of Play",
      description: "A man squatting in a heavy respirator gas mask over a toxic, plastic-strewn industrial stream. But in his clear water reflection, we observe a young, innocent boy playing freely with a dog in a lush green clover meadow.",
      significance: "An evocative representation showing how our children inherit a scarred, industrial-ash wasteland, surviving on recycled clean air, whilst holding the deep evolutionary memory of what pristine greenery once felt like.",
      quote: "We do not inherit the Earth from our ancestors; we borrow it from our children.",
      author: "United Nations Secretariat (UNFCCC)",
      imageUrl: "https://images.unsplash.com/photo-1611270629569-8b357cb88da9?q=80&w=1000",
      stat: "421 ppm",
      statLabel: "Carbon concentration in air today"
    },
    {
      title: "Inherited Skies",
      subtitle: "A Child Cultivating the Fragile Sapling of Hope",
      description: "A small child kneeling in the dirt, wearing a heavy, metal oxygen filtration tank and visual respirator mask, gently tending to a tiny green plant in a pot under an industrial skyline filled with soot-colored smoke plumes.",
      significance: "Symbolizes a generation that breathes artificial, packaged oxygen, struggling to defend and nurture the last remaining sparks of organic growth in our cities.",
      quote: "Children are the least responsible for the climate crisis, yet they will pay the heaviest price of our atmospheric choices.",
      author: "Intergovernmental Panel on Climate Change (IPCC)",
      imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000",
      stat: "99%",
      statLabel: "Of children breathe polluted air globally"
    },
    {
      title: "Drowning in Discard",
      subtitle: "A Swimmer Navigating a Tide of Human Waste",
      description: "A solo swimmer desperately reaching an arm above a heavy, thick surface layer of floating plastic bottles, crushed aluminium cans, and shredded landfill waste, with beautiful open water far off on the horizon.",
      significance: "No longer a theoretical warning about tomorrow; this is our active reality. We are quite literally drowning in the physical, discarded packaging of our fast-paced consumption cultures.",
      quote: "Our planet is overwhelmed by plastic. Within a generation, human debris has replaced marine flora as the surface norm.",
      author: "United Nations Environment Programme",
      imageUrl: "https://images.unsplash.com/photo-1526951521990-620dc14c214b?q=80&w=1000",
      stat: "1:1",
      statLabel: "Ratio of plastic to fish by 2050"
    },
    {
      title: "The Synthetic Mountain",
      subtitle: "The Mountains of Outcast Discard Over the Sunrise",
      description: "Sprawling, massive hills of discarded plastic chairs, household trash, oil containers, and debris taking over a whole coastline under a beautiful, smog-hazed, rust-colored sunset.",
      significance: "A high-fidelity gaze into where our trash actually goes. 'Away' does not exist on a closed spherical planet; 'away' is simply onto the soil of our marginalized wildernesses.",
      quote: "There is no such thing as 'away'. When we throw anything away, it must go somewhere.",
      author: "Project Drawdown",
      imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=1000",
      stat: "2.1 Billion",
      statLabel: "Tons of solid waste created annually"
    }
  ];

  // Combine user curated tragedy with official slides smoothly
  const activeTragediesList = userTragedy ? [userTragedy, ...tragedies] : tragedies;

  const faqs = [
    {
      q: "Who is behind Carbon Compass, and what is your motive?",
      a: "We are an independent team of ecological designers and developers. We build tools that replace overwhelming climate anxiety with localized personal Agency. By confronting the graphic reality of environmental scarring, we don't foster despair—we build active, step-by-step roadmaps to reverse our personal emissions."
    },
    {
      q: "How does the Carbon Compass calculator calculate my footprint?",
      a: "Our system calculates home transportation, diets, electricity, and shopping habits against the peer-reviewed greenhouse parameters developed by the IPCC and Project Drawdown. We map simple, daily actions to physical savings in kilograms of CO₂ equivalents, localizing global values to your browser."
    },
    {
      q: "Do I have to enter my utilities bills or pay anything?",
      a: "Never. Carbon Compass is completely free and works off-line. Your tracking data stays safely in your local browser state. It is a humble interactive game of global care."
    },
    {
      q: "How does the Interactive Globe work?",
      a: "The interactive Three.js 3D earth model responds dynamically to your tracking logs. As you log carbon offsets (car commutes dropped, vegetarian meals eaten), a real-time restoration algorithm shifts heat colors back towards vibrant green, simulating healing!"
    }
  ];

  // Auto scroll tragedy images slightly over time unless it's user uploaded
  useEffect(() => {
    if (activeViewMode === 'scars' && !isScanning) {
      const timer = setInterval(() => {
        // If the active slide is a user tragedy, don't rush auto-scrolling away instantly
        setActiveSlide((prev) => (prev + 1) % activeTragediesList.length);
      }, 7500);
      return () => clearInterval(timer);
    }
  }, [activeViewMode, activeTragediesList.length, isScanning]);

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen text-stone-900 dark:text-stone-100 transition-colors duration-300 font-sans" id="landing-container">
      
      {/* 1. Header & Humanized Manifest Banner */}
      <header className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-stone-200 dark:border-stone-850 pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 rounded-full bg-orange-100/80 dark:bg-orange-950/30 px-3 py-1 text-[11px] font-mono font-bold tracking-wide text-orange-850 dark:text-orange-400 border border-orange-200/40">
              <AlertTriangle className="h-3.5 w-3.5 animate-pulse text-orange-600 dark:text-orange-400" />
              <span>THE PLANETARY EXHIBITION & RESOLUTION SUITE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-stone-950 dark:text-stone-50">
              This is the state of our <span className="bg-gradient-to-r from-orange-600 to-emerald-500 bg-clip-text text-transparent">destruction.</span>
            </h1>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('onboarding')}
              className="px-5 py-3 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/10 hover:translate-y-[-1px] cursor-pointer"
              id="cta-top-onboarding"
            >
              <span>Commit to Action</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={loadDemoMode}
              className="px-5 py-3 text-xs font-bold rounded-xl text-stone-700 bg-white border border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 hover:bg-stone-100 transition-all cursor-pointer"
              id="cta-top-demo"
            >
              Load Demo Path
            </button>
          </div>
        </div>
      </header>

      {/* 2. Manifesto Split Section: Confronting Scars vs. Digital Healing Globe */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 animate-fade-in" id="manifesto-interactive-split">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* Left Column - Core Narrative and Custom Interactive File-Scan Section */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div>
              <span className="text-xs font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block mb-1">
                Confronting Reality
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display leading-tight text-stone-900 dark:text-stone-50">
                A Poetic Lens.<br />Activating Visual RESTORATION.
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              <p>
                <strong>Carbon Compass</strong> is a platform built to dismantle climate paralysis. We believe that looking directly at the visual tragedy of physical eco-damage is the only way to trigger real change. 
              </p>
              <p>
                Whether it is a clownfish trapped in human plastic or a landscape you photographed in your own neighborhood—we translate these raw images into immediate, empowering micro-actions.
              </p>
            </div>

            {/* Premium Artifact Upload Sandbox ("Images Uploaded by Me & Real-time Gemini API Scan") */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-stone-100/50 to-stone-200/20 dark:from-stone-900/40 dark:to-stone-900/10 border border-stone-200 dark:border-stone-850 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="h-4 w-4 text-orange-500 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#ce502e] dark:text-orange-400">
                    EXHIBIT YOUR DISCOVERY
                  </span>
                </div>
                <span className="text-[9px] bg-stone-200/75 dark:bg-stone-800 text-stone-500 px-2 py-0.5 rounded font-mono">
                  MULTIMODAL GEMINI
                </span>
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                Upload your own photograph of an environmental scar or waste issue. Gemini will read it in real time to create an active conservation card complete with custom scientific calibrations!
              </p>

              {/* Upload Dropzone Container */}
              {!selectedFileBase64 ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 dark:border-stone-800 rounded-xl p-6 cursor-pointer hover:bg-stone-100/50 dark:hover:bg-stone-900/30 transition group">
                  <UploadCloud className="h-8 w-8 text-stone-400 group-hover:text-orange-500 transition mb-2" />
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 text-center">
                    Select local photo file
                  </span>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                    Up to 8MB. PNG, JPG or WebP
                  </span>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept="image/*" 
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  {/* Polaroid Frame Preview */}
                  <div className="relative rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-950/40 p-2">
                    <div className="relative h-32 rounded-md overflow-hidden group/preview">
                      <img 
                        src={selectedFileBase64} 
                        alt="Local Upload Preview" 
                        className="w-full h-full object-cover group-hover/preview:opacity-75 transition-opacity" 
                      />
                      
                      {/* Change image overlay */}
                      {!isScanning && (
                        <label className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover/preview:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] font-bold cursor-pointer">
                          <UploadCloud className="h-5 w-5 mb-1 text-orange-400 animate-pulse" />
                          <span>Click to Change Image</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={handleFileChange} 
                            accept="image/*" 
                          />
                        </label>
                      )}
                    </div>
                    
                    {!userTragedy && !isScanning && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeUploadedFile();
                        }}
                        className="absolute top-4 right-4 h-8 w-8 rounded-full bg-stone-950/80 hover:bg-red-950 text-white flex items-center justify-center border border-stone-800 transition z-10"
                        title="Remove uploaded image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Upload Actions */}
                  {uploadError && (
                    <div className="space-y-3 font-sans">
                      <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-bold">Gemini API Congestion or Under High-Demand (503)</p>
                            <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-300">
                              The shared Google AI model is currently busy. No worries! You can instantly calibrate your photo manually using our **Offline Scientific Presets** below:
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Asymmetric selector pills */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => applyOfflineCurationTemplate('plastic')}
                          className="px-3 py-2 bg-white dark:bg-stone-900 hover:bg-stone-50 border border-stone-200 dark:border-stone-850 hover:border-orange-500 rounded-xl text-left text-[11px] font-bold text-stone-800 dark:text-stone-200 cursor-pointer transition flex items-center gap-1.5"
                        >
                          <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                          <span>Water & Plastics</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => applyOfflineCurationTemplate('industry')}
                          className="px-3 py-2 bg-white dark:bg-stone-900 hover:bg-stone-50 border border-stone-200 dark:border-stone-850 hover:border-orange-500 rounded-xl text-left text-[11px] font-bold text-stone-800 dark:text-stone-200 cursor-pointer transition flex items-center gap-1.5"
                        >
                          <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                          <span>Industrial Plumes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => applyOfflineCurationTemplate('landfill')}
                          className="px-3 py-2 bg-white dark:bg-stone-900 hover:bg-stone-50 border border-stone-200 dark:border-stone-850 hover:border-orange-500 rounded-xl text-left text-[11px] font-bold text-stone-800 dark:text-stone-200 cursor-pointer transition flex items-center gap-1.5"
                        >
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>Trash Landfill</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => applyOfflineCurationTemplate('urban')}
                          className="px-3 py-2 bg-white dark:bg-stone-900 hover:bg-stone-50 border border-stone-200 dark:border-stone-850 hover:border-orange-500 rounded-xl text-left text-[11px] font-bold text-stone-800 dark:text-stone-200 cursor-pointer transition flex items-center gap-1.5"
                        >
                          <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                          <span>Urban Heat Island</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {!userTragedy ? (
                    <button
                      onClick={triggerGeminiScan}
                      disabled={isScanning}
                      className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>{scanStatusMsg}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 animate-pulse text-white" />
                          <span>Run Real-time Gemini Scan</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1 p-2 rounded-xl border border-emerald-200 dark:border-emerald-950 text-emerald-700 dark:text-emerald-400 bg-emerald-100/20 text-center font-bold text-[10px] flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>Curated live into Exhibition Slide #1!</span>
                      </div>
                      <button 
                        onClick={removeUploadedFile}
                        className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-red-500 transition cursor-pointer"
                        title="Clear and reset upload"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Interactive Statistics Badge Grid */}
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3.5 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-850 rounded-xl">
                <span className="text-[10px] text-stone-400 uppercase block">Marine Plastic</span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400 block mt-0.5">85%</span>
                <span className="text-[9px] text-stone-400 leading-tight block">Contains microplastics</span>
              </div>
              <div className="p-3.5 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-850 rounded-xl">
                <span className="text-[10px] text-stone-400 uppercase block">Urgent Action</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">1-Click</span>
                <span className="text-[9px] text-stone-400 leading-tight block">Logging response preset</span>
              </div>
            </div>
          </div>

          {/* Right Column - Immersive Exhibition Container (Conform vs Heal Interactive Card) */}
          <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-850 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6" id="exhibition-visual-stage">
            
            {/* Visual View-Mode Selector (Tragedy Scars vs Restoring Globe) */}
            <div className="flex bg-stone-100 dark:bg-stone-950 p-1.5 rounded-2xl border border-stone-200/50 dark:border-stone-850/80">
              <button
                onClick={() => setActiveViewMode('scars')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold rounded-xl transition cursor-pointer ${
                  activeViewMode === 'scars' 
                    ? 'bg-white text-stone-900 shadow-md dark:bg-stone-800 dark:text-white' 
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                id="btn-tab-exhibit-scars"
              >
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span>Confronting Our Scars</span>
              </button>

              <button
                onClick={() => setActiveViewMode('healing')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold rounded-xl transition cursor-pointer ${
                  activeViewMode === 'healing' 
                    ? 'bg-white text-stone-900 shadow-md dark:bg-stone-800 dark:text-white' 
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                id="btn-tab-exhibit-healing"
              >
                <Globe className="h-4 w-4 text-emerald-500" />
                <span>The Restorative Globe</span>
              </button>
            </div>

            {activeViewMode === 'scars' ? (
              /* VIEW 1: Interactive Animated Tragedy slideshow representing user images */
              <div className="space-y-4 animate-fade-in" id="tragedy-scars-slider">
                <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden group shadow-lg border border-stone-200 dark:border-stone-800 bg-stone-900">
                  
                  {isScanning ? (
                    /* SCANNING PLACEHOLDER CARDS WITH COOL SHIMMER */
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-stone-950 text-white space-y-4">
                      <div className="p-4 bg-orange-500/10 rounded-full border border-orange-500/30 animate-pulse">
                        <Sparkles className="h-10 w-10 text-orange-400 animate-spin" />
                      </div>
                      <div className="space-y-2 max-w-sm">
                        <h4 className="font-display font-extrabold text-lg text-stone-100 uppercase tracking-wider">
                          GEMINI SPECTRAL SCANNING
                        </h4>
                        <p className="text-xs text-stone-400 font-mono animate-pulse">
                          {scanStatusMsg}
                        </p>
                      </div>
                      <div className="w-1/2 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-emerald-400 animate-loading-bar rounded-full" />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Backdrop Image - with smooth transition effects */}
                      <img
                        src={activeTragediesList[activeSlide]?.imageUrl}
                        alt={activeTragediesList[activeSlide]?.title}
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        id={`active-slide-img-${activeSlide}`}
                      />

                      {/* Gradient Shadow scrim for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 via-80% to-transparent" />

                      {/* Bottom textual banner overlay */}
                      <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white space-y-1.5">
                        <div className="flex justify-between items-end gap-4">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-orange-400 bg-orange-950/85 px-2.5 py-1 rounded-md border border-orange-850/40 flex items-center gap-1 shrink-0">
                            {activeTragediesList[activeSlide]?.isUserUploaded ? (
                              <>
                                <Sparkles className="h-3 w-3 text-orange-400" />
                                <span>Curated Discovery</span>
                              </>
                            ) : (
                              <span>Scar Exhibition {activeSlide + 1} of {activeTragediesList.length}</span>
                            )}
                          </span>
                          <div className="text-right">
                            <span className="text-[17px] font-extrabold font-mono text-orange-400 block tracking-tight leading-none mb-1">
                              {activeTragediesList[activeSlide]?.stat}
                            </span>
                            <span className="text-[8px] font-mono text-stone-400 uppercase tracking-widest block leading-none">
                              {activeTragediesList[activeSlide]?.statLabel}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg sm:text-xl font-display font-black tracking-tight leading-tight pt-1">
                          {activeTragediesList[activeSlide]?.title}
                        </h3>
                        <p className="text-[10px] uppercase font-mono tracking-wider text-stone-300 font-semibold">
                          {activeTragediesList[activeSlide]?.subtitle}
                        </p>
                      </div>

                      {/* Previous & Next Arrow Controls on Hover */}
                      <div className="absolute top-1/2 -translate-y-1/2 left-3 opacity-0 group-hover:opacity-100 transition duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlide((prev) => (prev - 1 + activeTragediesList.length) % activeTragediesList.length);
                          }}
                          className="h-10 w-10 rounded-full bg-stone-950/85 backdrop-blur border border-stone-800 text-white flex items-center justify-center hover:bg-stone-900 select-none cursor-pointer"
                          id="btn-slide-prev"
                          aria-label="Previous slide"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-0 group-hover:opacity-100 transition duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlide((prev) => (prev + 1) % activeTragediesList.length);
                          }}
                          className="h-10 w-10 rounded-full bg-stone-950/85 backdrop-blur border border-stone-800 text-white flex items-center justify-center hover:bg-stone-900 select-none cursor-pointer"
                          id="btn-slide-next"
                          aria-label="Next slide"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Narrative Caption Card - Human-written feeling commentary */}
                {!isScanning && activeTragediesList[activeSlide] && (
                  <div className="p-4 bg-orange-50/20 dark:bg-orange-950/5 rounded-2xl border border-orange-200/50 dark:border-orange-900/10 space-y-3">
                    <div className="flex items-center justify-between text-orange-700 dark:text-orange-400 font-mono text-[10px] font-bold uppercase tracking-widest">
                      <span>Active Exhibit Spotlight</span>
                      {activeTragediesList[activeSlide]?.isUserUploaded && (
                        <span className="text-[8px] font-mono bg-orange-100 dark:bg-orange-950 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-900 text-orange-700 dark:text-orange-400 uppercase font-semibold">
                          USER INTAKE SCAN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                      {activeTragediesList[activeSlide]?.description}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 italic leading-relaxed pl-3 border-l-2 border-orange-500/50">
                      "{activeTragediesList[activeSlide]?.significance}"
                    </p>

                    <div className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug bg-stone-150/40 dark:bg-stone-950/40 p-3 rounded-lg border border-stone-200/30 flex items-start gap-2 italic">
                      <Quote className="h-4 w-4 shrink-0 text-stone-400 mt-0.5" />
                      <span>
                        "{activeTragediesList[activeSlide]?.quote}" — <strong className="font-bold font-sans not-italic text-stone-600 dark:text-stone-300">{activeTragediesList[activeSlide]?.author}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* Playback dots list */}
                <div className="flex justify-center items-center gap-1.5 pt-1">
                  {activeTragediesList.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${activeSlide === i ? 'w-6 bg-orange-500' : 'w-2 bg-stone-200 dark:bg-stone-800'}`}
                      title={`Go to slide ${i+1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* VIEW 2: The dynamic 3D Active Globe visual representational context */
              <div className="space-y-4 animate-slide-up" id="hologram-eco-healing">
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800/80 bg-stone-950 relative overflow-hidden p-1.5">
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-48 text-stone-500">
                      <div className="text-center space-y-2">
                        <div className="h-8 w-8 rounded-full border-2 border-stone-600 border-t-emerald-400 animate-spin mx-auto" />
                        <p className="text-[10px] font-mono tracking-widest uppercase">Initializing Globe...</p>
                      </div>
                    </div>
                  }>
                    <InteractiveGlobe showOnlyGlobe={true} size="md" />
                  </Suspense>
                  
                  {/* Subtle technical branding overlay */}
                  <div className="absolute top-4 left-4 pointer-events-none flex items-center space-x-1.5 bg-stone-950/90 backdrop-blur-md border border-stone-800 px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-wide uppercase text-stone-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>3D Live Ecological Grid Simulator</span>
                  </div>

                  {/* Floating ? question help button */}
                  <button
                    onClick={() => setShowGlobeHint(!showGlobeHint)}
                    className="absolute top-4 right-4 z-20 h-7 w-7 rounded-full bg-stone-900/95 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 flex items-center justify-center transition shadow-md cursor-pointer font-bold font-mono text-sm"
                    id="btn-globe-help-icon"
                    title="How to heal the globe"
                  >
                    ?
                  </button>

                  {/* Interactive Help dialogue overlay */}
                  {showGlobeHint && (
                    <div className="absolute inset-x-4 top-14 z-30 bg-stone-900/95 backdrop-blur-md border border-emerald-500/40 p-4 rounded-xl text-stone-100 shadow-xl text-xs space-y-2 animate-fade-in">
                      <div className="flex justify-between items-center pb-1.5 border-b border-stone-800">
                        <span className="font-bold text-emerald-400 uppercase tracking-wide text-[10px] flex items-center gap-1.5 font-mono">
                          <Globe className="h-3.5 w-3.5 text-emerald-400 animate-spin-slow" />
                          <span>Healing Earth Twin</span>
                        </span>
                        <button
                          onClick={() => setShowGlobeHint(false)}
                          className="text-stone-400 hover:text-white font-mono text-[10px] leading-none cursor-pointer px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-750"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="leading-relaxed font-sans text-stone-300">
                        This dynamic 3D world model turns from warning heat-red back to a vibrant, flourishing <strong className="text-emerald-400">green</strong> as you complete your healthy habits and contribute to the environment!
                      </p>
                      <p className="text-[10px] text-stone-400 leading-normal italic font-mono">
                        "Your daily tracking acts as physical ecological restoration."
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/5 rounded-2xl border border-emerald-200/40 dark:border-emerald-900/10 space-y-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    HOW THE COMPASS CLOSES THE LOOP
                  </span>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                    While the scars showcase the physical cost of our collective delay, **this Interactive Globe** acts as your scorecard. 
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                    Every transport compromise logged, green meal eaten, or home electricity saving logged shrinks the heat index of this digital model, restoring pristine ecological states in real time. We replace climate-grief loops with active virtual restoration.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* 3. The Citations Portal: Top Sustainability Research Systems on the Web */}
      <section className="bg-white dark:bg-stone-900 border-y border-stone-200 dark:border-stone-850 py-12" id="verified-citations-deck">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block">
              empirical validation
            </span>
            <h3 className="text-lg font-bold font-display text-stone-900 dark:text-stone-50">
              Standing on the shoulders of scientific arbiters.
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              Our calculations, checklists, and carbon factors are built from open emission guides and references supplied by the finest sustainability foundations on the internet. Trace our formulas or study world-ending facts at the official portals:
            </p>
          </div>

          {/* Clean human asymmetrical links gallery representing top sustainability sites */}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5 pt-4">
            
            <a
              href="https://www.drawdown.org/"
              target="_blank"
              rel="noreferrer"
              referrerPolicy="no-referrer"
              className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 hover:border-emerald-600 rounded-2xl flex flex-col justify-between text-left group transition shadow-xs"
              title="Visit Project Drawdown (opens in a new tab)"
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ce502e] dark:text-orange-400 block mb-1">
                  drawdown.org
                </span>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition block leading-tight">
                  Project Drawdown
                </span>
              </div>
              <p className="text-[10px] text-stone-400 dark:text-stone-400 leading-tight mt-2.5 font-sans">
                The world's premier scientific climate solutions directory.
              </p>
            </a>

            <a
              href="https://www.worldwildlife.org/"
              target="_blank"
              rel="noreferrer"
              referrerPolicy="no-referrer"
              className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 hover:border-emerald-600 rounded-2xl flex flex-col justify-between text-left group transition shadow-xs"
              title="Visit WWF (opens in a new tab)"
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ce502e] dark:text-orange-400 block mb-1">
                  worldwildlife.org
                </span>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition block leading-tight">
                  World Wildlife Fund
                </span>
              </div>
              <p className="text-[10px] text-stone-400 dark:text-stone-400 leading-tight mt-2.5 font-sans">
                Global guardians defending wildlife preservation and bio-sanctuarism.
              </p>
            </a>

            <a
              href="https://www.wri.org/"
              target="_blank"
              rel="noreferrer"
              referrerPolicy="no-referrer"
              className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 hover:border-emerald-600 rounded-2xl flex flex-col justify-between text-left group transition shadow-xs"
              title="Visit World Resources Institute (opens in a new tab)"
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ce502e] dark:text-orange-400 block mb-1">
                  wri.org
                </span>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition block leading-tight">
                  World Resources Institute
                </span>
              </div>
              <p className="text-[10px] text-stone-400 dark:text-stone-400 leading-tight mt-2.5 font-sans">
                A massive global research system turning resources data into action.
              </p>
            </a>

            <a
              href="https://www.earthday.org/"
              target="_blank"
              rel="noreferrer"
              referrerPolicy="no-referrer"
              className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 hover:border-emerald-600 rounded-2xl flex flex-col justify-between text-left group transition shadow-xs"
              title="Visit Earthday Network (opens in a new tab)"
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ce502e] dark:text-orange-400 block mb-1">
                  earthday.org
                </span>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition block leading-tight">
                  Earthday Network
                </span>
              </div>
              <p className="text-[10px] text-stone-400 dark:text-stone-400 leading-tight mt-2.5 font-sans">
                The massive civic force organizing active anti-plastic campaigns for decades.
              </p>
            </a>

            <a
              href="https://unfccc.int/"
              target="_blank"
              rel="noreferrer"
              referrerPolicy="no-referrer"
              className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 hover:border-emerald-600 rounded-2xl flex flex-col justify-between text-left group transition shadow-xs"
              title="Visit UNFCCC (opens in a new tab)"
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ce502e] dark:text-orange-400 block mb-1">
                  unfccc.int
                </span>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition block leading-tight">
                  UN Climate Change
                </span>
              </div>
              <p className="text-[10px] text-stone-400 dark:text-stone-400 leading-tight mt-2.5 font-sans">
                The international regulatory core driving global emissions standards.
              </p>
            </a>

          </div>
        </div>
      </section>

      {/* 4. Asymmetrical 3-Step Functional Strategy Loop */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16" id="three-step-manifesto-loop">
        <div className="grid gap-12 lg:grid-cols-3">
          
          <div className="space-y-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono font-bold text-sm shadow-xs animate-bounce-slow">
              01
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50 font-display">Confront the Budget</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              Enter our quick-budget template. No electricity-bill numbers or spreadsheets required. By answering lifestyle preferences on car rides, meat days, and home structures, you establish raw baseline statistics in under two minutes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 font-mono font-bold text-sm shadow-xs">
              02
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50 font-display">Test Dynamic Scenarios</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              Before committing to lifestyle changes, use our What-If Habit Simulator to slide variables—like going vegetarian 4 times a week, or using a smart thermostat. See directly which changes offer the highest environmental or economic returns for your lifestyle.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-mono font-bold text-sm shadow-xs">
              03
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50 font-display">Log Habit Receipts</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              Update daily victories using our quick 1-click tracker presets. Earn certified badges, check milestone progression bars in real-time, and download complete verified weekly climate compliance.
            </p>
          </div>

        </div>
      </section>

      {/* 5. Pure Editorial FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10" id="editorial-faq">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[10px] font-mono font-extrabold text-stone-400 uppercase tracking-widest block">
            clarification portal
          </span>
          <h3 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-50">
            Humble Inquiries and Honest Responses
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850 rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  id={`btn-faq-trigger-${idx}`}
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 hover:bg-stone-50/50 dark:hover:bg-stone-850"
                >
                  <span className="pr-4">{faq.q}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-stone-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-stone-400 shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 text-xs text-stone-500 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-850/60 pt-4 animate-fade-in font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Human-Designed Call To Action Card */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12" id="ultimate-editorial-cta">
        <div className="rounded-3xl bg-gradient-to-br from-stone-900 to-stone-950 p-8 sm:p-14 text-center text-white border border-stone-800 shadow-2xl relative overflow-hidden">
          
          {/* Artistic organic blur graphic */}
          <div className="absolute top-[-50px] right-[-50px] h-60 w-60 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-50px] left-[-50px] h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3ec583] mb-2">
            The road starts with a single view
          </p>
          
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight max-w-2xl mx-auto">
            You see the scars. Let’s build the restoring roadmap together.
          </h2>
          
          <p className="mt-4 text-xs text-stone-400 max-w-md mx-auto leading-relaxed font-sans font-medium">
            Join other thoughtful creators who refuse to yield to silent paralysis. Start your personal footprint ledger in under two minutes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3">
            <button
              id="btn-landing-cta-final"
              onClick={() => setActiveTab('onboarding')}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3.5 text-xs font-bold text-white shadow-lg transition cursor-pointer"
            >
              <span>Map My Roadmap</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenMethodology}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-transparent px-6 py-3.5 text-xs font-bold text-stone-300 hover:text-white border border-stone-800 hover:bg-stone-900 transition cursor-pointer"
            >
              <span>See Calculation Methods</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
