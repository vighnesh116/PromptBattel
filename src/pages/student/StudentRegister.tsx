import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface FormData {
  fullName: string;
  studentId: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  collegeName: string;
  collegeEmail: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  authorized: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v: string) => /^[6-9]\d{9}$/.test(v);

const StudentRegister: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    fullName: '',
    studentId: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeName: '',
    collegeEmail: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    authorized: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!form.studentId.trim()) e.studentId = 'Student ID is required.';
    if (!form.phone.trim()) e.phone = 'Phone is required.';
    else if (!isValidPhone(form.phone)) e.phone = 'Enter a valid 10-digit phone number starting with 6-9.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!isValidEmail(form.email)) e.email = 'Enter a valid email address.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    else if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password)) e.password = 'Password must contain both letters and numbers.';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    if (!form.collegeName.trim()) e.collegeName = 'College name is required.';
    if (!form.collegeEmail.trim()) e.collegeEmail = 'College email is required.';
    else if (!isValidEmail(form.collegeEmail)) e.collegeEmail = 'Enter a valid college email address.';
    if (!form.parentName.trim()) e.parentName = 'Parent/Guardian name is required.';
    if (!form.parentPhone.trim()) e.parentPhone = 'Parent phone is required.';
    else if (!isValidPhone(form.parentPhone)) e.parentPhone = 'Enter a valid 10-digit phone number starting with 6-9.';
    if (!form.parentEmail.trim()) e.parentEmail = 'Parent email is required.';
    else if (!isValidEmail(form.parentEmail)) e.parentEmail = 'Enter a valid email address.';
    if (!form.authorized) e.authorized = 'You must accept the authorization to register.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setGlobalError(null);
    if (!validate()) return;

    if (!isSupabaseConfigured) {
      setGlobalError('Please configure Supabase to register. Set your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
      return;
    }

    setLoading(true);
    try {
      // 1. Auth signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { role: 'student', full_name: form.fullName } },
      });
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('No user ID returned from sign up.');

      // 2. Insert into students table
      const { error: studentError } = await supabase.from('students').insert({
        id: userId,
        full_name: form.fullName,
        student_id: form.studentId,
        phone: form.phone,
        email: form.email,
        college_name: form.collegeName,
        college_email: form.collegeEmail,
      });
      if (studentError) throw studentError;

      // 3. Insert into emergency_contacts table
      const { error: ecError } = await supabase.from('emergency_contacts').insert({
        student_id: userId,
        name: form.parentName,
        phone: form.parentPhone,
        email: form.parentEmail,
        relationship: 'Parent/Guardian',
      });
      if (ecError) throw ecError;

      setSuccess(true);
    } catch (err: any) {
      setGlobalError(err?.message ?? 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-14 w-14 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Registration Successful!</h2>
          <p className="text-gray-600 text-sm mb-6">
            Please check your email to verify your account. Once verified, you can sign in to the student portal.
          </p>
          <Link
            to="/student/login"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block text-sm"
          >
            Go to Student Login
          </Link>
        </div>
      </div>
    );
  }

  const inputCls = (field: string) =>
    `border ${errors[field] ? 'border-red-400' : 'border-gray-300'} rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-auto p-8">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-blue-100 rounded-full p-3">
              <Shield className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-blue-600">RESQ-AI</h1>
          <p className="text-gray-500 text-sm mt-1">Student Registration</p>
          <h2 className="text-xl font-bold text-gray-800 mt-3">Create Your Student Account</h2>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-700 text-sm">
              <span className="font-semibold">Demo Mode:</span> Supabase is not configured. Registration is disabled.
            </p>
          </div>
        )}

        {globalError && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{globalError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Personal Information */}
          <fieldset>
            <legend className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100 w-full">
              Personal Information
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" value={form.fullName} onChange={set('fullName')} placeholder="Ravi Kumar" className={inputCls('fullName')} />
                {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                <input type="text" value={form.studentId} onChange={set('studentId')} placeholder="STU2024001" className={inputCls('studentId')} />
                {errors.studentId && <p className="text-red-600 text-xs mt-1">{errors.studentId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="9876543210" className={inputCls('phone')} maxLength={10} />
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="ravi@example.com" className={inputCls('email')} />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min 8 chars, letter+number" className={`${inputCls('password')} pr-10`} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Re-enter password" className={`${inputCls('confirmPassword')} pr-10`} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </fieldset>

          {/* College Information */}
          <fieldset>
            <legend className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100 w-full">
              College Information
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College Name *</label>
                <input type="text" value={form.collegeName} onChange={set('collegeName')} placeholder="Government College of Engineering" className={inputCls('collegeName')} />
                {errors.collegeName && <p className="text-red-600 text-xs mt-1">{errors.collegeName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College Email *</label>
                <input type="email" value={form.collegeEmail} onChange={set('collegeEmail')} placeholder="ravi@college.edu.in" className={inputCls('collegeEmail')} />
                {errors.collegeEmail && <p className="text-red-600 text-xs mt-1">{errors.collegeEmail}</p>}
              </div>
            </div>
          </fieldset>

          {/* Emergency Contact */}
          <fieldset>
            <legend className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100 w-full">
              Parent / Guardian (Emergency Contact)
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Name *</label>
                <input type="text" value={form.parentName} onChange={set('parentName')} placeholder="Suresh Kumar" className={inputCls('parentName')} />
                {errors.parentName && <p className="text-red-600 text-xs mt-1">{errors.parentName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone *</label>
                <input type="tel" value={form.parentPhone} onChange={set('parentPhone')} placeholder="9876543210" className={inputCls('parentPhone')} maxLength={10} />
                {errors.parentPhone && <p className="text-red-600 text-xs mt-1">{errors.parentPhone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email *</label>
                <input type="email" value={form.parentEmail} onChange={set('parentEmail')} placeholder="parent@example.com" className={inputCls('parentEmail')} />
                {errors.parentEmail && <p className="text-red-600 text-xs mt-1">{errors.parentEmail}</p>}
              </div>
            </div>
          </fieldset>

          {/* Authorization */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${errors.authorized ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
            <input
              type="checkbox"
              id="authorized"
              checked={form.authorized}
              onChange={set('authorized')}
              className="mt-0.5 h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="authorized" className="text-sm text-gray-600 cursor-pointer">
              I authorize RESQ-AI to share my location and trip information with my registered emergency contacts during active trips or emergency situations.
            </label>
          </div>
          {errors.authorized && <p className="text-red-600 text-xs -mt-4">{errors.authorized}</p>}

          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Creating Account…' : 'Create Student Account'}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm">
          <p className="text-gray-500">
            Already have an account?{' '}
            <Link to="/student/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
          <Link to="/" className="text-gray-400 hover:text-gray-600 text-xs block">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
