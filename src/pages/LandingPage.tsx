import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Shield,
  MapPin,
  Bus,
  AlertTriangle,
  Navigation,
  CheckCircle,
  Lock,
  Users,
  Clock,
  Star,
  ArrowRight,
  Phone,
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAV */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-blue-600">RESQ-AI</span>
          </div>
          <div className="flex gap-3">
            <Link
              to="/student/login"
              className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              {t('Student Login')}
            </Link>
            <Link
              to="/agent/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {t('Agent Login')}
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 rounded-full p-5">
              <Shield className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
            RESQ-AI
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-blue-100 mb-4">
            {t('Every journey deserves a safe alternative.')}
          </p>
          <p className="text-blue-200 max-w-2xl mx-auto text-base sm:text-lg mb-10">
            {t('Connecting rural students with verified local transport agents in real-time. One tap to find a safe ride — one tap to send an emergency alert.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/student/login"
              className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center gap-2 shadow-lg"
            >
              {t('Student Login')} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/agent/login"
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Bus className="h-5 w-5" /> {t('Transport Agent Login')}
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-blue-100 text-sm">
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-300" /> {t('100% Free for Students')}</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-300" /> {t('Verified Agents Only')}</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-300" /> {t('Real-time Safety Alerts')}</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('How RESQ-AI Works')}</h2>
          <p className="text-center text-gray-500 mb-12">{t('Three simple steps to a safer journey')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <MapPin className="h-10 w-10 text-blue-600" />,
                title: t('Share Your Location'),
                desc: 'Allow location access or enter your pickup point manually. RESQ-AI will find verified agents near you instantly.',
              },
              {
                step: '02',
                icon: <Bus className="h-10 w-10 text-blue-600" />,
                title: t('Find Nearby Transport'),
                desc: 'Browse available verified transport agents sorted by distance, rating, and vehicle type. Book in one tap.',
              },
              {
                step: '03',
                icon: <Shield className="h-10 w-10 text-blue-600" />,
                title: t('Travel Safely'),
                desc: 'Share your trip with emergency contacts. If anything feels wrong, trigger an alert instantly — parents and authorities are notified.',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="text-5xl font-black text-blue-100 mb-2">{item.step}</div>
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KEY FEATURES */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('Key Features')}</h2>
          <p className="text-center text-gray-500 mb-12">{t('Built specifically for rural student safety')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Navigation className="h-8 w-8 text-blue-600" />,
                title: 'Alternative Transport Discovery',
                desc: 'Find auto-rickshaws, cars, vans, and minibuses in your area with real-time availability.',
                color: 'bg-blue-50',
              },
              {
                icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
                title: 'Emergency Safety Alert',
                desc: 'One-tap SOS sends your live location to emergency contacts and local authorities immediately.',
                color: 'bg-red-50',
              },
              {
                icon: <Navigation className="h-8 w-8 text-green-600" />,
                title: 'Real-time Tracking',
                desc: 'Share your live trip with parents and guardians. Know exactly where you are at all times.',
                color: 'bg-green-50',
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-purple-600" />,
                title: 'Verified Agents',
                desc: 'All transport agents are manually verified with vehicle documents before appearing in searches.',
                color: 'bg-purple-50',
              },
            ].map((f) => (
              <div key={f.title} className={`${f.color} rounded-2xl p-6 hover:shadow-md transition-shadow`}>
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: <Users className="h-8 w-8 mx-auto mb-2 text-blue-200" />, value: '500+', label: 'Students Protected' },
            { icon: <Bus className="h-8 w-8 mx-auto mb-2 text-blue-200" />, value: '120+', label: 'Verified Agents' },
            { icon: <Clock className="h-8 w-8 mx-auto mb-2 text-blue-200" />, value: '<2 min', label: 'Avg. Response Time' },
          ].map((s) => (
            <div key={s.label}>
              {s.icon}
              <div className="text-4xl font-black">{s.value}</div>
              <div className="text-blue-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SAFETY & PRIVACY */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-shrink-0 bg-blue-50 rounded-full p-6">
              <Lock className="h-16 w-16 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Safety & Privacy First</h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                RESQ-AI is built with privacy at its core. Your location is only shared with agents you explicitly contact,
                and emergency contacts you choose. We never sell your data. All communications are encrypted, and you can
                delete your account at any time.
              </p>
              <ul className="space-y-2">
                {[
                  'End-to-end encrypted communications',
                  'Location shared only with your permission',
                  'Emergency contacts notified instantly',
                  'Data deletion on request',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to travel safer?</h2>
          <p className="text-gray-500 mb-8">Join thousands of rural students who travel with confidence every day.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/student/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Star className="h-5 w-5" /> Register as Student
            </Link>
            <Link
              to="/agent/register"
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Phone className="h-5 w-5" /> Register as Agent
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-blue-400" />
          <span className="text-white font-bold text-base">RESQ-AI</span>
        </div>
        <p>RESQ-AI © 2024 | Rural Alternative Transportation & Student Safety Platform</p>
        <p className="mt-1 text-gray-500">Built with ❤️ by <span className="text-blue-400 font-semibold">Team Token Titans</span></p>
        <div className="mt-4 flex justify-center gap-6 text-xs">
          <Link to="/student/login" className="hover:text-white transition-colors">Student Portal</Link>
          <Link to="/agent/login" className="hover:text-white transition-colors">Agent Portal</Link>
          <Link to="/student/register" className="hover:text-white transition-colors">Get Started</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
