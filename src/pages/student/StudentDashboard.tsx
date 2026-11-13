import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bus,
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Student, EmergencyContact, TransportRequest } from '../../types/index';
import { DEMO_STUDENTS, DEMO_EMERGENCY_CONTACTS } from '../../lib/demoData';
import { formatRelativeTime, formatDateTime } from '../../lib/utils';
import { getDemoTransportRequests } from '../../lib/demoTransportRequests';
import { useLanguage } from '../../contexts/LanguageContext';

interface DashboardState {
  student: Student | null;
  emergencyContact: EmergencyContact | null;
  activeRequest: TransportRequest | null;
  recentRequests: TransportRequest[];
  loading: boolean;
  locationAvailable: boolean;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useLanguage();
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    accepted: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {t(status)}
    </span>
  );
};

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isDemo = !isSupabaseConfigured();

  const [state, setState] = useState<DashboardState>({
    student: null,
    emergencyContact: null,
    activeRequest: null,
    recentRequests: [],
    loading: true,
    locationAvailable: false,
  });

  useEffect(() => {
    // Check if geolocation is available
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setState(s => ({ ...s, locationAvailable: true })),
        () => setState(s => ({ ...s, locationAvailable: false }))
      );
    }

    if (isDemo) {
      // Load demo data
      const demoStudent = DEMO_STUDENTS[0];
      const demoContact = DEMO_EMERGENCY_CONTACTS[0];
      const demoRequests = getDemoTransportRequests()
        .filter((request) => request.student_id === demoStudent.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 5);
      const activeDemoRequest = demoRequests.find((request) =>
        request.status === 'pending' || request.status === 'accepted'
      ) || null;
      setState(s => ({
        ...s,
        student: demoStudent,
        emergencyContact: demoContact,
        activeRequest: activeDemoRequest,
        recentRequests: demoRequests,
        loading: false,
      }));
      return;
    }

    // Load from Supabase
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/student/login');
          return;
        }

        const { data: studentData } = await supabase
          .from('students')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();

        if (!studentData) {
          navigate('/student/login');
          return;
        }

        const { data: ecData } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('student_id', studentData.id)
          .single();

        const { data: requestsData } = await supabase
          .from('transport_requests')
          .select('*')
          .eq('student_id', studentData.id)
          .order('created_at', { ascending: false })
          .limit(5);

        const requests: TransportRequest[] = requestsData || [];
        const active = requests.find(r => r.status === 'pending' || r.status === 'accepted') || null;

        setState(s => ({
          ...s,
          student: studentData,
          emergencyContact: ecData || null,
          activeRequest: active,
          recentRequests: requests,
          loading: false,
        }));
      } catch (err) {
        console.error('Dashboard load error:', err);
        setState(s => ({ ...s, loading: false }));
      }
    };

    loadData();
  }, [isDemo, navigate]);

  const { student, emergencyContact, activeRequest, recentRequests, loading, locationAvailable } = state;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{t('Loading dashboard...')}</p>
        </div>
      </div>
    );
  }

  const studentName = student?.full_name || 'Student';
  const initials = studentName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const hasEmergencyContact = !!emergencyContact?.parent_name;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <span className="text-amber-700 text-sm font-medium">
            {t('🧪 Demo Mode — Showing demo data for Ananya Joshi. Configure Supabase to use real data.')}
          </span>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Welcome Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('Welcome back, {name}! 👋', { name: studentName })}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {t('Find safe transport or alert your emergency contacts')}
            </p>
          </div>
        </div>

        {/* Status Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Location Status */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <MapPin className={`w-5 h-5 ${locationAvailable ? 'text-green-500' : 'text-gray-400'}`} />
            <div>
              <p className="text-xs text-gray-500 font-medium">{t('Location')}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${locationAvailable ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm font-semibold text-gray-700">
                  {locationAvailable ? t('Available') : t('Not Available')}
                </span>
              </div>
            </div>
          </div>

          {/* Current Request Status */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500 font-medium">{t('Active Request')}</p>
              <div className="mt-0.5">
                {activeRequest ? (
                  <StatusBadge status={activeRequest.status} />
                ) : (
                  <span className="text-sm font-semibold text-gray-400">{t('None')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500 font-medium">{t('Emergency Contacts')}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {hasEmergencyContact ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-700">{t('Set Up')}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold text-orange-600">{t('Not Set')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Find Alternative Transport — Primary Large Card */}
          <button
            onClick={() => navigate('/student/find-transport')}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md p-6 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group col-span-1"
          >
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 rounded-xl p-3 group-hover:bg-blue-400 transition-colors">
                <Bus className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{t('Find Alternative Transport')}</h2>
                <p className="text-blue-100 text-sm leading-relaxed">
                  {t('Search for verified transport agents near you')}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-200 mt-1 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-blue-100 text-xs">
              <span className="bg-blue-500 rounded-full px-2 py-0.5">✓ Verified Agents</span>
              <span className="bg-blue-500 rounded-full px-2 py-0.5">✓ Real-time Location</span>
            </div>
          </button>

          {/* Emergency Alert — Red/Orange Card */}
          <button
            onClick={() => navigate('/student/emergency')}
            className="relative bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl shadow-md p-6 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group overflow-hidden col-span-1"
          >
            {/* Pulsing ring animation */}
            <span className="absolute inset-0 rounded-xl ring-2 ring-red-400 animate-pulse opacity-60 pointer-events-none" />
            <div className="relative flex items-start gap-4">
              <div className="bg-red-400 bg-opacity-50 rounded-xl p-3 group-hover:bg-opacity-70 transition-all">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{t('Emergency Alert')}</h2>
                <p className="text-red-100 text-sm leading-relaxed">
                  {t('Alert your parents and college when no transport is available')}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-red-200 mt-1 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="relative mt-4 flex items-center gap-2 text-red-100 text-xs">
              <span className="bg-red-400 bg-opacity-50 rounded-full px-2 py-0.5">📍 Shares Location</span>
              <span className="bg-red-400 bg-opacity-50 rounded-full px-2 py-0.5">📧 Notifies Contacts</span>
            </div>
          </button>
        </div>

        {/* Smaller Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/student/requests"
            className="bg-white hover:bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-3 transition-all hover:shadow-md group"
          >
            <div className="bg-indigo-50 rounded-lg p-2.5">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">{t('My Requests')}</p>
              <p className="text-xs text-gray-400">View request history</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/student/profile"
            className="bg-white hover:bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-3 transition-all hover:shadow-md group"
          >
            <div className="bg-blue-50 rounded-lg p-2.5">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">My Profile</p>
              <p className="text-xs text-gray-400">Edit personal info</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/student/emergency-contacts"
            className="bg-white hover:bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-3 transition-all hover:shadow-md group"
          >
            <div className="bg-green-50 rounded-lg p-2.5">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">Emergency Contacts</p>
              <p className="text-xs text-gray-400">Manage contacts</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Recent Activity
          </h3>
          {recentRequests.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs mt-1">Your transport requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.slice(0, 3).map((req) => (
                <Link
                  key={req.id}
                  to={`/student/request/${req.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Bus className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Transport Request</p>
                      <p className="text-xs text-gray-400">{formatRelativeTime(req.created_at)}</p>
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Student ID Card Footer */}
        {student && (
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-500 font-medium">Student ID</p>
              <p className="text-blue-800 font-mono font-semibold">{student.student_id}</p>
              <p className="text-xs text-blue-500 mt-0.5">{student.college_name}</p>
            </div>
            <Link
              to="/student/profile"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              View Profile <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
