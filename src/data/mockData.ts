import { Provider, Category } from '../types';

export const categories: Category[] = [
  { id: '1', name: 'RO Technician', icon: 'droplet', count: 28 },
  { id: '2', name: 'AC Technician', icon: 'tv', count: 20 },
  { id: '3', name: 'Electrician', icon: 'zap', count: 24 },
  { id: '4', name: 'Plumber', icon: 'droplet', count: 18 },
  { id: '5', name: 'Mechanic', icon: 'tool', count: 32 },
  { id: '6', name: 'Carpenter', icon: 'scissors', count: 15 },
  { id: '7', name: 'Painter', icon: 'palette', count: 12 },
  { id: '8', name: 'Cleaner', icon: 'trash', count: 28 },
  { id: '9', name: 'Gardener', icon: 'flower', count: 10 }
];

export const providers: Provider[] = [
  // RO Technicians first
  {
    id: '1',
    name: 'Rajesh Kumar',
    category: 'RO Technician',
    subcategory: 'Water Purifier',
    description: 'Expert RO technician with extensive experience in installation, maintenance, and repair of all major water purifier brands. Certified professional with 8+ years of experience.',
    image: 'https://images.pexels.com/photos/8487465/pexels-photo-8487465.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 89,
    location: 'Delhi NCR',
    contact: '+91 98765 43210',
    available: true,
    services: [
      { id: 's1', name: 'RO Installation', description: 'New RO system installation with warranty', price: '₹2000-3000', estimatedTime: '2-3 hrs' },
      { id: 's2', name: 'Filter Replacement', description: 'Complete filter set replacement', price: '₹800-1200', estimatedTime: '1 hr' },
      { id: 's3', name: 'System Maintenance', description: 'Full system check and maintenance', price: '₹600', estimatedTime: '1 hr' }
    ],
    reviews: [
      { id: 'r1', user: 'Priya Sharma', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Rajesh did an excellent job installing our new RO system. Very professional and knowledgeable.', date: '2023-07-15' },
      { id: 'r2', user: 'Amit Singh', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 4, comment: 'Regular maintenance service was thorough and well-explained.', date: '2023-06-20' }
    ]
  },
  {
    id: '6',
    name: 'Arjun Mehta',
    category: 'RO Technician',
    subcategory: 'Installation & Maintenance',
    description: 'Skilled RO technician with 6+ years of experience in water purifier installation, repair, and maintenance. Specializes in Kent, Aquaguard, Pureit, and Blue Star systems.',
    image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 127,
    location: 'Hyderabad',
    contact: '+91 91234 56789',
    available: true,
    services: [
      { id: 's17', name: 'RO Installation', description: 'Professional RO system installation with 2-year warranty', price: '₹2200-3200', estimatedTime: '2-3 hrs' },
      { id: 's18', name: 'Filter Replacement', description: 'All types of RO filter replacement', price: '₹900-1400', estimatedTime: '1 hr' },
      { id: 's19', name: 'RO Repair', description: 'Complete RO system diagnosis and repair', price: '₹500-1500', estimatedTime: '1-2 hrs' },
      { id: 's20', name: 'Annual Service', description: 'Comprehensive annual maintenance package', price: '₹1500', estimatedTime: '2 hrs' }
    ],
    reviews: [
      { id: 'r11', user: 'Ravi Gupta', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Arjun is very knowledgeable about RO systems. Fixed our water taste issue perfectly.', date: '2023-07-20' },
      { id: 'r12', user: 'Sneha Reddy', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Excellent service! Very punctual and professional. Highly recommended.', date: '2023-07-18' }
    ]
  },
  {
    id: '7',
    name: 'Priya Agarwal',
    category: 'RO Technician',
    subcategory: 'Water Purifier Expert',
    description: 'Certified female RO technician with 7+ years of experience. Expert in all major brands including Aquaguard, Kent, Pureit, and Livpure. Known for excellent customer service and technical expertise.',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 164,
    location: 'Kolkata',
    contact: '+91 98765 12345',
    available: true,
    services: [
      { id: 's21', name: 'RO Installation', description: 'Expert RO installation with detailed explanation', price: '₹2400-3400', estimatedTime: '2-3 hrs' },
      { id: 's22', name: 'Filter Change', description: 'Premium filter replacement service', price: '₹850-1300', estimatedTime: '45 min' },
      { id: 's23', name: 'Water Quality Testing', description: 'Complete water quality analysis and recommendations', price: '₹300', estimatedTime: '30 min' },
      { id: 's24', name: 'RO Maintenance', description: 'Thorough cleaning and maintenance service', price: '₹800', estimatedTime: '1.5 hrs' }
    ],
    reviews: [
      { id: 'r13', user: 'Rajesh Singh', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Priya is extremely professional and knowledgeable. She explained everything clearly and did excellent work.', date: '2023-07-25' },
      { id: 'r14', user: 'Kavita Sharma', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Best RO technician I have worked with. Very reliable and trustworthy service.', date: '2023-07-22' }
    ]
  },
  {
    id: '8',
    name: 'Sunita Verma',
    category: 'RO Technician',
    subcategory: 'Water Solutions Expert',
    description: 'Experienced female RO technician with 9+ years in the water purification industry. Specializes in complex RO repairs, UV systems, and water softeners. Certified by multiple brands.',
    image: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviewCount: 198,
    location: 'Jaipur',
    contact: '+91 87654 98765',
    available: true,
    services: [
      { id: 's25', name: 'RO Installation', description: 'Complete RO system setup with water testing', price: '₹2300-3300', estimatedTime: '2.5-3 hrs' },
      { id: 's26', name: 'UV System Repair', description: 'UV lamp and chamber repair/replacement', price: '₹800-2000', estimatedTime: '1-2 hrs' },
      { id: 's27', name: 'Water Softener Service', description: 'Water softener installation and maintenance', price: '₹1200-2500', estimatedTime: '2-3 hrs' },
      { id: 's28', name: 'Emergency Repair', description: 'Same-day emergency RO repair service', price: '₹600-1800', estimatedTime: '1-2 hrs' }
    ],
    reviews: [
      { id: 'r15', user: 'Amit Patel', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Sunita solved our complex RO issue that other technicians couldn\'t fix. Truly an expert!', date: '2023-07-28' },
      { id: 'r16', user: 'Deepika Jain', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 4, comment: 'Very knowledgeable and patient. Explained the water quality issues and provided great solutions.', date: '2023-07-26' }
    ]
  },
  // AC Technicians second
  {
    id: '5',
    name: 'Ramesh Pawar',
    category: 'AC Technician',
    subcategory: 'Installation & Repair',
    description: 'Professional AC technician with 12+ years of experience in installation, repair, and maintenance of all AC brands including split, window, and central air conditioning systems.',
    image: 'https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviewCount: 143,
    location: 'Chennai',
    contact: '+91 98123 45678',
    available: true,
    services: [
      { id: 's13', name: 'AC Installation', description: 'Complete AC installation with warranty', price: '₹2500-4000', estimatedTime: '3-4 hrs' },
      { id: 's14', name: 'AC Repair', description: 'Diagnosis and repair of AC issues', price: '₹800-2500', estimatedTime: '1-3 hrs' },
      { id: 's15', name: 'AC Maintenance', description: 'Regular servicing and cleaning', price: '₹600-1000', estimatedTime: '1-2 hrs' },
      { id: 's16', name: 'Gas Refilling', description: 'AC gas refilling and leak detection', price: '₹1500-2500', estimatedTime: '1-2 hrs' }
    ],
    reviews: [
      { id: 'r9', user: 'Sanjay Patil', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Excellent AC installation service! Very professional and clean work.', date: '2023-07-13' },
      { id: 'r10', user: 'Meera Joshi', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 4, comment: 'Quick AC repair service. Fixed the cooling issue efficiently.', date: '2023-07-06' }
    ]
  },
  // Rest of the services
  {
    id: '2',
    name: 'Vikash Gupta',
    category: 'Electrician',
    subcategory: 'Residential',
    description: 'Experienced electrician with 10+ years in residential and commercial electrical installations, repairs, and maintenance. Licensed and insured professional.',
    image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 156,
    location: 'Mumbai',
    contact: '+91 87654 32109',
    available: true,
    services: [
      { id: 's4', name: 'Electrical Wiring', description: 'Complete home wiring and rewiring services', price: '₹80-120/hr', estimatedTime: '2-4 hrs' },
      { id: 's5', name: 'Fixture Installation', description: 'Installation of lighting fixtures', price: '₹600/fixture', estimatedTime: '1 hr' },
      { id: 's6', name: 'Circuit Repair', description: 'Repair of faulty circuits and breakers', price: '₹1000-1500', estimatedTime: '1-2 hrs' }
    ],
    reviews: [
      { id: 'r3', user: 'Sunita Verma', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Vikash was extremely professional and fixed our wiring issues quickly. Highly recommend!', date: '2023-06-15' },
      { id: 'r4', user: 'Rohit Agarwal', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 4, comment: 'Good service, arrived on time and completed the job efficiently.', date: '2023-05-22' }
    ]
  },
  {
    id: '3',
    name: 'Kavita Joshi',
    category: 'Plumber',
    subcategory: 'Emergency Services',
    description: 'Licensed plumber specializing in emergency repairs, pipe installation, and bathroom renovations. Available for emergency services.',
    image: 'https://images.pexels.com/photos/8961065/pexels-photo-8961065.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.6,
    reviewCount: 98,
    location: 'Bangalore',
    contact: '+91 76543 21098',
    available: true,
    services: [
      { id: 's7', name: 'Pipe Repair', description: 'Repair of leaking or damaged pipes', price: '₹900-1300/hr', estimatedTime: '1-3 hrs' },
      { id: 's8', name: 'Drain Cleaning', description: 'Professional drain cleaning services', price: '₹750-1000', estimatedTime: '1 hr' },
      { id: 's9', name: 'Fixture Installation', description: 'Installation of sinks, toilets, and faucets', price: '₹1200-1800', estimatedTime: '2-3 hrs' }
    ],
    reviews: [
      { id: 'r5', user: 'Manoj Kumar', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Kavita saved us during a plumbing emergency! Fast response and excellent work.', date: '2023-07-02' },
      { id: 'r6', user: 'Neha Reddy', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 4, comment: 'Very knowledgeable and efficient. Fair pricing too.', date: '2023-06-18' }
    ]
  },
  {
    id: '4',
    name: 'Suresh Patel',
    category: 'Mechanic',
    subcategory: 'Auto Repair',
    description: 'Certified mechanic with expertise in diagnostics, engine repair, and general maintenance for all vehicle makes and models. 15+ years of experience.',
    image: 'https://images.pexels.com/photos/4489794/pexels-photo-4489794.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 212,
    location: 'Pune',
    contact: '+91 65432 10987',
    available: false,
    services: [
      { id: 's10', name: 'Engine Diagnostics', description: 'Complete engine diagnostic service', price: '₹800', estimatedTime: '1 hr' },
      { id: 's11', name: 'Brake Replacement', description: 'Brake pad and rotor replacement', price: '₹1500-3000', estimatedTime: '2-3 hrs' },
      { id: 's12', name: 'Oil Change', description: 'Full service oil change with filter', price: '₹450-650', estimatedTime: '30 min' }
    ],
    reviews: [
      { id: 'r7', user: 'Deepak Sharma', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Suresh is honest and extremely knowledgeable. Saved me from an expensive unnecessary repair another shop recommended.', date: '2023-07-10' },
      { id: 'r8', user: 'Anita Desai', avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 5, comment: 'Outstanding service! My car runs better than ever.', date: '2023-06-28' }
    ]
  }
];

export const getProvidersByCategory = (categoryId: string): Provider[] => {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return [];
  return providers.filter(provider => provider.category === category.name);
};

export const getProviderById = (id: string): Provider | undefined => {
  return providers.find(provider => provider.id === id);
};

export const searchProviders = (query: string): Provider[] => {
  const lowerQuery = query.toLowerCase();
  return providers.filter(
    provider => 
      provider.name.toLowerCase().includes(lowerQuery) ||
      provider.category.toLowerCase().includes(lowerQuery) ||
      provider.description.toLowerCase().includes(lowerQuery) ||
      provider.location.toLowerCase().includes(lowerQuery)
  );
};