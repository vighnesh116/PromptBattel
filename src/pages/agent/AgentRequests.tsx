import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Bus, Clock, MapPin, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { DEMO_AGENTS, DEMO_LOCATION, DEMO_VEHICLES } from '../../lib/demoData';
import { getDemoTransportRequests, updateDemoTransportRequest } from '../../lib/demoTransportRequests';
import { calculateDistance, formatDistance, formatRelativeTime } from '../../lib/utils';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { TransportRequest } from '../../types';

const DEFAULT_REQUEST_RADIUS_KM = 10;

export default function AgentRequests() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { agentProfile } = useAuth();
  const { location, requestLocation, loading: locationLoading } = useLocation();
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const agent = agentProfile || DEMO_AGENTS[0];
  const vehicle = agentProfile?.vehicles?.[0] || (isSupabaseConfigured() ? null : DEMO_VEHICLES[0]);
  const agentLatitude = location?.latitude ?? vehicle?.latitude ?? (isSupabaseConfigured() ? null : DEMO_LOCATION.latitude);
  const agentLongitude = location?.longitude ?? vehicle?.longitude ?? (isSupabaseConfigured() ? null : DEMO_LOCATION.longitude);

  const loadRequests = useCallback(async () => {
    setError(null);
    try {
      if (isSupabaseConfigured()) {
        const { data, error: requestError } = await supabase
          .from('transport_requests')
          .select('*')
          .eq('status', 'pending')
          .is('agent_id', null)
          .order('created_at', { ascending: false })
          .limit(100);

        if (requestError) throw requestError;
        setRequests((data || []) as TransportRequest[]);
      } else {
        setRequests(getDemoTransportRequests().filter((request) => request.status === 'pending'));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('Unable to load open requests.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel(`agent-open-requests-${agent.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transport_requests' }, () => {
          void loadRequests();
        })
        .subscribe();

      return () => {
        void supabase.removeChannel(channel);
      };
    }

    const refresh = () => void loadRequests();
    const intervalId = window.setInterval(refresh, 5000);
    window.addEventListener('demo-transport-requests-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('demo-transport-requests-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [agent.id, loadRequests]);

  const nearbyRequests = useMemo(() => requests
    .map((request) => ({
      request,
      distance: agentLatitude !== null && agentLongitude !== null
        ? calculateDistance(agentLatitude, agentLongitude, request.pickup_latitude, request.pickup_longitude)
        : null,
    }))
    .filter(({ request, distance }) =>
      distance === null || distance <= (request.request_radius_km ?? DEFAULT_REQUEST_RADIUS_KM)
    ), [
    requests,
    agentLatitude,
    agentLongitude,
  ]);

  const handleClaim = async (request: TransportRequest) => {
    if (isSupabaseConfigured() && !agentProfile) {
      setError(t('Your agent profile is not available. Please sign in again.'));
      return;
    }

    setClaimingId(request.id);
    setError(null);
    try {
      if (isSupabaseConfigured()) {
        const { data, error: claimError } = await supabase
          .from('transport_requests')
          .update({
            agent_id: agent.id,
            status: 'accepted',
            updated_at: new Date().toISOString(),
          })
          .eq('id', request.id)
          .eq('status', 'pending')
          .is('agent_id', null)
          .select('id')
          .maybeSingle();

        if (claimError) throw claimError;
        if (!data) {
          setError(t('Another agent has already accepted this request. The list has been refreshed.'));
        }
      } else {
        const claimed = updateDemoTransportRequest(request.id, {
          agent_id: agent.id,
          status: 'accepted',
        });
        if (!claimed) setError(t('This request is no longer available.'));
      }
      await loadRequests();
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : t('Unable to accept this request.'));
    } finally {
      setClaimingId(null);
    }
  };

  const groupSizeFor = (request: TransportRequest) => nearbyRequests.filter(({ request: other }) =>
    calculateDistance(
      request.pickup_latitude,
      request.pickup_longitude,
      other.pickup_latitude,
      other.pickup_longitude
    ) <= 1
  ).length;

  return (
    <div className="container max-w-3xl py-8 px-4">
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:bg-transparent"
        onClick={() => navigate('/agent/dashboard')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> {t('Back to Dashboard')}
      </Button>

      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('Nearby Student Requests')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('Accept one open request to claim it. Requests are shared with nearby verified agents.')}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadRequests()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> {t('Refresh')}
          </Button>
        </div>

        {agentLatitude === null && (
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              {t('Enable location to filter requests by each student’s selected radius. Until then, all open requests are shown.')}
              <Button size="sm" variant="outline" onClick={requestLocation} disabled={locationLoading}>
                {locationLoading ? t('Getting location...') : t('Use my location')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="flex items-center gap-3 p-4">
            <Bell className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-900">
              <strong>{nearbyRequests.length}</strong> {t(nearbyRequests.length === 1 ? 'open request' : 'open requests')} {t('in your selected ranges')}
              {nearbyRequests.length > 1 ? ` — ${t('grouped requests near the same pickup are marked below.')}` : '.'}
            </p>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && requests.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">{t('Loading open requests…')}</CardContent></Card>
        ) : nearbyRequests.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              {t('No open requests in your area right now. New student requests will appear here automatically.')}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {nearbyRequests.map(({ request, distance }) => {
              const nearbyPickupCount = groupSizeFor(request);
              return (
                <Card key={request.id} className="shadow-sm">
                  <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-gray-900">{t('Student looking for a ride')}</h2>
                        <Badge variant="secondary">{t('OPEN')}</Badge>
                        {nearbyPickupCount > 1 && (
                          <Badge variant="outline">{nearbyPickupCount} {t('requests within 1 km')}</Badge>
                        )}
                      </div>
                      <p className="flex items-center text-sm text-gray-700">
                        <MapPin className="mr-1.5 h-4 w-4 text-red-500" />
                        {t('Pickup')}: <strong className="ml-1">{request.pickup_address || t('Current location')}</strong>
                      </p>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {distance !== null && <span>{formatDistance(distance)} {t('from your location')}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {formatRelativeTime(request.created_at)}
                        </span>
                      </p>
                      {request.bus_presence && (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Bus className="h-3.5 w-3.5" />
                          {t('Bus')} {request.bus_presence === 'present'
                            ? t('expected in {eta} min from {location}', {
                              eta: request.bus_eta_minutes ?? t('unknown'),
                              location: request.bus_location || t('location not provided'),
                            })
                            : t('Bus unavailable')}
                          {request.max_wait_minutes !== null && request.max_wait_minutes !== undefined &&
                            ` · ${t('Student wait limit {minutes} min', { minutes: request.max_wait_minutes })}`}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => void handleClaim(request)}
                      disabled={claimingId !== null}
                      className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {claimingId === request.id ? t('Accepting…') : t('Accept request')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
