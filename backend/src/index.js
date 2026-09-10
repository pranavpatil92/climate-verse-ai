// src/index.js — ClimateVerse AI Backend Entry Point
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const weatherRoutes = require('./routes/weather');
const locationRoutes = require('./routes/location');
const riskRoutes = require('./routes/risk');
const scenarioRoutes = require('./routes/scenario');
const aiRoutes = require('./routes/ai');
const digitalTwinRoutes = require('./routes/digitalTwin');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ClimateVerse AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/weather', weatherRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/scenario', scenarioRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/copilot', aiRoutes);          // /api/copilot/ask shares the ai router
app.use('/api/digital-twin', digitalTwinRoutes);

// ─── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌍 ClimateVerse AI Backend running on http://localhost:${PORT}`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL}`);
  console.log(`   Demo city: Pune (${process.env.PUNE_LOCATION_ID})\n`);
});

module.exports = app;
