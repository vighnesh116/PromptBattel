import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Radio, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useLocation } from '../../contexts/LocationContext';
import { DEMO_LOCATION } from '../../lib/demoData';

export default function AgentLocation() {
  const navigate = useNavigate();
  const { location, requestLocation } = useLocation();

  const [broadcasting, setBroadcasting] = useState(true);

  const lat = location?.latitude || DEMO_LOCATION.latitude;
  const lon = location?.longitude || DEMO_LOCATION.longitude;

  return (
    <div className="container max-w-2xl py-8 px-4">
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:bg-transparent"
        onClick={() => navigate('/agent/dashboard')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Radio className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-2xl">Live Location Sharing</CardTitle>
              <CardDescription>
                Allow nearby students to locate your registered vehicle on OpenStreetMap
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl">
            <div>
              <h4 className="font-semibold text-sm text-gray-900">Broadcast Vehicle Position</h4>
              <p className="text-xs text-muted-foreground">
                When active, your vehicle appears in student alternative transport searches
              </p>
            </div>
            <Switch checked={broadcasting} onCheckedChange={setBroadcasting} />
          </div>

          <div className="space-y-3 p-4 border rounded-xl bg-white shadow-sm">
            <h4 className="text-xs font-semibold uppercase text-gray-500">Current Device Coordinates</h4>
            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
              <div>
                <span className="text-xs text-muted-foreground block font-sans">Latitude</span>
                {lat.toFixed(6)}
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-sans">Longitude</span>
                {lon.toFixed(6)}
              </div>
            </div>
            <div className="pt-2">
              <Button size="sm" variant="outline" onClick={() => requestLocation()}>
                Update Coordinates via Geolocation API
              </Button>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200 text-blue-900">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs">
              <strong>Privacy Protection:</strong> Your location is only exposed to students within your active search radius when your vehicle availability is enabled.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

