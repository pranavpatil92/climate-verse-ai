// src/components/Dashboard/DataSourcesBadge.tsx
import { DATA_SOURCES } from '../../data/fallback';

export function DataSourcesBadge() {
  return (
    <div className="bg-navy rounded-card p-4">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        🔗 Multi-Source Climate Intelligence
      </div>
      <div className="flex flex-wrap gap-3">
        {DATA_SOURCES.map((src) => (
          <div
            key={src.name}
            className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 text-white text-xs font-medium"
          >
            <span>{src.icon}</span>
            <span className="font-semibold">{src.name}</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-300">{src.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Combining weather, air quality, historical, and geospatial data for Pune
      </div>
    </div>
  );
}
