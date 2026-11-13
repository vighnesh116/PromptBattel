import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SUPPORTED_LANGUAGES, useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/button';

function ShieldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-7 h-7 text-blue-600"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Navbar() {
  const { currentUser, signOut, isDemo } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMenuOpen(false);
  };

  const studentLinks = [
    { label: 'Dashboard', to: '/student/dashboard' },
    { label: 'Find Transport', to: '/student/find-transport' },
    { label: 'Emergency', to: '/student/emergency' },
    { label: 'Profile', to: '/student/profile' },
  ];

  const agentLinks = [
    { label: 'Dashboard', to: '/agent/dashboard' },
    { label: 'Requests', to: '/agent/requests' },
    { label: 'Vehicle', to: '/agent/vehicle' },
    { label: 'Location', to: '/agent/location' },
  ];

  const links = currentUser?.role === 'student'
    ? studentLinks.map((link) => ({ ...link, label: t(link.label) }))
    : currentUser?.role === 'agent'
    ? agentLinks.map((link) => ({ ...link, label: t(link.label) }))
    : [];

  const languageSelector = (
    <label className="flex items-center gap-2 text-sm text-gray-600">
      <span>{t('Language')}</span>
      <select
        aria-label={t('Language')}
        value={language}
        onChange={(event) => setLanguage(event.target.value as typeof language)}
        className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-800"
      >
        {SUPPORTED_LANGUAGES.map(({ code, label }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
    </label>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-blue-700 hover:text-blue-800 transition-colors"
          >
            <ShieldIcon />
            <span>RESQ-AI</span>
            {isDemo && (
              <span className="text-xs font-normal bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded ml-1">
                DEMO
              </span>
            )}
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            {languageSelector}
            {currentUser ? (
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                {t('Sign Out')}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/student/login')}
                >
                  {t('Student Login')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/agent/login')}
                >
                  {t('Agent Login')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={t('Toggle navigation menu')}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t mt-2 flex flex-col gap-2">
            {languageSelector}
            {currentUser ? (
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                {t('Sign Out')}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { navigate('/student/login'); setMenuOpen(false); }}
                >
                  {t('Student Login')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => { navigate('/agent/login'); setMenuOpen(false); }}
                >
                  {t('Agent Login')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
