import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ArrowLeft, Save, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { DEMO_VEHICLES } from '../../lib/demoData';
import { getVehicleTypeLabel } from '../../lib/utils';
import type { VehicleType } from '../../types';

export default function AgentVehicle() {
  const navigate = useNavigate();
  const initialVehicle = DEMO_VEHICLES[0];

  const [vehicleType, setVehicleType] = useState<VehicleType>(initialVehicle.vehicle_type);
  const [regNumber, setRegNumber] = useState(initialVehicle.registration_number);
  const [description, setDescription] = useState(initialVehicle.vehicle_description);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Vehicle Specifications</CardTitle>
              <CardDescription>
                Configure the registered vehicle shown to rural students looking for transport
              </CardDescription>
            </div>
            <Badge className="bg-emerald-600 hover:bg-emerald-600">
              <ShieldCheck className="h-3 w-3 mr-1" /> Verified Vehicle
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {saved && (
            <Alert className="mb-4 bg-green-50 border-green-200 text-green-800 text-sm">
              Vehicle details updated successfully.
            </Alert>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Category</Label>
              <select
                id="vehicleType"
                className="w-full h-10 px-3 border rounded-md text-sm bg-white"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
              >
                <option value="auto-rickshaw">Auto-Rickshaw (3 Passengers)</option>
                <option value="car">Car (4 Passengers)</option>
                <option value="van">Van / Tempo (7-8 Passengers)</option>
                <option value="minibus">Minibus (12-15 Passengers)</option>
                <option value="other">Other Authorized Transport</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="regNumber">Vehicle Registration Number</Label>
              <Input
                id="regNumber"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="MH-08-AB-1234"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Vehicle Description & Features</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Yellow auto-rickshaw, regularly serviced, seats 3 students comfortably."
                rows={3}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" /> Save Vehicle Details
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

