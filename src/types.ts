export type CategoryType = 'transport' | 'food' | 'home' | 'shopping' | 'waste';

export interface UserProfile {
  name: string;
  region: string;
  householdSize: number;
  lifestyleProfile: 'urban' | 'suburban' | 'rural';
  transportHabits: 'car_daily' | 'car_occasional' | 'public_transit' | 'active_transit' | 'mixed';
  foodPreference: 'meat_heavy' | 'mixed' | 'low_meat' | 'vegetarian' | 'vegan';
  homeEnergy: 'coal_gas' | 'grid_avg' | 'green_renewables';
  shoppingHabits: 'frequent' | 'average' | 'minimalist';
  flightFrequency: 'frequent' | 'occasional' | 'rare_never';
  wasteHabits: 'recycles_all' | 'recycles_some' | 'no_recycling';
  goalPreference: 'save_money' | 'reduce_carbon' | 'build_habits' | 'learn_sustainability';
  climatePersona: string;
}

export interface FootprintProfile {
  transportScore: number; // kg CO2e per month
  foodScore: number;
  homeScore: number;
  shoppingScore: number;
  wasteScore: number;
  monthlyEstimate: number; // Sum of the above in kg CO2e
  yearlyEstimate: number;  // monthly * 12
  lastUpdated: string;
}

export interface ActivityLog {
  id: string;
  category: CategoryType;
  actionType: string;
  value: number;
  unit: string;
  estimatedEmission: number; // kg CO2e saved (negative means reduction over baseline) or added (positive means absolute entry, but we model as footprint difference or absolute footprint log)
  label: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  category: CategoryType;
  targetValue: number; // number of times to perform per month
  progress: number;    // times performed this month
  estimatedReduction: number; // kg CO2e saved per action or total
  status: 'active' | 'completed' | 'paused';
  streak: number;
  icon?: string;
  moneySaved?: number; // USD per month
}

export interface Recommendation {
  id: string;
  title: string;
  category: CategoryType;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  savings: number; // USD saved per month
  carbonSaved: number; // kg CO2e saved per month
  rationale: string;
  personalizedReason: string;
  timeToImplement: string;
  isAdded: boolean;
}

export interface SimulatedHabit {
  id: string;
  title: string;
  category: CategoryType;
  currentValue: number;
  simulatedValue: number;
  unit: string;
  factor: number; // kg CO2e per unit
}

export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  category: CategoryType | 'general';
  earnedAt?: string;
  icon: string;
}

export interface TragedySlide {
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
