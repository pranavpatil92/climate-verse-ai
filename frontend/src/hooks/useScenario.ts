// src/hooks/useScenario.ts
import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';
import type { ScenarioResult } from '../types';
import { FALLBACK_SCENARIO } from '../data/fallback';

export interface ScenarioInputs {
  rainfall_change_pct: number;
  temp_change_c: number;
  green_cover_change_pct: number;
}

export function useScenario(locationId?: string) {
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = useCallback(async (inputs: ScenarioInputs) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/scenario/simulate', {
        method: 'POST',
        body: JSON.stringify({
          ...inputs,
          location_id: locationId,
          scenario_name: `Custom Scenario (Δtemp ${inputs.temp_change_c > 0 ? '+' : ''}${inputs.temp_change_c}°C)`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setResult({
          scenario_name: json.scenario_name,
          input_changes: json.input_changes,
          baseline: json.baseline,
          simulated: json.simulated,
          delta: json.delta,
        });
      } else throw new Error(json.error);
    } catch (err) {
      console.warn('Scenario simulation failed, using fallback:', err);
      setResult({ ...FALLBACK_SCENARIO, input_changes: inputs });
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  return { result, loading, error, runSimulation };
}
