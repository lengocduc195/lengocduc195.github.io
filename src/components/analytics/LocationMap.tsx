'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface LocationMapProps {
  latitude: number;
  longitude: number;
  popupContent?: string;
  height?: string;
}

const LocationMap = ({ latitude, longitude, popupContent, height = '400px' }: LocationMapProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [icon, setIcon] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);

    // Fix for Leaflet's default icon
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });

      setIcon(new L.Icon.Default());
    });
  }, []);

  if (!isMounted) {
    return (
      <div 
        style={{ 
          height, 
          width: '100%', 
          backgroundColor: '#f0f0f0', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}
      >
        Loading map...
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {icon && (
          <Marker position={[latitude, longitude]} icon={icon}>
            {popupContent && <Popup>{popupContent}</Popup>}
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LocationMap;
