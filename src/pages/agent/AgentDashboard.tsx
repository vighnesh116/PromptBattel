import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Clock,
  Car,
  Bell,
  ShieldCheck,
  AlertCircle,
  History,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { DEMO_AGENTS, DEMO_VEHICLES, DEMO_LOCATION } from '../../lib/demoData';
import { calculateDistance, getVehicleTypeLabel, getVehicleIcon } from '../../lib/utils';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getDemoTransportRequests } from '../../lib/demoTransportRequests';
import type { TransportRequest } from '../../types';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { agentProfile } = useAuth();
  const { location, requestLocation } = useLocation();

  const [available, setAvailable] = useState<boolean>(true);
  const [sharingLocation, setSharingLocation] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  const [nearbyRequestCount, setNearbyRequestCount] = useState(0);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  const agent = agentProfile || DEMO_AGENTS[0];
  const vehicle = agentProfile?.vehicles?.[0] || DEMO_VEHICLES[0];
  const requestLatitude = location?.latitude ?? agentProfile?.vehicles?.[0]?.latitude ?? (isSupabaseConfigured() ? null : DEMO_LOCATION.latitude);
  const requestLongitude = location?.longitude ?? agentProfile?.vehicles?.[0]?.longitude ?? (isSupabaseConfigured() ? null : DEMO_LOCATION.longitude);

  useEffect(() => {
    let active = true;
    const loadNearbyRequests = async () => {
      try {
        let openRequests: TransportRequest[];
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('transport_requests')
            .select('id, pickup_latitude, pickup_longitude, request_radius_km')
            .eq('status', 'pending')
            .is('agent_id', null)
            .limit(100);
          if (error) throw error;
          openRequests = (data || []) as TransportRequest[];
        } else {
          openRequests = getDemoTransportRequests().filter((request) => request.status === 'pending');
        }

        const nearbyCount = openRequests.filter((request) =>
          requestLatitude === null || requestLongitude === null ||
          calculateDistance(requestLatitude, requestLongitude, request.pickup_latitude, request.pickup_longitude) <=
            (request.request_radius_km ?? 10)
        ).length;
        if (active) {
          setNearbyRequestCount(nearbyCount);
          setRequestsError(null);
        }
      } catch (error) {
        if (active) {
          setRequestsError(error instanceof Error ? error.message : 'Unable to load incoming requests.');
        }
      }
    };

    void loadNearbyRequests();
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel(`dashboard-open-requests-${agent.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transport_requests' }, () => {
          void loadNearbyRequests();
        })
        .subscribe();
      return () => {
        active = false;
        void supabase.removeChannel(channel);
      };
    }

    const refresh = () => void loadNearbyRequests();
    const intervalId = window.setInterval(refresh, 5000);
    window.addEventListener('demo-transport-requests-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('demo-transport-requests-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [agent.id, requestLatitude, requestLongitude]);

  const handleToggleAvailability = async (checked: boolean) => {
    setAvailable(checked);
    setUpdating(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase
          .from('vehicles')
          .update({
            availability_status: checked ? 'available' : 'unavailable',
            updated_at: new Date().toISOString(),
          })
          .eq('agent_id', agent.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 px-4 space-y-6">
      {/* Header Profile Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-2xl font-bold shadow-inner">
            {agent.full_name?.charAt(0) || 'R'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900">{agent.full_name}</h1>
              <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600 text-xs">
                <ShieldCheck className="h-3 w-3 mr-1" /> {agent.verification_status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('Service Route')}: <strong>{agent.service_area}</strong>
            </p>
          </div>
        </div>

        {/* Availability Switch */}
        <div className="flex items-center space-x-3 bg-slate-50 border p-3 rounded-xl">
          <div className="text-right">
            <span className="text-xs font-semibold block text-gray-500 uppercase">{t('Status')}</span>
            <span
              className={`text-sm font-bold ${
                available ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {available ? t('Available for Rides') : t('Unavailable')}
            </span>
          </div>
          <Switch
            checked={available}
            onCheckedChange={handleToggleAvailability}
            disabled={updating}
          />
        </div>
      </div>

      {/* Live GPS & Location Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-blue-600" /> {t('Live GPS Location Broadcasting')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('Students nearby only see your vehicle when availability and location sharing are active')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg border text-xs flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-700">{t('Current Position')}</p>
                <p className="font-mono text-muted-foreground">
                  {location
                    ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                    : `${DEMO_LOCATION.latitude.toFixed(5)}, ${DEMO_LOCATION.longitude.toFixed(5)} (${t('Ratnagiri Center')})`}
                </p>
              </div>
              <Badge variant="outline" className="bg-white">
                <Clock className="h-3 w-3 mr-1 text-emerald-600" /> {t('Updated 2m ago')}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => requestLocation()}>
                {t('Refresh GPS Coordinates')}
              </Button>
              <Button
                size="sm"
                variant={sharingLocation ? 'secondary' : 'default'}
                onClick={() => setSharingLocation(!sharingLocation)}
              >
                {sharingLocation ? t('Stop Location Sharing') : t('Start Location Sharing')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Vehicle Mini Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Car className="h-4 w-4 mr-2 text-indigo-600" /> Vehicle
            </CardTitle>
            <CardDescription className="text-xs">{t('Registered transport vehicle')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">{t('Type')}</span>
              <span className="font-semibold">
                {getVehicleIcon(vehicle.vehicle_type)} {getVehicleTypeLabel(vehicle.vehicle_type)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">{t('Plate No.')}</span>
              <span className="font-mono font-bold text-xs">{vehicle.registration_number}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 text-xs"
              onClick={() => navigate('/agent/vehicle')}
            >
              {t('Manage Vehicle Details')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Incoming Requests Banner */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-amber-500" /> {t('Nearby Student Requests')}
        </h3>

        {requestsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{requestsError}</AlertDescription>
          </Alert>
        )}
        <Card className="border-amber-200 bg-amber-50/30 shadow-sm">
          <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold text-gray-900">
                {nearbyRequestCount} {t(nearbyRequestCount === 1 ? 'open request' : 'open requests')} {t('in your area')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('Requests near the same pickup are grouped in your inbox. The first agent to accept claims the trip.')}
              </p>
            </div>
            <Button onClick={() => navigate('/agent/requests')} className="shrink-0">
              {t('View requests')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
        <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/agent/requests')}>
          <Bell className="h-5 w-5 mb-1 text-blue-600" />
          <span className="text-xs font-semibold">{t('Active Requests')}</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/agent/vehicle')}>
          <Truck className="h-5 w-5 mb-1 text-indigo-600" />
          <span className="text-xs font-semibold">{t('Vehicle Settings')}</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/agent/location')}>
          <MapPin className="h-5 w-5 mb-1 text-emerald-600" />
          <span className="text-xs font-semibold">{t('GPS Sharing')}</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/agent/history')}>
          <History className="h-5 w-5 mb-1 text-gray-600" />
          <span className="text-xs font-semibold">{t('Ride History')}</span>
        </Button>
      </div>
    </div>
  );
}
