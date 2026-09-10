// routes/location.js
// GET /api/location/boundary — OSM Nominatim boundary GeoJSON for Digital Twin map

const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

function getLocationId(req) {
  return req.query.location_id || process.env.PUNE_LOCATION_ID;
}

// GET /api/location/boundary
router.get('/boundary', async (req, res) => {
  try {
    const locationId = getLocationId(req);
    const data = await weatherService.getBoundaryGeoJSON(locationId);
    res.json({ success: true, source: 'OpenStreetMap Nominatim', data });
  } catch (err) {
    console.error('Boundary error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
