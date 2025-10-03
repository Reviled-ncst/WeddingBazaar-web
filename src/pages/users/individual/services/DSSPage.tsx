import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoupleHeader } from '../landing/CoupleHeader';
import { DecisionSupportSystem } from './dss/DecisionSupportSystem';
import { serviceManager } from '../../../../shared/services/CentralizedServiceManager';

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice?: number;
  priceRange?: string;
  image: string;
  rating: number;
  reviewCount: number;
  vendorName: string;
  location?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export const DSSPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const result = await serviceManager.getAllServices();
        setServices(result.services || []);
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const handleClose = () => {
    navigate('/individual/services');
  };

  const handleServiceRecommend = (serviceId: string) => {
    console.log('Service recommended:', serviceId);
    // You can add additional logic here for handling service recommendations
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <CoupleHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading wedding services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <CoupleHeader />
      <DecisionSupportSystem
        services={services}
        budget={50000}
        isOpen={true}
        onClose={handleClose}
        onServiceRecommend={handleServiceRecommend}
      />
    </div>
  );
};

export default DSSPage;
