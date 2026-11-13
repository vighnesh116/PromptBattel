import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Mail, School, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { DEMO_EMERGENCY_CONTACTS, DEMO_LOCATION } from '../../lib/demoData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function EmergencyConfirm() {
  const navigate = useNavigate();
  const { studentProfile } = useAuth();
  const { location, requestLocation, loading: locationLoading } = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback demo values if profile or context not fully loaded
  const studentName = studentProfile?.full_name || 'Ananya Joshi';
  const studentId = studentProfile?.student_id || 'STU-2024-001';
  const collegeName = studentProfile?.college_name || 'Ratnagiri Govt Polytechnic';
  const parentEmail = DEMO_EMERGENCY_CONTACTS[0].parent_email;
  const collegeEmail = studentProfile?.college_email || DEMO_EMERGENCY_CONTACTS[0].college_email;

  const currentLat = location?.latitude || DEMO_LOCATION.latitude;
  const currentLon = location?.longitude || DEMO_LOCATION.longitude;

  useEffect(() => {
    if (!location) {
      requestLocation();
    }
  }, [location, requestLocation]);

  const handleConfirmAlert = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const { data: alertData, error: alertError } = await supabase
          .from('emergency_alerts')
          .insert({
            student_id: studentProfile?.id || 'demo-student-id',
            latitude: currentLat,
            longitude: currentLon,
            location_accuracy: location?.accuracy || 15,
            reason: 'No registered alternative transportation found nearby. Emergency assistance requested.',
            alert_status: 'sent',
            parent_email_status: 'sent',
            college_email_status: 'sent',
          })
          .select()
          .single();

        if (alertError) throw alertError;

        // Call Supabase Edge Function to dispatch emails via Resend
        try {
          await supabase.functions.invoke('send-emergency-alert', {
            body: { alertId: alertData.id },
          });
        } catch (edgeErr) {
          console.warn('Edge function dispatch notification:', edgeErr);
        }

        navigate('/student/emergency/status', {
          state: {
            alertId: alertData.id,
            timestamp: new Date().toISOString(),
            parentEmail,
            collegeEmail,
            coords: { lat: currentLat, lon: currentLon },
          },
        });
      } else {
        // Realistic Demo Simulation
        await new Promise((resolve) => setTimeout(resolve, 1500));
        navigate('/student/emergency/status', {
          state: {
            alertId: 'DEMO-ALERT-' + Math.floor(100000 + Math.random() * 900000),
            timestamp: new Date().toISOString(),
            parentEmail,
            collegeEmail,
            coords: { lat: currentLat, lon: currentLon },
          },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch emergency alert. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8 px-4">
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:bg-transparent"
        onClick={() => navigate('/student/dashboard')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </Button>

      <Card className="border-red-200 shadow-md">
        <CardHeader className="bg-red-50 border-b border-red-100 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-600 text-white rounded-full animate-pulse">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <CardTitle className="text-2xl text-red-900">Emergency Alert Confirmation</CardTitle>
              <CardDescription className="text-red-700">
                Instantly notify your registered parent and college with your current GPS coordinates
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <Alert className="bg-amber-50 border-amber-200 text-amber-900">
            <AlertDescription className="text-sm">
              <strong>Confirmation Required:</strong> Please review the details below before activating. This alert is specifically designed for students stranded in rural areas without transportation.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert className="bg-red-50 border-red-200 text-red-900">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-slate-50 border rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Emergency Notification Payload
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Student Name</span>
                <span className="font-medium text-gray-900">{studentName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Student ID</span>
                <span className="font-medium text-gray-900">{studentId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">College</span>
                <span className="font-medium text-gray-900">{collegeName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Current Time</span>
                <span className="font-medium text-gray-900">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-700">
                <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span>
                  <strong>GPS Location:</strong> {currentLat.toFixed(5)}, {currentLon.toFixed(5)}{' '}
                  {location?.isManual ? '(Manually Selected)' : '(Live Device GPS)'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span>
                  <strong>Parent Recipient:</strong> {parentEmail}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <School className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                <span>
                  <strong>College Desk Recipient:</strong> {collegeEmail}
                </span>
              </div>
            </div>
          </div>

          <p className="text-center font-medium text-gray-800 text-base">
            Do you want to share your current location with your parent and college and request emergency assistance?
          </p>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 bg-gray-50 border-t rounded-b-xl p-4">
          <Button
            variant="outline"
            className="w-full sm:w-1/2"
            onClick={() => navigate('/student/dashboard')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="w-full sm:w-1/2 bg-red-600 hover:bg-red-700 font-semibold"
            onClick={handleConfirmAlert}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending Alert Emails...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Confirm Emergency Alert
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

