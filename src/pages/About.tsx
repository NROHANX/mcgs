import React from 'react';
import { 
  Shield, 
  Star, 
  Users, 
  Award, 
  Clock, 
  CheckCircle, 
  Heart, 
  Target, 
  Eye, 
  Handshake,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Zap,
  Wrench,
  Home,
  Building,
  Lightbulb,
  Globe
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const About: React.FC = () => {
  const stats = [
    { number: '10,000+', label: 'Happy Customers', icon: <Users className="h-8 w-8" /> },
    { number: '500+', label: 'Verified Providers', icon: <Shield className="h-8 w-8" /> },
    { number: '4.8/5', label: 'Average Rating', icon: <Star className="h-8 w-8" /> },
    { number: '24/7', label: 'Support Available', icon: <Clock className="h-8 w-8" /> },
    { number: '50+', label: 'Cities Covered', icon: <MapPin className="h-8 w-8" /> },
    { number: '99%', label: 'Customer Satisfaction', icon: <Heart className="h-8 w-8" /> }
  ];

  const services = [
    { name: 'RO Technician', icon: <Zap className="h-6 w-6" />, description: 'Water purifier installation, maintenance & repair' },
    { name: 'AC Technician', icon: <Zap className="h-6 w-6" />, description: 'Air conditioning installation, service & repair' },
    { name: 'Electrician', icon: <Zap className="h-6 w-6" />, description: 'Electrical wiring, repairs & installations' },
    { name: 'Plumber', icon: <Wrench className="h-6 w-6" />, description: 'Plumbing repairs, installations & maintenance' },
    { name: 'Mechanic', icon: <Wrench className="h-6 w-6" />, description: 'Vehicle repair, maintenance & diagnostics' },
    { name: 'Carpenter', icon: <Home className="h-6 w-6" />, description: 'Furniture making, repairs & custom work' },
    { name: 'Painter', icon: <Building className="h-6 w-6" />, description: 'Interior & exterior painting services' },
    { name: 'Cleaner', icon: <Home className="h-6 w-6" />, description: 'Home, office & deep cleaning services' }
  ];

  const values = [
    {
      icon: <Shield className="h-12 w-12" />,
      title: 'Trust & Reliability',
      description: 'We verify all our service providers and ensure they meet our high standards of professionalism and quality.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Star className="h-12 w-12" />,
      title: 'Quality Excellence',
      description: 'We are committed to delivering exceptional service quality that exceeds customer expectations every time.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Heart className="h-12 w-12" />,
      title: 'Customer First',
      description: 'Our customers are at the heart of everything we do. Their satisfaction and happiness drive our success.',
      color: 'from-pink-500 to-red-500'
    },
    {
      icon: <Lightbulb className="h-12 w-12" />,
      title: 'Innovation',
      description: 'We continuously innovate our platform and services to provide the best possible experience for our users.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: <Handshake className="h-12 w-12" />,
      title: 'Fair Partnership',
      description: 'We believe in fair partnerships with our service providers, ensuring mutual growth and success.',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: <Globe className="h-12 w-12" />,
      title: 'Community Impact',
      description: 'We strive to make a positive impact in the communities we serve by connecting people and creating opportunities.',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
      description: 'Visionary leader with 15+ years in service industry'
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Operations',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
      description: 'Operations expert ensuring smooth service delivery'
    },
    {
      name: 'Amit Singh',
      role: 'Technology Director',
      image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600',
      description: 'Tech innovator building cutting-edge solutions'
    },
    {
      name: 'Kavita Patel',
      role: 'Customer Success Manager',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600',
      description: 'Dedicated to ensuring customer satisfaction'
    }
  ];

  const milestones = [
    { year: '2020', title: 'Company Founded', description: 'MCGS was established with a vision to revolutionize home services' },
    { year: '2021', title: 'First 1000 Customers', description: 'Reached our first milestone of serving 1000 happy customers' },
    { year: '2022', title: 'Multi-City Expansion', description: 'Expanded operations to 10 major cities across India' },
    { year: '2023', title: '500+ Service Providers', description: 'Built a network of 500+ verified service providers' },
    { year: '2024', title: '10,000+ Happy Customers', description: 'Achieved the milestone of serving 10,000+ satisfied customers' },
    { year: '2025', title: 'Technology Innovation', description: 'Launched advanced AI-powered matching and booking system' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCategoryClick={() => {}} />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                About <span className="text-yellow-400">MCGS</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Connecting communities with trusted service providers since 2020. 
                We're more than just a platform - we're your reliable partner for all home service needs.
              </p>
              <div className="flex items-center justify-center space-x-8 text-blue-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">5+</div>
                  <div className="text-sm">Years of Excellence</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">50+</div>
                  <div className="text-sm">Cities Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">10K+</div>
                  <div className="text-sm">Happy Customers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission, Vision & Values */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Target className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To revolutionize the home services industry by creating a seamless, trustworthy platform that connects 
                    customers with skilled professionals, making quality services accessible to everyone.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Eye className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To become India's most trusted and comprehensive home services platform, empowering service providers 
                    and delighting customers with exceptional experiences in every interaction.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Award className="h-10 w-10 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Promise</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We promise to maintain the highest standards of service quality, ensure fair pricing, and provide 
                    reliable support to both our customers and service providers at every step.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Story */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  From a simple idea to a thriving platform serving thousands
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">How It All Started</h3>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      MCGS (Max Care Grand Services) was born out of a simple yet powerful observation: finding reliable, 
                      skilled service providers for home needs was unnecessarily complicated and often frustrating.
                    </p>
                    <p>
                      Our founder, having experienced the challenges of finding trustworthy electricians, plumbers, and 
                      other service providers, envisioned a platform that would bridge this gap effectively.
                    </p>
                    <p>
                      Starting in Nagpur, Maharashtra, we began with a small team and a big dream - to create a platform 
                      where quality meets convenience, and trust is never compromised.
                    </p>
                    <p>
                      Today, we're proud to serve customers across 50+ cities, with a network of 500+ verified service 
                      providers who share our commitment to excellence.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <img 
                    src="https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=800" 
                    alt="Our Journey" 
                    className="rounded-2xl shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="text-2xl font-bold">5+</div>
                    <div className="text-sm">Years of Growth</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-6">Our Impact in Numbers</h2>
                <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                  These numbers represent real people, real services, and real satisfaction
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300">
                    <div className="text-yellow-400 mb-4 flex justify-center">
                      {stat.icon}
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                    <div className="text-blue-100 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Services We Offer</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Comprehensive home services to meet all your needs
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                    <div className="text-blue-600 mb-4">
                      {service.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Core Values</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  The principles that guide everything we do
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {values.map((value, index) => (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <div className={`bg-gradient-to-br ${value.color} rounded-2xl w-16 h-16 flex items-center justify-center text-white mb-6`}>
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
                <p className="text-xl text-gray-600">Key milestones in our growth story</p>
              </div>

              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
                
                {milestones.map((milestone, index) => (
                  <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  The passionate people behind MCGS who make it all possible
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {team.map((member, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <div className="text-blue-600 font-medium mb-3">{member.role}</div>
                    <p className="text-gray-600 text-sm">{member.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto text-white">
              <h2 className="text-4xl font-bold mb-6">Ready to Experience MCGS?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of satisfied customers who trust MCGS for all their service needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Book a Service
                </a>
                <a 
                  href="/contact"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-800 font-semibold px-8 py-4 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;