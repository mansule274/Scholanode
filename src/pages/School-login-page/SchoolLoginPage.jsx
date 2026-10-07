import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  Shield,
  User,
  Headphones,
  Phone,
  MapPin,
  Clock,
  Send,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import publicAxiosInstance from '../../auth/publicAxiosInstance';

export default function SchoolLoginPage({ onBack }) {
  const navigate = useNavigate();
  const location = useLocation();
  const school = location.state?.school || {};
  const schoolName = school.name || school.schoolName || 'School';
  const schoolCode = school.code || school.schoolCode || 'school-code';
  const schoolLogo = school.logoUrl || school.logo_url || null;
  const contactEmail = school.contactEmail || school.email || school.schoolEmail || 'support@school.edu.ng';
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLoginId, setRememberLoginId] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const initials = schoolName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('') || 'S';

  const handleLogin = async (event) => {
    event.preventDefault();

    const trimmedLoginId = loginId.trim();
    if (!trimmedLoginId || !password.trim()) {
      setLoginError('Please enter your login ID and password.');
      return;
    }

    setLoading(true);
    setLoginError('');

    try {
      const payload = {
        schoolCode,
        loginId: trimmedLoginId,
        password,
      };

      console.log('Login request payload:', payload);
      const response = await publicAxiosInstance.post('/auths/login', payload);
      console.log('Login success response:', response.data);
      localStorage.setItem('accessToken', response.data.accessToken);
      navigate('/school-dashboard', { state: { school, user: response.data?.data } });
    } catch (error) {
      console.error('Login request failed:', {
        payload: {
          schoolCode,
          loginId: trimmedLoginId,
          password,
        },
        error: error?.response?.data || error,
      });
      setLoginError(error?.response?.data?.message || 'Login failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top spacing under navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back link */}
        <button
          type="button"
          onClick={() => (onBack ? onBack() : navigate(-1))}
          className="inline-flex items-center gap-2 text-[#071A52] font-medium hover:underline mb-6 cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back to all schools
        </button>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT - Login Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            {/* School branding */}
            <div className="text-center space-y-4">
              <div className="w-28 h-28 mx-auto rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                {schoolLogo ? (
                  <img src={schoolLogo} alt={schoolName} className="w-20 h-20 object-contain" />
                ) : (
                  <span className="text-3xl font-bold text-[#071A52]">{initials}</span>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-extrabold text-[#071A52]">
                  {schoolName}
                </h1>
                <p className="text-slate-500 mt-1">{schoolCode}</p>
              </div>

              <p className="text-emerald-600 font-semibold text-lg">
                Excellence Through Knowledge
              </p>
            </div>

            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200" />
              <Shield className="text-slate-400" size={18} />
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Welcome box */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#071A52] text-white flex items-center justify-center">
                <User size={22} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 text-lg">Welcome back!</h2>
                <p className="text-slate-600">
                  Sign in to access your school's portal.
                </p>
              </div>
            </div>

            {/* Login form */}
            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Login ID
                </label>

                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />

                  <input
                    type="text"
                    value={loginId}
                    onChange={(event) => setLoginId(event.target.value)}
                    placeholder="Enter your login ID"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#071A52]/10 focus:border-[#071A52] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-20 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#071A52]/10 focus:border-[#071A52] transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((currentValue) => !currentValue)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#071A52] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {loginError}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberLoginId}
                    onChange={(event) => setRememberLoginId(event.target.checked)}
                    className="accent-[#071A52]"
                  />
                  Remember my login ID
                </label>

                <div className="flex flex-col items-start gap-1 text-sm sm:items-end">
                  <Link to="/forgot-password" className="font-medium text-[#071A52] hover:underline cursor-pointer">
                    Forgot password?
                  </Link>
                  <Link to="/forgot-login-id" className="font-medium text-[#071A52] hover:underline cursor-pointer">
                    Forgot login ID?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#071A52] text-white font-semibold hover:bg-[#0A2463] shadow-lg shadow-[#071A52]/20 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogIn size={20} />
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            {/* Help section */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-2">
              <p className="font-semibold text-slate-800">Need help?</p>
              <p className="text-slate-500 max-w-md mx-auto">
                If you're having trouble accessing your account, please contact
                your school administrator.
              </p>
              <a
                href={`mailto:${contactEmail}?subject=${encodeURIComponent('School Login Support')}`}
                className="inline-block text-sm font-medium text-[#071A52] hover:underline"
              >
                Contact school
              </a>
            </div>
          </div>

          {/* RIGHT - Info Cards */}
          <div className="space-y-6">
            {/* Login Instructions */}
            <InfoCard
              color="blue"
              icon={Shield}
              title="Login Instructions"
              items={[
                "Students: Use your admission number to log in.",
                "Teachers & Staff: Use the system-generated Staff Login ID provided by your school.",
                "Contact the school administrator if you cannot access your account.",
              ]}
            />

            {/* Registration Guidelines */}
            <InfoCard
              color="green"
              icon={CheckCircle2}
              title="Registration Guidelines"
              items={[
                "Student, teacher, and parent accounts are created by the school administrator.",
                "Self-registration is not available.",
                "If you don't have an account, please contact your school.",
                "If you've forgotten your password or login ID, use the recovery options. If you're still unable to recover your details, contact your school administrator.",
              ]}
            />

            {/* Help Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Headphones size={22} />
                </div>
                <h3 className="font-bold text-lg text-slate-900">
                  Need More Help?
                </h3>
              </div>

              <p className="text-slate-600">
                Our support team is here to help you.
              </p>

              <div className="space-y-4 text-sm">
                <ContactRow icon={Mail} text={contactEmail} />
                <ContactRow icon={Phone} text="+234 703 123 4567" />
                <ContactRow
                  icon={MapPin}
                  text="P.M.B 7156, Dutse, Jigawa State, Nigeria"
                />
                <ContactRow icon={Clock} text="Mon – Fri: 8:00 AM – 4:00 PM" />
              </div>
            </div>
          </div>
        </div>

        {/* About School */}
        <div className="mt-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="flex justify-center lg:justify-start">
              <div className="w-56 h-40 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                <img
                  src="/school-building.png"
                  alt="School Building"
                  className="w-44 h-28 object-contain"
                />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-2xl font-bold text-[#071A52]">
                About FUD International School
              </h3>

              <p className="text-slate-600 leading-relaxed">
                FUD International School is committed to providing quality
                education that empowers students to become leaders and innovators
                of tomorrow. We nurture excellence, discipline, and values in a
                safe and supportive learning environment.
              </p>

              <a
                href="#"
                className="inline-flex items-center gap-2 text-[#071A52] font-semibold hover:underline cursor-pointer"
              >
                Visit our website
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 bg-[#071A52] text-white rounded-3xl overflow-hidden">
          <div className="grid lg:grid-cols-5 gap-8 p-8">
            {/* Brand */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                  <Shield size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-xl">ScholarNode</h4>
                  <p className="text-white/70 text-sm">
                    School Management System
                  </p>
                </div>
              </div>

              <p className="text-white/80 max-w-md leading-relaxed">
                Empowering schools to manage students, teachers, classes, and
                more in one secure cloud platform.
              </p>
            </div>

            {/* Links */}
            <FooterLinks
              title="Product"
              links={['Features', 'Pricing', 'Security', 'Updates', 'Mobile App']}
            />

            <FooterLinks
              title="Company"
              links={['About Us', 'Careers', 'Blog', 'Contact Us', 'Privacy Policy']}
            />

            {/* Newsletter */}
            <div className="space-y-4">
              <h5 className="font-semibold text-lg">Newsletter</h5>
              <p className="text-white/70 text-sm">
                Get the latest updates and tips delivered to your inbox.
              </p>

              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 placeholder:text-white/40 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />

                <button className="px-4 rounded-xl bg-cyan-400 text-[#071A52] hover:bg-cyan-300 transition-colors cursor-pointer">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/70">
            <p>© 2026 ScholarNode. All rights reserved.</p>

            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white cursor-pointer">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white cursor-pointer">
                Privacy Policy
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* -------------------- Reusable Components -------------------- */

function InfoCard({ icon: Icon, title, items, color = 'blue' }) {
  const styles = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-100 text-blue-700',
      text: 'text-blue-900',
      bullet: 'text-blue-600',
    },
    green: {
      bg: 'bg-emerald-50',
      icon: 'bg-emerald-100 text-emerald-700',
      text: 'text-emerald-900',
      bullet: 'text-emerald-600',
    },
  };

  const s = styles[color];

  return (
    <div className={`rounded-3xl border border-slate-200 shadow-sm p-6 ${s.bg}`}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.icon}`}>
          <Icon size={22} />
        </div>
        <h3 className={`font-bold text-lg ${s.text}`}>{title}</h3>
      </div>

      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-slate-700">
            <CheckCircle2 className={`mt-0.5 shrink-0 ${s.bullet}`} size={20} />
            <span className="leading-relaxed text-[15px]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactRow({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
      <Icon className="text-[#071A52] mt-0.5" size={18} />
      <span className="text-slate-700 leading-relaxed">{text}</span>
    </div>
  );
}

function FooterLinks({ title, links }) {
  return (
    <div className="space-y-4">
      <h5 className="font-semibold text-lg">{title}</h5>
      <ul className="space-y-3 text-white/70 text-sm">
        {links.map((link) => (
          <li key={link}>
            <a href="#" className="hover:text-white transition-colors cursor-pointer">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}