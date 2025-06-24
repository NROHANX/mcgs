import React from 'react';
import { Gift, Star, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const PromoBanner: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-12 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <Gift className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Limited Time Offer</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get 20% OFF on Your First Service
          </h2>
          
          <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
            Book any service today and save big! Professional, reliable, and affordable services at your doorstep.
          </p>
          
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <Star className="h-5 w-5 mr-2" />
              <span className="font-medium">Verified Professionals</span>
            </div>
          </div>
          
          <Button 
            size="lg"
            className="bg-white text-orange-600 hover:bg-gray-100 font-semibold shadow-lg"
            icon={<ArrowRight className="h-5 w-5" />}
          >
            Book Now & Save
          </Button>
          
          <p className="text-sm text-white/80 mt-4">
            Use code: <span className="font-bold bg-white/20 px-2 py-1 rounded">FIRST20</span> | Valid till month end
          </p>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;