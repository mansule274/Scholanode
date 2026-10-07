

import FeaturesBar from "./FeaturesBar";
import Footer from "../../components/Footer";
import Hero from "./Hero";
import SchoolSearch from "./SchoolSearch";
import WelcomeCard from "./WelcomeCard";


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