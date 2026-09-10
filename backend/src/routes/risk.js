// routes/risk.js
// GET /api/risk/score — Compute climate risk scores, store in DB, return result

const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const { computeRiskScores } = require('../services/riskEngine');
const supabase = require('../db/supabase');

function getLocationId(req) {
  const id = req.query?.location_id || process.env.PUNE_LOCATION_ID;
  return id ? id.trim() : 'b55a3fb0-e322-42d3-8882-7a3f544f873f';
}

/**
 * Extract the 5-year average daily precipitation from NASA POWER data.
 */
function compute5yrAvgPrecip(nasaData) {
  try {
    const precipData = nasaData?.properties?.parameter?.PRECTOTCORR;
    if (!precipData) return 5; // fallback default

    const values = Object.values(precipData).filter(
      (v) => typeof v === 'number' && v !== -999
    );
    if (!values.length) return 5;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  } catch {
    return 5;
  }
}

// GET /api/risk/score
router.get('/score', async (req, res) => {
  try {
    const locationId = getLocationId(req);

    // Fetch all data sources in parallel
    const [weatherData, aqiData, historicalData] = await Promise.all([
      weatherService.getCurrentWeather(locationId),
      weatherService.getAirQuality(locationId),
      weatherService.getHistoricalData(locationId),
    ]);

    // Extract current temperature
    const currentTempC = weatherData?.current?.temperature_2m ?? 30;

    // Extract today's precipitation (first daily value)
    const dailyPrecipMm = weatherData?.daily?.precipitation_sum?.[0] ?? 0;

    // Extract AQI index from OpenWeatherMap (1-5 scale)
    const aqiIndex = aqiData?.list?.[0]?.main?.aqi ?? 2;

    // Compute 5-year average precipitation
    const avgPrecip5yr = compute5yrAvgPrecip(historicalData);

    // Compute risk scores
    const scores = computeRiskScores({
      currentTempC,
      dailyPrecipMm,
      aqiIndex,
      avgPrecip5yr,
    });

    // Store in Supabase
    const { data: stored, error } = await supabase
      .from('risk_scores')
      .insert({
        location_id: locationId,
        ...scores,
      })
      .select()
      .single();

    if (error) console.error('DB insert error:', error);

    res.json({
      success: true,
      risk_score_id: stored?.id,
      location_id: locationId,
      inputs: { currentTempC, dailyPrecipMm, aqiIndex, avgPrecip5yr },
      ...scores,
    });
  } catch (err) {
    console.error('Risk score error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
