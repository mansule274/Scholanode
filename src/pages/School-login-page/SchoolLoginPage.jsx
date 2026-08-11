import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
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

export default function SchoolLoginPage({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top spacing under navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back link */}
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onBack?.();
          }}
          className="inline-flex items-center gap-2 text-[#071A52] font-medium hover:underline mb-6 cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back to all schools
        </a>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT - Login Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            {/* School branding */}
            <div className="text-center space-y-4">
              <div className="w-28 h-28 mx-auto rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                {/* Replace with your real school logo */}
                <img
                  src="/school-logo.png"
                  alt="School Logo"
                  className="w-20 h-20 object-contain"
                />
              </div>

              <div>
                <h1 className="text-3xl font-extrabold text-[#071A52]">
                  FUD International School
                </h1>
                <p className="text-slate-500 mt-1">fud-international</p>
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
            <form className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />

                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#071A52]/10 focus:border-[#071A52] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
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
                    type="password"
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-20 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#071A52]/10 focus:border-[#071A52] transition-all"
                  />

                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#071A52] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye size={16} />
                    Show
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="accent-[#071A52]" />
                  Keep me signed in
                </label>

                <a
                  href="#"
                  className="text-sm font-medium text-[#071A52] hover:underline cursor-pointer"
                >
                  Forgot password?
                </a>
              </div>

              {/* Login button */}
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#071A52] text-white font-semibold hover:bg-[#0A2463] shadow-lg shadow-[#071A52]/20 transition-all cursor-pointer"
              >
                <LogIn size={20} />
                Log in
              </button>
            </form>

            {/* Help section */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-2">
              <p className="font-semibold text-slate-800">Need help?</p>
              <p className="text-slate-500 max-w-md mx-auto">
                If you're having trouble accessing your account, please contact
                your school administrator.
              </p>
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
                "Students: Use your admission number or school email to log in.",
                "Teachers & Staff: Use the email provided by the school.",
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
                "If you've forgotten your login details, contact your school administrator.",
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
                <ContactRow icon={Mail} text="support@fudinternational.edu.ng" />
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
            <CheckCircle2 className={`mt-0.5 ${s.bullet}`} size={18} />
            <span className="leading-relaxed">{item}</span>
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