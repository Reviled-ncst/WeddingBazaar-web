import React from 'react';
import { Star, Quote } from 'lucide-react';
import { cn } from '../../../utils/cn';

const testimonials = [
  {
    name: 'Sarah & Michael',
    wedding: 'June 2024',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=200&h=200&fit=crop&crop=faces',
    quote: 'Wedding Bazaar made our dream wedding come true! The vendors were exceptional and the planning process was seamless.',
    vendor: 'Elegant Venues'
  },
  {
    name: 'Emma & David',
    wedding: 'August 2024',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1594736797933-d0051ba4fdc6?w=200&h=200&fit=crop&crop=faces',
    quote: 'From photography to catering, every vendor exceeded our expectations. We could not have asked for a better experience.',
    vendor: 'Perfect Moments Photography'
  },
  {
    name: 'Jessica & Ryan',
    wedding: 'September 2024',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200&h=200&fit=crop&crop=faces',
    quote: 'The platform connected us with amazing vendors who understood our vision perfectly. Our wedding was absolutely magical!',
    vendor: 'Bloom & Blossom'
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section id="planning" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Happy Couples
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from couples who found their perfect vendors through Wedding Bazaar 
            and created unforgettable wedding experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="mb-6">
                <Quote className="h-10 w-10 text-rose-500" />
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-gray-700 text-lg leading-relaxed mb-6">
                "{testimonial.quote}"
              </blockquote>

              {/* Rating */}
              <div className="flex items-center mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Author Info */}
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.wedding}
                  </p>
                  <p className="text-sm text-rose-600 font-medium">
                    via {testimonial.vendor}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center p-12 bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Wedding Journey?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of happy couples who found their perfect vendors through Wedding Bazaar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className={cn(
              "px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold rounded-full",
              "hover:from-rose-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200",
              "shadow-lg hover:shadow-xl"
            )}>
              Get Started Free
            </button>
            <button className={cn(
              "px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-200",
              "hover:border-rose-300 hover:text-rose-600 transform hover:scale-105 transition-all duration-200",
              "shadow-lg hover:shadow-xl"
            )}>
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
