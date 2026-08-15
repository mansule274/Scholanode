import Navbar from './components/Navbar';
import HomePage from './pages/landing-page/HomePage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SchoolLoginPage from './pages/School-login-page/SchoolLoginPage';
import { ToastContainer } from 'react-toastify';
import FeaturesBar from './pages/landing-page/FeaturesBar';
import GetStarted from './pages/get-start/GetStarted';


export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Navbar />

        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/school-login' element={<SchoolLoginPage />} />
          <Route path='/test' element={<FeaturesBar />} />
          <Route path='/get-started' element={<GetStarted />} />
        </Routes>

        <ToastContainer position="top-right" autoClose={5000} style={{ zIndex: 9999 }} />
      </div>
    </BrowserRouter>
  );
}