

import FeaturesBar from "../components/FeaturesBar";
import Footer from "../../components/Footer";
import Hero from "../components/Hero";
import SchoolSearch from "../components/SchoolSearch";
import WelcomeCard from "../components/WelcomeCard";


const HomePage = () => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
           <Hero />
          <WelcomeCard />
          <SchoolSearch />
          <FeaturesBar />
          <Footer />
 </main>

    );
}

export default HomePage;