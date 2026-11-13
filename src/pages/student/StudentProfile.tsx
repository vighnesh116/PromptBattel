import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  BookOpen,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Student } from '../../types/index';
import { DEMO_STUDENTS } from '../../lib/demoData';

interface ProfileForm {
  full_name: string;
  phone: string;
  college_name: string;
  college_email: string;
}

const StudentProfile: React.FC = () => {
  const isDemo = !isSupabaseConfigured();

  const [student, setStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    full_name: '',
    phone: '',
    college_name: '',
    college_email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (isDemo) {
        const demoStudent = DEMO_STUDENTS[0];
        setStudent(demoStudent);
        setForm({
          full_name: demoStudent.full_name,
          phone: demoStudent.phone,
          college_name: demoStudent.college_name,
          college_email: demoStudent.college_email,
        });
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: studentData, error } = await supabase
          .from('students')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();

        if (error || !studentData) {
          setMessage({ type: 'error', text: 'Failed to load profile.' });
          setLoading(false);
          return;
        }

        setStudent(studentData);
        setForm({
          full_name: studentData.full_name,
          phone: studentData.phone,
          college_name: studentData.college_name,
          college_email: studentData.college_email,
        });
      } catch (err) {
        console.error('Profile load error:', err);
        setMessage({ type: 'error', text: 'An error occurred loading your profile.' });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isDemo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemo) {
      setMessage({ type: 'success', text: 'Demo mode: Profile changes are not saved.' });
      return;
    }

    if (!student) return;
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('students')
        .update({
          full_name: form.full_name,
          phone: form.phone,
          college_name: form.college_name,
          college_email: form.college_email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', student.id);

      if (error) {
        setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
      } else {
        setStudent(prev => prev ? { ...prev, ...form } : prev);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      console.error('Save error:', err);
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  const initials = form.full_name
    ? form.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="min-h-screen bg-gray-50">
      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <span className="text-amber-700 text-sm font-medium">
            🧪 Demo Mode — Changes will not be saved to any database.
          </span>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header with Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-md">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{form.full_name || 'Your Profile'}</h1>
            {student && (
              <p className="text-gray-500 text-sm font-mono mt-0.5">{student.student_id}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Personal Information
            </h2>
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Student ID (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Student ID
                  <span className="ml-2 text-xs text-gray-400 font-normal">(read-only)</span>
                </label>
                <input
                  type="text"
                  value={student?.student_id || ''}
                  readOnly
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    Phone Number
                  </span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    Email Address
                    <span className="text-xs text-gray-400 font-normal">(read-only)</span>
                  </span>
                </label>
                <input
                  type="email"
                  value={student?.email || ''}
                  readOnly
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* College Information */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              College Information
            </h2>
            <div className="space-y-4">
              {/* College Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  College Name
                </label>
                <input
                  type="text"
                  name="college_name"
                  value={form.college_name}
                  onChange={handleChange}
                  required
                  placeholder="Name of your college/institution"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* College Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  College Official Email
                </label>
                <input
                  type="email"
                  name="college_email"
                  value={form.college_email}
                  onChange={handleChange}
                  required
                  placeholder="admin@yourcollege.edu.in"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="mt-1 text-xs text-gray-400">
                  This email will be notified during emergency alerts.
                </p>
              </div>
            </div>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </form>

        {/* Emergency Contacts Link */}
        <div className="mt-6">
          <Link
            to="/student/emergency-contacts"
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl border border-gray-200 transition-all flex items-center gap-3 shadow-sm group"
          >
            <Shield className="w-5 h-5 text-green-600" />
            <div className="flex-1 text-left">
              <span className="text-sm font-semibold">Emergency Contacts</span>
              <p className="text-xs text-gray-400 mt-0.5">Manage parent &amp; college contacts</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
