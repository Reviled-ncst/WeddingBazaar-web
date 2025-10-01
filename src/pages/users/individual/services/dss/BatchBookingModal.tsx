import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Calendar, 
  ShoppingBag, 
  Star, 
  DollarSign,
  CheckCircle2,
  MessageSquare,
  Users,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { Service } from '../../../../../modules/services/types';

interface BatchBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  onConfirmBooking: (services: Service[]) => Promise<void>;
  onCreateGroupChat: (services: Service[]) => Promise<boolean>;
}

interface BookingProgress {
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export const BatchBookingModal: React.FC<BatchBookingModalProps> = ({
  isOpen,
  onClose,
  services,
  onConfirmBooking,
  onCreateGroupChat
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BookingProgress[]>([]);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [chatCreated, setChatCreated] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>(services.map(s => s.id));

  if (!isOpen) return null;

  // Calculate totals
  const selectedServicesList = services.filter(s => selectedServices.includes(s.id));
  const totalCost = selectedServicesList.reduce((sum, service) => {
    const basePrice = service.basePrice || 
      (service.priceRange?.includes('$$$') ? 7000 :
       service.priceRange?.includes('$$') ? 3000 : 2000);
    return sum + basePrice;
  }, 0);

  const uniqueVendors = Array.from(
    new Map(
      selectedServicesList.map(service => [service.vendorId, {
        vendorId: service.vendorId,
        vendorName: service.vendorName || `Vendor ${service.vendorId}`,
        category: service.category
      }])
    ).values()
  );

  const handleToggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleConfirmBooking = async () => {
    if (selectedServicesList.length === 0) return;

    setIsProcessing(true);
    const initialProgress = selectedServicesList.map(service => ({
      serviceId: service.id,
      serviceName: service.name,
      status: 'pending' as const
    }));
    setProgress(initialProgress);

    try {
      // Simulate batch booking process
      for (let i = 0; i < selectedServicesList.length; i++) {
        const service = selectedServicesList[i];
        
        // Update status to processing
        setProgress(prev => prev.map(p => 
          p.serviceId === service.id 
            ? { ...p, status: 'processing' }
            : p
        ));

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update status to completed
        setProgress(prev => prev.map(p => 
          p.serviceId === service.id 
            ? { ...p, status: 'completed' }
            : p
        ));
      }

      // Call the actual booking function
      await onConfirmBooking(selectedServicesList);

      // Show success for 2 seconds then close
      setTimeout(() => {
        onClose();
        setIsProcessing(false);
        setProgress([]);
      }, 2000);

    } catch (error) {
      console.error('Batch booking failed:', error);
      setProgress(prev => prev.map(p => ({
        ...p,
        status: 'failed',
        error: 'Booking failed'
      })));
      
      setTimeout(() => {
        setIsProcessing(false);
      }, 3000);
    }
  };

  const handleCreateGroupChat = async () => {
    if (selectedServicesList.length === 0) return;

    setIsCreatingChat(true);
    try {
      const success = await onCreateGroupChat(selectedServicesList);
      setChatCreated(success);
      
      setTimeout(() => {
        setIsCreatingChat(false);
        if (success) {
          // Navigate to chat or show success message
          setTimeout(() => setChatCreated(false), 3000);
        }
      }, 1500);
    } catch (error) {
      console.error('Failed to create group chat:', error);
      setIsCreatingChat(false);
    }
  };

  const getStatusIcon = (status: BookingProgress['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Batch Service Booking</h2>
            </div>
            {!isProcessing && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="font-semibold">Selected Services</div>
              <div className="text-lg font-bold">{selectedServices.length}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="font-semibold">Unique Vendors</div>
              <div className="text-lg font-bold">{uniqueVendors.length}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="font-semibold">Total Estimate</div>
              <div className="text-lg font-bold">₱{totalCost.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isProcessing ? (
            /* Booking Progress */
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Processing Your Bookings...
                </h3>
                <p className="text-gray-600">
                  Please wait while we process each service booking
                </p>
              </div>

              {progress.map((item) => (
                <div key={item.serviceId} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.serviceName}</h4>
                    {item.error && (
                      <p className="text-sm text-red-600">{item.error}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`text-sm font-medium capitalize ${
                      item.status === 'completed' ? 'text-green-600' :
                      item.status === 'failed' ? 'text-red-600' :
                      item.status === 'processing' ? 'text-blue-600' :
                      'text-gray-500'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Service Selection */
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Review & Confirm Services
                </h3>
                <p className="text-gray-600">
                  Select the services you want to book and create a group chat with vendors
                </p>
              </div>

              {/* Service List */}
              <div className="space-y-3">
                {services.map((service) => {
                  const isSelected = selectedServices.includes(service.id);
                  const basePrice = service.basePrice || 
                    (service.priceRange?.includes('$$$') ? 7000 :
                     service.priceRange?.includes('$$') ? 3000 : 2000);

                  return (
                    <div
                      key={service.id}
                      className={`p-4 border-2 rounded-xl transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-purple-300 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleToggleService(service.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-500 text-white' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="h-3 w-3" />}
                        </div>

                        <div className="flex-shrink-0">
                          <img
                            src={service.image}
                            alt={service.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.category}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{service.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-green-500" />
                              <span className="text-sm font-medium">₱{basePrice.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600">{service.vendorName}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Vendor Summary */}
              {uniqueVendors.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Vendors in Group Chat ({uniqueVendors.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {uniqueVendors.map((vendor) => (
                      <div key={vendor.vendorId} className="bg-white px-3 py-1 rounded-lg text-sm">
                        <span className="font-medium">{vendor.vendorName}</span>
                        <span className="text-gray-500 ml-1">({vendor.category})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isProcessing && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="text-sm text-gray-600">
                <p>Total: <span className="font-semibold text-gray-900">₱{totalCost.toLocaleString()}</span></p>
                <p>{selectedServices.length} services • {uniqueVendors.length} vendors</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCreateGroupChat}
                  disabled={selectedServices.length === 0 || isCreatingChat}
                  className="px-6 py-3 bg-white border-2 border-purple-300 text-purple-600 rounded-xl hover:bg-purple-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreatingChat ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                  {isCreatingChat ? 'Creating...' : 'Create Group Chat'}
                </button>
                
                <button
                  onClick={handleConfirmBooking}
                  disabled={selectedServices.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Book All ({selectedServices.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Messages */}
        {chatCreated && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="h-5 w-5" />
            Group chat created successfully!
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};
