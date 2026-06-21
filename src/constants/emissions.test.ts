import { describe, it, expect } from 'vitest';
import { calculateBaseline, generateClimatePersona } from './emissions';
import { UserProfile } from '../types';

describe('Carbon Math & Baseline Calculations', () => {
  it('should correctly calculate carbon baseline for standard US mixed profile', () => {
    const mockProfile: UserProfile = {
      name: 'Test Alex',
      region: 'US',
      householdSize: 2,
      lifestyleProfile: 'urban',
      transportHabits: 'car_daily',
      foodPreference: 'mixed',
      homeEnergy: 'coal_gas',
      shoppingHabits: 'average',
      flightFrequency: 'occasional',
      wasteHabits: 'recycles_some',
      goalPreference: 'reduce_carbon',
      climatePersona: ''
    };

    const baseline = calculateBaseline(mockProfile);

    expect(baseline.transportScore).toBeGreaterThan(600);
    expect(baseline.foodScore).toBe(267); // US base food is 3200/12 = 267
    expect(baseline.homeScore).toBeGreaterThan(0);
    expect(baseline.shoppingScore).toBeGreaterThan(0);
    expect(baseline.wasteScore).toBeGreaterThan(0);

    expect(baseline.monthlyEstimate).toBe(baseline.transportScore + baseline.foodScore + baseline.homeScore + baseline.shoppingScore + baseline.wasteScore);
    expect(baseline.yearlyEstimate).toBe(baseline.monthlyEstimate * 12);
  });

  it('should reflect regional difference for India baseline', () => {
    const mockProfileIN: UserProfile = {
      name: 'Rahul',
      region: 'IN',
      householdSize: 4,
      lifestyleProfile: 'urban',
      transportHabits: 'public_transit',
      foodPreference: 'vegetarian',
      homeEnergy: 'green_renewables',
      shoppingHabits: 'minimalist',
      flightFrequency: 'rare_never',
      wasteHabits: 'recycles_all',
      goalPreference: 'save_money',
      climatePersona: ''
    };

    const baseline = calculateBaseline(mockProfileIN);

    expect(baseline.yearlyEstimate).toBeLessThan(4000);
  });

  it('should assign Conscious Eater persona to vegans/vegetarians', () => {
    const mockProfile: UserProfile = {
      name: 'Vegan Friend',
      region: 'EU',
      householdSize: 1,
      lifestyleProfile: 'urban',
      transportHabits: 'active_transit',
      foodPreference: 'vegan',
      homeEnergy: 'green_renewables',
      shoppingHabits: 'minimalist',
      flightFrequency: 'rare_never',
      wasteHabits: 'recycles_all',
      goalPreference: 'learn_sustainability',
      climatePersona: ''
    };

    const persona = generateClimatePersona(mockProfile);
    expect(persona).toBe('Conscious Eater');
  });

  it('should assign Home Optimizer persona for clean energy users without active transit', () => {
    const mockProfile: UserProfile = {
      name: 'Solar user',
      region: 'US',
      householdSize: 3,
      lifestyleProfile: 'suburban',
      transportHabits: 'car_daily',
      foodPreference: 'mixed',
      homeEnergy: 'green_renewables',
      shoppingHabits: 'average',
      flightFrequency: 'occasional',
      wasteHabits: 'recycles_some',
      goalPreference: 'reduce_carbon',
      climatePersona: ''
    };

    const persona = generateClimatePersona(mockProfile);
    expect(persona).toBe('Home Optimizer');
  });

  // NEW AUDIT-GRADE CALCULATIONS TESTS
  it('should calculate audit-grade detailed outputs correctly', () => {
    const auditProfile: UserProfile = {
      name: 'Audit Expert',
      region: 'US',
      householdSize: 1,
      lifestyleProfile: 'urban',
      transportHabits: 'mixed',
      foodPreference: 'mixed',
      homeEnergy: 'coal_gas',
      shoppingHabits: 'average',
      flightFrequency: 'occasional',
      wasteHabits: 'recycles_some',
      goalPreference: 'reduce_carbon',
      climatePersona: '',
      
      // Audit inputs
      isAuditGrade: true,
      commuteDistance: 200, // km per week
      vehicleType: 'hybrid', // factor is 0.12 kg/km
      shortHaulFlights: 4, // 4 * 150 = 600 kg
      longHaulFlights: 2, // 2 * 850 = 1700 kg
      electricityKwh: 400 // 400 * 0.45 = 180 kg
    };

    const baseline = calculateBaseline(auditProfile);

    // Transport commute annual = 200 * 52 * 0.12 = 1248 kg CO2e
    // Flights annual = (4 * 150) + (2 * 850) = 600 + 1700 = 2300 kg CO2e
    // Total Transport monthly = (1248 + 2300) / 12 = 3548 / 12 = 295.66 => ~296
    expect(baseline.transportScore).toBe(296);

    // Home score = 400 kWh * 0.45 (electricity_standard) = 180 kg CO2e
    expect(baseline.homeScore).toBe(180);

    // monthlyEstimateMin and monthlyEstimateMax should be populated
    expect(baseline.monthlyEstimateMin).toBeLessThan(baseline.monthlyEstimate);
    expect(baseline.monthlyEstimateMax).toBeGreaterThan(baseline.monthlyEstimate);
    expect(baseline.monthlyEstimateMin).toBe(Math.round(baseline.monthlyEstimate * 0.88));
  });
});
