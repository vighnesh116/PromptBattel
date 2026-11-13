import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  ArrowLeft,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { DEMO_AGENTS, DEMO_VEHICLES } from '../../lib/demoData';
import { getVehicleTypeLabel, getVehicleIcon } from '../../lib/utils';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getDemoTransportRequests, updateDemoTransportRequest } from '../../lib/demoTransportRequests';
import { useLanguage } from '../../contexts/LanguageContext';
import type { RequestStatus as ReqStatusType, TransportAgent, TransportRequest, Vehicle } from '../../types';

export default function RequestStatus() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [status, setStatus] = useState<ReqStatusType>('pending');
  const [request, setRequest] = useState<TransportRequest | null>(null);
  const [agent, setAgent] = useState<TransportAgent | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadRequest = async () => {
      if (!requestId) return;
      try {
        let transportRequest: TransportRequest | null = null;
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('transport_requests')
            .select('*')
            .eq('id', requestId)
            .single();
          if (error) throw error;
          transportRequest = data as TransportRequest;
        } else {
          transportRequest = getDemoTransportRequests().find((item) => item.id === requestId) || null;
        }

        if (!active) return;
        if (!transportRequest) {
          setRequestError(t('This transport request could not be found.'));
          return;
        }
        setRequest(transportRequest);
        setStatus(transportRequest.status);

        if (transportRequest.agent_id) {
          if (isSupabaseConfigured()) {
            const { data, error } = await supabase
              .from('transport_agents')
              .select('*, vehicles(*)')
              .eq('id', transportRequest.agent_id)
              .single();
            if (error) throw error;
            if (active) {
              const acceptedAgent = data as TransportAgent & { vehicles: Vehicle[] };
              setAgent(acceptedAgent);
              setVehicle(acceptedAgent.vehicles?.[0] || null);
            }
          } else {
            const acceptedAgent = DEMO_AGENTS.find((item) => item.id === transportRequest.agent_id) || null;
            setAgent(acceptedAgent);
            setVehicle(DEMO_VEHICLES.find((item) => item.agent_id === transportRequest.agent_id) || null);
          }
        }
      } catch (error) {
        if (active) setRequestError(error instanceof Error ? error.message : 'Unable to load request status.');
      }
    };

    if (!isSupabaseConfigured()) {
      void loadRequest();
      const intervalId = window.setInterval(() => void loadRequest(), 2000);
      const refresh = () => void loadRequest();
      window.addEventListener('demo-transport-requests-updated', refresh);
      window.addEventListener('storage', refresh);
      return () => {
        active = false;
        window.clearInterval(intervalId);
        window.removeEventListener('demo-transport-requests-updated', refresh);
        window.removeEventListener('storage', refresh);
      };
    } else if (requestId) {
      void loadRequest();
      const channel = supabase
        .channel(`request-${requestId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'transport_requests', filter: `id=eq.${requestId}` },
          () => void loadRequest()
        )
        .subscribe();

      return () => {
        active = false;
        void supabase.removeChannel(channel);
      };
    }
    return () => {
      active = false;
    };
  }, [requestId]);

  const handleCancel = async () => {
    setCancelling(true);
    setRequestError(null);
    try {
      if (requestId && isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('transport_requests')
          .update({ status: 'cancelled' })
          .eq('id', requestId)
          .eq('status', 'pending')
          .select('id')
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error(t('This request may already have been accepted by an agent.'));
      } else if (requestId) {
        const cancelledRequest = updateDemoTransportRequest(requestId, { status: 'cancelled' });
        if (!cancelledRequest) throw new Error(t('This transport request could not be found.'));
      }
      setStatus('cancelled');
      setRequest((current) => current ? { ...current, status: 'cancelled' } : current);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : t('Unable to cancel this request.'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container max-w-xl py-8 px-4">
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:bg-transparent"
        onClick={() => navigate('/student/dashboard')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> {t('Back to Dashboard')}
      </Button>

      <Card className="shadow-md">
        <CardHeader className="text-center border-b pb-6">
          <div className="mx-auto mb-3">
            {status === 'pending' && (
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center animate-pulse">
                <Clock className="h-8 w-8" />
              </div>
            )}
            {status === 'accepted' && (
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
            )}
            {status === 'rejected' && (
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8" />
              </div>
            )}
            {status === 'cancelled' && (
              <div className="w-14 h-14 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8" />
              </div>
            )}
          </div>

          <CardTitle className="text-2xl font-bold">
            {status === 'pending' && t('Request Pending')}
            {status === 'accepted' && t('Transport Request Accepted!')}
            {status === 'rejected' && t('Request Declined by Agent')}
            {status === 'cancelled' && t('Request Cancelled')}
          </CardTitle>

          <CardDescription>
            {status === 'pending' && t('Waiting for the transport agent to review and accept...')}
            {status === 'accepted' && t('Your ride is confirmed. You can now contact the driver directly.')}
            {status === 'rejected' && t('The agent is currently unable to accept your trip.')}
            {status === 'cancelled' && t('This transport request has been cancelled.')}
          </CardDescription>

          <div className="mt-3">
            <Badge
              variant={
                status === 'accepted'
                  ? 'default'
                  : status === 'pending'
                  ? 'secondary'
                  : 'destructive'
              }
              className={`text-xs uppercase font-bold tracking-wider ${
                status === 'accepted' ? 'bg-green-600 hover:bg-green-600' : ''
              }`}
            >
              {t('Status: {status}', { status: t(status) })}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-5">
          {requestError && (
            <Alert variant="destructive">
              <AlertDescription>{requestError}</AlertDescription>
            </Alert>
          )}

          {request && (
            <div className="rounded-xl border bg-slate-50 p-4 text-sm">
              <p><strong>{t('Pickup')}:</strong> {request.pickup_address || t('Current location')}</p>
              {request.bus_presence && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('Bus')} {request.bus_presence === 'present'
                    ? t('expected in {eta} min from {location}', {
                      eta: request.bus_eta_minutes ?? t('unknown'),
                      location: request.bus_location || t('location not provided'),
                    })
                    : t('Bus unavailable')}
                </p>
              )}
            </div>
          )}

          {/* Assigned Agent Details */}
          {status === 'accepted' && agent && <div className="bg-slate-50 border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{agent.full_name}</h4>
                <p className="text-xs text-muted-foreground">{agent.service_area}</p>
              </div>
              {vehicle && <span className="text-3xl">{getVehicleIcon(vehicle.vehicle_type)}</span>}
            </div>

            {vehicle && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">{t('Vehicle Type')}</span>
                  <span className="font-medium text-gray-800">{getVehicleTypeLabel(vehicle.vehicle_type)}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">{t('Registration No.')}</span>
                  <span className="font-mono font-medium text-gray-800">{vehicle.registration_number}</span>
                </div>
              </div>
            )}

            {status === 'accepted' && (
              <div className="pt-3 border-t">
                <a
                  href={`tel:${agent.phone}`}
                  className="flex items-center justify-center w-full py-2.5 px-4 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors shadow-sm"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {t('Call Agent ({phone})', { phone: agent.phone })}
                </a>
              </div>
            )}
          </div>}

          {/* Pending Notification */}
          {status === 'pending' && (
            <Alert className="bg-amber-50 border-amber-200 text-amber-900">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-xs">
                {t('Your request has been sent to verified nearby agents. The first agent to accept it will be assigned to your trip.')}
              </AlertDescription>
            </Alert>
          )}

          {/* Rejected Fallback */}
          {status === 'rejected' && (
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() => navigate('/student/find-transport')}
              >
                <Search className="h-4 w-4 mr-2" /> {t('Search Another Agent')}
              </Button>
              <Button
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => navigate('/student/emergency')}
              >
                <AlertTriangle className="h-4 w-4 mr-2" /> {t('Trigger Emergency Alert')}
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-gray-50 border-t rounded-b-xl flex justify-between p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/student/find-transport')}
          >
            {t('Find Alternative')}
          </Button>

          {status === 'pending' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {t('Cancel Request')}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
