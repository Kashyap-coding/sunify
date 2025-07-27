export interface IndiaState {
  name: string;
  capital: string;
  latitude: number;
  longitude: number;
  averageSolarIrradiance: number; // kWh/m²/day
  estimatedCapacity: number; // MW
  populationDensity: number;
  solarPotential: 'High' | 'Medium' | 'Low';
}

export const INDIA_STATES: IndiaState[] = [
  {
    name: "Rajasthan",
    capital: "Jaipur",
    latitude: 27.0238,
    longitude: 74.2179,
    averageSolarIrradiance: 5.8,
    estimatedCapacity: 18400,
    populationDensity: 200,
    solarPotential: 'High'
  },
  {
    name: "Karnataka",
    capital: "Bengaluru",
    latitude: 15.3173,
    longitude: 75.7139,
    averageSolarIrradiance: 5.2,
    estimatedCapacity: 8800,
    populationDensity: 319,
    solarPotential: 'High'
  },
  {
    name: "Tamil Nadu",
    capital: "Chennai",
    latitude: 11.1271,
    longitude: 78.6569,
    averageSolarIrradiance: 5.1,
    estimatedCapacity: 5600,
    populationDensity: 555,
    solarPotential: 'High'
  },
  {
    name: "Gujarat",
    capital: "Gandhinagar",
    latitude: 23.0225,
    longitude: 72.5714,
    averageSolarIrradiance: 5.6,
    estimatedCapacity: 4200,
    populationDensity: 308,
    solarPotential: 'High'
  },
  {
    name: "Andhra Pradesh",
    capital: "Amaravati",
    latitude: 15.9129,
    longitude: 79.7400,
    averageSolarIrradiance: 5.3,
    estimatedCapacity: 3800,
    populationDensity: 303,
    solarPotential: 'High'
  },
  {
    name: "Maharashtra",
    capital: "Mumbai",
    latitude: 19.7515,
    longitude: 75.7139,
    averageSolarIrradiance: 4.8,
    estimatedCapacity: 3200,
    populationDensity: 365,
    solarPotential: 'Medium'
  },
  {
    name: "Madhya Pradesh",
    capital: "Bhopal",
    latitude: 23.2599,
    longitude: 77.4126,
    averageSolarIrradiance: 5.4,
    estimatedCapacity: 2800,
    populationDensity: 236,
    solarPotential: 'High'
  },
  {
    name: "Punjab",
    capital: "Chandigarh",
    latitude: 31.1471,
    longitude: 75.3412,
    averageSolarIrradiance: 4.9,
    estimatedCapacity: 2400,
    populationDensity: 551,
    solarPotential: 'Medium'
  },
  {
    name: "Uttar Pradesh",
    capital: "Lucknow",
    latitude: 26.8467,
    longitude: 80.9462,
    averageSolarIrradiance: 4.7,
    estimatedCapacity: 2200,
    populationDensity: 828,
    solarPotential: 'Medium'
  },
  {
    name: "Haryana",
    capital: "Chandigarh",
    latitude: 29.0588,
    longitude: 76.0856,
    averageSolarIrradiance: 5.0,
    estimatedCapacity: 1800,
    populationDensity: 573,
    solarPotential: 'Medium'
  },
  {
    name: "Telangana",
    capital: "Hyderabad",
    latitude: 18.1124,
    longitude: 79.0193,
    averageSolarIrradiance: 5.2,
    estimatedCapacity: 1600,
    populationDensity: 312,
    solarPotential: 'High'
  },
  {
    name: "Kerala",
    capital: "Thiruvananthapuram",
    latitude: 10.8505,
    longitude: 76.2711,
    averageSolarIrradiance: 4.5,
    estimatedCapacity: 800,
    populationDensity: 860,
    solarPotential: 'Medium'
  },
  {
    name: "Odisha",
    capital: "Bhubaneswar",
    latitude: 20.9517,
    longitude: 85.0985,
    averageSolarIrradiance: 4.8,
    estimatedCapacity: 700,
    populationDensity: 270,
    solarPotential: 'Medium'
  },
  {
    name: "West Bengal",
    capital: "Kolkata",
    latitude: 22.9868,
    longitude: 87.8550,
    averageSolarIrradiance: 4.3,
    estimatedCapacity: 600,
    populationDensity: 1028,
    solarPotential: 'Low'
  },
  {
    name: "Jharkhand",
    capital: "Ranchi",
    latitude: 23.6102,
    longitude: 85.2799,
    averageSolarIrradiance: 4.6,
    estimatedCapacity: 500,
    populationDensity: 414,
    solarPotential: 'Medium'
  },
  {
    name: "Chhattisgarh",
    capital: "Raipur",
    latitude: 21.2787,
    longitude: 81.8661,
    averageSolarIrradiance: 4.9,
    estimatedCapacity: 450,
    populationDensity: 189,
    solarPotential: 'Medium'
  },
  {
    name: "Bihar",
    capital: "Patna",
    latitude: 25.0961,
    longitude: 85.3131,
    averageSolarIrradiance: 4.4,
    estimatedCapacity: 400,
    populationDensity: 1106,
    solarPotential: 'Low'
  },
  {
    name: "Assam",
    capital: "Dispur",
    latitude: 26.2006,
    longitude: 92.9376,
    averageSolarIrradiance: 4.2,
    estimatedCapacity: 300,
    populationDensity: 398,
    solarPotential: 'Low'
  }
];

// Solar panel cost and efficiency constants
export const SOLAR_CONSTANTS = {
  PANEL_EFFICIENCY: 0.20, // 20% efficiency
  COST_PER_KW: 40000, // ₹40,000 per kW installed
  ELECTRICITY_RATE: 6.5, // ₹6.5 per kWh average
  PANEL_LIFESPAN: 25, // years
  MAINTENANCE_FACTOR: 0.85, // 85% efficiency after maintenance losses
  PERFORMANCE_RATIO: 0.8, // 80% performance ratio
};

export function calculateAnnualSavings(
  irradiance: number, 
  panelCapacityKW: number = 5,
  electricityRate: number = SOLAR_CONSTANTS.ELECTRICITY_RATE
): {
  annualEnergyGeneration: number;
  annualMoneySaved: number;
  lifetimeSavings: number;
  paybackPeriod: number;
  co2Reduction: number;
} {
  // Annual energy generation (kWh) = Irradiance × Panel Capacity × Performance Ratio × Days
  const annualEnergyGeneration = 
    irradiance * panelCapacityKW * SOLAR_CONSTANTS.PERFORMANCE_RATIO * 365;
  
  // Annual money saved
  const annualMoneySaved = annualEnergyGeneration * electricityRate;
  
  // Lifetime savings (25 years)
  const lifetimeSavings = annualMoneySaved * SOLAR_CONSTANTS.PANEL_LIFESPAN;
  
  // Installation cost
  const installationCost = panelCapacityKW * SOLAR_CONSTANTS.COST_PER_KW;
  
  // Payback period
  const paybackPeriod = installationCost / annualMoneySaved;
  
  // CO2 reduction (kg/year) - 0.82 kg CO2 per kWh
  const co2Reduction = annualEnergyGeneration * 0.82;
  
  return {
    annualEnergyGeneration: Math.round(annualEnergyGeneration),
    annualMoneySaved: Math.round(annualMoneySaved),
    lifetimeSavings: Math.round(lifetimeSavings),
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    co2Reduction: Math.round(co2Reduction)
  };
}