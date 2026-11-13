import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default Leaflet icon for Vite/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, shadowUrl: iconShadow });

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import type { NearbyAgent, GPSLocation } from '../../types/index';
import { formatDistance, getVehicleIcon, getVehicleTypeLabel } from '../../lib/utils';

// Custom icons
const studentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const agentAvailableIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const agentUnavailableIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapClickHandlerProps {
  onMapClick?: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

interface AgentMapProps {
  center: [number, number];
  zoom?: number;
  studentLocation: GPSLocation | null;
  agents: NearbyAgent[];
  onMapClick?: (lat: number, lng: number) => void;
  style?: React.CSSProperties;
  className?: string;
}

const AgentMap: React.FC<AgentMapProps> = ({
  center,
  zoom = 13,
  studentLocation,
  agents,
  onMapClick,
  style,
  className,
}) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={style ?? { height: '400px', width: '100%' }}
      className={className}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

      {/* Student location marker */}
      {studentLocation && (
        <Marker
          position={[studentLocation.latitude, studentLocation.longitude]}
          icon={studentIcon}
        >
          <Popup>
            <div className="text-sm font-semibold text-blue-700">
              📍 Your Location
              {studentLocation.isManual && (
                <span className="block text-xs text-yellow-600 font-normal mt-1">
                  Manually Selected (Not Live GPS)
                </span>
              )}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Agent markers */}
      {agents.map((nearby) => {
        const { agent, vehicle, distance_km } = nearby;
        if (!vehicle.latitude || !vehicle.longitude) return null;
        const icon =
          vehicle.availability_status === 'available'
            ? agentAvailableIcon
            : agentUnavailableIcon;

        return (
          <Marker
            key={agent.id}
            position={[vehicle.latitude, vehicle.longitude]}
            icon={icon}
          >
            <Popup>
              <div className="text-sm min-w-[180px]">
                <div className="font-semibold text-gray-800 flex items-center gap-1">
                  {agent.full_name}
                  {agent.verification_status === 'verified' && (
                    <span className="text-blue-500 text-xs">✔ Verified</span>
                  )}
                </div>
                <div className="text-gray-600 mt-1">
                  {getVehicleIcon(vehicle.vehicle_type)}{' '}
                  {getVehicleTypeLabel(vehicle.vehicle_type)}
                </div>
                <div className="text-gray-500 text-xs">{vehicle.registration_number}</div>
                <div className="mt-1 text-green-600 font-medium text-xs">
                  {formatDistance(distance_km)} away
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default AgentMap;
