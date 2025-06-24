import { Provider } from '../types';

// Dummy service providers for Nagpur City
export const nagpurProviders: Provider[] = [
  {
    id: 'ngp1',
    name: 'Rajesh Kumar RO Services',
    category: 'RO Technician',
    subcategory: 'Water Purifier',
    description: 'Expert RO technician serving Nagpur for 8+ years. Specializing in Kent, Aquaguard, and Pureit systems. Quick installation and reliable maintenance services.',
    image: 'https://images.pexels.com/photos/8487465/pexels-photo-8487465.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 156,
    location: 'Sitabuldi, Nagpur',
    contact: '+91 98765 43210',
    available: true,
    services: [
      { id: 's1', name: 'RO Installation', description: 'Complete RO system setup with warranty', price: '₹2500-3500', estimatedTime: '2-3 hrs' },
      { id: 's2', name: 'Filter Replacement', description: 'All types of filter replacement', price: '₹800-1500', estimatedTime: '1 hr' },
      { id: 's3', name: 'Annual Maintenance', description: 'Complete system servicing', price: '₹1200', estimatedTime: '1.5 hrs' }
    ],
    reviews: [
      { id: 'r1', user: 'Priya Sharma', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Excellent service! Fixed my RO system quickly and professionally.', date: '2024-01-15' },
      { id: 'r2', user: 'Amit Singh', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 4, comment: 'Good work and reasonable pricing.', date: '2024-01-10' }
    ]
  },
  {
    id: 'ngp2',
    name: 'Vikash Electrical Works',
    category: 'Electrician',
    subcategory: 'Residential',
    description: 'Licensed electrician with 12+ years experience in Nagpur. Specializing in home wiring, electrical repairs, and appliance installation.',
    image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 203,
    location: 'Dharampeth, Nagpur',
    contact: '+91 87654 32109',
    available: true,
    services: [
      { id: 's4', name: 'Home Wiring', description: 'Complete electrical wiring for homes', price: '₹150-200/point', estimatedTime: '4-6 hrs' },
      { id: 's5', name: 'Fan Installation', description: 'Ceiling and wall fan installation', price: '₹300-500', estimatedTime: '1 hr' },
      { id: 's6', name: 'Electrical Repair', description: 'All types of electrical repairs', price: '₹200-800', estimatedTime: '1-2 hrs' }
    ],
    reviews: [
      { id: 'r3', user: 'Sunita Verma', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Very professional and punctual. Highly recommended!', date: '2024-01-12' },
      { id: 'r4', user: 'Rohit Agarwal', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Excellent work quality and fair pricing.', date: '2024-01-08' }
    ]
  },
  {
    id: 'ngp3',
    name: 'Kavita Plumbing Services',
    category: 'Plumber',
    subcategory: 'Emergency Services',
    description: 'Professional plumber serving Nagpur with 24/7 emergency services. Expert in pipe repairs, bathroom fittings, and water tank installations.',
    image: 'https://images.pexels.com/photos/8961065/pexels-photo-8961065.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviewCount: 134,
    location: 'Sadar, Nagpur',
    contact: '+91 76543 21098',
    available: true,
    services: [
      { id: 's7', name: 'Pipe Repair', description: 'All types of pipe leak repairs', price: '₹500-1200', estimatedTime: '1-2 hrs' },
      { id: 's8', name: 'Bathroom Fitting', description: 'Complete bathroom fixture installation', price: '₹2000-5000', estimatedTime: '3-4 hrs' },
      { id: 's9', name: 'Drain Cleaning', description: 'Professional drain cleaning service', price: '₹800-1500', estimatedTime: '1-2 hrs' }
    ],
    reviews: [
      { id: 'r5', user: 'Manoj Kumar', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Quick response for emergency plumbing. Great service!', date: '2024-01-14' },
      { id: 'r6', user: 'Neha Reddy', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 4, comment: 'Professional work and reasonable rates.', date: '2024-01-09' }
    ]
  },
  {
    id: 'ngp4',
    name: 'Suresh Auto Garage',
    category: 'Mechanic',
    subcategory: 'Auto Repair',
    description: 'Experienced auto mechanic in Nagpur with expertise in all vehicle brands. Specializing in engine repair, brake service, and general maintenance.',
    image: 'https://images.pexels.com/photos/4489794/pexels-photo-4489794.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.6,
    reviewCount: 187,
    location: 'Itwari, Nagpur',
    contact: '+91 65432 10987',
    available: false,
    services: [
      { id: 's10', name: 'Engine Service', description: 'Complete engine diagnostic and repair', price: '₹1500-5000', estimatedTime: '3-5 hrs' },
      { id: 's11', name: 'Brake Service', description: 'Brake pad replacement and repair', price: '₹800-2500', estimatedTime: '2-3 hrs' },
      { id: 's12', name: 'Oil Change', description: 'Engine oil and filter change', price: '₹500-800', estimatedTime: '30 min' }
    ],
    reviews: [
      { id: 'r7', user: 'Deepak Sharma', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Honest mechanic with fair pricing. Trustworthy service.', date: '2024-01-11' },
      { id: 'r8', user: 'Anita Desai', avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 4, comment: 'Good service quality and timely delivery.', date: '2024-01-07' }
    ]
  },
  {
    id: 'ngp5',
    name: 'Ramesh Carpenter Works',
    category: 'Carpenter',
    subcategory: 'Furniture Making',
    description: 'Skilled carpenter in Nagpur specializing in custom furniture, home renovation, and wooden work. 15+ years of experience in quality craftsmanship.',
    image: 'https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 98,
    location: 'Hingna Road, Nagpur',
    contact: '+91 98123 45678',
    available: true,
    services: [
      { id: 's13', name: 'Custom Furniture', description: 'Made-to-order furniture design', price: '₹5000-25000', estimatedTime: '3-7 days' },
      { id: 's14', name: 'Door Installation', description: 'Wooden door fitting and installation', price: '₹2000-4000', estimatedTime: '2-3 hrs' },
      { id: 's15', name: 'Furniture Repair', description: 'Repair and restoration of furniture', price: '₹500-2000', estimatedTime: '1-2 hrs' }
    ],
    reviews: [
      { id: 'r9', user: 'Sanjay Patil', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Excellent craftsmanship! Made beautiful custom wardrobes.', date: '2024-01-13' },
      { id: 'r10', user: 'Meera Joshi', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Very skilled and professional carpenter.', date: '2024-01-06' }
    ]
  },
  {
    id: 'ngp6',
    name: 'Ashok Painting Services',
    category: 'Painter',
    subcategory: 'Interior',
    description: 'Professional painting contractor in Nagpur with expertise in interior and exterior painting. Using premium quality paints and modern techniques.',
    image: 'https://images.pexels.com/photos/1669799/pexels-photo-1669799.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.5,
    reviewCount: 76,
    location: 'Manish Nagar, Nagpur',
    contact: '+91 91234 56789',
    available: true,
    services: [
      { id: 's16', name: 'Interior Painting', description: 'Complete interior wall painting', price: '₹25-40/sq ft', estimatedTime: '2-4 days' },
      { id: 's17', name: 'Exterior Painting', description: 'Exterior wall and building painting', price: '₹20-35/sq ft', estimatedTime: '3-5 days' },
      { id: 's18', name: 'Texture Painting', description: 'Decorative texture and design painting', price: '₹50-80/sq ft', estimatedTime: '1-2 days' }
    ],
    reviews: [
      { id: 'r11', user: 'Ravi Gupta', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 4, comment: 'Good painting work with quality materials.', date: '2024-01-10' },
      { id: 'r12', user: 'Pooja Mehta', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Beautiful finish and professional service.', date: '2024-01-05' }
    ]
  },
  {
    id: 'ngp7',
    name: 'Cool Air AC Services',
    category: 'AC Technician',
    subcategory: 'Installation & Repair',
    description: 'Professional AC technician in Nagpur with 10+ years experience. Expert in all AC brands including split, window, and central air conditioning systems. 24/7 emergency service available.',
    image: 'https://images.pexels.com/photos/8961065/pexels-photo-8961065.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviewCount: 165,
    location: 'Wardha Road, Nagpur',
    contact: '+91 99887 76543',
    available: true,
    services: [
      { id: 's19', name: 'AC Installation', description: 'Complete AC installation with warranty', price: '₹2500-4500', estimatedTime: '3-4 hrs' },
      { id: 's20', name: 'AC Repair', description: 'Diagnosis and repair of all AC issues', price: '₹800-3000', estimatedTime: '1-3 hrs' },
      { id: 's21', name: 'AC Maintenance', description: 'Regular servicing and deep cleaning', price: '₹600-1200', estimatedTime: '1-2 hrs' },
      { id: 's22', name: 'Gas Refilling', description: 'AC gas refilling and leak detection', price: '₹1800-2800', estimatedTime: '1-2 hrs' }
    ],
    reviews: [
      { id: 'r13', user: 'Rajesh Tiwari', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Excellent AC installation service! Very professional and clean work. AC is working perfectly.', date: '2024-01-16' },
      { id: 'r14', user: 'Sneha Kulkarni', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 4, comment: 'Quick AC repair service. Fixed the cooling issue efficiently and at reasonable cost.', date: '2024-01-12' }
    ]
  }
];

// Dummy service names for search suggestions
export const dummyServiceNames = [
  'RO Technician',
  'Electrician',
  'Plumber',
  'Mechanic',
  'Carpenter',
  'Painter',
  'Cleaner',
  'Gardener',
  'AC Technician',
  'AC Repair',
  'Washing Machine Repair',
  'Refrigerator Repair',
  'TV Repair',
  'Mobile Repair',
  'Computer Repair',
  'Home Cleaning',
  'Pest Control',
  'Security Guard',
  'Driver',
  'Cook',
  'Maid'
];

// Dummy locations in Nagpur City
export const nagpurLocations = [
  'Sitabuldi',
  'Dharampeth',
  'Sadar',
  'Itwari',
  'Hingna Road',
  'Manish Nagar',
  'Wardha Road',
  'Amravati Road',
  'Kamptee Road',
  'Civil Lines',
  'Ramdaspeth',
  'Mahal',
  'Gandhibagh',
  'Nandanvan',
  'Pratap Nagar',
  'Shankar Nagar',
  'Bajaj Nagar',
  'Manewada',
  'Koradi Road',
  'Katol Road'
];

// Function to search providers
export const searchNagpurProviders = (query: string, location: string): Provider[] => {
  const lowerQuery = query.toLowerCase();
  const lowerLocation = location.toLowerCase();
  
  return nagpurProviders.filter(provider => {
    const matchesQuery = !query || 
      provider.name.toLowerCase().includes(lowerQuery) ||
      provider.category.toLowerCase().includes(lowerQuery) ||
      provider.description.toLowerCase().includes(lowerQuery) ||
      provider.subcategory?.toLowerCase().includes(lowerQuery);
    
    const matchesLocation = !location || 
      provider.location.toLowerCase().includes(lowerLocation);
    
    return matchesQuery && matchesLocation;
  });
};

// Function to get providers by category
export const getNagpurProvidersByCategory = (categoryName: string): Provider[] => {
  return nagpurProviders.filter(provider => 
    provider.category.toLowerCase() === categoryName.toLowerCase()
  );
};