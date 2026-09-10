// src/components/Recommendation/RecommendationPanel.tsx
// Explainable AI card + Recommended Action card

import { useEffect } from 'react';
import type { ReasoningFactor } from '../../types';
import { useRecommendation } from '../../hooks/useRecommendation';

const contributionColors = {
  high: 'bg-red-100 text-red-700 border border-red-200',
  medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  low: 'bg-green-100 text-green-700 border border-green-200',
};

const riskIcons: Record<string, string> = {
  Low: '✅',
  Medium: '⚠️',
  High: '🚨',
};

interface FactorTagProps {
  readonly factor: ReasoningFactor;
}

function FactorTag({ factor }: FactorTagProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
      <div className="flex-1">
        <span className="text-sm font-medium text-navy">{factor.factor}</span>
        <span className="ml-2 text-sm text-gray-500">{factor.value}</span>
      </div>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${contributionColors[factor.contribution]}`}>
        {factor.contribution}
      </span>
    </div>
  );
}

export function RecommendationPanel() {
  const { data, loading, error, fetchRecommendation } = useRecommendation();

  useEffect(() => {
    fetchRecommendation();
  }, [fetchRecommendation]);

  return (
    <div className="space-y-4">
      {/* Explainable AI card */}
      <div className="bg-white rounded-card shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🧠</span>
          <div>
            <h3 className="text-lg font-semibold text-navy">Why This Score?</h3>
            <p className="text-xs text-gray-400">Explainable AI — powered by Gemini 1.5 Flash</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 animate-pulse rounded w-full" />
            <div className="h-4 bg-gray-100 animate-pulse rounded w-5/6" />
            <div className="h-4 bg-gray-100 animate-pulse rounded w-4/6" />
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {data?.explanation ?? 'Loading AI analysis…'}
            </p>

            {data?.reasoning_factors && (
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Contributing Factors
                </div>
                <div className="space-y-2">
                  {data.reasoning_factors.map((f, i) => (
                    <FactorTag key={i} factor={f} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recommended Action card */}
      <div className={`rounded-card p-6 border-2 ${
        data?.risk_level === 'High' ? 'bg-red-50 border-red-200' :
        data?.risk_level === 'Low' ? 'bg-green-50 border-green-200' :
        'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{riskIcons[data?.risk_level ?? 'Medium']}</span>
          <div>
            <h3 className="text-lg font-semibold text-navy">Recommended Action</h3>
            <p className="text-xs text-gray-500">AI Decision Recommendation (Feature 5)</p>
          </div>
        </div>

        {loading ? (
          <div className="h-16 bg-white/60 animate-pulse rounded-lg" />
        ) : (
          <p className="text-sm font-medium text-navy leading-relaxed">
            {data?.recommended_action ?? 'Fetching recommendation…'}
          </p>
        )}

        <button
          onClick={fetchRecommendation}
          disabled={loading}
          className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline disabled:opacity-50"
        >
          {loading ? 'Analyzing…' : '↻ Refresh recommendation'}
        </button>

        {error && (
          <p className="mt-2 text-xs text-amber-600">⚠️ Using fallback — {error}</p>
        )}
      </div>
    </div>
  );
}
