import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Star, Users, Zap, ArrowRight, CheckCircle, Clock, Award, TrendingUp, DollarSign, Phone, MessageCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';

const BecomeProvider: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/provider-registration');
  };

  const benefits = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: 'Reach More Customers',
      description: 'Connect with thousands of customers actively looking for your services in your area.',
      stats: '10,000+ active customers'
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      title: 'Build Your Reputation',
      description: 'Collect reviews and ratings to showcase your quality work and attract more clients.',
      stats: '4.8★ average rating'
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-600" />,
      title: 'Easy Management',
      description: 'Manage bookings, track earnings, and communicate with customers through our dashboard.',
      stats: 'All-in-one platform'
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: 'Secure Payments',
      description: 'Receive payments securely and on time with our trusted payment system.',
      stats: '100% secure transactions'
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-600" />,
      title: 'Flexible Schedule',
      description: 'Work on your own terms and set your availability according to your schedule.',
      stats: 'Work when you want'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-indigo-600" />,
      title: 'Grow Your Business',
      description: 'Access analytics and insights to help you understand and grow your business.',
      stats: 'Data-driven growth'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Sign Up',
      description: 'Create your account and verify your identity',
      time: '5 minutes'
    },
    {
      step: '02',
      title: 'Complete Profile',
      description: 'Add your services, experience, and business details',
      time: '10 minutes'
    },
    {
      step: '03',
      title: 'Get Verified',
      description: 'Our team will review and verify your profile',
      time: '24-48 hours'
    },
    {
      step: '04',
      title: 'Start Earning',
      description: 'Begin receiving bookings and growing your business',
      time: 'Immediately'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'RO Technician',
      location: 'Nagpur',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
      quote: 'MCGS has transformed my business. I now get 3x more customers than before and my income has doubled.',
      rating: 5,
      earnings: '₹45,000/month'
    },
    {
      name: 'Priya Sharma',
      role: 'AC Technician',
      location: 'Mumbai',
      image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=600',
      quote: 'The platform is so easy to use. I can manage all my bookings and payments in one place.',
      rating: 5,
      earnings: '₹38,000/month'
    },
    {
      name: 'Amit Patel',
      role: 'Electrician',
      location: 'Delhi',
      image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600',
      quote: 'Great support team and reliable customers. MCGS has helped me build a strong reputation.',
      rating: 5,
      earnings: '₹52,000/month'
    }
  ];

  const categories = [
    { name: 'RO Technician', icon: '💧', demand: 'High', avgEarning: '₹35,000' },
    { name: 'AC Technician', icon: '❄️', demand: 'Very High', avgEarning: '₹42,000' },
    { name: 'Electrician', icon: '⚡', demand: 'High', avgEarning: '₹38,000' },
    { name: 'Plumber', icon: '🔧', demand: 'High', avgEarning: '₹32,000' },
    { name: 'Mechanic', icon: '🔩', demand: 'Medium', avgEarning: '₹40,000' },
    { name: 'Carpenter', icon: '🪚', demand: 'Medium', avgEarning: '₹35,000' },
    { name: 'Painter', icon: '🎨', demand: 'Medium', avgEarning: '₹28,000' },
    { name: 'Cleaner', icon: '🧹', demand: 'High', avgEarning: '₹25,000' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header onCategoryClick={() => {}} />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
                <Star className="h-5 w-5 mr-2" />
                <span className="font-medium">Join 500+ Verified Providers</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Grow Your Business with <span className="text-yellow-400">MCGS</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Join thousands of service providers who are building successful businesses on our platform. 
                Connect with customers, manage bookings, and increase your earnings.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  icon={<ArrowRight className="h-5 w-5" />}
                >
                  Start Your Journey
                </Button>
                <Link to="/provider-login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-800"
                  >
                    Already a Provider? Login
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">500+</div>
                  <div className="text-blue-100">Active Providers</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">₹35K</div>
                  <div className="text-blue-100">Avg Monthly Earning</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">4.8★</div>
                  <div className="text-blue-100">Provider Rating</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
                  <div className="text-blue-100">Support Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Categories */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">High-Demand Service Categories</h2>
              <p className="text-xl text-gray-600">Choose your category and start earning</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <div 
                  key={index} 
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-blue-200"
                >
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Demand:</span>
                      <span className={`text-sm font-medium ${
                        category.demand === 'Very High' ? 'text-red-600' :
                        category.demand === 'High' ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {category.demand}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Earning:</span>
                      <span className="text-sm font-bold text-green-600">{category.avgEarning}/mo</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose MCGS?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We provide everything you need to succeed as a service provider
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className="mb-6 group-hover:scale-110 transition-transform duration-300">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 mb-4">{benefit.description}</p>
                  <div className="text-sm font-medium text-blue-600">{benefit.stats}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-gray-600">Get started in just 4 simple steps</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-2">{step.description}</p>
                  <div className="text-sm text-blue-600 font-medium">{step.time}</div>
                  
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full">
                      <ArrowRight className="h-6 w-6 text-blue-300 mx-auto" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
              <p className="text-xl text-gray-600">Hear from our successful service providers</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-6">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                      <p className="text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-700 italic mb-4">"{testimonial.quote}"</blockquote>
                  
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                    Earning: {testimonial.earnings}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Earnings Calculator */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-green-800">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto text-white">
              <h2 className="text-4xl font-bold mb-6">Calculate Your Potential Earnings</h2>
              <p className="text-xl text-green-100 mb-8">
                See how much you could earn as a service provider on MCGS
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-yellow-400 mb-2">5-10</div>
                    <div className="text-green-100">Jobs per week</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400 mb-2">₹800</div>
                    <div className="text-green-100">Average per job</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400 mb-2">₹35,000</div>
                    <div className="text-green-100">Monthly potential</div>
                  </div>
                </div>
              </div>
              
              <p className="text-green-100 mb-8">
                * Earnings vary based on service type, location, and availability
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto text-white">
              <h2 className="text-4xl font-bold mb-6">Ready to Start Your Success Story?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Join MCGS today and take your service business to the next level
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  icon={<ArrowRight className="h-5 w-5" />}
                >
                  Get Started Now - It's Free!
                </Button>
                <div className="flex gap-4">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-800"
                    icon={<Phone className="h-5 w-5" />}
                    onClick={() => window.open('tel:+919881670078')}
                  >
                    Call Us
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-800"
                    icon={<MessageCircle className="h-5 w-5" />}
                    onClick={() => window.open('https://wa.me/919881670078')}
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 text-blue-200">
                <p className="text-sm">
                  Already registered? <Link to="/provider-login" className="text-yellow-400 hover:text-yellow-300 font-medium">Sign in here</Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BecomeProvider;