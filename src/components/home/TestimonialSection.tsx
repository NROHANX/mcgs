import React from 'react';
import { Star, Quote, Heart, ThumbsUp } from 'lucide-react';

const TestimonialSection: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Homeowner, Delhi',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
      quote: 'MCGS made it incredibly easy to find a reliable RO technician when our water purifier stopped working. The service was prompt, professional, and reasonably priced. Highly recommend!',
      rating: 5,
      service: 'RO Service',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      name: 'Rajesh Gupta',
      role: 'Business Owner, Mumbai',
      image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600',
      quote: 'As a small business owner, I rely on quality service providers. MCGS has consistently connected me with the best electricians and maintenance professionals in my area.',
      rating: 5,
      service: 'Electrical Work',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 3,
      name: 'Kavita Singh',
      role: 'Apartment Resident, Bangalore',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
      quote: 'When our apartment had plumbing issues, I found an excellent plumber through MCGS who fixed everything quickly and at a fair price. The platform is user-friendly and trustworthy.',
      rating: 5,
      service: 'Plumbing',
      color: 'from-blue-600 to-indigo-600'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 transform -translate-x-36 -translate-y-36"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tr from-orange-200 to-pink-200 rounded-full opacity-20 transform translate-x-32 translate-y-32"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 rounded-full px-6 py-3 mb-6">
            <Heart className="h-5 w-5 mr-2" />
            <span className="font-medium">Customer Love</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What Our 
            <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Customers Say
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real experiences from real customers who found their perfect service providers through MCGS
          </p>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden border border-gray-100"
              style={{
                animationDelay: `${index * 200}ms`
              }}
            >
              {/* Background Pattern */}
              <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <Quote className="h-12 w-12 text-gray-600" />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Service Badge */}
                <div className="inline-flex items-center bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm font-medium mb-6">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  {testimonial.service}
                </div>

                {/* Rating */}
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" 
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {testimonial.rating}.0
                  </span>
                </div>
                
                {/* Quote */}
                <blockquote className="text-gray-700 leading-relaxed mb-8 text-lg italic group-hover:text-gray-800 transition-colors duration-300">
                  "{testimonial.quote}"
                </blockquote>
                
                {/* Author */}
                <div className="flex items-center">
                  <div className="relative">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-14 h-14 rounded-full object-cover mr-4 ring-4 ring-white shadow-lg group-hover:ring-blue-100 transition-all duration-300"
                    />
                    {/* Verified Badge */}
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <Star className="h-3 w-3 text-white fill-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 left-4 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-300 delay-200"></div>
              <div className="absolute bottom-4 right-4 w-2 h-2 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300 delay-300"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <span className="font-semibold mr-2">Join 10,000+ Happy Customers</span>
            <div className="relative">
              <Heart className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-300"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;