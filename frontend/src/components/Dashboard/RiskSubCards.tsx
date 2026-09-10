// src/components/Dashboard/RiskSubCards.tsx
import type { RiskScores } from '../../types';

interface RiskSubCardsProps {
  readonly scores: RiskScores | null;
  readonly loading: boolean;
}

const RISK_CARDS = [
  { key: 'heat_risk', label: 'Heat', icon: '🌡️', description: 'Temperature stress', color: '#ef4444' },
  { key: 'flood_risk', label: 'Flood', icon: '🌊', description: 'Precipitation level', color: '#3b82f6' },
  { key: 'air_quality_risk', label: 'Air Quality', icon: '💨', description: 'AQI index', color: '#8b5cf6' },
  { key: 'drought_risk', label: 'Drought', icon: '🏜️', description: 'Rainfall deficit', color: '#f59e0b' },
] as const;

function getLevel(value: number): string {
  if (value < 33) return 'Low';
  if (value < 66) return 'Med';
  return 'High';
}

function getLevelColor(value: number): string {
  if (value < 33) return 'text-risk-low';
  if (value < 66) return 'text-risk-medium';
  return 'text-risk-high';
}

export function RiskSubCards({ scores, loading }: RiskSubCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {RISK_CARDS.map((card) => {
        const value = scores ? (scores[card.key] as number) : 0;
        return (
          <div
            key={card.key}
            className="bg-white rounded-card shadow-card p-4 flex flex-col items-center gap-2 hover:shadow-card-hover transition-shadow"
          >
            {loading ? (
              <div className="w-full space-y-2">
                <div className="h-8 bg-gray-100 animate-pulse rounded" />
                <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4 mx-auto" />
              </div>
            ) : (
              <>
                <span className="text-3xl">{card.icon}</span>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: card.color }}>
                    {Math.round(value)}
                  </div>
                  <div className={`text-xs font-semibold ${getLevelColor(value)}`}>
                    {getLevel(value)}
                  </div>
                </div>
                <div className="text-sm font-medium text-navy">{card.label}</div>
                <div className="text-xs text-gray-400">{card.description}</div>
                {/* Mini progress bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${value}%`, backgroundColor: card.color }}
                  />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
