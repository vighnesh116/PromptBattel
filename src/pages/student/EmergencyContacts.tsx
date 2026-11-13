import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { DEMO_EMERGENCY_CONTACTS } from '../../lib/demoData';
import { isValidEmail, isValidPhone } from '../../lib/utils';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function EmergencyContacts() {
  const navigate = useNavigate();
  const { studentProfile } = useAuth();

  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContacts() {
      if (isSupabaseConfigured() && studentProfile) {
        const { data } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('student_id', studentProfile.id)
          .single();
        if (data) {
          setParentName(data.parent_name || '');
          setParentPhone(data.parent_phone || '');
          setParentEmail(data.parent_email || '');
          setCollegeEmail(data.college_email || '');
          return;
        }
      }
      // Demo fallback
      const demo = DEMO_EMERGENCY_CONTACTS[0];
      setParentName(demo.parent_name);
      setParentPhone(demo.parent_phone);
      setParentEmail(demo.parent_email);
      setCollegeEmail(demo.college_email);
    }
    loadContacts();
  }, [studentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!parentName.trim()) {
      setError('Parent/Guardian name is required.');
      return;
    }
    if (!isValidPhone(parentPhone)) {
      setError('Please enter a valid 10-digit phone number for parent/guardian.');
      return;
    }
    if (!isValidEmail(parentEmail)) {
      setError('Please enter a valid email address for parent/guardian.');
      return;
    }
    if (!isValidEmail(collegeEmail)) {
      setError('Please enter a valid college emergency email address.');
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured() && studentProfile) {
        const { error: upsertError } = await supabase
          .from('emergency_contacts')
          .upsert({
            student_id: studentProfile.id,
            parent_name: parentName.trim(),
            parent_phone: parentPhone.trim(),
            parent_email: parentEmail.trim(),
            college_email: collegeEmail.trim(),
            updated_at: new Date().toISOString(),
          });
        if (upsertError) throw upsertError;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update emergency contacts.');
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

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Emergency Contacts</CardTitle>
              <CardDescription>
                These contacts receive immediate GPS alerts if you activate an Emergency Alert
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Alert className="mb-6 bg-blue-50 text-blue-900 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs">
              When an Emergency Alert is triggered, your live GPS coordinates, student identity, and an OpenStreetMap link will be emailed to these recipients automatically.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert className="mb-6 bg-red-50 text-red-900 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 text-green-900 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm">
                Emergency contacts updated successfully.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parentName">Parent / Guardian Name</Label>
              <Input
                id="parentName"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Ramesh Patil"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Parent / Guardian Phone</Label>
                <Input
                  id="parentPhone"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentEmail">Parent / Guardian Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="parent@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="collegeEmail">College Emergency Authority Email</Label>
              <Input
                id="collegeEmail"
                type="email"
                value={collegeEmail}
                onChange={(e) => setCollegeEmail(e.target.value)}
                placeholder="principal@college.edu.in"
                required
              />
              <p className="text-xs text-muted-foreground">
                Official college authority or safety desk email address
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving Changes...' : 'Save Emergency Contacts'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

