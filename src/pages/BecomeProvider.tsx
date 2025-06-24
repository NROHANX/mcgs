import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Star, Users, Zap, ArrowRight, CheckCircle, Clock, Award, TrendingUp } from 'lucide-react';
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
      description: 'Connect with thousands of customers actively looking for your services in your area.'
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      title: 'Build Your Reputation',
      description: 'Collect reviews and ratings to showcase your quality work and attract more clients.'
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-600" />,
      title: 'Easy Management',
      description: 'Manage bookings, track earnings, and communicate with customers through our dashboard.'
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: 'Secure Payments',
      description: 'Receive payments securely and on time with our trusted payment system.'
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-600" />,
      title: 'Flexible Schedule',
      description: 'Work on your own terms and set your availability according to your schedule.'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-indigo-600" />,
      title: 'Grow Your Business',
      description: 'Access analytics and insights to help you understand and grow your business.'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Sign Up',
      description: 'Create your account and verify your identity'
    },
    {
      step: '02',
      title: 'Complete Profile',
      description: 'Add your services, experience, and business details'
    },
    {
      step: '03',
      title: 'Get Verified',
      description: 'Our team will review and verify your profile'
    },
    {
      step: '04',
      title: 'Start Earning',
      description: 'Begin receiving bookings and growing your business'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Electrician',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
      quote: 'MCGS has transformed my business. I now get 3x more customers than before and my income has doubled.',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'RO Technician',
      image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=600',
      quote: 'The platform is so easy to use. I can manage all my bookings and payments in one place.',
      rating: 5
    },
    {
      name: 'Amit Patel',
      role: 'Plumber',
      image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600',
      quote: 'Great support team and reliable customers. MCGS has helped me build a strong reputation.',
      rating: 5
    }
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
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Grow Your Business with <span className="text-yellow-400">MCGS</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Join thousands of service providers who are building successful businesses on our platform. 
                Connect with customers, manage bookings, and increase your earnings.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
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
            </div>
          </div>
        </div>

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
                  className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="mb-6">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
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
                <div key={index} className="text-center">
                  <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
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
                  className="bg-gray-50 p-8 rounded-xl"
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
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-700 italic">"{testimonial.quote}"</blockquote>
                </div>
              ))}
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
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  icon={<ArrowRight className="h-5 w-5" />}
                >
                  Get Started Now
                </Button>
                <Link to="/provider-login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-800"
                  >
                    Already Registered? Login
                  </Button>
                </Link>
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