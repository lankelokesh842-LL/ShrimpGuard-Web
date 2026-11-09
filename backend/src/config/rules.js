/**
 * Configurable thresholds and advisory rules for shrimp pond health monitoring.
 * Note: Demonstration thresholds - indicative of environmental stress, does NOT
 * confirm clinical shrimp disease or biological infection.
 */

export const WATER_QUALITY_THRESHOLDS = {
  temperature: {
    name: 'Temperature',
    unit: '°C',
    idealMin: 26.0,
    idealMax: 32.0,
    warningLowMin: 24.0,
    warningHighMax: 34.0,
    criticalLow: 24.0,
    criticalHigh: 34.0
  },
  pH: {
    name: 'pH Level',
    unit: '',
    idealMin: 7.5,
    idealMax: 8.5,
    warningLowMin: 7.0,
    warningHighMax: 9.0,
    criticalLow: 7.0,
    criticalHigh: 9.0
  },
  dissolvedOxygen: {
    name: 'Dissolved Oxygen',
    unit: 'mg/L',
    idealMin: 5.0,
    idealMax: 9.5,
    warningLowMin: 3.5,
    criticalLow: 3.5
  },
  turbidity: {
    name: 'Turbidity',
    unit: 'NTU',
    idealMin: 25.0,
    idealMax: 45.0,
    warningLowMin: 18.0,
    warningHighMax: 60.0,
    criticalLow: 18.0,
    criticalHigh: 60.0
  }
};

export const HEALTH_DISCLAIMER = 
  "Demonstration threshold rule-based analysis. Water quality parameters indicate environmental stress and risk factors, but do NOT confirm clinical shrimp diseases or biological infection. Health score is a demonstrative risk indicator.";
