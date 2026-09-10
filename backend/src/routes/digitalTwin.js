// routes/digitalTwin.js
// GET /api/digital-twin/:location_id
// Returns a combined payload: location info, boundary GeoJSON, latest risk scores,
// latest weather snapshot — the "virtual representation" rendered on the map.

const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const weatherService = require('../services/weatherService');

// GET /api/digital-twin/:location_id
router.get('/:location_id', async (req, res) => {
  try {
    const locationId = req.params.location_id || process.env.PUNE_LOCATION_ID;

    // Fetch all data in parallel
    const [locationResult, riskResult, weatherSnapshots] = await Promise.all([
      supabase
        .from('locations')
        .select('*')
        .eq('id', locationId)
        .single(),
      supabase
        .from('risk_scores')
        .select('*')
        .eq('location_id', locationId)
        .order('computed_at', { ascending: false })
        .limit(1),
      supabase
        .from('weather_snapshots')
        .select('source, data, fetched_at')
        .eq('location_id', locationId)
        .order('fetched_at', { ascending: false })
        .limit(8),
    ]);

    const location = locationResult.data;
    const latestRisk = riskResult.data?.[0] || null;

    // Ensure boundary is up to date
    if (location && !location.boundary_geojson) {
      await weatherService.getBoundaryGeoJSON(locationId);
      const refreshed = await supabase
        .from('locations')
        .select('boundary_geojson')
        .eq('id', locationId)
        .single();
      if (refreshed.data) location.boundary_geojson = refreshed.data.boundary_geojson;
    }

    // Group snapshots by source (most recent per source)
    const snapshotsBySource = {};
    for (const snap of weatherSnapshots.data || []) {
      if (!snapshotsBySource[snap.source]) {
        snapshotsBySource[snap.source] = snap;
      }
    }

    res.json({
      success: true,
      digital_twin: {
        location,
        latest_risk_scores: latestRisk,
        weather_snapshots: snapshotsBySource,
        data_sources: [
          'Open-Meteo (forecast)',
          'OpenWeatherMap (air quality)',
          'NASA POWER (5-year historical)',
          'OpenStreetMap (boundary)',
        ],
        last_updated: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Digital Twin error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/digital-twin (uses Pune default)
router.get('/', async (req, res) => {
  req.params.location_id = process.env.PUNE_LOCATION_ID;
  const locationId = process.env.PUNE_LOCATION_ID;

  try {
    const [locationResult, riskResult, weatherSnapshots] = await Promise.all([
      supabase.from('locations').select('*').eq('id', locationId).single(),
      supabase.from('risk_scores').select('*').eq('location_id', locationId)
        .order('computed_at', { ascending: false }).limit(1),
      supabase.from('weather_snapshots').select('source, data, fetched_at')
        .eq('location_id', locationId).order('fetched_at', { ascending: false }).limit(8),
    ]);

    const location = locationResult.data;
    const latestRisk = riskResult.data?.[0] || null;
    const snapshotsBySource = {};
    for (const snap of weatherSnapshots.data || []) {
      if (!snapshotsBySource[snap.source]) snapshotsBySource[snap.source] = snap;
    }

    res.json({
      success: true,
      digital_twin: {
        location,
        latest_risk_scores: latestRisk,
        weather_snapshots: snapshotsBySource,
        data_sources: [
          'Open-Meteo (forecast)',
          'OpenWeatherMap (air quality)',
          'NASA POWER (5-year historical)',
          'OpenStreetMap (boundary)',
        ],
        last_updated: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
