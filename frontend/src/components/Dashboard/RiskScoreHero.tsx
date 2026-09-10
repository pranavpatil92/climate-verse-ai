// src/components/Dashboard/RiskScoreHero.tsx
import type { RiskScores } from '../../types';

interface RiskScoreHeroProps {
  readonly scores: RiskScores | null;
  readonly loading: boolean;
}

const riskColors = {
  Low: 'text-risk-low bg-green-50 border-green-200',
  Medium: 'text-risk-medium bg-amber-50 border-amber-200',
  High: 'text-risk-high bg-red-50 border-red-200',
};

const riskRingColors = {
  Low: '#16a34a',
  Medium: '#d97706',
  High: '#dc2626',
};

export function RiskScoreHero({ scores, loading }: RiskScoreHeroProps) {
  const riskLevel = scores?.risk_level ?? 'Medium';
  const overallRisk = scores?.overall_risk ?? 0;
  const ringColor = riskRingColors[riskLevel];

  // SVG ring
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (overallRisk / 100) * circumference;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-48 h-48 rounded-full bg-gray-100 animate-pulse" />
        <div className="mt-4 h-8 w-32 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8">
      {/* Circular score ring */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 168 168">
          <circle cx="84" cy="84" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle
            cx="84" cy="84" r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-navy" style={{ color: ringColor }}>
            {Math.round(overallRisk)}
          </span>
          <span className="text-sm text-gray-500 font-medium">/100</span>
        </div>
      </div>

      {/* Risk level badge */}
      <div className={`mt-4 px-6 py-2 rounded-full border-2 font-semibold text-lg ${riskColors[riskLevel]}`}>
        {riskLevel} Risk
      </div>

      <p className="mt-3 text-gray-500 text-sm text-center max-w-xs">
        Overall Climate Risk Score for Pune, Maharashtra
      </p>
    </div>
  );
}
