// src/App.tsx — ClimateVerse AI Main Application
import { useState } from 'react';
import { RiskScoreHero } from './components/Dashboard/RiskScoreHero';
import { RiskSubCards } from './components/Dashboard/RiskSubCards';
import { DataSourcesBadge } from './components/Dashboard/DataSourcesBadge';
import { TwinMap } from './components/DigitalTwin/TwinMap';
import { HistoricalChart } from './components/HistoricalChart/HistoricalChart';
import { ScenarioEngine } from './components/ScenarioEngine/ScenarioEngine';
import { RecommendationPanel } from './components/Recommendation/RecommendationPanel';
import { ChatPanel } from './components/Copilot/ChatPanel';
import { useRisk } from './hooks/useRisk';
import { useWeather } from './hooks/useWeather';

type ActiveTab = 'dashboard' | 'scenario' | 'recommendation' | 'copilot';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const { data: riskScores, loading: riskLoading } = useRisk();
  const { data: weatherData, loading: weatherLoading } = useWeather();

  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'scenario', label: 'What-If', icon: '⚙️' },
    { id: 'recommendation', label: 'AI Insights', icon: '🧠' },
    { id: 'copilot', label: 'Copilot', icon: '🤖' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ────────────────────────────────────────────── */}
      <header className="bg-navy shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
              🌍
            </div>
            <div>
              <span className="text-white font-bold text-xl">ClimateVerse AI</span>
              <div className="text-gray-400 text-xs">Predict. Simulate. Decide. Protect.</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-navy-light border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span>📍</span>
              <span className="font-medium">Pune, Maharashtra</span>
              <span className="text-gray-400 text-xs">▼</span>
            </div>
            {riskScores && (
              <div
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  riskScores.risk_level === 'High' ? 'bg-red-500' :
                  riskScores.risk_level === 'Low' ? 'bg-green-500' : 'bg-amber-500'
                } text-white`}
              >
                {riskScores.risk_level} Risk
              </div>
            )}
          </div>
        </div>

        {/* Tab nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-50 text-navy border-t border-l border-r border-gray-200'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Risk Score Hero */}
            <div className="bg-white rounded-card shadow-card p-6">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-navy">Climate Risk Score</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Real-time composite score — Heat 30% · Flood 30% · AQI 20% · Drought 20%
                </p>
              </div>
              <RiskScoreHero scores={riskScores} loading={riskLoading} />

              {/* Live weather strip */}
              {weatherData && !weatherLoading && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-navy">{weatherData.current.temperature_2m}°C</div>
                    <div className="text-xs text-gray-400">Temperature</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-navy">{weatherData.current.relative_humidity_2m}%</div>
                    <div className="text-xs text-gray-400">Humidity</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-navy">{weatherData.current.wind_speed_10m} km/h</div>
                    <div className="text-xs text-gray-400">Wind Speed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-navy">{weatherData.current.precipitation} mm</div>
                    <div className="text-xs text-gray-400">Precipitation</div>
                  </div>
                </div>
              )}
            </div>

            {/* Risk sub-cards */}
            <RiskSubCards scores={riskScores} loading={riskLoading} />

            {/* Map + Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TwinMap riskScores={riskScores} />
              <HistoricalChart />
            </div>

            {/* Data sources */}
            <DataSourcesBadge />
          </div>
        )}

        {/* WHAT-IF TAB */}
        {activeTab === 'scenario' && (
          <div className="max-w-2xl mx-auto">
            <ScenarioEngine />
          </div>
        )}

        {/* AI INSIGHTS TAB */}
        {activeTab === 'recommendation' && (
          <div className="max-w-2xl mx-auto">
            <RecommendationPanel />
          </div>
        )}

        {/* COPILOT TAB */}
        {activeTab === 'copilot' && (
          <div className="max-w-2xl mx-auto">
            <ChatPanel />
          </div>
        )}
      </main>

      {/* ─── Footer ────────────────────────────────────────────── */}
      <footer className="bg-navy mt-12 py-6 text-center text-gray-400 text-xs">
        <div className="font-semibold text-white mb-1">Team Infinite Loopers · SSGB College of Engineering & Technology</div>
        <div>Prototype — data from Open-Meteo · OpenWeatherMap · NASA POWER · OpenStreetMap</div>
        <div className="mt-1 text-gray-500">AI powered by Google Gemini 1.5 Flash · Database: Supabase · Maps: Leaflet.js</div>
      </footer>
    </div>
  );
}
