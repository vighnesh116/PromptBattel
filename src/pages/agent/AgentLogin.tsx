import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Truck, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AgentLogin() {
  const navigate = useNavigate();
  const { isDemo } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        navigate('/agent/dashboard');
      } else {
        // Demo quick login
        await new Promise((r) => setTimeout(r, 600));
        navigate('/agent/dashboard');
      }
    } catch (err: any) {
      setError(err.message || t('Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAgentLogin = () => {
    navigate('/agent/dashboard');
  };

  return (
    <div className="container max-w-md py-12 px-4">
      <Card className="shadow-lg border-blue-100">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
            <Truck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('Transport Agent Portal')}</CardTitle>
          <CardDescription>
            {t('Sign in to manage your vehicle, availability and incoming ride requests')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4 bg-red-50 text-red-900 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('Agent Email Address')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="ramesh.patil@demo.resqai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('Password')}</Label>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => alert('Demo password reset: Enter your registered email.')}
                >
                  {t('Forgot password?')}
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t('Sign In as Transport Agent')}
            </Button>
          </form>

          {isDemo && (
            <div className="mt-6 pt-4 border-t text-center">
              <Button
                variant="outline"
                className="w-full text-xs font-semibold text-blue-700 bg-blue-50/50 hover:bg-blue-100"
                onClick={handleDemoAgentLogin}
              >
                {t('⚡ Fast Demo Login (Ramesh Patil - Auto-Rickshaw)')}
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 border-t pt-4 text-center text-sm text-muted-foreground">
          <div>
            {t('Need to register your vehicle?')}{' '}
            <Link to="/agent/register" className="font-semibold text-blue-600 hover:underline">
              {t('Register as Agent')}
            </Link>
          </div>
          <div>
            {t('Student looking for transport?')}{' '}
            <Link to="/student/login" className="font-semibold text-gray-700 hover:underline">
              Student Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
