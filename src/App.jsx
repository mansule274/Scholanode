import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import logoMark from './assets/vite.svg';
import { useUserContext } from './context/UserContext';

import PublicAppShell from './public/PublicAppShell';
import PublicHomePage from './public/pages/HomePage';
import PublicLoginPage from './public/pages/LoginPage';
import PublicFeaturesPage from './public/pages/FeaturesPage';
import PublicPricingPage from './public/pages/PricingPage';
import PublicContactPage from './public/pages/ContactPage';

import PrivateAppShell from './private/PrivateAppShell';
import PrivateDashboardPage from './private/pages/DashboardPage';
import PrivateStudentsPage from './private/pages/StudentsPage';
import PrivateStaffPage from './private/pages/StaffPage';
import PrivateClassesPage from './private/pages/ClassesPage';
import PrivateSubjectsPage from './private/pages/SubjectsPage';
import PrivateSessionsTermsPage from './private/pages/SessionsTermsPage';
import PrivateResultsPage from './private/pages/ResultsPage';
import PrivateAttendancePage from './private/pages/AttendancePage';
import PrivatePaymentsPage from './private/pages/PaymentsPage';
import PrivateMessagesPage from './private/pages/MessagesPage';
import PrivateNotificationsPage from './private/pages/NotificationsPage';
import PrivateProfilePage from './private/pages/ProfilePage';
import PrivateSettingsPage from './private/pages/Settings';
import PrivateLogoutPage from './private/pages/LogoutPage';

import HomePage from './pages/landing-page/HomePage';
import SchoolLoginPage from './pages/School-login-page/SchoolLoginPage';
import FeaturesBar from './pages/landing-page/FeaturesBar';
import GetStarted from './pages/get-start/GetStarted';
import ReferAndEarn from './pages/referal/ReferAndEarn';
import Dashboard from './pages/dashboard/Dashboard';
import SchoolProfile from './pages/school-profile/SchoolProfile';
import PaymentPage from './pages/payment/PaymentPage';
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage';
import AcademicSetup from './pages/academic/AcademicSetup';
import ForgotLoginId from './pages/forgot/ForgotLoginId';
import ForgotPassword from './pages/forgot/ForgotPassword';
import VerifyRecoveryCode from './pages/forgot/VerifyRecoveryCode';
import ResetPassword from './pages/forgot/ResetPassword';
import WatchDemoPage from './pages/landing-page/WatchDemoPage';
import SchoolContactPage from './pages/landing-page/SchoolContactPage';
import SessionsTerms from './pages/academic/SessionsTerms';
import Subjects from './pages/academic/Subjects';
import Classes from './pages/academic/Classes';
import StaffManagement from './pages/people/StaffManagement';
import StudentManagement from './pages/people/StudentManagement';
import ParentManagement from './pages/people/ParentManagement';
import FormMasterAttendance from './pages/attendance/FormMasterAttendance';
import GateAccess from './pages/attendance/GateAccess';
import MyClassPage from './pages/dashboard/MyClassPage';
import StudentPlaceholderPage from './pages/student/StudentPlaceholderPage';
import VerifyStudent from './pages/attendance/VerifyStudent';
import ScanHistoryPage from './pages/attendance/ScanHistoryPage';

// test veiw parent dashbord private
import ParentDashboard from './pages/dashboard/ParentDashboard';
import Complaint from './private/pages/Complaint';


function AppLoadingScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(73,166,255,0.28),_transparent_35%),linear-gradient(135deg,#020817_0%,#0f172a_45%,#111827_100%)] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/10 bg-white/5 shadow-[0_0_30px_rgba(73,166,255,0.35)] backdrop-blur-sm">
          <div className="absolute inset-2 rounded-[22px] border border-white/10" />
          <img src={logoMark} alt="ScholaNode logo" className="h-12 w-12 object-contain drop-shadow-[0_0_18px_rgba(73,166,255,0.7)]" />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#49A6FF]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.48em] text-slate-300">Loading</p>
        </div>

        <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">ScholaNode</h1>
        <p className="mt-2 max-w-md text-sm text-slate-300">Preparing your workspace and secure access…</p>

        <div className="mt-8 h-1.5 w-56 overflow-hidden rounded-full bg-slate-800/80">
          <div className="h-full w-1/2 animate-[pulse_1.6s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#49A6FF] via-[#7dd3fc] to-[#dbeafe]" />
        </div>
      </div>
    </div>
  );
}

function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicAppShell><HomePage /></PublicAppShell>} />
      <Route path="/features" element={<PublicAppShell><PublicFeaturesPage /></PublicAppShell>} />
      <Route path="/pricing" element={<PublicAppShell><PublicPricingPage /></PublicAppShell>} />
      <Route path="/contact" element={<PublicAppShell><PublicContactPage /></PublicAppShell>} />
      <Route path="/school-login" element={<PublicAppShell><SchoolLoginPage /></PublicAppShell>} />
      <Route path="/watch-demo" element={<PublicAppShell><WatchDemoPage /></PublicAppShell>} />
      <Route path="/get-started" element={<PublicAppShell><GetStarted /></PublicAppShell>} />
      <Route path="/forgot-login-id" element={<PublicAppShell><ForgotLoginId /></PublicAppShell>} />
      <Route path="/forgot-password" element={<PublicAppShell><ForgotPassword /></PublicAppShell>} />
      <Route path="/verify-email" element={<PublicAppShell><VerifyRecoveryCode /></PublicAppShell>} />
      <Route path="/reset-password" element={<PublicAppShell><ResetPassword /></PublicAppShell>} />
      <Route path="/landing" element={<PublicAppShell><PublicHomePage /></PublicAppShell>} />
      <Route path="/school-login-legacy" element={<PublicAppShell><PublicLoginPage /></PublicAppShell>} />
      <Route path="/school-contact" element={<PublicAppShell><SchoolContactPage /></PublicAppShell>} />
      <Route path="/test" element={<FeaturesBar />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/school-profile" element={<SchoolProfile />} />
      <Route path="/academic-setup" element={<AcademicSetup />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      <Route path="/refer-earn" element={<ReferAndEarn />} />
      <Route path="/sessions-terms" element={<SessionsTerms />} />
      <Route path="/classes" element={<Classes />} />
      <Route path="/subjects" element={<Subjects />} />
      <Route path="/staff" element={<StaffManagement />} />
      <Route path="/students" element={<StudentManagement />} />
      <Route path="/parents" element={<ParentManagement />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function PrivateRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<PrivateAppShell pageTitle="Dashboard"><Dashboard /></PrivateAppShell>} />
      <Route path="/profile" element={<PrivateAppShell pageTitle="My Profile"><PrivateProfilePage /></PrivateAppShell>} />
      <Route path="/my-profile" element={<Navigate to="/profile" replace />} />
      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
      <Route path="/staff-dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/private/dashboard" element={<Navigate to="/dashboard" replace />} />

      {/* People & Academic Management */}
      <Route path="/students" element={<PrivateAppShell pageTitle="Students"><StudentManagement /></PrivateAppShell>} />
      <Route path="/private/students" element={<Navigate to="/students" replace />} />
      <Route path="/staff" element={<PrivateAppShell pageTitle="Staff"><StaffManagement /></PrivateAppShell>} />
      <Route path="/private/staff" element={<Navigate to="/staff" replace />} />
      <Route path="/parents" element={<PrivateAppShell pageTitle="Parents"><ParentManagement /></PrivateAppShell>} />
      <Route path="/private/parents" element={<Navigate to="/parents" replace />} />
      <Route path="/gate-access" element={<PrivateAppShell pageTitle="Gate Access"><GateAccess /></PrivateAppShell>} />
      <Route path="/private/gate-access" element={<Navigate to="/gate-access" replace />} />
      <Route path="/attendance" element={<PrivateAppShell pageTitle="Form Master Attendance"><FormMasterAttendance /></PrivateAppShell>} />
      <Route path="/my-class" element={<PrivateAppShell pageTitle="My Class"><MyClassPage /></PrivateAppShell>} />
      <Route path="/student-subjects" element={<PrivateAppShell pageTitle="My Subjects"><StudentPlaceholderPage title="My Subjects" description="Subjects offered by the student's class will appear here." /></PrivateAppShell>} />
      <Route path="/student-attendance" element={<PrivateAppShell pageTitle="My Attendance"><StudentPlaceholderPage title="My Attendance" description="Daily attendance records and reports will appear here." /></PrivateAppShell>} />
      <Route path="/student-results" element={<PrivateAppShell pageTitle="My Results"><StudentPlaceholderPage title="My Results" description="Published scores, grades, and positions will appear here." /></PrivateAppShell>} />
      <Route path="/student-announcements" element={<PrivateAppShell pageTitle="Announcements"><StudentPlaceholderPage title="Announcements" description="Official school notices and updates will appear here." /></PrivateAppShell>} />
      <Route path="/student-complaints" element={<PrivateAppShell pageTitle="Complaints"><StudentPlaceholderPage title="Complaints" description="Complaint status and responses will appear here once this feature is ready." /></PrivateAppShell>} />
      <Route path="/student-profile" element={<PrivateAppShell pageTitle="My Profile"><StudentPlaceholderPage title="My Profile" description="Basic student information and account details will appear here." /></PrivateAppShell>} />
      <Route path="/classes" element={<PrivateAppShell pageTitle="Classes"><Classes /></PrivateAppShell>} />
      <Route path="/private/classes" element={<Navigate to="/classes" replace />} />
      <Route path="/subjects" element={<PrivateAppShell pageTitle="Subjects"><Subjects /></PrivateAppShell>} />
      <Route path="/private/subjects" element={<Navigate to="/subjects" replace />} />
      <Route path="/sessions-terms" element={<PrivateAppShell pageTitle="Sessions & Terms"><SessionsTerms /></PrivateAppShell>} />
      <Route path="/private/sessions-terms" element={<Navigate to="/sessions-terms" replace />} />
      <Route path="/academic-setup" element={<PrivateAppShell pageTitle="Academic Setup"><AcademicSetup /></PrivateAppShell>} />
      {/* Security & Gate Verification */}
      <Route path="/verify-student" element={<PrivateAppShell pageTitle="Verify Student"><VerifyStudent /></PrivateAppShell>} />
      <Route path="/parent-test-view" element={<PrivateAppShell pageTitle="Gate Scan History"><ParentDashboard /></PrivateAppShell>} />
      {/* Parent Dashboard */}
        <Route path="/scan-history" element={<PrivateAppShell pageTitle="Gate Scan History"><ScanHistoryPage /></PrivateAppShell>} />
        {/* <Route path="/student-test" element={<PrivateAppShell pageTitle="Gate Scan History"><Student /></PrivateAppShell>} /> */}
      {/* Examinations & Operations */}
      <Route path="/private/results" element={<PrivateAppShell pageTitle="Examinations & Results"><PrivateResultsPage /></PrivateAppShell>} />
      <Route path="/private/attendance" element={<PrivateAppShell pageTitle="Attendance"><PrivateAttendancePage /></PrivateAppShell>} />
      <Route path="/payment" element={<PrivateAppShell pageTitle="Fees & Payments"><PaymentPage /></PrivateAppShell>} />
      <Route path="/private/payments" element={<Navigate to="/payment" replace />} />
      <Route path="/payment-success" element={<PrivateAppShell pageTitle="Payment Success"><PaymentSuccessPage /></PrivateAppShell>} />
      <Route path="/private/messages" element={<PrivateAppShell pageTitle="Messages"><PrivateMessagesPage /></PrivateAppShell>} />
      <Route path="/private/notifications" element={<PrivateAppShell pageTitle="Notifications"><PrivateNotificationsPage /></PrivateAppShell>} />

      {/* School Setup & Profile */}
      <Route path="/school-profile" element={<PrivateAppShell pageTitle="School Profile"><SchoolProfile /></PrivateAppShell>} />
      <Route path="/private/profile" element={<Navigate to="/profile" replace />} />
      <Route path="/refer-earn" element={<PrivateAppShell pageTitle="Refer & Earn"><ReferAndEarn /></PrivateAppShell>} />
      <Route path="/settings" element={<PrivateAppShell pageTitle="Settings"><PrivateSettingsPage /></PrivateAppShell>} />
      <Route path="/private/settings" element={<Navigate to="/settings" replace />} />
      <Route path="/private/security" element={<Navigate to="/settings" replace />} />
      <Route path="/private/logout" element={<PrivateAppShell pageTitle="Logout"><PrivateLogoutPage /></PrivateAppShell>} />

      {/* Redirects */}
      <Route path="/school-login" element={<Navigate to="/admin" replace />} />
      <Route path="/watch-demo" element={<Navigate to="/admin" replace />} />
      <Route path="/get-started" element={<Navigate to="/admin" replace />} />
      <Route path="/forgot-login-id" element={<Navigate to="/admin" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/admin" replace />} />
      <Route path="/verify-email" element={<Navigate to="/admin" replace />} />
      <Route path="/reset-password" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        {isAuthenticated ? <PrivateRoutes /> : <PublicRoutes />}
      </div>
    </BrowserRouter>
  );
}