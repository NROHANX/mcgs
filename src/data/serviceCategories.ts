export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  averageRating: number;
  totalProviders: number;
  availability: 'Available Now' | 'Busy' | 'Limited Availability';
  services: string[];
  priceRange: string;
  responseTime: string;
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'ro-technician',
    name: 'RO Technician',
    icon: '💧',
    description: 'Professional water purifier installation, maintenance, and repair services for all major brands.',
    averageRating: 4.8,
    totalProviders: 28,
    availability: 'Available Now',
    services: ['Installation & Setup', 'Filter Replacement', 'Annual Maintenance', 'Emergency Repairs', 'Water Quality Testing'],
    priceRange: '₹800 - ₹3,500',
    responseTime: '30 mins'
  },
  {
    id: 'ac-technician',
    name: 'AC Technician',
    icon: '❄️',
    description: 'Expert air conditioning services including installation, repair, maintenance, and gas refilling.',
    averageRating: 4.7,
    totalProviders: 20,
    availability: 'Available Now',
    services: ['AC Installation', 'Repair & Diagnostics', 'Gas Refilling', 'Deep Cleaning', 'Preventive Maintenance'],
    priceRange: '₹600 - ₹4,500',
    responseTime: '45 mins'
  },
  {
    id: 'electrician',
    name: 'Electrician',
    icon: '⚡',
    description: 'Licensed electrical professionals for home wiring, repairs, installations, and maintenance.',
    averageRating: 4.9,
    totalProviders: 24,
    availability: 'Available Now',
    services: ['Electrical Wiring', 'Fixture Installation', 'Circuit Repairs', 'Safety Inspections', 'Emergency Services'],
    priceRange: '₹200 - ₹2,500',
    responseTime: '25 mins'
  },
  {
    id: 'plumber',
    name: 'Plumber',
    icon: '🔧',
    description: 'Professional plumbing services for pipe repairs, bathroom fittings, and emergency issues.',
    averageRating: 4.6,
    totalProviders: 18,
    availability: 'Limited Availability',
    services: ['Pipe Repairs', 'Bathroom Fittings', 'Drain Cleaning', 'Water Tank Installation', '24/7 Emergency Service'],
    priceRange: '₹500 - ₹3,000',
    responseTime: '40 mins'
  },
  {
    id: 'mechanic',
    name: 'Mechanic',
    icon: '🔩',
    description: 'Experienced auto mechanics for vehicle repair, maintenance, and diagnostics.',
    averageRating: 4.7,
    totalProviders: 32,
    availability: 'Available Now',
    services: ['Engine Diagnostics', 'Brake Service', 'Oil Changes', 'Transmission Repair', 'General Maintenance'],
    priceRange: '₹500 - ₹5,000',
    responseTime: '35 mins'
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    icon: '🪚',
    description: 'Skilled carpenters for custom furniture, home renovation, repairs, and woodwork.',
    averageRating: 4.8,
    totalProviders: 15,
    availability: 'Busy',
    services: ['Custom Furniture', 'Door Installation', 'Furniture Repair', 'Kitchen Cabinets', 'Home Renovation'],
    priceRange: '₹1,000 - ₹25,000',
    responseTime: '60 mins'
  },
  {
    id: 'painter',
    name: 'Painter',
    icon: '🎨',
    description: 'Professional painting services for interior and exterior walls with premium quality paints.',
    averageRating: 4.5,
    totalProviders: 12,
    availability: 'Limited Availability',
    services: ['Interior Painting', 'Exterior Painting', 'Texture Work', 'Wall Preparation', 'Color Consultation'],
    priceRange: '₹20 - ₹80 per sq ft',
    responseTime: '90 mins'
  },
  {
    id: 'cleaner',
    name: 'Cleaner',
    icon: '🧹',
    description: 'Professional cleaning services for homes, offices, and commercial spaces.',
    averageRating: 4.6,
    totalProviders: 28,
    availability: 'Available Now',
    services: ['Home Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Post-Construction', 'Regular Maintenance'],
    priceRange: '₹500 - ₹2,500',
    responseTime: '20 mins'
  },
  {
    id: 'gardener',
    name: 'Gardener',
    icon: '🌱',
    description: 'Expert gardening and landscaping services including plant care and garden design.',
    averageRating: 4.4,
    totalProviders: 10,
    availability: 'Limited Availability',
    services: ['Garden Design', 'Plant Care', 'Landscaping', 'Seasonal Maintenance', 'Pest Control'],
    priceRange: '₹800 - ₹3,000',
    responseTime: '75 mins'
  }
];

export const getServiceCategoryById = (id: string): ServiceCategory | undefined => {
  return serviceCategories.find(category => category.id === id);
};

export const searchServiceCategories = (query: string): ServiceCategory[] => {
  const lowerQuery = query.toLowerCase();
  return serviceCategories.filter(
    category => 
      category.name.toLowerCase().includes(lowerQuery) ||
      category.description.toLowerCase().includes(lowerQuery) ||
      category.services.some(service => service.toLowerCase().includes(lowerQuery))
  );
};