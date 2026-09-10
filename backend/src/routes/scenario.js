// routes/scenario.js
// POST /api/scenario/simulate — What-If Scenario Engine
// Body: { rainfall_change_pct, temp_change_c, green_cover_change_pct }

const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const { simulateScenario, computeRiskScores } = require('../services/riskEngine');
const supabase = require('../db/supabase');

function getLocationId(req) {
  return req.body.location_id || req.query.location_id || process.env.PUNE_LOCATION_ID;
}

function compute5yrAvgPrecip(nasaData) {
  try {
    const precipData = nasaData?.properties?.parameter?.PRECTOTCORR;
    if (!precipData) return 5;
    const values = Object.values(precipData).filter(
      (v) => typeof v === 'number' && v !== -999
    );
    if (!values.length) return 5;
    return values.reduce((a, b) => a + b, 0) / values.length;
  } catch {
    return 5;
  }
}

// POST /api/scenario/simulate
router.post('/simulate', async (req, res) => {
  try {
    const locationId = getLocationId(req);
    const {
      rainfall_change_pct = 0,
      temp_change_c = 0,
      green_cover_change_pct = 0,
      scenario_name = 'Custom Scenario',
    } = req.body;

    // Get current inputs (same as risk score endpoint)
    const [weatherData, aqiData, historicalData] = await Promise.all([
      weatherService.getCurrentWeather(locationId),
      weatherService.getAirQuality(locationId),
      weatherService.getHistoricalData(locationId),
    ]);

    const baseline = {
      currentTempC: weatherData?.current?.temperature_2m ?? 30,
      dailyPrecipMm: weatherData?.daily?.precipitation_sum?.[0] ?? 0,
      aqiIndex: aqiData?.list?.[0]?.main?.aqi ?? 2,
      avgPrecip5yr: compute5yrAvgPrecip(historicalData),
    };

    const changes = { rainfall_change_pct, temp_change_c, green_cover_change_pct };
    const result = simulateScenario(baseline, changes);

    // Store in scenarios table
    const { error } = await supabase.from('scenarios').insert({
      location_id: locationId,
      scenario_name,
      input_changes: changes,
      baseline_risk: result.baseline,
      resulting_risk: result.simulated,
    });

    if (error) console.error('Scenario DB error:', error);

    res.json({
      success: true,
      location_id: locationId,
      scenario_name,
      input_changes: changes,
      baseline_inputs: baseline,
      ...result,
    });
  } catch (err) {
    console.error('Scenario error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
