import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { isValidEmail, isValidPhone } from '../../lib/utils';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import type { VehicleType } from '../../types';

export default function AgentRegister() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('auto-rickshaw');
  const [regNumber, setRegNumber] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [description, setDescription] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError('Full name is required.');
    if (!isValidPhone(phone)) return setError('Please enter a valid 10-digit mobile number.');
    if (!isValidEmail(email)) return setError('Please enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters long.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (!regNumber.trim()) return setError('Vehicle registration number is required.');
    if (!serviceArea.trim()) return setError('Service area / route is required.');
    if (!isAuthorized) return setError('You must confirm authorization to provide transport.');

    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: 'agent', full_name: fullName },
          },
        });
        if (authError) throw authError;

        if (authData.user) {
          const { data: agentData, error: agentError } = await supabase
            .from('transport_agents')
            .insert({
              auth_user_id: authData.user.id,
              full_name: fullName.trim(),
              phone: phone.trim(),
              email: email.trim(),
              service_area: serviceArea.trim(),
              verification_status: 'pending',
            })
            .select()
            .single();

          if (agentError) throw agentError;

          const { error: vehicleError } = await supabase.from('vehicles').insert({
            agent_id: agentData.id,
            vehicle_type: vehicleType,
            registration_number: regNumber.trim().toUpperCase(),
            vehicle_description: description.trim(),
            availability_status: 'unavailable',
            location_sharing_enabled: false,
          });

          if (vehicleError) throw vehicleError;
        }
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8 px-4">
      <Card className="shadow-lg border-blue-100">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md mb-2">
            <Truck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Register as Transport Agent</CardTitle>
          <CardDescription>
            Join RESQ-AI to provide verified alternative transport in rural communities
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Application Submitted!</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Thank you for applying. Your vehicle registration and background verification are now in review (<strong>Pending Verification</strong>). Once approved, you will appear in student searches.
              </p>
              <div className="pt-4">
                <Button onClick={() => navigate('/agent/login')}>
                  Proceed to Agent Login
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="bg-red-50 text-red-900 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Agent Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Patil"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@example.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="password">Password (min 8 chars)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Vehicle Specifications
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="vehicleType">Vehicle Category</Label>
                    <select
                      id="vehicleType"
                      className="w-full h-10 px-3 border rounded-md text-sm bg-white"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                    >
                      <option value="auto-rickshaw">Auto-Rickshaw (3 Seater)</option>
                      <option value="car">Car / Taxi (4 Seater)</option>
                      <option value="van">Van / Tempo (7-8 Seater)</option>
                      <option value="minibus">Minibus (12-15 Seater)</option>
                      <option value="other">Other Authorized Transport</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="regNumber">Vehicle Registration Number</Label>
                    <Input
                      id="regNumber"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="e.g. MH-08-AB-1234"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="serviceArea">Primary Operating Route / Service Area</Label>
                  <Input
                    id="serviceArea"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="e.g. Ratnagiri to Khed Route"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description">Vehicle Description & Seating Capacity</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Yellow auto-rickshaw, regularly serviced, safe for student travel."
                    rows={2}
                  />
                </div>
              </div>

              {/* Authorization Declaration */}
              <div className="pt-2">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={isAuthorized}
                    onChange={(e) => setIsAuthorized(e.target.checked)}
                  />
                  <span className="text-xs text-gray-700">
                    I confirm that I am authorized to provide the declared transportation service, possess a valid driving license, and my vehicle complies with all safety and registration standards.
                  </span>
                </label>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Registration
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="border-t pt-4 text-center justify-center text-sm text-muted-foreground">
          Already registered?{' '}
          <Link to="/agent/login" className="font-semibold text-blue-600 hover:underline ml-1">
            Sign In here
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

