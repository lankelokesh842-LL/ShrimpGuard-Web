import { WATER_QUALITY_THRESHOLDS, HEALTH_DISCLAIMER } from '../config/rules.js';

/**
 * Evaluates water quality readings using demonstration rule thresholds.
 * Returns health score (0-100), overall status, violations list, and recommended actions.
 */
export function evaluateWaterQuality(readings) {
  const { temperature, pH, dissolvedOxygen, turbidity } = readings;
  const violations = [];
  const recommendations = [];

  let criticalCount = 0;
  let warningCount = 0;

  // 1. Dissolved Oxygen (DO) Evaluation (Highest biological risk for shrimp)
  if (dissolvedOxygen < WATER_QUALITY_THRESHOLDS.dissolvedOxygen.criticalLow) {
    criticalCount++;
    violations.push({
      parameter: 'Dissolved Oxygen',
      value: dissolvedOxygen,
      expected: `>= ${WATER_QUALITY_THRESHOLDS.dissolvedOxygen.idealMin} mg/L`,
      severity: 'critical',
      message: `CRITICAL: Dissolved Oxygen (${dissolvedOxygen} mg/L) is dangerously low! Severe risk of hypoxia and shrimp mortality.`
    });
    recommendations.push(
      'Turn on ALL auxiliary paddlewheel aerators immediately. Cut or suspend feed application to reduce biological oxygen demand. Monitor DO levels every 30 minutes until above 5.0 mg/L.'
    );
  } else if (dissolvedOxygen < WATER_QUALITY_THRESHOLDS.dissolvedOxygen.idealMin) {
    warningCount++;
    violations.push({
      parameter: 'Dissolved Oxygen',
      value: dissolvedOxygen,
      expected: `>= ${WATER_QUALITY_THRESHOLDS.dissolvedOxygen.idealMin} mg/L`,
      severity: 'warning',
      message: `WARNING: Dissolved Oxygen (${dissolvedOxygen} mg/L) is suboptimal.`
    });
    recommendations.push(
      'Engage secondary aerators during nighttime and early dawn. Reduce feed quantity by 20% until DO stabilizes above 5.0 mg/L.'
    );
  }

  // 2. pH Evaluation
  if (pH < WATER_QUALITY_THRESHOLDS.pH.criticalLow) {
    criticalCount++;
    violations.push({
      parameter: 'pH Level',
      value: pH,
      expected: `${WATER_QUALITY_THRESHOLDS.pH.idealMin} - ${WATER_QUALITY_THRESHOLDS.pH.idealMax}`,
      severity: 'critical',
      message: `CRITICAL: Pond pH (${pH}) is overly acidic! Softens shrimp exoskeleton and inhibits respiration.`
    });
    recommendations.push(
      'Apply agricultural limestone (CaCO3) or dolomite at 15-20 kg/acre to buffer alkalinity and elevate pH.'
    );
  } else if (pH > WATER_QUALITY_THRESHOLDS.pH.criticalHigh) {
    criticalCount++;
    violations.push({
      parameter: 'pH Level',
      value: pH,
      expected: `${WATER_QUALITY_THRESHOLDS.pH.idealMin} - ${WATER_QUALITY_THRESHOLDS.pH.idealMax}`,
      severity: 'critical',
      message: `CRITICAL: Pond pH (${pH}) is excessively alkaline! High toxicity risk from unionized ammonia (NH3).`
    });
    recommendations.push(
      'Exchange 10-15% of pond surface water if possible. Apply fermented molasses or commercial probiotics to control excessive phytoplankton bloom.'
    );
  } else if (pH < WATER_QUALITY_THRESHOLDS.pH.idealMin || pH > WATER_QUALITY_THRESHOLDS.pH.idealMax) {
    warningCount++;
    violations.push({
      parameter: 'pH Level',
      value: pH,
      expected: `${WATER_QUALITY_THRESHOLDS.pH.idealMin} - ${WATER_QUALITY_THRESHOLDS.pH.idealMax}`,
      severity: 'warning',
      message: `WARNING: pH (${pH}) is drifting outside optimal range.`
    });
    recommendations.push(
      'Monitor diurnal pH swings between morning and afternoon. Apply mild dolomite buffer if morning pH drops below 7.5.'
    );
  }

  // 3. Temperature Evaluation
  if (temperature < WATER_QUALITY_THRESHOLDS.temperature.criticalLow) {
    criticalCount++;
    violations.push({
      parameter: 'Temperature',
      value: temperature,
      expected: `${WATER_QUALITY_THRESHOLDS.temperature.idealMin} - ${WATER_QUALITY_THRESHOLDS.temperature.idealMax} °C`,
      severity: 'critical',
      message: `CRITICAL: Water temperature (${temperature} °C) is too cold. Drastically slows shrimp digestion and immune response.`
    });
    recommendations.push(
      'Drastically reduce feed to avoid bottom waste accumulation. Maintain minimum 1.2m pond depth to buffer rapid chill.'
    );
  } else if (temperature > WATER_QUALITY_THRESHOLDS.temperature.criticalHigh) {
    criticalCount++;
    violations.push({
      parameter: 'Temperature',
      value: temperature,
      expected: `${WATER_QUALITY_THRESHOLDS.temperature.idealMin} - ${WATER_QUALITY_THRESHOLDS.temperature.idealMax} °C`,
      severity: 'critical',
      message: `CRITICAL: Water temperature (${temperature} °C) is dangerously high. Accelerates bacterial multiplication and reduces oxygen saturation.`
    });
    recommendations.push(
      'Increase aeration during peak sun hours to prevent thermocline stratification. Top up with cooler source water if available.'
    );
  } else if (temperature < WATER_QUALITY_THRESHOLDS.temperature.idealMin || temperature > WATER_QUALITY_THRESHOLDS.temperature.idealMax) {
    warningCount++;
    violations.push({
      parameter: 'Temperature',
      value: temperature,
      expected: `${WATER_QUALITY_THRESHOLDS.temperature.idealMin} - ${WATER_QUALITY_THRESHOLDS.temperature.idealMax} °C`,
      severity: 'warning',
      message: `WARNING: Water temperature (${temperature} °C) is outside the optimal comfort zone.`
    });
    recommendations.push(
      'Adjust feeding times towards cooler early morning or twilight hours.'
    );
  }

  // 4. Turbidity Evaluation
  if (turbidity < WATER_QUALITY_THRESHOLDS.turbidity.criticalLow) {
    criticalCount++;
    violations.push({
      parameter: 'Turbidity',
      value: turbidity,
      expected: `${WATER_QUALITY_THRESHOLDS.turbidity.idealMin} - ${WATER_QUALITY_THRESHOLDS.turbidity.idealMax} NTU`,
      severity: 'critical',
      message: `CRITICAL: Water is excessively clear (< ${WATER_QUALITY_THRESHOLDS.turbidity.criticalLow} NTU). Total collapse of natural algal bloom, leaving shrimp exposed to stress and benthic algae.`
    });
    recommendations.push(
      'Fertilize gently with organic fermented nutrients or inoculate pond with clean green microalgae culture.'
    );
  } else if (turbidity > WATER_QUALITY_THRESHOLDS.turbidity.criticalHigh) {
    criticalCount++;
    violations.push({
      parameter: 'Turbidity',
      value: turbidity,
      expected: `${WATER_QUALITY_THRESHOLDS.turbidity.idealMin} - ${WATER_QUALITY_THRESHOLDS.turbidity.idealMax} NTU`,
      severity: 'critical',
      message: `CRITICAL: Water is heavily turbid (${turbidity} NTU). High suspended clay or decaying organic matter clogs shrimp gills.`
    });
    recommendations.push(
      'Suspend feeding tray checks, apply biofloc / zeolite binders, and flush bottom sludge drain if central drain is equipped.'
    );
  } else if (turbidity < WATER_QUALITY_THRESHOLDS.turbidity.idealMin || turbidity > WATER_QUALITY_THRESHOLDS.turbidity.idealMax) {
    warningCount++;
    violations.push({
      parameter: 'Turbidity',
      value: turbidity,
      expected: `${WATER_QUALITY_THRESHOLDS.turbidity.idealMin} - ${WATER_QUALITY_THRESHOLDS.turbidity.idealMax} NTU`,
      severity: 'warning',
      message: `WARNING: Turbidity (${turbidity} NTU) indicates unstable plankton bloom or slight silt disturbance.`
    });
    recommendations.push(
      'Check Secchi disk transparency and regulate daily feed rations to prevent excess organic loading.'
    );
  }

  // Calculate Health Score (100 base score)
  let healthScore = 100 - (criticalCount * 28) - (warningCount * 12);
  healthScore = Math.max(10, Math.min(100, healthScore));

  // Determine overall status
  let status = 'normal';
  if (criticalCount > 0 || healthScore < 60) {
    status = 'critical';
  } else if (warningCount > 0 || healthScore < 85) {
    status = 'warning';
  }

  const recommendedAction = recommendations.length > 0
    ? recommendations.join(' | ')
    : 'All water quality parameters are within optimal aquaculture targets. Maintain standard feeding schedules and routine aerator operations.';

  return {
    healthScore,
    status,
    violations,
    criticalCount,
    warningCount,
    recommendedAction,
    disclaimer: HEALTH_DISCLAIMER
  };
}
