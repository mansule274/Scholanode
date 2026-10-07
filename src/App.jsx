import Navbar from './components/Navbar';
import HomePage from './pages/landing-page/HomePage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SchoolLoginPage from './pages/School-login-page/SchoolLoginPage';
import FeaturesBar from './pages/landing-page/FeaturesBar';
import GetStarted from './pages/get-start/GetStarted';
import ReferAndEarn from './pages/referal/ReferAndEarn';
import AdminDashboard from './pages/admin-dashboard/AdminDashboard';
import SchoolProfile from './pages/school-profile/SchoolProfile';
import PaymentPage from './pages/payment/PaymentPage';
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage';
import AcademicSetup from './pages/academic/AcademicSetup';
import ForgotLoginId from './pages/forgot/ForgotLoginId';
import ForgotPassword from './pages/forgot/ForgotPassword';
import VerifyRecoveryCode from './pages/forgot/VerifyRecoveryCode';
import ResetPassword from './pages/forgot/ResetPassword';
import WatchDemoPage from './pages/landing-page/WatchDemoPage';
import SessionsTerms from './pages/academic/SessionsTerms';
import Subjects from './pages/academic/Subjects';
import Classes from './pages/academic/Classes';
import StaffManagement from './pages/academic/StaffManagement';
import StudentManagement from './pages/academic/StudentManagement';


export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Navbar />

        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/watch-demo' element={<WatchDemoPage />} />
          <Route path='/school-login' element={<SchoolLoginPage />} />
          <Route path='/test' element={<FeaturesBar />} />
          <Route path='/get-started' element={<GetStarted />} />
          <Route path='/admin' element={<AdminDashboard />} />
          <Route path='/school-profile' element={<SchoolProfile />} />
          <Route path='/academic-setup' element={<AcademicSetup />} />
          <Route path='/payment' element={<PaymentPage />} />
            <Route path='/payment-success' element={<PaymentSuccessPage />} />
          <Route path='/refer-earn' element={<ReferAndEarn />} />
          <Route path='/forgot-login-id' element={<ForgotLoginId />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/verify-email' element={<VerifyRecoveryCode />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='/sessions-terms' element={<SessionsTerms />} />
          <Route path='/classes' element={<Classes />} />
          <Route path='/subjects' element={<Subjects />} />
          <Route path='/staff' element={<StaffManagement />} />
          <Route path='/students' element={<StudentManagement />} />
        </Routes>

        {/* <ToastContainer position="top-right" autoClose={5000} style={{ zIndex: 9999 }} /> */}
      </div>
    </BrowserRouter>
  );
}