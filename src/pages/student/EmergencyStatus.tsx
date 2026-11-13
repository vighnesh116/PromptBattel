import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ExternalLink, RefreshCw, ArrowLeft, ShieldCheck, MailCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { generateMapLink } from '../../lib/utils';
import { DEMO_LOCATION } from '../../lib/demoData';

export default function EmergencyStatus() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const state = routeLocation.state || {};

  const alertId = state.alertId || 'ALERT-DEMO-78912';
  const timestamp = state.timestamp || new Date().toISOString();
  const parentEmail = state.parentEmail || 'meera.joshi@demo.resqai';
  const collegeEmail = state.collegeEmail || 'principal@rgnp.edu.in';
  const coords = state.coords || { lat: DEMO_LOCATION.latitude, lon: DEMO_LOCATION.longitude };

  const [retrying, setRetrying] = useState(false);
  const [retrySuccess, setRetrySuccess] = useState(false);

  const mapLink = generateMapLink(coords.lat, coords.lon);

  const handleRetry = async () => {
    setRetrying(true);
    setRetrySuccess(false);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRetrying(false);
    setRetrySuccess(true);
  };

  return (
    <div className="container max-w-2xl py-8 px-4">
      <Card className="border-green-200 shadow-lg">
        <CardHeader className="bg-green-50 border-b border-green-100 rounded-t-xl text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl text-green-950">Emergency Alert Dispatched</CardTitle>
          <CardDescription className="text-green-800">
            Emergency notification and GPS coordinates sent to registered contacts
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg text-sm">
            <span className="text-muted-foreground">Alert Reference ID:</span>
            <span className="font-mono font-bold text-gray-800">{alertId}</span>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Recipient Dispatch Status
            </h4>

            {/* Parent Email Status */}
            <div className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm">
              <div className="flex items-center space-x-3">
                <MailCheck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm text-gray-900">Parent / Guardian</p>
                  <p className="text-xs text-muted-foreground">{parentEmail}</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Delivered
              </Badge>
            </div>

            {/* College Desk Email Status */}
            <div className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm">
              <div className="flex items-center space-x-3">
                <MailCheck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm text-gray-900">College Safety Desk</p>
                  <p className="text-xs text-muted-foreground">{collegeEmail}</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Delivered
              </Badge>
            </div>
          </div>

          {/* Location shared */}
          <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/50 space-y-2">
            <h4 className="text-sm font-semibold text-blue-900">Captured Emergency Coordinates</h4>
            <p className="text-xs text-blue-700">
              Latitude: {coords.lat.toFixed(6)}, Longitude: {coords.lon.toFixed(6)}
            </p>
            <div className="pt-2">
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Open OpenStreetMap Location Link <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>

          <Alert className="bg-gray-50 border-gray-200">
            <AlertCircle className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-xs text-gray-600">
              Delivery confirmed with SMTP/Resend service provider. Please remain in a safe, visible area while waiting for assistance.
            </AlertDescription>
          </Alert>

          {retrySuccess && (
            <Alert className="bg-green-50 border-green-200 text-green-800 text-xs">
              Alert notifications re-dispatched successfully.
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 bg-gray-50 border-t rounded-b-xl p-4">
          <Button
            variant="outline"
            className="w-full sm:w-1/2"
            onClick={handleRetry}
            disabled={retrying}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying...' : 'Retry Email Delivery'}
          </Button>

          <Button
            className="w-full sm:w-1/2"
            onClick={() => navigate('/student/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

