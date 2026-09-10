# ClimateVerse AI — Backend API

> Predict. Simulate. Decide. Protect.

Node.js/Express REST API powering ClimateVerse AI for **Pune, Maharashtra, India**.

## Setup

```bash
cd backend
npm install
# copy .env and fill in your keys
npm run dev   # development with auto-reload
npm start     # production
```

## Environment Variables (`.env`)

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio (Gemini) API key |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key (air quality) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `PUNE_LOCATION_ID` | UUID of the Pune row in `locations` table |
| `PORT` | Server port (default: 3000) |

---

## API Endpoints

### Health
```
GET /health
```
Returns server status.

---

### Weather Data (Multi-Source Climate Intelligence)

#### `GET /api/weather/current`
Fetches current + hourly + daily forecast from **Open-Meteo** (no API key needed).  
Cached in Supabase for 1 hour.

```bash
curl http://localhost:3000/api/weather/current
curl http://localhost:3000/api/weather/current?location_id=<uuid>
```

#### `GET /api/weather/air-quality`
Fetches AQI from **OpenWeatherMap**.  
Cached in Supabase for 1 hour.

```bash
curl http://localhost:3000/api/weather/air-quality
```

#### `GET /api/weather/historical`
Fetches 5-year daily climate data (2020–2024) from **NASA POWER**.  
Cached in Supabase for 1 hour. *(First call may take ~15s — NASA POWER is slow.)*

```bash
curl http://localhost:3000/api/weather/historical
```

---

### Location

#### `GET /api/location/boundary`
Returns Pune boundary **GeoJSON** from OpenStreetMap Nominatim. Used by the Leaflet map in the Digital Twin panel.

```bash
curl http://localhost:3000/api/location/boundary
```

---

### Climate Risk Score (Feature 4)

#### `GET /api/risk/score`
Computes all 4 risk scores + weighted overall, stores in `risk_scores` table.

**Formula:**
- `heat_risk = normalize(temp_c, 20, 45) × 100`
- `flood_risk = normalize(precip_mm, 0, 100) × 100`
- `air_quality_risk = normalize(aqi_index×60, 0, 300) × 100`
- `drought_risk = normalize(5yr_avg − current_precip, 0, 100) × 100`
- `overall_risk = heat×0.3 + flood×0.3 + aqi×0.2 + drought×0.2`

```bash
curl http://localhost:3000/api/risk/score
```

**Response:**
```json
{
  "overall_risk": 42.5,
  "risk_level": "Medium",
  "heat_risk": 48.0,
  "flood_risk": 12.0,
  "air_quality_risk": 40.0,
  "drought_risk": 75.0
}
```

---

### What-If Scenario Engine (Feature 3)

#### `POST /api/scenario/simulate`
Applies delta changes to baseline inputs, recomputes all scores. Returns baseline vs simulated comparison + deltas.

```bash
curl -X POST http://localhost:3000/api/scenario/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "rainfall_change_pct": -30,
    "temp_change_c": 2,
    "green_cover_change_pct": 15,
    "scenario_name": "Dry Heat Wave"
  }'
```

**Response:**
```json
{
  "baseline": { "overall_risk": 42.5, "risk_level": "Medium", ... },
  "simulated": { "overall_risk": 61.8, "risk_level": "Medium", ... },
  "delta": { "overall_risk": 19.3, "heat_risk": 6.0, ... }
}
```

---

### Explainable AI Recommendation (Features 5 & 6)

#### `GET /api/ai/recommendation`
Builds full climate context → sends to **Gemini 1.5 Flash** with Prompt A → returns JSON with explanation, reasoning factors, and recommended action. Stored in `recommendations` table.

```bash
curl http://localhost:3000/api/ai/recommendation
```

**Response:**
```json
{
  "explanation": "Pune is experiencing moderate heat stress with low flood risk ...",
  "reasoning_factors": [
    { "factor": "Temperature", "value": "34.2°C", "contribution": "high" },
    { "factor": "Rainfall deficit", "value": "4.2mm below 5yr avg", "contribution": "high" }
  ],
  "recommended_action": "Activate shaded water distribution points in high-density wards.",
  "risk_level": "Medium"
}
```

---

### AI Climate Copilot (Feature 1)

#### `POST /api/copilot/ask`
Sends user message + current risk context to **Gemini 1.5 Flash** with Prompt B. Logs conversation to `copilot_conversations`.

```bash
curl -X POST http://localhost:3000/api/copilot/ask \
  -H "Content-Type: application/json" \
  -d '{ "message": "What is the current flood risk in Pune?" }'
```

---

### Digital Twin (Feature 2)

#### `GET /api/digital-twin` or `GET /api/digital-twin/:location_id`
Returns combined payload: location info, boundary GeoJSON, latest risk scores, all weather snapshots by source.

```bash
curl http://localhost:3000/api/digital-twin
curl http://localhost:3000/api/digital-twin/46e268d2-94ac-497d-a5ed-692d4b68f333
```

---

## Scalability (Feature 8)

All endpoints accept an optional `location_id` query param. To add a new city:
```sql
INSERT INTO locations (name, latitude, longitude) VALUES ('Mumbai', 19.0760, 72.8777);
```
No code changes needed — the entire pipeline works for any city.

---

## Data Sources

| Source | Data | Key Required |
|---|---|---|
| Open-Meteo | Current + forecast weather | ❌ Free |
| OpenWeatherMap | Air Quality Index | ✅ |
| NASA POWER | 5-year historical climate | ❌ Free |
| OpenStreetMap Nominatim | City boundary GeoJSON | ❌ Free |

---

*Team: Infinite Loopers — SSGB College of Engineering & Technology*
