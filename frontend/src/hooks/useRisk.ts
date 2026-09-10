// src/hooks/useRisk.ts
import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import type { RiskScores } from '../types';
import { FALLBACK_RISK_SCORES } from '../data/fallback';

export function useRisk(locationId?: string) {
  const [data, setData] = useState<RiskScores | null>(null);
  const [riskScoreId, setRiskScoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRisk = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = locationId ? `?location_id=${locationId}` : '';
      const res = await apiFetch(`/api/risk/score${params}`);
      const json = await res.json();
      if (json.success) {
        const { heat_risk, flood_risk, air_quality_risk, drought_risk, overall_risk, risk_level } = json;
        setData({ heat_risk, flood_risk, air_quality_risk, drought_risk, overall_risk, risk_level });
        setRiskScoreId(json.risk_score_id ?? null);
      } else throw new Error(json.error);
    } catch (err) {
      console.warn('Risk fetch failed, using fallback:', err);
      setData(FALLBACK_RISK_SCORES);
      setError(err instanceof Error ? err.message : 'Failed to fetch risk score');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRisk(); }, [locationId]);

  return { data, riskScoreId, loading, error, refetch: fetchRisk };
}
