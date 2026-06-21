import { UserProfile, FootprintProfile, CategoryType } from '../types';

// Emission factors in kg CO2e per unit
export const EMISSION_FACTORS = {
  transport: {
    car_petrol: 0.22,      // per km
    car_hybrid: 0.12,      // per km
    car_electric: 0.05,    // per km
    bus_or_train: 0.04,    // per km
    active: 0.0,           // cycling/walking
    flight_short: 150.0,   // per single flight (under 3 hours)
    flight_long: 850.0,    // per single flight (long haul)
  },
  food: {
    beef_lamb: 7.2,        // per serving
    poultry_pork: 2.1,     // per serving
    vegetarian: 1.1,       // per serving
    vegan: 0.5,            // per serving
    dairy_heavy_day: 3.5,  // additional emissions for high dairy consumption day
  },
  home: {
    electricity_standard: 0.45,  // per kWh
    electricity_clean: 0.04,     // per kWh
    gas_heating_hr: 1.8,         // per hour of heating usage
    ac_cooling_hr: 1.1,          // per hour of high A/C usage
    laundry_hot_wash: 0.6,       // per load
    laundry_cold_wash: 0.1,      // per load
  },
  shopping: {
    clothing_item: 12.5,        // per piece (average fashion item)
    electronics_major: 180.0,   // per device (laptop, tv)
    electronics_minor: 45.0,    // per smaller device (smartphone, tablet)
    online_order_delivery: 3.0, // shipping packaging & transit per order
  },
  waste: {
    landfill_bag: 2.2,          // per standard trash bag
    recycling_offset: -0.6,     // kg CO2e saved per bag recycled
    compost_offset: -0.8,       // kg CO2e saved per kg food waste composted
  }
};

// Factor Provenance Citations (EPA & international carbon authorities)
export const EMISSION_FACTORS_METADATA = {
  transport: {
    car_petrol: { citation: "EPA Emission Factors Hub (2024) - Passenger Vehicles", lastUpdated: "2024-03" },
    car_hybrid: { citation: "US EPA Fuel Economy Guide (2024)", lastUpdated: "2024-03" },
    car_electric: { citation: "EPA eGRID regional averages & EV consumption rates", lastUpdated: "2024-04" },
    bus_or_train: { citation: "DEFRA UK Greenhouse Gas Conversion Factors (2024)", lastUpdated: "2024-06" },
    active: { citation: "IPCC WGIII Chapter 10 (Active Transport Proxy)", lastUpdated: "2023-11" },
    flight_short: { citation: "ICAO Carbon Emissions Calculator (flights < 3 hrs)", lastUpdated: "2024-02" },
    flight_long: { citation: "ICAO Carbon Emissions Calculator (long haul average)", lastUpdated: "2024-02" }
  },
  food: {
    beef_lamb: { citation: "Our World in Data (Poore & Nemecek 2018 study)", lastUpdated: "2024-01" },
    poultry_pork: { citation: "Our World in Data (Poore & Nemecek 2018 study)", lastUpdated: "2024-01" },
    vegetarian: { citation: "WRI Diet Carbon Calculator (Vegetarian Mix)", lastUpdated: "2024-03" },
    vegan: { citation: "WRI Diet Carbon Calculator (Plant-Based Mix)", lastUpdated: "2024-03" },
    dairy_heavy_day: { citation: "FAO Global Livestock Environmental Assessment Model", lastUpdated: "2023-09" }
  },
  home: {
    electricity_standard: { citation: "EPA eGRID 2024 National Grid Average", lastUpdated: "2024-04" },
    electricity_clean: { citation: "NREL Life Cycle Greenhouse Gas Emissions from Electricity Generation", lastUpdated: "2023-12" },
    gas_heating_hr: { citation: "US EIA Residential Energy Consumption Survey (RECS)", lastUpdated: "2023-10" },
    ac_cooling_hr: { citation: "US EIA Residential Energy Consumption Survey (RECS)", lastUpdated: "2023-10" },
    laundry_hot_wash: { citation: "DoE Energy Star Residential Laundry Analysis", lastUpdated: "2024-01" },
    laundry_cold_wash: { citation: "DoE Energy Star Residential Laundry Analysis", lastUpdated: "2024-01" }
  },
  shopping: {
    clothing_item: { citation: "UNEP Fashion Charter for Climate Action Report", lastUpdated: "2024-02" },
    electronics_major: { citation: "Product Carbon Footprint (PCF) reports from Apple/Dell/HP", lastUpdated: "2024-05" },
    electronics_minor: { citation: "Product Carbon Footprint (PCF) reports from Apple/Samsung", lastUpdated: "2024-05" },
    online_order_delivery: { citation: "World Economic Forum - Future of Last-Mile Ecosystems", lastUpdated: "2023-11" }
  },
  waste: {
    landfill_bag: { citation: "EPA Waste Reduction Model (WARM) - MSW Landfilling", lastUpdated: "2024-03" },
    recycling_offset: { citation: "EPA Waste Reduction Model (WARM) - Recycling Credits", lastUpdated: "2024-03" },
    compost_offset: { citation: "EPA Waste Reduction Model (WARM) - Composting Sequestration", lastUpdated: "2024-03" }
  }
};

// Global averages in tons of CO2e per year for baseline comparison (in kg per year)
export const REGIONAL_AVERAGES: Record<string, { total: number; transport: number; food: number; home: number; shopping: number; waste: number }> = {
  US: { total: 16000, transport: 5120, food: 3200, home: 4480, shopping: 2240, waste: 960 },
  EU: { total: 7500, transport: 2250, food: 1500, home: 2100, shopping: 1125, waste: 525 },
  IN: { total: 2200, transport: 440, food: 660, home: 550, shopping: 330, waste: 220 },
  CA: { total: 15500, transport: 4960, food: 3100, home: 4340, shopping: 2170, waste: 930 },
  AU: { total: 15150, transport: 4848, food: 3030, home: 4242, shopping: 2121, waste: 909 },
  GLOBAL: { total: 4800, transport: 1200, food: 1200, home: 1440, shopping: 600, waste: 360 }
};

/**
 * Calculates a personalized footprint profile from onboarding answers.
 * Returns scores in kg CO2e per month.
 */
export function calculateBaseline(profile: UserProfile): FootprintProfile {
  const region = profile.region || 'GLOBAL';
  const avg = REGIONAL_AVERAGES[region] || REGIONAL_AVERAGES.GLOBAL;
  
  let transportScore = 0;
  let foodScore = 0;
  let homeScore = 0;
  let shoppingScore = 0;
  let wasteScore = 0;

  if (profile.isAuditGrade) {
    // 1. AUDIT-GRADE TRANSPORT
    const distancePerWeek = profile.commuteDistance ?? 100; // km/week
    const annualCommuteDist = distancePerWeek * 52;
    let factor = EMISSION_FACTORS.transport.car_petrol;
    if (profile.vehicleType === 'hybrid') factor = EMISSION_FACTORS.transport.car_hybrid;
    else if (profile.vehicleType === 'electric') factor = EMISSION_FACTORS.transport.car_electric;
    else if (profile.vehicleType === 'none') factor = EMISSION_FACTORS.transport.active;

    const commuteAnnual = annualCommuteDist * factor;
    const shortFlights = profile.shortHaulFlights ?? 2;
    const longFlights = profile.longHaulFlights ?? 1;
    const flightsAnnual = (shortFlights * EMISSION_FACTORS.transport.flight_short) + 
                          (longFlights * EMISSION_FACTORS.transport.flight_long);
    
    transportScore = (commuteAnnual + flightsAnnual) / 12;

    // 2. AUDIT-GRADE HOME
    const monthlyKwh = profile.electricityKwh ?? 300;
    const isClean = profile.homeEnergy === 'green_renewables';
    const energyFactor = isClean ? EMISSION_FACTORS.home.electricity_clean : EMISSION_FACTORS.home.electricity_standard;
    homeScore = monthlyKwh * energyFactor;

    // Others fall back to template scales
    foodScore = (avg.food / 12);
    if (profile.foodPreference === 'meat_heavy') foodScore *= 1.45;
    else if (profile.foodPreference === 'low_meat') foodScore *= 0.75;
    else if (profile.foodPreference === 'vegetarian') foodScore *= 0.5;
    else if (profile.foodPreference === 'vegan') foodScore *= 0.3;

    shoppingScore = (avg.shopping / 12);
    if (profile.shoppingHabits === 'frequent') shoppingScore *= 1.5;
    else if (profile.shoppingHabits === 'minimalist') shoppingScore *= 0.4;

    wasteScore = (avg.waste / 12);
    if (profile.wasteHabits === 'recycles_all') wasteScore *= 0.4;
    else if (profile.wasteHabits === 'recycles_some') wasteScore *= 0.8;
    else wasteScore *= 1.3;

  } else {
    // 1. STANDARD ESTIMATION - TRANSPORT
    transportScore = avg.transport / 12; // Start with regional average
    if (profile.transportHabits === 'car_daily') {
      transportScore *= 1.4;
    } else if (profile.transportHabits === 'car_occasional') {
      transportScore *= 1.0;
    } else if (profile.transportHabits === 'public_transit') {
      transportScore *= 0.35;
    } else if (profile.transportHabits === 'active_transit') {
      transportScore *= 0.1;
    } else if (profile.transportHabits === 'mixed') {
      transportScore *= 0.75;
    }
    
    // Adjust for flights
    if (profile.flightFrequency === 'frequent') {
      transportScore += (EMISSION_FACTORS.transport.flight_long * 4 + EMISSION_FACTORS.transport.flight_short * 6) / 12;
    } else if (profile.flightFrequency === 'occasional') {
      transportScore += (EMISSION_FACTORS.transport.flight_long * 1 + EMISSION_FACTORS.transport.flight_short * 2) / 12;
    } else {
      transportScore += 50 / 12; // Tiny baseline
    }

    // 2. FOOD ESTIMATION
    foodScore = avg.food / 12;
    if (profile.foodPreference === 'meat_heavy') {
      foodScore *= 1.45;
    } else if (profile.foodPreference === 'mixed') {
      foodScore *= 1.0;
    } else if (profile.foodPreference === 'low_meat') {
      foodScore *= 0.75;
    } else if (profile.foodPreference === 'vegetarian') {
      foodScore *= 0.5;
    } else if (profile.foodPreference === 'vegan') {
      foodScore *= 0.3;
    }

    // 3. HOME ENERGY ESTIMATION
    homeScore = avg.home / 12;
    const sizeFactor = profile.householdSize === 1 ? 1.0 : profile.householdSize === 2 ? 0.75 : profile.householdSize === 3 ? 0.6 : 0.5;
    homeScore *= sizeFactor;

    if (profile.homeEnergy === 'coal_gas') {
      homeScore *= 1.3;
    } else if (profile.homeEnergy === 'green_renewables') {
      homeScore *= 0.15; // huge reduction
    }

    // 4. SHOPPING ESTIMATION
    shoppingScore = avg.shopping / 12;
    if (profile.shoppingHabits === 'frequent') {
      shoppingScore *= 1.5;
    } else if (profile.shoppingHabits === 'minimalist') {
      shoppingScore *= 0.4;
    }

    // 5. WASTE ESTIMATION
    wasteScore = avg.waste / 12;
    if (profile.wasteHabits === 'recycles_all') {
      wasteScore *= 0.4;
    } else if (profile.wasteHabits === 'recycles_some') {
      wasteScore *= 0.8;
    } else {
      wasteScore *= 1.3;
    }
  }

  // Sum up
  const monthlyEstimate = Math.round(transportScore + foodScore + homeScore + shoppingScore + wasteScore);
  const yearlyEstimate = Math.round(monthlyEstimate * 12);

  // Uncertainty margin calculation (±12% profile band to prevent fake precision)
  const monthlyEstimateMin = Math.round(monthlyEstimate * 0.88);
  const monthlyEstimateMax = Math.round(monthlyEstimate * 1.12);

  return {
    transportScore: Math.round(transportScore),
    foodScore: Math.round(foodScore),
    homeScore: Math.round(homeScore),
    shoppingScore: Math.round(shoppingScore),
    wasteScore: Math.round(wasteScore),
    monthlyEstimate,
    yearlyEstimate,
    monthlyEstimateMin,
    monthlyEstimateMax,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Determines user's Climate Persona based on their profile.
 */
export function generateClimatePersona(profile: UserProfile): string {
  if (profile.foodPreference === 'vegan' || profile.foodPreference === 'vegetarian') {
    return 'Conscious Eater';
  }
  if (profile.transportHabits === 'active_transit' || profile.transportHabits === 'public_transit' || profile.vehicleType === 'none') {
    return 'Transit Transformer';
  }
  if (profile.homeEnergy === 'green_renewables') {
    return 'Home Optimizer';
  }
  if (profile.shoppingHabits === 'minimalist') {
    return 'Everyday Reducer';
  }
  return 'Climate Starter';
}
