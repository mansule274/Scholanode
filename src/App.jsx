import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import logoMark from './assets/vite.svg';
import { useUserContext } from './context/UserContext';

import PublicAppShell from './public/PublicAppShell';
import HomePage from './public/pages/HomePage';
import FeaturesPage from './public/pages/FeaturesPage';
import PricingPage from './public/pages/PricingPage';
import ContactPage from './public/pages/ContactPage';
import SchoolContactPage from './public/pages/SchoolContactPage';
import SchoolLoginPage from './public/pages/SchoolLoginPage';
import WatchDemoPage from './public/pages/WatchDemoPage';
import GetStarted from './public/pages/get-start/GetStarted';
import ForgotLoginId from './public/pages/forgot/ForgotLoginId';
import ForgotPassword from './public/pages/forgot/ForgotPassword';
import VerifyRecoveryCode from './public/pages/forgot/VerifyRecoveryCode';
import ResetPassword from './public/pages/forgot/ResetPassword';
import PaymentPage from './public/pages/payment/PaymentPage';
import PaymentSuccessPage from './public/pages/payment/PaymentSuccessPage';

import PrivateAppShell from './private/PrivateAppShell';
import Dashboard from './private/pages/dashboard/Dashboard';
import MyClassPage from './private/pages/dashboard/MyClassPage';
import ProfilePage from './private/pages/ProfilePage';
import SettingsPage from './private/pages/Settings';
import PlaceholderPage from './private/pages/PlaceholderPage';
import HelpSupport from './private/pages/HelpSupport';
import SchoolInquiries from './private/pages/SchoolInquiries';
import Timetable from './private/pages/Timetable';

import ChildProfilePage from './private/pages/parent/ChildProfilePage';
import ChildResultsPage from './private/pages/parent/ChildResultsPage';
import AnnouncementsPage from './private/pages/announcements/AnnouncementsPage';
import ComplaintsPage from './private/pages/complaints/ComplaintsPage';
import StudentManagement from './private/pages/people/StudentManagement';
import StaffManagement from './private/pages/people/StaffManagement';
import ParentManagement from './private/pages/people/ParentManagement';
import AcademicSetup from './private/pages/academic/AcademicSetup';
import Classes from './private/pages/academic/Classes';
import Subjects from './private/pages/academic/Subjects';
import SessionsTerms from './private/pages/academic/SessionsTerms';
import FormMasterAttendance from './private/pages/attendance/FormMasterAttendance';
import GateAccess from './private/pages/attendance/GateAccess';
import VerifyStudent from './private/pages/attendance/VerifyStudent';
import ScanHistoryPage from './private/pages/attendance/ScanHistoryPage';
import SchoolProfile from './private/pages/school-profile/SchoolProfile';
import ReferAndEarn from './private/pages/referal/ReferAndEarn';

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
      <Route path="/features" element={<PublicAppShell><FeaturesPage /></PublicAppShell>} />
      <Route path="/pricing" element={<PublicAppShell><PricingPage /></PublicAppShell>} />
      <Route path="/contact" element={<PublicAppShell><ContactPage /></PublicAppShell>} />
      <Route path="/school-contact" element={<PublicAppShell><SchoolContactPage /></PublicAppShell>} />
      <Route path="/school-login" element={<PublicAppShell><SchoolLoginPage /></PublicAppShell>} />
      <Route path="/watch-demo" element={<PublicAppShell><WatchDemoPage /></PublicAppShell>} />
      <Route path="/get-started" element={<PublicAppShell><GetStarted /></PublicAppShell>} />
      <Route path="/forgot-login-id" element={<PublicAppShell><ForgotLoginId /></PublicAppShell>} />
      <Route path="/forgot-password" element={<PublicAppShell><ForgotPassword /></PublicAppShell>} />
      <Route path="/verify-email" element={<PublicAppShell><VerifyRecoveryCode /></PublicAppShell>} />
      <Route path="/reset-password" element={<PublicAppShell><ResetPassword /></PublicAppShell>} />
      <Route path="/payment" element={<PublicAppShell><PaymentPage /></PublicAppShell>} />
      <Route path="/payment-success" element={<PublicAppShell><PaymentSuccessPage /></PublicAppShell>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function PrivateRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<PrivateAppShell pageTitle="Dashboard"><Dashboard /></PrivateAppShell>} />
      <Route path="/profile" element={<PrivateAppShell pageTitle="My Profile"><ProfilePage /></PrivateAppShell>} />
      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

      {/* People */}
      <Route path="/students" element={<PrivateAppShell pageTitle="Students"><StudentManagement /></PrivateAppShell>} />
      <Route path="/staff" element={<PrivateAppShell pageTitle="Staff"><StaffManagement /></PrivateAppShell>} />
      <Route path="/parents" element={<PrivateAppShell pageTitle="Parents"><ParentManagement /></PrivateAppShell>} />

      {/* Academic */}
      <Route path="/academic-setup" element={<PrivateAppShell pageTitle="Academic Setup"><AcademicSetup /></PrivateAppShell>} />
      <Route path="/classes" element={<PrivateAppShell pageTitle="Classes"><Classes /></PrivateAppShell>} />
      <Route path="/subjects" element={<PrivateAppShell pageTitle="Subjects"><Subjects /></PrivateAppShell>} />
      <Route path="/sessions-terms" element={<PrivateAppShell pageTitle="Sessions & Terms"><SessionsTerms /></PrivateAppShell>} />
      <Route path="/my-class" element={<PrivateAppShell pageTitle="My Class"><MyClassPage /></PrivateAppShell>} />
      <Route path="/results" element={<PrivateAppShell pageTitle="Examinations & Results"><PlaceholderPage title="Examinations & Results" description="Exam results, assessment records, and report generation will appear here." /></PrivateAppShell>} />

      {/* Attendance & security */}
      <Route path="/attendance" element={<PrivateAppShell pageTitle="Form Master Attendance"><FormMasterAttendance /></PrivateAppShell>} />
      <Route path="/gate-access" element={<PrivateAppShell pageTitle="Gate Access"><GateAccess /></PrivateAppShell>} />
      <Route path="/verify-student" element={<PrivateAppShell pageTitle="Verify Student"><VerifyStudent /></PrivateAppShell>} />
      <Route path="/scan-history" element={<PrivateAppShell pageTitle="Gate Scan History"><ScanHistoryPage /></PrivateAppShell>} />

      {/* Parents */}
      <Route path="/children/:studentId/profile" element={<PrivateAppShell pageTitle="Student Profile"><ChildProfilePage /></PrivateAppShell>} />
      <Route path="/children/:studentId/results" element={<PrivateAppShell pageTitle="Student Results"><ChildResultsPage /></PrivateAppShell>} />

      {/* School communication */}
      <Route path="/announcements" element={<PrivateAppShell pageTitle="Announcements"><AnnouncementsPage /></PrivateAppShell>} />
      <Route path="/complaints" element={<PrivateAppShell pageTitle="Complaints"><ComplaintsPage /></PrivateAppShell>} />

      {/* Student */}
      <Route path="/student-subjects" element={<PrivateAppShell pageTitle="My Subjects"><PlaceholderPage title="My Subjects" description="Subjects offered by the student's class will appear here." /></PrivateAppShell>} />
      <Route path="/student-attendance" element={<PrivateAppShell pageTitle="My Attendance"><PlaceholderPage title="My Attendance" description="Daily attendance records and reports will appear here." /></PrivateAppShell>} />
      <Route path="/student-results" element={<PrivateAppShell pageTitle="My Results"><PlaceholderPage title="My Results" description="Published scores, grades, and positions will appear here." /></PrivateAppShell>} />

      {/* Operations & support */}
      <Route path="/messages" element={<PrivateAppShell pageTitle="Messages"><PlaceholderPage title="Messages" description="Internal staff communication will appear here." /></PrivateAppShell>} />
      <Route path="/notifications" element={<PrivateAppShell pageTitle="Notifications"><PlaceholderPage title="Notifications" description="Notifications and inbox alerts will appear here." /></PrivateAppShell>} />
      <Route path="/timetable" element={<PrivateAppShell pageTitle="Timetable"><Timetable /></PrivateAppShell>} />
      <Route path="/help-support" element={<PrivateAppShell pageTitle="Help & Support"><HelpSupport /></PrivateAppShell>} />
      <Route path="/school-inquiries" element={<PrivateAppShell pageTitle="School Inquiries"><SchoolInquiries /></PrivateAppShell>} />

      {/* School account */}
      <Route path="/school-profile" element={<PrivateAppShell pageTitle="School Profile"><SchoolProfile /></PrivateAppShell>} />
      <Route path="/refer-earn" element={<PrivateAppShell pageTitle="Refer & Earn"><ReferAndEarn /></PrivateAppShell>} />
      <Route path="/settings" element={<PrivateAppShell pageTitle="Settings"><SettingsPage /></PrivateAppShell>} />

      {/* Public routes are not reachable while signed in */}
      <Route path="/school-login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/watch-demo" element={<Navigate to="/dashboard" replace />} />
      <Route path="/get-started" element={<Navigate to="/dashboard" replace />} />
      <Route path="/forgot-login-id" element={<Navigate to="/dashboard" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/dashboard" replace />} />
      <Route path="/verify-email" element={<Navigate to="/dashboard" replace />} />
      <Route path="/reset-password" element={<Navigate to="/dashboard" replace />} />
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
