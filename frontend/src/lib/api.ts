// src/lib/api.ts — Central API base URL configuration
// In production (Vercel), calls go to the deployed backend.
// In development, Vite proxy forwards /api → localhost:3000.

const PROD_API = 'https://climateverse-ai-backend.vercel.app';

export const API_BASE =
  import.meta.env.MODE === 'production' ? PROD_API : '';

export async function apiFetch(path: string, options?: RequestInit) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });
  return res;
}
