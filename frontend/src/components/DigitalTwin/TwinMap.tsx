// src/components/DigitalTwin/TwinMap.tsx
// Leaflet map showing Pune with boundary and color-coded risk overlay

import { useEffect, useRef } from 'react';
import { API_BASE } from '../../lib/api';
import type { RiskScores } from '../../types';

interface TwinMapProps {
  readonly riskScores: RiskScores | null;
}

function getRiskColor(level: 'Low' | 'Medium' | 'High' | undefined): string {
  switch (level) {
    case 'Low': return '#16a34a';
    case 'High': return '#dc2626';
    default: return '#d97706'; // Medium
  }
}

export function TwinMap({ riskScores }: TwinMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [18.5204, 73.8567],
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Pune marker
      const riskColor = getRiskColor(riskScores?.risk_level);
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background:${riskColor};
          width:24px;height:24px;
          border-radius:50%;
          border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([18.5204, 73.8567], { icon })
        .addTo(map)
        .bindPopup(`
          <b>📍 Pune, Maharashtra</b><br/>
          Overall Risk: <b>${Math.round(riskScores?.overall_risk ?? 0)}/100</b><br/>
          Level: <b style="color:${riskColor}">${riskScores?.risk_level ?? 'N/A'}</b>
        `)
        .openPopup();

      // Fetch boundary from API and draw it
      fetch(`${API_BASE}/api/location/boundary`)
        .then((r) => r.json())
        .then((res) => {
          if (res.data?.geojson) {
            L.geoJSON(res.data.geojson, {
              style: {
                color: riskColor,
                weight: 2.5,
                fillColor: riskColor,
                fillOpacity: 0.08,
                dashArray: '5, 5',
              },
            }).addTo(map);
          }
        })
        .catch(() => {
          // Draw a fallback approximate Pune circle
          L.circle([18.5204, 73.8567], {
            radius: 15000,
            color: riskColor,
            fillColor: riskColor,
            fillOpacity: 0.08,
            weight: 2,
            dashArray: '5, 5',
          }).addTo(map);
        });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const riskColor = getRiskColor(riskScores?.risk_level);

  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-navy">🗺️ Climate Digital Twin</h3>
          <p className="text-xs text-gray-400">Pune boundary · Risk overlay · Live data</p>
        </div>
        <div
          className="px-3 py-1 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: riskColor }}
        >
          {riskScores?.risk_level ?? '…'} Risk
        </div>
      </div>
      <div ref={mapRef} style={{ height: '320px', width: '100%' }} />
      <div className="px-5 py-2 bg-gray-50 text-xs text-gray-400 flex items-center gap-2">
        <span>●</span>
        <span>Boundary: OpenStreetMap Nominatim · Tiles: © OpenStreetMap contributors</span>
      </div>
    </div>
  );
}
