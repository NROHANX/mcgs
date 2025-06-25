import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/home/HeroSection';
import FeatureSection from '../components/home/FeatureSection';
import TestimonialSection from '../components/home/TestimonialSection';
import ServicesBanner from '../components/home/ServicesBanner';
import TrustBanner from '../components/home/TrustBanner';
import CTABanner from '../components/home/CTABanner';
import ServiceBookingModal from '../components/ui/ServiceBookingModal';

const Home: React.FC = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearch = (query: string, location: string) => {
    // Open booking modal with the searched service
    setSelectedService(query);
    setSelectedCategory(query);
    setIsBookingModalOpen(true);
  };

  const handleCategoryClick = (categoryId: string) => {
    // Map category IDs to service names
    const categoryMap: { [key: string]: string } = {
      '1': 'RO Technician',
      '2': 'AC Technician', 
      '3': 'Electrician',
      '4': 'Plumber',
      '5': 'Mechanic',
      '6': 'Carpenter',
      '7': 'Painter',
      '8': 'Cleaner',
      '9': 'Gardener'
    };
    
    const serviceName = categoryMap[categoryId] || categoryId;
    setSelectedService(serviceName);
    setSelectedCategory(serviceName);
    setIsBookingModalOpen(true);
  };

  const handleServiceBooking = (serviceName: string, category?: string) => {
    setSelectedService(serviceName);
    setSelectedCategory(category || serviceName);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onCategoryClick={handleCategoryClick} />
      
      <main className="flex-grow">
        <HeroSection onSearch={handleSearch} />
        <ServicesBanner />
        <div className="container mx-auto px-4">
          <FeatureSection />
        </div>
        <TrustBanner />
        <CTABanner />
        <div className="container mx-auto px-4">
          <TestimonialSection />
        </div>
      </main>
      
      <ServiceBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        serviceName={selectedService}
        serviceCategory={selectedCategory}
      />
      
      <Footer />
    </div>
  );
};

export default Home;