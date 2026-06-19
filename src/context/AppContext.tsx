import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, FootprintProfile, ActivityLog, Goal, Recommendation, MilestoneBadge } from '../types';
import { calculateBaseline, generateClimatePersona, EMISSION_FACTORS } from '../constants/emissions';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged, 
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc
} from 'firebase/firestore';

interface AppContextProps {
  user: UserProfile | null;
  footprint: FootprintProfile | null;
  activityLogs: ActivityLog[];
  goals: Goal[];
  recommendations: Recommendation[];
  badges: MilestoneBadge[];
  activeTab: string;
  isDemoMode: boolean;
  theme: 'light' | 'dark';
  completedLessons: string[];
  firebaseUser: FirebaseUser | null;
  authError: string | null;
  authLoading: boolean;
  signUpEmail: (email: string, password: string, name: string) => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutFirebase: () => Promise<void>;
  syncDataToCloud: (userState?: UserProfile | null, logsState?: ActivityLog[], goalsState?: Goal[]) => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => void;
  setActiveTab: (tab: string) => void;
  completeOnboarding: (profile: UserProfile) => void;
  logActivity: (category: 'transport' | 'food' | 'home' | 'shopping' | 'waste', actionType: string, value: number, unit: string, label: string, emissionFactor: number) => void;
  deleteLog: (id: string) => void;
  addGoalFromRecommendation: (recId: string) => void;
  toggleGoalStatus: (goalId: string) => void;
  logGoalProgress: (goalId: string) => void;
  completeLesson: (lessonId: string) => void;
  resetAllData: () => void;
  loadDemoMode: () => void;
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Initial recommendations templates
const RECOMMENDATIONS_TEMPLATES = [
  {
    id: 'rec_commute_transit',
    title: 'Swap 2 car commutes for public transit/cycling',
    category: 'transport' as const,
    impact: 'High' as const,
    effort: 'Medium' as const,
    savings: 45,
    carbonSaved: 68,
    rationale: 'Active or public commuting is the absolute single best action for road commuters.',
    personalizedReason: 'Recommended because you commute by car daily and live in an urban environment.',
    timeToImplement: '2 hrs/week',
    isAdded: false
  },
  {
    id: 'rec_beef_reduction',
    title: 'Swap 2 beef meals for poultry or veggie options',
    category: 'food' as const,
    impact: 'High' as const,
    effort: 'Low' as const,
    savings: 30,
    carbonSaved: 42,
    rationale: 'Beef production emits nearly 45x more carbon than beans and 4x more than chicken.',
    personalizedReason: 'Recommended because you reported a mixed/meat-heavy diet in onboarding.',
    timeToImplement: '30 mins/week',
    isAdded: false
  },
  {
    id: 'rec_ac_temp',
    title: 'Set A/C 1°C higher or use ECO mode',
    category: 'home' as const,
    impact: 'Medium' as const,
    effort: 'Low' as const,
    savings: 15,
    carbonSaved: 28,
    rationale: 'Every degree lower on cooling adds around 10% more energy to your electricity bill.',
    personalizedReason: 'Recommended because your utility grid relies partially on fossil heating/cooling.',
    timeToImplement: '1 min',
    isAdded: false
  },
  {
    id: 'rec_cold_wash',
    title: 'Wash laundry on cold cycle instead of hot',
    category: 'home' as const,
    impact: 'Low' as const,
    effort: 'Low' as const,
    savings: 8,
    carbonSaved: 12,
    rationale: 'Roughly 75% to 90% of a washing machine\'s energy goes toward heating the water.',
    personalizedReason: 'An easy-win energy adapter suited for automated saving.',
    timeToImplement: '2 mins',
    isAdded: false
  },
  {
    id: 'rec_slow_fashion',
    title: 'Skip 1 clothing purchase per month',
    category: 'shopping' as const,
    impact: 'Medium' as const,
    effort: 'Medium' as const,
    savings: 65,
    carbonSaved: 25,
    rationale: 'Fast fashion relies on fossil-fuel synthetic textiles and high logistics carbon.',
    personalizedReason: 'Recommended for avid and frequent shoppers to reduce waste at source.',
    timeToImplement: 'Instant',
    isAdded: false
  },
  {
    id: 'rec_food_compost',
    title: 'Compost organic waste & leftovers',
    category: 'waste' as const,
    impact: 'Medium' as const,
    effort: 'Medium' as const,
    savings: 0,
    carbonSaved: 18,
    rationale: 'Food decomposing in oxygen-free landfills creates methane, but composting binds carbon with zero methane.',
    personalizedReason: 'Perfect habit builder to shrink waste footprint completely.',
    timeToImplement: '10 mins/week',
    isAdded: false
  },
  {
    id: 'rec_wfh_day',
    title: 'Work from home 2 additional days per week',
    category: 'transport' as const,
    impact: 'High' as const,
    effort: 'Low' as const,
    savings: 80,
    carbonSaved: 90,
    rationale: 'Eliminating the commute entirely saves both high fuel costs and idle traffic emissions.',
    personalizedReason: 'Recommended as a high impact action for single commuters with active roles.',
    timeToImplement: 'Instant',
    isAdded: false
  },
  {
    id: 'rec_no_drive_day',
    title: 'Implement 1 "No-Car" day per week',
    category: 'transport' as const,
    impact: 'High' as const,
    effort: 'Medium' as const,
    savings: 40,
    carbonSaved: 55,
    rationale: 'A single non-driving day encourages neighborhood walking, physical health, and community.',
    personalizedReason: 'Matches your focus on building lasting physical and eco habits.',
    timeToImplement: '1 day/week',
    isAdded: false
  }
];

// Initial badges templates
const INITIAL_BADGES: MilestoneBadge[] = [
  { id: 'b_first_log', title: 'First Log', description: 'Log your first daily climate action.', category: 'general', icon: '🎯' },
  { id: 'b_streak_3', title: 'Carbon Scout', description: 'Maintain a 3-day action logging streak.', category: 'general', icon: '🔥' },
  { id: 'b_commute', title: 'Transit Hero', description: 'Save a total of 20 kg CO₂ in transport.', category: 'transport', icon: '🚲' },
  { id: 'b_eater', title: 'Conscious Eater', description: 'Log 5 plant-based or low-beef meals.', category: 'food', icon: '🌱' },
  { id: 'b_energy', title: 'Grid Champion', description: 'Perform 4 energy saving actions.', category: 'home', icon: '⚡' },
  { id: 'b_waste', title: 'Zero Waste Monk', description: 'Compost or recycle 10 times.', category: 'waste', icon: '♻️' },
  { id: 'b_saving_50', title: 'Planet Protector', description: 'Reduce over 50 kg of estimated carbon!', category: 'general', icon: '🌍' },
  { id: 'b_truth_seeker', title: 'Truth Seeker', description: 'Debunk 3 myths or complete lessons in the Learn Hub.', category: 'general', icon: '🧠' }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [footprint, setFootprint] = useState<FootprintProfile | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [badges, setBadges] = useState<MilestoneBadge[]>(INITIAL_BADGES);
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Firebase auth & error states
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Monitor Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      setAuthLoading(false);
      if (fUser) {
        // Logged in! Let's check if there is data on cloud
        try {
          const userDocRef = doc(db, 'users', fUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.user) setUser(data.user);
            if (data.footprint) setFootprint(data.footprint);
            if (data.activityLogs) setActivityLogs(data.activityLogs);
            if (data.goals) setGoals(data.goals);
            // If they completed onboarding, load it, otherwise go to onboarding
            if (data.user) {
              // Stay on current tab unless it was landing/onboarding
              setActiveTab((prev) => (prev === 'landing' || prev === 'onboarding') ? 'dashboard' : prev);
            } else {
              setActiveTab('onboarding');
            }
          } else {
            // First time login - no profile on Firestore. Needs onboarding!
            setUser(null);
            setFootprint(null);
            setActiveTab('onboarding');
          }
        } catch (e) {
          console.error("Error reading Firestore profile: ", e);
        }
      } else {
        setUser(null);
        setFootprint(null);
        setActivityLogs([]);
        setGoals([]);
      }
    });

    return unsubscribe;
  }, []);

  // Sync state to cloud
  const syncDataToCloud = async (userState?: UserProfile | null, logsState?: ActivityLog[], goalsState?: Goal[]) => {
    const activeU = userState !== undefined ? userState : user;
    const activeLogs = logsState !== undefined ? logsState : activityLogs;
    const activeGoals = goalsState !== undefined ? goalsState : goals;

    if (auth.currentUser && activeU) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, {
          user: activeU,
          footprint: footprint,
          activityLogs: activeLogs,
          goals: activeGoals,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log("Firestore synced successfully!");
      } catch (e) {
        console.error("Firestore sync failed: ", e);
      }
    }
  };

  const signUpEmail = async (email: string, password: string, name: string) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      
      setUser(null);
      setFootprint(null);
      setActivityLogs([]);
      setGoals([]);
      
      setActiveTab('onboarding');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign up');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const signInEmail = async (email: string, password: string) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      
      // Load from Firestore
      const userDocRef = doc(db, 'users', credential.user.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.user) {
          setUser(data.user);
          if (data.footprint) setFootprint(data.footprint);
          if (data.activityLogs) setActivityLogs(data.activityLogs);
          if (data.goals) setGoals(data.goals);
          setActiveTab('dashboard');
        } else {
          setActiveTab('onboarding');
        }
      } else {
        setActiveTab('onboarding');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      
      const userDocRef = doc(db, 'users', credential.user.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.user) {
          setUser(data.user);
          if (data.footprint) setFootprint(data.footprint);
          if (data.activityLogs) setActivityLogs(data.activityLogs);
          if (data.goals) setGoals(data.goals);
          setActiveTab('dashboard');
        } else {
          setActiveTab('onboarding');
        }
      } else {
        setActiveTab('onboarding');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in with Google');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const signOutFirebase = async () => {
    setAuthError(null);
    try {
      await fbSignOut(auth);
      setUser(null);
      setFootprint(null);
      setActivityLogs([]);
      setGoals([]);
      setFirebaseUser(null);
      setActiveTab('landing');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign out');
    }
  };

  // Load from local storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('cc_theme');
    const savedLessons = localStorage.getItem('cc_lessons');

    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
    }

    if (savedLessons) {
      try {
        setCompletedLessons(JSON.parse(savedLessons));
      } catch (e) {
        setCompletedLessons([]);
      }
    }
  }, []);

  // Save to local storage when state changes; and sync online too
  useEffect(() => {
    if (user) localStorage.setItem('cc_user', JSON.stringify(user));
    if (footprint) localStorage.setItem('cc_footprint', JSON.stringify(footprint));
    localStorage.setItem('cc_logs', JSON.stringify(activityLogs));
    localStorage.setItem('cc_goals', JSON.stringify(goals));
    localStorage.setItem('cc_recs', JSON.stringify(recommendations));
    localStorage.setItem('cc_badges', JSON.stringify(badges));
    localStorage.setItem('cc_theme', theme);
    localStorage.setItem('cc_lessons', JSON.stringify(completedLessons));

    if (firebaseUser) {
      syncDataToCloud(user, activityLogs, goals);
    }
  }, [user, footprint, activityLogs, goals, recommendations, badges, theme, completedLessons, firebaseUser]);

  const completeLesson = (lessonId: string) => {
    setCompletedLessons(prev => {
      if (prev.includes(lessonId)) return prev;
      const updated = [...prev, lessonId];
      
      // Earn Badge trigger for completing lessons / myths
      if (updated.length >= 3) {
        setBadges(badgesData => {
          const finishedIdx = badgesData.findIndex(b => b.id === 'b_truth_seeker');
          if (finishedIdx !== -1 && !badgesData[finishedIdx].earnedAt) {
            const updatedBadges = [...badgesData];
            updatedBadges[finishedIdx] = { ...updatedBadges[finishedIdx], earnedAt: new Date().toISOString() };
            return updatedBadges;
          }
          return badgesData;
        });
      }
      return updated;
    });
  };

  // Handle onboarding completion
  const completeOnboarding = (profile: UserProfile) => {
    const calculated = calculateBaseline(profile);
    const persona = generateClimatePersona(profile);
    const finishedProfile = { ...profile, climatePersona: persona };

    setUser(finishedProfile);
    setFootprint(calculated);
    setIsDemoMode(false);

    // Personalize recommendations based on onboarding choices
    const personalized = RECOMMENDATIONS_TEMPLATES.map(rec => {
      let isHighScore = false;
      if (rec.category === 'transport' && (profile.transportHabits === 'car_daily' || profile.flightFrequency === 'frequent')) {
        isHighScore = true;
      } else if (rec.category === 'food' && profile.foodPreference === 'meat_heavy') {
        isHighScore = true;
      } else if (rec.category === 'home' && profile.homeEnergy === 'coal_gas') {
        isHighScore = true;
      } else if (rec.category === 'shopping' && profile.shoppingHabits === 'frequent') {
        isHighScore = true;
      }

      return {
        ...rec,
        impact: isHighScore ? ('High' as const) : rec.impact,
        personalizedReason: isHighScore 
          ? `Specially recommended based on high predicted values in your ${rec.category} habits.` 
          : rec.personalizedReason
      };
    });

    setRecommendations(personalized);

    // Setup initial default goals
    const initialGoals: Goal[] = [
      {
        id: 'g_cold_wash',
        title: 'Perform cold laundry wash',
        category: 'home',
        targetValue: 4,
        progress: 0,
        estimatedReduction: 12,
        status: 'active',
        streak: 0,
        moneySaved: 8
      },
      {
        id: 'g_veggie_day',
        title: 'Enjoy a veggie or vegan day',
        category: 'food',
        targetValue: 8,
        progress: 0,
        estimatedReduction: 32,
        status: 'active',
        streak: 0,
        moneySaved: 20
      }
    ];
    setGoals(initialGoals);
    setActivityLogs([]);
    setBadges(INITIAL_BADGES);
    setActiveTab('dashboard');
  };

  // Log a carbon footprint tracker activity
  const logActivity = (
    category: 'transport' | 'food' | 'home' | 'shopping' | 'waste',
    actionType: string,
    value: number,
    unit: string,
    label: string,
    emissionFactor: number // Negative for saved, positive for direct absolute footprint addition
  ) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      category,
      actionType,
      value,
      unit,
      estimatedEmission: Number(emissionFactor.toFixed(2)),
      label,
      createdAt: new Date().toISOString()
    };

    const updatedLogs = [newLog, ...activityLogs];
    setActivityLogs(updatedLogs);

    // Badge triggers
    let updatedBadges = [...badges];
    
    // First log badge
    const firstLogIdx = updatedBadges.findIndex(b => b.id === 'b_first_log');
    if (firstLogIdx !== -1 && !updatedBadges[firstLogIdx].earnedAt) {
      updatedBadges[firstLogIdx] = { ...updatedBadges[firstLogIdx], earnedAt: new Date().toISOString() };
    }

    // Streak badge triggers
    const streakIdx = updatedBadges.findIndex(b => b.id === 'b_streak_3');
    if (streakIdx !== -1 && !updatedBadges[streakIdx].earnedAt && updatedLogs.length >= 3) {
      updatedBadges[streakIdx] = { ...updatedBadges[streakIdx], earnedAt: new Date().toISOString() };
    }

    // Cumulative carbon reductions
    const savedCarbon = Math.abs(updatedLogs.reduce((acc, log) => acc + (log.estimatedEmission < 0 ? log.estimatedEmission : 0), 0));
    const savingBadgeIdx = updatedBadges.findIndex(b => b.id === 'b_saving_50');
    if (savingBadgeIdx !== -1 && !updatedBadges[savingBadgeIdx].earnedAt && savedCarbon >= 50) {
      updatedBadges[savingBadgeIdx] = { ...updatedBadges[savingBadgeIdx], earnedAt: new Date().toISOString() };
    }

    // Category specific badge triggers
    if (category === 'transport') {
      const savedCar = Math.abs(updatedLogs.filter(l => l.category === 'transport' && l.estimatedEmission < 0).reduce((acc, log) => acc + log.estimatedEmission, 0));
      const transportBadgeIdx = updatedBadges.findIndex(b => b.id === 'b_commute');
      if (transportBadgeIdx !== -1 && !updatedBadges[transportBadgeIdx].earnedAt && savedCar >= 20) {
        updatedBadges[transportBadgeIdx] = { ...updatedBadges[transportBadgeIdx], earnedAt: new Date().toISOString() };
      }
    } else if (category === 'food') {
      const veggieLogs = updatedLogs.filter(l => l.category === 'food' && (l.actionType === 'vegetarian_meal' || l.actionType === 'vegan_meal')).length;
      const eaterBadgeIdx = updatedBadges.findIndex(b => b.id === 'b_eater');
      if (eaterBadgeIdx !== -1 && !updatedBadges[eaterBadgeIdx].earnedAt && veggieLogs >= 5) {
        updatedBadges[eaterBadgeIdx] = { ...updatedBadges[eaterBadgeIdx], earnedAt: new Date().toISOString() };
      }
    } else if (category === 'home') {
      const energyLogs = updatedLogs.filter(l => l.category === 'home').length;
      const energyBadgeIdx = updatedBadges.findIndex(b => b.id === 'b_energy');
      if (energyBadgeIdx !== -1 && !updatedBadges[energyBadgeIdx].earnedAt && energyLogs >= 4) {
        updatedBadges[energyBadgeIdx] = { ...updatedBadges[energyBadgeIdx], earnedAt: new Date().toISOString() };
      }
    } else if (category === 'waste') {
      const wasteLogs = updatedLogs.filter(l => l.category === 'waste').length;
      const wasteBadgeIdx = updatedBadges.findIndex(b => b.id === 'b_waste');
      if (wasteBadgeIdx !== -1 && !updatedBadges[wasteBadgeIdx].earnedAt && wasteLogs >= 10) {
        updatedBadges[wasteBadgeIdx] = { ...updatedBadges[wasteBadgeIdx], earnedAt: new Date().toISOString() };
      }
    }

    setBadges(updatedBadges);

    // Update active goal progress if user logged something matching an active goal
    const updatedGoals = goals.map(g => {
      let matches = false;
      if (g.category === category) {
        if (g.category === 'transport' && actionType !== 'drove_car') matches = true;
        if (g.category === 'food' && (actionType === 'vegetarian_meal' || actionType === 'vegan_meal')) matches = true;
        if (g.category === 'home' && (actionType === 'laundry_cold_wash' || actionType === 'ac_eco')) matches = true;
        if (g.category === 'waste' && (actionType === 'composted' || actionType === 'recycled')) matches = true;
      }
      
      if (matches && g.status === 'active' && g.progress < g.targetValue) {
        const nextProgress = g.progress + 1;
        return {
          ...g,
          progress: nextProgress,
          streak: g.streak + 1,
          status: nextProgress >= g.targetValue ? ('completed' as const) : ('active' as const)
        };
      }
      return g;
    });
    setGoals(updatedGoals);
  };

  // Delete logged action
  const deleteLog = (id: string) => {
    setActivityLogs(activityLogs.filter(l => l.id !== id));
  };

  // Add recommendations as direct goals
  const addGoalFromRecommendation = (recId: string) => {
    const updatedRecs = recommendations.map(r => r.id === recId ? { ...r, isAdded: true } : r);
    setRecommendations(updatedRecs);

    const rec = recommendations.find(r => r.id === recId);
    if (rec) {
      const newGoal: Goal = {
        id: `goal_${Date.now()}`,
        title: rec.title,
        category: rec.category,
        targetValue: rec.category === 'transport' ? 8 : 4,
        progress: 0,
        estimatedReduction: rec.carbonSaved,
        status: 'active',
        streak: 0,
        moneySaved: rec.savings
      };
      setGoals([newGoal, ...goals]);
    }
  };

  // Toggle goal state
  const toggleGoalStatus = (goalId: string) => {
    setGoals(goals.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          status: g.status === 'active' ? ('paused' as const) : ('active' as const)
        };
      }
      return g;
    }));
  };

  // Incremental log goal completion
  const logGoalProgress = (goalId: string) => {
    setGoals(goals.map(g => {
      if (g.id === goalId && g.status === 'active') {
        const nextProgress = g.progress + 1;
        const reached = nextProgress >= g.targetValue;
        
        // Log a corresponding activity automatically
        setTimeout(() => {
          logActivity(g.category, 'manual_goal_increment', 1, 'unit', g.title, -(g.estimatedReduction / g.targetValue));
        }, 10);

        return {
          ...g,
          progress: nextProgress,
          streak: g.streak + 1,
          status: reached ? ('completed' as const) : ('active' as const)
        };
      }
      return g;
    }));
  };

  // Load High-Fidelity Seeding data "Alex"
  const loadDemoMode = () => {
    setIsDemoMode(true);
    const mockProfile: UserProfile = {
      name: 'Alex',
      region: 'US',
      householdSize: 2,
      lifestyleProfile: 'urban',
      transportHabits: 'car_daily',
      foodPreference: 'mixed',
      homeEnergy: 'coal_gas',
      shoppingHabits: 'frequent',
      flightFrequency: 'occasional',
      wasteHabits: 'recycles_some',
      goalPreference: 'reduce_carbon',
      climatePersona: 'Climate Starter'
    };

    const calculatedBaseline = {
      transportScore: 380,   // kg CO2e per month
      foodScore: 240,       // kg CO2e per month
      homeScore: 350,       // kg CO2e per month
      shoppingScore: 180,   // kg CO2e per month
      wasteScore: 80,       // kg CO2e per month
      monthlyEstimate: 1230,
      yearlyEstimate: 14760,
      lastUpdated: new Date().toISOString()
    };

    setUser({
      ...mockProfile,
      climatePersona: generateClimatePersona(mockProfile)
    });
    setFootprint(calculatedBaseline);

    const seededLogs: ActivityLog[] = [
      {
        id: 'seed_log_1',
        category: 'transport',
        actionType: 'cycled',
        value: 12,
        unit: 'km',
        estimatedEmission: -4.8, // Saved from car commute
        label: 'Cycled to the office',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      },
      {
        id: 'seed_log_2',
        category: 'food',
        actionType: 'vegan_meal',
        value: 1,
        unit: 'meal',
        estimatedEmission: -6.7, // beef replaced
        label: 'Plant-Based vegan burger bowl',
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
      },
      {
        id: 'seed_log_3',
        category: 'home',
        actionType: 'laundry_cold_wash',
        value: 1,
        unit: 'load',
        estimatedEmission: -0.5,
        label: 'Cold wash cycle laundry',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'seed_log_4',
        category: 'transport',
        actionType: 'metro',
        value: 18,
        unit: 'km',
        estimatedEmission: -3.2,
        label: 'Took subway instead of urban ride-share',
        createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
      },
      {
        id: 'seed_log_5',
        category: 'waste',
        actionType: 'composted',
        value: 2.5,
        unit: 'kg',
        estimatedEmission: -2.0,
        label: 'Composted household organic food waste',
        createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
      },
      {
        id: 'seed_log_6',
        category: 'shopping',
        actionType: 'consigned',
        value: 1,
        unit: 'item',
        estimatedEmission: -12.5,
        label: 'Bought thrifted secondhand trousers',
        createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString()
      },
      {
        id: 'seed_log_7',
        category: 'home',
        actionType: 'ac_eco',
        value: 3,
        unit: 'hours',
        estimatedEmission: -3.3,
        label: 'Ran smart eco A/C setting (+1°C higher)',
        createdAt: new Date(Date.now() - 110 * 3600 * 1000).toISOString()
      }
    ];

    setActivityLogs(seededLogs);

    const seededGoals: Goal[] = [
      {
        id: 'seed_g_1',
        title: 'Swap 2 car commutes for public transit/cycling',
        category: 'transport',
        targetValue: 8,
        progress: 2,
        estimatedReduction: 68,
        status: 'active',
        streak: 2,
        moneySaved: 45
      },
      {
        id: 'seed_g_2',
        title: 'Enjoy a veggie or vegan day',
        category: 'food',
        targetValue: 8,
        progress: 4,
        estimatedReduction: 32,
        status: 'active',
        streak: 4,
        moneySaved: 20
      },
      {
        id: 'seed_g_3',
        title: 'Wash laundry on cold cycle instead of hot',
        category: 'home',
        targetValue: 4,
        progress: 1,
        estimatedReduction: 12,
        status: 'active',
        streak: 1,
        moneySaved: 8
      },
      {
        id: 'seed_g_4',
        title: 'Implement 1 "No-Car" day per week',
        category: 'transport',
        targetValue: 4,
        progress: 4,
        estimatedReduction: 55,
        status: 'completed',
        streak: 4,
        moneySaved: 40
      }
    ];

    setGoals(seededGoals);

    const seededRecs = RECOMMENDATIONS_TEMPLATES.map(rec => {
      if (rec.id === 'rec_commute_transit' || rec.id === 'rec_cold_wash' || rec.id === 'rec_no_drive_day' || rec.id === 'rec_beef_reduction') {
        return { ...rec, isAdded: true };
      }
      return rec;
    });

    setRecommendations(seededRecs);

    const seededBadges = INITIAL_BADGES.map((b, idx) => {
      if (idx <= 3) {
        return { ...b, earnedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString() };
      }
      return b;
    });
    setBadges(seededBadges);

    setActiveTab('dashboard');
  };

  // Reset store to empty onboarding
  const resetAllData = () => {
    setUser(null);
    setFootprint(null);
    setActivityLogs([]);
    setGoals([]);
    setRecommendations([]);
    setBadges(INITIAL_BADGES);
    setIsDemoMode(false);
    setActiveTab('landing');
    localStorage.clear();
  };

  return (
    <AppContext.Provider value={{
      user,
      footprint,
      activityLogs,
      goals,
      recommendations,
      badges,
      activeTab,
      isDemoMode,
      theme,
      completedLessons,
      firebaseUser,
      authError,
      authLoading,
      signUpEmail,
      signInEmail,
      signInWithGoogle,
      signOutFirebase,
      syncDataToCloud,
      setTheme,
      setActiveTab,
      completeOnboarding,
      logActivity,
      deleteLog,
      addGoalFromRecommendation,
      toggleGoalStatus,
      logGoalProgress,
      completeLesson,
      resetAllData,
      loadDemoMode,
      setGoals
    }}>
      <div className={theme}>
        <div className="bg-stone-50 min-h-screen text-stone-900 transition-colors duration-300 dark:bg-stone-950 dark:text-stone-50">
          {children}
        </div>
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
