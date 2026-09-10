// src/components/HistoricalChart/HistoricalChart.tsx
// 5-year line chart sourced from NASA POWER — toggleable between temp and rainfall

import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { FALLBACK_HISTORICAL_TEMPS } from '../../data/fallback';

type Metric = 'temperature' | 'rainfall';

export function HistoricalChart() {
  const [metric, setMetric] = useState<Metric>('temperature');

  const data = FALLBACK_HISTORICAL_TEMPS;

  return (
    <div className="bg-white rounded-card shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-navy">5-Year Historical Trend</h3>
          <p className="text-xs text-gray-400 mt-0.5">Source: NASA POWER (2020–2024)</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMetric('temperature')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              metric === 'temperature'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🌡️ Temperature
          </button>
          <button
            onClick={() => setMetric('rainfall')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              metric === 'rainfall'
                ? 'bg-secondary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🌧️ Rainfall
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        {metric === 'temperature' ? (
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis unit="°C" tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => [`${v}°C`]} />
            <Legend />
            <Line type="monotone" dataKey="max" stroke="#ef4444" strokeWidth={2} name="Max Temp" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="avg" stroke="#f59e0b" strokeWidth={2} name="Avg Temp" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="min" stroke="#3b82f6" strokeWidth={2} name="Min Temp" dot={{ r: 4 }} />
          </LineChart>
        ) : (
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis unit="mm" tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => [`${v}mm`]} />
            <Legend />
            <Line type="monotone" dataKey="precip" stroke="#2563A8" strokeWidth={2} name="Annual Rainfall" dot={{ r: 4 }} />
          </LineChart>
        )}
      </ResponsiveContainer>

      <div className="mt-3 text-xs text-gray-400 text-center">
        ⚠️ Warming trend: +0.55°C/yr · Rainfall decreasing ~27mm/yr · Data: NASA POWER
      </div>
    </div>
  );
}
