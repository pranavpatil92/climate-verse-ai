// src/components/ScenarioEngine/ScenarioEngine.tsx
// What-If Scenario Engine: 3 sliders + Run Simulation + before/after comparison

import { useState } from 'react';
import type { ScenarioResult } from '../../types';
import { useScenario } from '../../hooks/useScenario';

interface DeltaArrowProps {
  readonly value: number;
  readonly label: string;
}

function DeltaArrow({ value, label }: DeltaArrowProps) {
  const isUp = value > 0;
  const isDown = value < 0;
  const color = isUp ? '#dc2626' : isDown ? '#16a34a' : '#6b7280';
  const arrow = isUp ? '↑' : isDown ? '↓' : '→';
  return (
    <div className="flex items-center gap-1 text-sm">
      <span style={{ color }} className="font-bold">{arrow} {Math.abs(value).toFixed(1)}</span>
      <span className="text-gray-400 text-xs">{label}</span>
    </div>
  );
}

interface ScoreCardProps {
  readonly title: string;
  readonly scores: ScenarioResult['baseline'];
  readonly highlight?: boolean;
}

function ScoreCard({ title, scores, highlight }: ScoreCardProps) {
  const levelColors = { Low: '#16a34a', Medium: '#d97706', High: '#dc2626' };
  const color = levelColors[scores.risk_level];

  return (
    <div className={`rounded-card p-4 border-2 ${highlight ? 'border-primary bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="text-xs font-semibold text-gray-400 uppercase mb-2">{title}</div>
      <div className="text-4xl font-bold mb-1" style={{ color }}>
        {Math.round(scores.overall_risk)}
      </div>
      <div className="text-sm font-semibold mb-3" style={{ color }}>{scores.risk_level} Risk</div>
      <div className="space-y-1.5 text-xs text-gray-600">
        <div className="flex justify-between"><span>🌡️ Heat</span><span>{Math.round(scores.heat_risk)}</span></div>
        <div className="flex justify-between"><span>🌊 Flood</span><span>{Math.round(scores.flood_risk)}</span></div>
        <div className="flex justify-between"><span>💨 Air</span><span>{Math.round(scores.air_quality_risk)}</span></div>
        <div className="flex justify-between"><span>🏜️ Drought</span><span>{Math.round(scores.drought_risk)}</span></div>
      </div>
    </div>
  );
}

export function ScenarioEngine() {
  const [rainfall, setRainfall] = useState(0);
  const [temp, setTemp] = useState(0);
  const [greenCover, setGreenCover] = useState(0);
  const { result, loading, runSimulation } = useScenario();

  const handleRun = () => {
    runSimulation({
      rainfall_change_pct: rainfall,
      temp_change_c: temp,
      green_cover_change_pct: greenCover,
    });
  };

  return (
    <div className="bg-white rounded-card shadow-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-navy">⚙️ What-If Scenario Engine</h3>
        <p className="text-xs text-gray-400 mt-1">Adjust parameters and simulate future climate conditions for Pune</p>
      </div>

      {/* Sliders */}
      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">🌧️ Rainfall Change</label>
            <span className="text-sm font-bold text-secondary">{rainfall > 0 ? '+' : ''}{rainfall}%</span>
          </div>
          <input
            type="range" min={-50} max={50} step={5} value={rainfall}
            onChange={(e) => setRainfall(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>-50%</span><span>+50%</span></div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">🌡️ Temperature Change</label>
            <span className="text-sm font-bold text-red-500">{temp > 0 ? '+' : ''}{temp}°C</span>
          </div>
          <input
            type="range" min={-5} max={5} step={0.5} value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>-5°C</span><span>+5°C</span></div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">🌿 Green Cover Increase</label>
            <span className="text-sm font-bold text-primary">+{greenCover}%</span>
          </div>
          <input
            type="range" min={0} max={30} step={5} value={greenCover}
            onChange={(e) => setGreenCover(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0%</span><span>+30%</span></div>
        </div>
      </div>

      <button
        onClick={handleRun}
        disabled={loading}
        className="w-full py-3 bg-primary text-white font-semibold rounded-card hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <><span className="animate-spin">⟳</span> Simulating…</>
        ) : (
          <>▶ Run Simulation</>
        )}
      </button>

      {/* Before / After comparison */}
      {result && (
        <div className="mt-6">
          <div className="text-sm font-semibold text-gray-600 mb-3">Scenario Comparison</div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <ScoreCard title="Baseline" scores={result.baseline} />
            <ScoreCard title="Simulated" scores={result.simulated} highlight />
          </div>
          <div className="bg-gray-50 rounded-card p-4">
            <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Risk Changes (Δ)</div>
            <div className="grid grid-cols-2 gap-2">
              <DeltaArrow value={result.delta.overall_risk} label="Overall" />
              <DeltaArrow value={result.delta.heat_risk} label="Heat" />
              <DeltaArrow value={result.delta.flood_risk} label="Flood" />
              <DeltaArrow value={result.delta.drought_risk} label="Drought" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
