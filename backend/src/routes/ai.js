// routes/ai.js
// GET  /api/ai/recommendation — Explainable AI recommendation (Prompt A)
// POST /api/copilot/ask       — AI Climate Copilot chat (Prompt B)

const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const { computeRiskScores } = require('../services/riskEngine');
const { getRecommendation, askCopilot } = require('../ai/gemini');
const supabase = require('../db/supabase');

function getLocationId(req) {
  const id = req.query?.location_id || req.body?.location_id || process.env.PUNE_LOCATION_ID;
  return id ? id.trim() : 'b55a3fb0-e322-42d3-8882-7a3f544f873f';
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

async function buildRiskContext(locationId) {
  const [weatherData, aqiData, historicalData] = await Promise.all([
    weatherService.getCurrentWeather(locationId),
    weatherService.getAirQuality(locationId),
    weatherService.getHistoricalData(locationId),
  ]);

  const inputs = {
    currentTempC: weatherData?.current?.temperature_2m ?? 30,
    dailyPrecipMm: weatherData?.daily?.precipitation_sum?.[0] ?? 0,
    aqiIndex: aqiData?.list?.[0]?.main?.aqi ?? 2,
    avgPrecip5yr: compute5yrAvgPrecip(historicalData),
  };

  const riskScores = computeRiskScores(inputs);

  return {
    location: 'Pune, Maharashtra, India',
    weather: {
      temperature_c: inputs.currentTempC,
      humidity_pct: weatherData?.current?.relative_humidity_2m,
      precipitation_mm: inputs.dailyPrecipMm,
      wind_speed_kmh: weatherData?.current?.wind_speed_10m,
    },
    air_quality: {
      aqi_index: inputs.aqiIndex,
      components: aqiData?.list?.[0]?.components,
    },
    historical: {
      avg_daily_precip_5yr_mm: Math.round(inputs.avgPrecip5yr * 100) / 100,
    },
    risk_scores: riskScores,
  };
}

// GET /api/ai/recommendation
router.get('/recommendation', async (req, res) => {
  try {
    const locationId = getLocationId(req);
    const context = await buildRiskContext(locationId);

    // Get latest risk_score_id from DB
    const { data: latestScore } = await supabase
      .from('risk_scores')
      .select('id')
      .eq('location_id', locationId)
      .order('computed_at', { ascending: false })
      .limit(1);

    const riskScoreId = latestScore?.[0]?.id || null;

    // Call AI
    const recommendation = await getRecommendation(context);

    // Store recommendation
    const { error } = await supabase.from('recommendations').insert({
      location_id: locationId,
      risk_score_id: riskScoreId,
      explanation: recommendation.explanation,
      reasoning_factors: recommendation.reasoning_factors,
      recommended_action: recommendation.recommended_action,
    });

    if (error) console.error('Recommendation DB error:', error);

    res.json({
      success: true,
      location_id: locationId,
      context: context.risk_scores,
      ...recommendation,
    });
  } catch (err) {
    console.error('Recommendation error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/copilot/ask
router.post('/ask', async (req, res) => {
  try {
    const locationId = getLocationId(req);
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'message is required' });
    }

    // Build context for the copilot
    const context = await buildRiskContext(locationId);

    // Get AI response
    const aiResponse = await askCopilot(message, context);

    // Log conversation
    await supabase.from('copilot_conversations').insert({
      location_id: locationId,
      user_message: message,
      ai_response: aiResponse,
    });

    res.json({
      success: true,
      location_id: locationId,
      user_message: message,
      ai_response: aiResponse,
    });
  } catch (err) {
    console.error('Copilot error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
