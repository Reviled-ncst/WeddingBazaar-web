import React from 'react';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { FeaturedVendors } from './components/FeaturedVendors';
import { Testimonials } from './components/Testimonials';

export const Homepage: React.FC = () => {
  return (
    <main>
      <Hero />
      <Services />
      <FeaturedVendors />
      <Testimonials />
    </main>
  );
};
