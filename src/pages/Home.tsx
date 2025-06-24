import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/home/HeroSection';
import ProviderList from '../components/providers/ProviderList';
import FeatureSection from '../components/home/FeatureSection';
import TestimonialSection from '../components/home/TestimonialSection';
import ProviderDetails from '../components/providers/ProviderDetails';
import ServicesBanner from '../components/home/ServicesBanner';
import TrustBanner from '../components/home/TrustBanner';
import CTABanner from '../components/home/CTABanner';
import { providers, getProviderById, getProvidersByCategory, searchProviders } from '../data/mockData';

const Home: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [filteredProviders, setFilteredProviders] = useState(providers);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryTitle, setCategoryTitle] = useState('Top Service Providers');

  const handleSearch = (query: string, location: string) => {
    const results = searchProviders(query);
    setFilteredProviders(results);
    setCategoryTitle(`Search results for "${query}"`);
    setSearchQuery(query);
    setSelectedProvider(null);
  };

  const handleCategoryClick = (categoryId: string) => {
    const categoryProviders = getProvidersByCategory(categoryId);
    const categoryName = categoryProviders.length > 0 ? categoryProviders[0].category : '';
    setFilteredProviders(categoryProviders);
    setCategoryTitle(`${categoryName} Providers`);
    setSearchQuery('');
    setSelectedProvider(null);
  };

  const handleProviderClick = (providerId: string) => {
    setSelectedProvider(providerId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToResults = () => {
    setSelectedProvider(null);
  };

  const resetToHome = () => {
    setSelectedProvider(null);
    setFilteredProviders(providers);
    setSearchQuery('');
    setCategoryTitle('Top Service Providers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedProviderData = selectedProvider ? getProviderById(selectedProvider) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header onCategoryClick={handleCategoryClick} />
      
      <main className="flex-grow">
        {!selectedProvider && (
          <>
            <HeroSection onSearch={handleSearch} />
            <ServicesBanner />
            <div className="container mx-auto px-4">
              <ProviderList 
                providers={filteredProviders} 
                onProviderClick={handleProviderClick} 
                title={categoryTitle}
                emptyMessage={searchQuery ? `No results found for "${searchQuery}"` : 'No providers available in this category'}
              />
              <FeatureSection />
            </div>
            <TrustBanner />
            <CTABanner />
            <div className="container mx-auto px-4">
              <TestimonialSection />
            </div>
          </>
        )}

        {selectedProvider && selectedProviderData && (
          <div className="container mx-auto px-4 py-8">
            <ProviderDetails 
              provider={selectedProviderData}
              onBack={handleBackToResults}
            />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;