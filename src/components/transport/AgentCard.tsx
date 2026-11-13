import React from 'react';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import type { TransportAgent, Vehicle } from '../../types/index';
import {
  formatDistance,
  formatRelativeTime,
  getVehicleIcon,
  getVehicleTypeLabel,
  isLocationRecent,
} from '../../lib/utils';

interface AgentCardProps {
  agent: TransportAgent;
  vehicle: Vehicle;
  distance: number;
  isDemo?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  vehicle,
  distance,
  isDemo = false,
}) => {
  const locationRecent = isLocationRecent(vehicle.location_updated_at);
  const lastUpdate = formatRelativeTime(vehicle.location_updated_at);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-base truncate">
              {agent.full_name}
            </h3>
            {agent.verification_status === 'verified' && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            )}
            {isDemo && (
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                DEMO DATA
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{agent.service_area}</p>
        </div>
        {/* Distance Badge */}
        <span className="ml-3 inline-flex items-center bg-green-50 text-green-700 text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0">
          {formatDistance(distance)} away
        </span>
      </div>

      {/* Vehicle Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{getVehicleIcon(vehicle.vehicle_type)}</span>
          <div>
            <span className="font-medium text-gray-800 text-sm">
              {getVehicleTypeLabel(vehicle.vehicle_type)}
            </span>
            <span className="text-gray-400 mx-2 text-xs">•</span>
            <span className="text-gray-600 text-sm font-mono">{vehicle.registration_number}</span>
          </div>
        </div>
        {vehicle.vehicle_description && (
          <p className="text-xs text-gray-500 mt-1">{vehicle.vehicle_description}</p>
        )}
      </div>

      {/* Location Update Time */}
      <div className="flex items-center gap-1.5 mb-3">
        <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-500">Location updated {lastUpdate}</span>
      </div>

      {/* Outdated Location Warning */}
      {!locationRecent && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          <span className="text-xs text-yellow-700 font-medium">
            ⚠️ Location may be outdated
          </span>
        </div>
      )}

    </div>
  );
};

export default AgentCard;
