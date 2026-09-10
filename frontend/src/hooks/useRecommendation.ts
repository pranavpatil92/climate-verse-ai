// src/hooks/useRecommendation.ts
import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';
import type { Recommendation } from '../types';
import { FALLBACK_RECOMMENDATION } from '../data/fallback';

export function useRecommendation(locationId?: string) {
  const [data, setData] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = locationId ? `?location_id=${locationId}` : '';
      const res = await apiFetch(`/api/ai/recommendation${params}`);
      const json = await res.json();
      if (json.success) {
        setData({
          explanation: json.explanation,
          reasoning_factors: json.reasoning_factors,
          recommended_action: json.recommended_action,
          risk_level: json.risk_level,
        });
      } else throw new Error(json.error);
    } catch (err) {
      console.warn('Recommendation fetch failed, using fallback:', err);
      setData(FALLBACK_RECOMMENDATION);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendation');
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  return { data, loading, error, fetchRecommendation };
}
