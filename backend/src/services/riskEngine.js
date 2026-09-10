// services/riskEngine.js
// Implements Climate Risk Score formulae with Bug 1 & Bug 2 fixes applied.

/**
 * Clamps a value between min and max, then scales to 0-100.
 */
function normalize(value, min, max) {
  if (max === min) return 0;
  const clamped = Math.min(Math.max(value, min), max);
  return ((clamped - min) / (max - min)) * 100;
}

/**
 * Compute all 4 risk scores + weighted overall.
 *
 * @param {object} params
 * @param {number} params.currentTempC       - Current air temp in °C
 * @param {number} params.dailyPrecipMm      - Today's total precipitation in mm
 * @param {number} params.aqiIndex           - Raw AQI index (1-5 scale from OpenWeatherMap)
 * @param {number} params.avgPrecip5yr       - 5-year daily avg precipitation (mm)
 * @returns {object} risk scores
 */
function computeRiskScores({ currentTempC, dailyPrecipMm, aqiIndex, avgPrecip5yr }) {
  // 1. Heat Risk (20°C = 0%, 45°C = 100%)
  const heat_risk = normalize(currentTempC, 20, 45);

  // 2. Flood Risk (0mm = 0%, 100mm = 100%)
  const flood_risk = normalize(dailyPrecipMm, 0, 100);

  // 3. Air Quality Risk — BUG 1 FIX:
  // Raw OpenWeather AQI is 1-5 (1=Good, 5=Very Poor).
  // Map (1-5) -> (0-300) so AQI 1 maps to 0 risk, AQI 5 maps to 300 (100% risk).
  const aqiRaw = typeof aqiIndex === 'number' ? Math.min(Math.max(aqiIndex, 1), 5) : 1;
  const aqi_scaled = (aqiRaw - 1) * 75; // 1->0, 2->75, 3->150, 4->225, 5->300
  const air_quality_risk = normalize(aqi_scaled, 0, 300);

  // 4. Drought Risk — Stabilized:
  // Deficit between 5-year daily average precip vs current precip
  const rainfallDeficit = Math.max(0, avgPrecip5yr - dailyPrecipMm);
  // Scale against historical average threshold so reasonable daily variations don't spike to 100%
  const maxDeficitThreshold = Math.max(10, avgPrecip5yr * 3);
  const drought_risk = normalize(rainfallDeficit, 0, maxDeficitThreshold);

  // Weighted average: heat 30%, flood 30%, AQI 20%, drought 20%
  const overall_risk =
    heat_risk * 0.3 +
    flood_risk * 0.3 +
    air_quality_risk * 0.2 +
    drought_risk * 0.2;

  const risk_level =
    overall_risk < 33 ? 'Low' : overall_risk < 66 ? 'Medium' : 'High';

  return {
    heat_risk: Math.round(heat_risk * 10) / 10,
    flood_risk: Math.round(flood_risk * 10) / 10,
    air_quality_risk: Math.round(air_quality_risk * 10) / 10,
    drought_risk: Math.round(drought_risk * 10) / 10,
    overall_risk: Math.round(overall_risk * 10) / 10,
    risk_level,
    aqi_scaled: Math.round(aqi_scaled),
  };
}

/**
 * Apply what-if deltas to inputs and recompute.
 * BUG 2 FIX: Apply green cover reduction to scaled AQI (0-300) instead of raw (1-5) scale.
 *
 * @param {object} baseline - { currentTempC, dailyPrecipMm, aqiIndex, avgPrecip5yr }
 * @param {object} changes  - { rainfall_change_pct, temp_change_c, green_cover_change_pct }
 * @returns {{ baseline: scores, simulated: scores, delta: scores }}
 */
function simulateScenario(baseline, changes) {
  const { rainfall_change_pct = 0, temp_change_c = 0, green_cover_change_pct = 0 } = changes;

  // 1. Calculate baseline scaled AQI (0-300)
  const baselineAqiRaw = typeof baseline.aqiIndex === 'number' ? Math.min(Math.max(baseline.aqiIndex, 1), 5) : 1;
  const baselineAqiScaled = (baselineAqiRaw - 1) * 75;

  // BUG 2 FIX: Reduce scaled AQI by 15 points for every 10% green cover (on 0-300 scale)
  const simulatedAqiScaled = Math.max(0, baselineAqiScaled - (green_cover_change_pct / 10) * 15);
  // Convert back to raw 1-5 equivalent for consistent calculation structure
  const simulatedAqiRaw = 1 + (simulatedAqiScaled / 75);

  const simulatedInputs = {
    currentTempC: baseline.currentTempC + temp_change_c,
    dailyPrecipMm: Math.max(0, baseline.dailyPrecipMm * (1 + rainfall_change_pct / 100)),
    aqiIndex: simulatedAqiRaw,
    avgPrecip5yr: baseline.avgPrecip5yr,
  };

  const baselineScores = computeRiskScores(baseline);
  const simulatedScores = computeRiskScores(simulatedInputs);

  const delta = {
    heat_risk: Math.round((simulatedScores.heat_risk - baselineScores.heat_risk) * 10) / 10,
    flood_risk: Math.round((simulatedScores.flood_risk - baselineScores.flood_risk) * 10) / 10,
    air_quality_risk: Math.round((simulatedScores.air_quality_risk - baselineScores.air_quality_risk) * 10) / 10,
    drought_risk: Math.round((simulatedScores.drought_risk - baselineScores.drought_risk) * 10) / 10,
    overall_risk: Math.round((simulatedScores.overall_risk - baselineScores.overall_risk) * 10) / 10,
  };

  return { baseline: baselineScores, simulated: simulatedScores, delta };
}

module.exports = { computeRiskScores, simulateScenario, normalize };
