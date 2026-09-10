// src/types/index.ts — Shared TypeScript types for ClimateVerse AI

export interface RiskScores {
  heat_risk: number;
  flood_risk: number;
  air_quality_risk: number;
  drought_risk: number;
  overall_risk: number;
  risk_level: 'Low' | 'Medium' | 'High';
}

export interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    rain: number;
    wind_speed_10m: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    time: string[];
  };
  hourly?: Record<string, number[]>;
}

export interface AirQualityData {
  list: Array<{
    main: { aqi: number };
    components: {
      co: number;
      no2: number;
      o3: number;
      pm2_5: number;
      pm10: number;
    };
  }>;
}

export interface ReasoningFactor {
  factor: string;
  value: string;
  contribution: 'high' | 'medium' | 'low';
}

export interface Recommendation {
  explanation: string;
  reasoning_factors: ReasoningFactor[];
  recommended_action: string;
  risk_level: 'Low' | 'Medium' | 'High';
}

export interface ScenarioResult {
  scenario_name: string;
  input_changes: {
    rainfall_change_pct: number;
    temp_change_c: number;
    green_cover_change_pct: number;
  };
  baseline: RiskScores;
  simulated: RiskScores;
  delta: Omit<RiskScores, 'risk_level'>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DigitalTwinPayload {
  location: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    boundary_geojson: GeoJSON.Geometry | null;
  };
  latest_risk_scores: RiskScores | null;
  weather_snapshots: Record<string, { data: unknown; fetched_at: string }>;
  data_sources: string[];
  last_updated: string;
}
