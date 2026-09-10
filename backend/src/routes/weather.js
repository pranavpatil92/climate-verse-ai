// routes/weather.js
// GET /api/weather/current    — Open-Meteo current + hourly + daily forecast
// GET /api/weather/air-quality — OpenWeatherMap AQI
// GET /api/weather/historical  — NASA POWER 5-year historical data

const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

// Resolve location_id from query param or use Pune default
function getLocationId(req) {
  return req.query.location_id || process.env.PUNE_LOCATION_ID;
}

// GET /api/weather/current
router.get('/current', async (req, res) => {
  try {
    const locationId = getLocationId(req);
    const data = await weatherService.getCurrentWeather(locationId);
    res.json({ success: true, source: 'Open-Meteo', data });
  } catch (err) {
    console.error('Weather current error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/weather/air-quality
router.get('/air-quality', async (req, res) => {
  try {
    const locationId = getLocationId(req);
    const data = await weatherService.getAirQuality(locationId);
    res.json({ success: true, source: 'OpenWeatherMap', data });
  } catch (err) {
    console.error('Air quality error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/weather/historical
router.get('/historical', async (req, res) => {
  try {
    const locationId = getLocationId(req);
    const data = await weatherService.getHistoricalData(locationId);
    res.json({ success: true, source: 'NASA POWER', data });
  } catch (err) {
    console.error('Historical data error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
