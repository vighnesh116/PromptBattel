import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import type { GPSLocation } from '../../types/index';
import { DEMO_LOCATION } from '../../lib/demoData';

interface LocationDeniedProps {
  onLocationSelected: (loc: GPSLocation) => void;
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const LocationDenied: React.FC<LocationDeniedProps> = ({ onLocationSelected }) => {
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
  };

  const handleUseLocation = () => {
    if (!selectedCoords) return;
    onLocationSelected({
      latitude: selectedCoords.lat,
      longitude: selectedCoords.lng,
      accuracy: 500,
      timestamp: Date.now(),
      isManual: true,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-orange-200 shadow-sm p-5">
      {/* Warning Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-yellow-100 rounded-full p-2 flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-base">Location Access Denied</h3>
          <p className="text-sm text-gray-600 mt-1">
            GPS access is required to find nearby transport agents. You can manually select your
            approximate location on the map below.
          </p>
        </div>
      </div>

      {/* Manual location label */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-3 text-xs text-yellow-800 font-medium">
        📍 Manually Selected Location (Not Live GPS)
        {selectedCoords && (
          <span className="ml-2 text-gray-600 font-normal">
            ({selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)})
          </span>
        )}
      </div>

      {/* Leaflet Map */}
      <div className="rounded-xl overflow-hidden border border-gray-200 mb-4" style={{ height: 300 }}>
        <MapContainer
          center={[DEMO_LOCATION.latitude, DEMO_LOCATION.longitude]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <ClickHandler onMapClick={handleMapClick} />
        </MapContainer>
      </div>

      <p className="text-xs text-gray-500 mb-3 text-center">Tap on the map to drop a pin at your approximate location.</p>

      <button
        onClick={handleUseLocation}
        disabled={!selectedCoords}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
      >
        Use This Location
      </button>
    </div>
  );
};

export default LocationDenied;
