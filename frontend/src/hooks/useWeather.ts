// src/hooks/useWeather.ts
import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import type { WeatherData } from '../types';
import { FALLBACK_WEATHER } from '../data/fallback';

export function useWeather(locationId?: string) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const params = locationId ? `?location_id=${locationId}` : '';
        const res = await apiFetch(`/api/weather/current${params}`);
        const json = await res.json();
        if (json.success) setData(json.data as WeatherData);
        else throw new Error(json.error);
      } catch (err) {
        console.warn('Weather fetch failed, using fallback:', err);
        setData(FALLBACK_WEATHER as WeatherData);
        setError(err instanceof Error ? err.message : 'Failed to fetch weather');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [locationId]);

  return { data, loading, error };
}
