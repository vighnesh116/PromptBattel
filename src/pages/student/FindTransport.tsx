import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  Car,
  Bus,
  Clock,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useLocation } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { DEMO_AGENTS, DEMO_VEHICLES, DEMO_LOCATION } from '../../lib/demoData';
import { calculateDistance } from '../../lib/utils';
import AgentMap from '../../components/map/AgentMap';
import AgentCard from '../../components/transport/AgentCard';
import LocationDenied from '../../components/transport/LocationDenied';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getDemoTransportRequests, saveDemoTransportRequests } from '../../lib/demoTransportRequests';
import type { NearbyAgent, TransportRequest, Vehicle } from '../../types';

export default function FindTransport() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { location, permissionDenied, setManualLocation } = useLocation();
  const { studentProfile } = useAuth();

  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [agents, setAgents] = useState<NearbyAgent[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [busPresence, setBusPresence] = useState<'unknown' | 'present' | 'absent'>('unknown');
  const [busLocation, setBusLocation] = useState('');
  const [busEta, setBusEta] = useState('15');
  const [maxWait, setMaxWait] = useState('20');
  const [pickupAddress, setPickupAddress] = useState('');
  const [chooseAlternative, setChooseAlternative] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Search logic
  const searchAgents = async (currentLat: number, currentLon: number, radius: number) => {
    setSearching(true);
    try {
      if (isSupabaseConfigured()) {
        const { data: dbAgents, error: agentError } = await supabase
          .from('transport_agents')
          .select('*, vehicles(*)')
          .eq('verification_status', 'verified');

        if (agentError) throw agentError;

        const results: NearbyAgent[] = [];
        (dbAgents || []).forEach((agentRecord: any) => {
          const vehicle = (agentRecord.vehicles || []).find(
            (v: Vehicle) => v.availability_status === 'available' && v.latitude && v.longitude
          );
          if (vehicle) {
            const dist = calculateDistance(currentLat, currentLon, vehicle.latitude!, vehicle.longitude!);
            if (dist <= radius) {
              results.push({
                agent: agentRecord,
                vehicle,
                distance_km: dist,
              });
            }
          }
        });

        results.sort((a, b) => a.distance_km - b.distance_km);
        setAgents(results);
      } else {
        // Demo Mode calculations
        await new Promise((r) => setTimeout(r, 600));
        const results: NearbyAgent[] = [];

        DEMO_AGENTS.filter((a) => a.verification_status === 'verified').forEach((agent) => {
          const vehicle = DEMO_VEHICLES.find(
            (v) => v.agent_id === agent.id && v.availability_status === 'available' && v.latitude && v.longitude
          );
          if (vehicle) {
            const dist = calculateDistance(currentLat, currentLon, vehicle.latitude!, vehicle.longitude!);
            if (dist <= radius) {
              results.push({
                agent,
                vehicle,
                distance_km: dist,
              });
            }
          }
        });

        results.sort((a, b) => a.distance_km - b.distance_km);
        setAgents(results);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const lat = location?.latitude || DEMO_LOCATION.latitude;
    const lon = location?.longitude || DEMO_LOCATION.longitude;
    searchAgents(lat, lon, radiusKm);
  }, [location, radiusKm]);

  const etaMinutes = Number(busEta);
  const maxWaitMinutes = Number(maxWait);
  const busWaitExceedsLimit =
    busPresence === 'present' &&
    Number.isFinite(etaMinutes) &&
    Number.isFinite(maxWaitMinutes) &&
    etaMinutes > maxWaitMinutes;
  const showAlternatives =
    chooseAlternative || busPresence === 'absent' || busWaitExceedsLimit;

  const handleRequest = async () => {
    setSubmittingRequest(true);
    setRequestError(null);
    if (
      busPresence === 'present' &&
      (!busLocation.trim() ||
        !Number.isInteger(etaMinutes) ||
        !Number.isInteger(maxWaitMinutes) ||
        etaMinutes < 0 ||
        etaMinutes > 180 ||
        maxWaitMinutes < 0 ||
        maxWaitMinutes > 180)
    ) {
      setRequestError(t('Enter the bus’s last known location, a valid ETA, and a maximum wait between 0 and 180 minutes.'));
      setSubmittingRequest(false);
      return;
    }
    const pickupLat = location?.latitude || DEMO_LOCATION.latitude;
    const pickupLon = location?.longitude || DEMO_LOCATION.longitude;

    try {
      if (isSupabaseConfigured()) {
        if (!studentProfile) {
          throw new Error(t('Your student profile is not available. Please sign in again before requesting transport.'));
        }
        const { data, error } = await supabase
          .from('transport_requests')
          .insert({
            student_id: studentProfile.id,
            agent_id: null,
            pickup_latitude: pickupLat,
            pickup_longitude: pickupLon,
            pickup_address: pickupAddress.trim() || 'Student current location',
            request_radius_km: radiusKm,
            bus_presence: busPresence === 'unknown' ? null : busPresence,
            bus_location: busLocation.trim() || null,
            bus_eta_minutes: busPresence === 'present' && busEta !== '' ? etaMinutes : null,
            max_wait_minutes: busPresence === 'present' && maxWait !== '' ? maxWaitMinutes : null,
            status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;
        navigate(`/student/request/${data.id}`);
      } else {
        const requestId = `demo-${Date.now()}`;
        const now = new Date().toISOString();
        const request: TransportRequest = {
          id: requestId,
          student_id: studentProfile?.id || 'demo-student-1',
          agent_id: null,
          pickup_latitude: pickupLat,
          pickup_longitude: pickupLon,
          pickup_address: pickupAddress.trim() || 'Student current location',
          request_radius_km: radiusKm,
          bus_presence: busPresence === 'unknown' ? null : busPresence,
          bus_location: busLocation.trim() || null,
          bus_eta_minutes: busPresence === 'present' && busEta !== '' ? etaMinutes : null,
          max_wait_minutes: busPresence === 'present' && maxWait !== '' ? maxWaitMinutes : null,
          status: 'pending',
          created_at: now,
          updated_at: now,
        };
        saveDemoTransportRequests([request, ...getDemoTransportRequests()]);
        navigate(`/student/request/${requestId}`);
      }
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : t('Failed to create transport request.'));
    } finally {
      setSubmittingRequest(false);
    }
  };

  const currentCoords = location
    ? { lat: location.latitude, lon: location.longitude }
    : { lat: DEMO_LOCATION.latitude, lon: DEMO_LOCATION.longitude };

  return (
    <div className="container max-w-5xl py-8 px-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Button
            variant="ghost"
            className="pl-0 mb-1 hover:bg-transparent"
            onClick={() => navigate('/student/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> {t('Back to Dashboard')}
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {t('Find Alternative Transport')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('Search nearby verified transport agents within your area')}
          </p>
        </div>

        {/* Radius & Refresh Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 border rounded-lg p-1 bg-white shadow-sm">
            {[2, 5, 10, 15, 20].map((r) => (
              <Button
                key={r}
                size="sm"
                variant={radiusKm === r ? 'default' : 'ghost'}
                className="h-8 px-3 text-xs"
                onClick={() => setRadiusKm(r)}
              >
                {r} km
              </Button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => searchAgents(currentCoords.lat, currentCoords.lon, radiusKm)}
            disabled={searching}
          >
            <RefreshCw className={`h-4 w-4 ${searching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* GPS Status Banner */}
      {permissionDenied && (
        <LocationDenied
          onLocationSelected={setManualLocation}
        />
      )}

      <Card className="mb-6 border-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
          <Bus className="h-5 w-5 text-blue-600" /> {t('Check the bus first')}
          </CardTitle>
          <CardDescription>
            {t("Enter the bus's current status and expected arrival. If it is unavailable or the wait is too long, request alternatives.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium">
              {t('Bus presence')}
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={busPresence}
                onChange={(event) => {
                  setBusPresence(event.target.value as 'unknown' | 'present' | 'absent');
                  setChooseAlternative(false);
                }}
              >
                <option value="unknown">{t('Not checked yet')}</option>
                <option value="present">{t('Bus is on the route')}</option>
                <option value="absent">{t('Bus is not available')}</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              {t('Your pickup location')}
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={pickupAddress}
                onChange={(event) => setPickupAddress(event.target.value)}
                placeholder={t('Stop, landmark, or current location')}
              />
            </label>
            {busPresence === 'present' && (
              <>
                <label className="space-y-1.5 text-sm font-medium">
                  {t('Bus location')}
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={busLocation}
                    onChange={(event) => setBusLocation(event.target.value)}
                    placeholder={t('Last known stop or landmark')}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1.5 text-sm font-medium">
                    {t('Estimated arrival (minutes)')}
                    <input
                      type="number"
                      min="0"
                      max="180"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={busEta}
                      onChange={(event) => setBusEta(event.target.value)}
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    {t('Maximum wait (minutes)')}
                    <input
                      type="number"
                      min="0"
                      max="180"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={maxWait}
                      onChange={(event) => setMaxWait(event.target.value)}
                    />
                  </label>
                </div>
              </>
            )}
          </div>

          {busPresence === 'present' && !busWaitExceedsLimit && (
            <div className="flex flex-col justify-between gap-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 sm:flex-row sm:items-center">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('Bus expected in {eta} minutes{location}', {
                  eta: busEta || '—',
                  location: busLocation.trim() ? ` ${t('from')} ${busLocation.trim()}` : '',
                })}
              </span>
              <Button size="sm" variant="outline" onClick={() => setChooseAlternative(true)}>
                {t('Find alternative instead')}
              </Button>
            </div>
          )}
          {busWaitExceedsLimit && (
            <Alert className="border-amber-200 bg-amber-50">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                {t('The bus ETA exceeds your {minutes}-minute wait limit. Nearby alternatives are shown below.', { minutes: maxWaitMinutes })}
              </AlertDescription>
            </Alert>
          )}
          {busPresence === 'absent' && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription>{t('The bus is marked unavailable. Request an alternative from nearby agents below.')}</AlertDescription>
            </Alert>
          )}
          {requestError && (
            <Alert variant="destructive">
              <AlertDescription>{requestError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* View Switcher and Count */}
      {showAlternatives && <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-gray-600">
          {searching ? (
            <span>{t('Searching area...')}</span>
          ) : (
            <span>
              {t('Found {count} available verified agent{plural} within {radius} km', {
                count: agents.length,
                plural: agents.length === 1 ? '' : 's',
                radius: radiusKm,
              })}
            </span>
          )}
        </div>

        <div className="inline-flex rounded-lg border bg-white p-1 shadow-sm">
          <Button
            size="sm"
            variant={activeTab === 'list' ? 'default' : 'ghost'}
            className="h-8 text-xs"
            onClick={() => setActiveTab('list')}
          >
            {t('List View')}
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'map' ? 'default' : 'ghost'}
            className="h-8 text-xs"
            onClick={() => setActiveTab('map')}
          >
            {t('Map View')}
          </Button>
        </div>
      </div>}

      {/* Main Content Area */}
      {!showAlternatives ? (
        <Card className="border-dashed text-center">
          <CardContent className="space-y-3 py-8">
            <p className="font-medium text-gray-800">{t('Choose the bus status to see whether you need an alternative.')}</p>
            {busPresence === 'unknown' && (
              <Button variant="outline" onClick={() => setBusPresence('absent')}>
                {t('Bus is not available')} — {t('find alternatives')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : agents.length === 0 && !searching ? (
        /* Empty State: Step 4 of PRD */
        <Card className="text-center py-12 px-6 border-dashed">
          <CardContent className="space-y-5 max-w-md mx-auto">
            <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Car className="h-8 w-8 text-gray-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">{t('No Nearby Agents Online')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('No available registered vehicle was found within {radius} km. You can still notify verified agents in this radius.', { radius: radiusKm })}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              {radiusKm < 20 && (
                <Button
                  variant="outline"
                  onClick={() => setRadiusKm(Math.min(radiusKm + 5, 20))}
                >
                  {t('Expand Search Radius to {radius} km', { radius: Math.min(radiusKm + 5, 20) })}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => searchAgents(currentCoords.lat, currentCoords.lon, radiusKm)}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> {t('Search Again')}
              </Button>

              <div className="pt-4 border-t mt-2">
                <Button
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700 py-6 text-base font-semibold shadow-md"
                  onClick={() => navigate('/student/emergency')}
                >
                  <AlertTriangle className="h-5 w-5 mr-2 animate-bounce" />
                  {t('Activate Emergency Alert')}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('Emergency Alert will immediately share your GPS location with your parent and college authorities.')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : activeTab === 'map' ? (
        /* Map View */
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm h-[500px]">
          <AgentMap
            center={[currentCoords.lat, currentCoords.lon]}
            zoom={13}
            studentLocation={
              location || {
                latitude: DEMO_LOCATION.latitude,
                longitude: DEMO_LOCATION.longitude,
                accuracy: 15,
                timestamp: Date.now(),
              }
            }
            agents={agents}
          />
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((item) => (
            <AgentCard
              key={item.agent.id}
              agent={item.agent}
              vehicle={item.vehicle}
              distance={item.distance_km}
            />
          ))}
        </div>
      )}
      {showAlternatives && (
        <Card className="mt-5 border-blue-200 bg-blue-50/50">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-5 text-center sm:flex-row sm:text-left">
            <div>
              <h2 className="font-semibold text-gray-900">{t("Can't wait for the bus?")}</h2>
              <p className="text-sm text-muted-foreground">
                {t('One request will notify verified agents within {radius} km. The first agent to accept gets your trip.', { radius: radiusKm })}
              </p>
            </div>
            <Button onClick={handleRequest} disabled={submittingRequest} className="shrink-0">
              {submittingRequest ? t('Notifying agents...') : t('Notify nearby agents')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
