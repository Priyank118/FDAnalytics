import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import FaqSection from '../components/FaqSection'; 
import PricingSection from '../components/PricingSection';

function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <FaqSection /> {/* 2. Add it below the Features Section */}
    </>
  );
}

export default HomePage;