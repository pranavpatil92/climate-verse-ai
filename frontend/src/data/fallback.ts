// src/data/fallback.ts
// Pre-fetched fallback dataset — used if live API calls fail during demo.
// Captured from real Pune data on 2026-09-08.

import type { RiskScores, Recommendation, ScenarioResult } from '../types';

export const PUNE_LOCATION_ID = 'b55a3fb0-e322-42d3-8882-7a3f544f873f';

export const FALLBACK_WEATHER = {
  current: {
    temperature_2m: 28.4,
    relative_humidity_2m: 71,
    precipitation: 0.0,
    rain: 0.0,
    wind_speed_10m: 12.5,
  },
  daily: {
    time: ['2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13', '2026-09-14'],
    temperature_2m_max: [30.2, 29.8, 31.1, 32.0, 29.5, 28.8, 30.5],
    temperature_2m_min: [22.1, 21.8, 23.2, 24.0, 21.5, 20.9, 22.7],
    precipitation_sum: [0.0, 2.3, 5.1, 0.0, 8.4, 12.6, 1.2],
    precipitation_probability_max: [10, 35, 60, 15, 75, 85, 40],
  },
};

export const FALLBACK_RISK_SCORES: RiskScores = {
  heat_risk: 33.6,
  flood_risk: 0.0,
  air_quality_risk: 0.0,
  drought_risk: 21.5,
  overall_risk: 14.4,
  risk_level: 'Low',
};

export const FALLBACK_RECOMMENDATION: Recommendation = {
  explanation:
    'Pune is currently experiencing moderate heat stress with below-average rainfall, leading to elevated drought risk. Air quality is fair but could worsen with continued dry conditions and urban activity.',
  reasoning_factors: [
    { factor: 'Temperature', value: '28.4°C', contribution: 'medium' },
    { factor: 'Rainfall deficit', value: '4.1mm below 5yr avg', contribution: 'high' },
    { factor: 'AQI Index', value: '2 (Fair)', contribution: 'medium' },
    { factor: 'Daily precipitation', value: '0mm', contribution: 'high' },
  ],
  recommended_action:
    'Activate water conservation advisories in agricultural zones and restrict non-essential irrigation to evening hours to manage drought conditions.',
  risk_level: 'Medium',
};

export const FALLBACK_HISTORICAL_TEMPS = [
  { year: '2020', max: 38.2, min: 12.4, avg: 26.8, precip: 601 },
  { year: '2021', max: 39.1, min: 11.9, avg: 27.2, precip: 578 },
  { year: '2022', max: 40.3, min: 13.2, avg: 27.9, precip: 542 },
  { year: '2023', max: 41.5, min: 13.8, avg: 28.4, precip: 498 },
  { year: '2024', max: 42.1, min: 14.1, avg: 29.0, precip: 467 },
];

export const FALLBACK_SCENARIO: ScenarioResult = {
  scenario_name: 'Baseline',
  input_changes: { rainfall_change_pct: 0, temp_change_c: 0, green_cover_change_pct: 0 },
  baseline: FALLBACK_RISK_SCORES,
  simulated: FALLBACK_RISK_SCORES,
  delta: { heat_risk: 0, flood_risk: 0, air_quality_risk: 0, drought_risk: 0, overall_risk: 0 },
};

export const DATA_SOURCES = [
  { name: 'Open-Meteo', label: 'Forecast & Current', icon: '🌤️', color: '#2563A8' },
  { name: 'OpenWeatherMap', label: 'Air Quality', icon: '💨', color: '#1B7A3D' },
  { name: 'NASA POWER', label: '5-Year Historical', icon: '🛸', color: '#7c3aed' },
  { name: 'OpenStreetMap', label: 'Geospatial', icon: '🗺️', color: '#d97706' },
];
