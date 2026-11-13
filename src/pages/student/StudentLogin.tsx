import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      navigate('/student/dashboard');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError(t('Please enter your email and password.'));
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err?.message ?? t('An unexpected error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-blue-100 rounded-full p-3">
              <Shield className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-blue-600">RESQ-AI</h1>
          <p className="text-gray-500 text-sm mt-1">{t('Student Portal')}</p>
          <h2 className="text-xl font-bold text-gray-800 mt-4">{t('Welcome back')}</h2>
          <p className="text-gray-500 text-sm">{t('Sign in to your student account')}</p>
        </div>

        {/* Demo mode notice */}
        {!isSupabaseConfigured() && (
          <div className="mb-5 space-y-3">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-blue-900 text-xs">
                <span className="font-semibold">{t('Demo Mode Active:')}</span> {t('Sample student data loaded (Ananya Joshi). Click below for instant 1-click test login.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/student/dashboard')}
              className="w-full bg-blue-50 text-blue-700 border border-blue-300 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors text-xs flex items-center justify-center gap-2"
            >
              {t('⚡ Fast Demo Login (Ananya Joshi - Ratnagiri Govt Polytechnic)')}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              {t('Email Address')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              {t('Password')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="text-right mt-1">
              <button
                type="button"
                onClick={() => alert('Password reset link will be sent to your email. (Feature coming soon)')}
                className="text-xs text-blue-600 hover:underline"
              >
                {t('Forgot Password?')}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? t('Signing in…') : t('Sign In')}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm">
          <p className="text-gray-500">
            {t("Don't have an account?")}{' '}
            <Link to="/student/register" className="text-blue-600 font-medium hover:underline">
              {t('Register here')}
            </Link>
          </p>
          <p>
            <Link to="/" className="text-gray-400 hover:text-gray-600 text-xs">
              ← {t('Back to Home')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
