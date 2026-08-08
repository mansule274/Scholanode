import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WelcomeCard from './components/WelcomeCard';
import SchoolSearch from './components/SchoolSearch';
import SchoolList from './components/SchoolList';
import FeaturesBar from './components/FeaturesBar';
import Footer from './components/Footer';
import SchoolLoginPage from './components/SchoolLoginPage';

export default function App() {
  const [showLoginPage, setShowLoginPage] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      {showLoginPage ? (
        <SchoolLoginPage onBack={() => setShowLoginPage(false)} />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <Hero onLoginClick={() => setShowLoginPage(true)} />
          <WelcomeCard />
          <SchoolSearch />
          <SchoolList />
          <FeaturesBar />
          <Footer />
        </main>
      )}

    </div>
  );
}