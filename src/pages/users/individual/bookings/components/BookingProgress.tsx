import React from 'react';
import { 
  MessageSquare, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  Clock,
  Truck,
  Star,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../../../../utils/cn';
import type { BookingStatus } from '../../../../../shared/types/comprehensive-booking.types';

interface BookingProgressProps {
  currentStatus: BookingStatus;
  bookingId: string;
  vendorName: string;
  serviceName: string;
  className?: string;
}

// Define the linear workflow steps
const workflowSteps = [
  {
    id: 'quote_requested',
    label: 'Quote Requested',
    description: 'Waiting for vendor response',
    icon: MessageSquare,
    color: 'blue'
  },
  {
    id: 'quote_sent',
    label: 'Quote Received',
    description: 'Review vendor proposal',
    icon: FileText,
    color: 'purple'
  },
  {
    id: 'quote_accepted',
    label: 'Quote Accepted',
    description: 'Ready for payment',
    icon: CheckCircle,
    color: 'green'
  },
  {
    id: 'downpayment_paid',
    label: 'Payment Made',
    description: 'Awaiting confirmation',
    icon: CreditCard,
    color: 'blue'
  },
  {
    id: 'confirmed',
    label: 'Confirmed',
    description: 'Booking confirmed',
    icon: CheckCircle,
    color: 'green'
  },
  {
    id: 'in_progress',
    label: 'In Progress',
    description: 'Service being delivered',
    icon: Truck,
    color: 'orange'
  },
  {
    id: 'completed',
    label: 'Completed',
    description: 'Service delivered',
    icon: Star,
    color: 'green'
  }
] as const;

// Special states
const specialStates = {
  'quote_rejected': {
    id: 'quote_rejected',
    label: 'Quote Declined',
    description: 'Quote was rejected',
    icon: AlertCircle,
    color: 'red'
  },
  'cancelled': {
    id: 'cancelled',
    label: 'Cancelled',
    description: 'Booking cancelled',
    icon: AlertCircle,
    color: 'red'
  },
  'paid_in_full': {
    id: 'paid_in_full',
    label: 'Fully Paid',
    description: 'Payment completed',
    icon: CheckCircle,
    color: 'green'
  }
} as const;

export const BookingProgress: React.FC<BookingProgressProps> = ({ 
  currentStatus, 
  bookingId, 
  vendorName, 
  serviceName,
  className 
}) => {
  // Check if current status is a special state
  const isSpecialState = currentStatus in specialStates;
  const currentStep = isSpecialState ? specialStates[currentStatus as keyof typeof specialStates] : null;
  
  // Find current step index in normal workflow
  const currentStepIndex = workflowSteps.findIndex(step => step.id === currentStatus);
  
  // Handle special paid_in_full status - treat as step after downpayment_paid
  const adjustedCurrentStepIndex = currentStatus === 'paid_in_full' 
    ? workflowSteps.findIndex(step => step.id === 'downpayment_paid')
    : currentStepIndex;

  const getStepStatus = (stepIndex: number) => {
    if (isSpecialState && currentStep) {
      // For special states, only show current step as active
      return 'pending';
    }
    
    if (stepIndex < adjustedCurrentStepIndex) return 'completed';
    if (stepIndex === adjustedCurrentStepIndex) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string, stepColor: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white border-green-500';
      case 'current':
        return `bg-${stepColor}-500 text-white border-${stepColor}-500 animate-pulse`;
      default:
        return 'bg-gray-200 text-gray-400 border-gray-300';
    }
  };

  const getConnectorColor = (stepIndex: number) => {
    if (isSpecialState) return 'bg-gray-300';
    return stepIndex < adjustedCurrentStepIndex ? 'bg-green-500' : 'bg-gray-300';
  };

  // If special state, show only that state
  if (isSpecialState && currentStep) {
    const IconComponent = currentStep.icon;
    return (
      <div className={cn("bg-white rounded-xl p-6 shadow-sm border", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Booking Status</h3>
          <span className="text-sm text-gray-500">#{bookingId.slice(-8)}</span>
        </div>
        
        <div className="text-center py-8">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
            `bg-${currentStep.color}-500 text-white`
          )}>
            <IconComponent className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">{currentStep.label}</h4>
          <p className="text-gray-600 mb-4">{currentStep.description}</p>
          <div className="text-sm text-gray-500">
            <p className="font-medium">{vendorName}</p>
            <p>{serviceName}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl p-6 shadow-sm border", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Booking Progress</h3>
        <span className="text-sm text-gray-500">#{bookingId.slice(-8)}</span>
      </div>
      
      <div className="space-y-1 mb-6">
        <p className="font-medium text-gray-900">{vendorName}</p>
        <p className="text-sm text-gray-600">{serviceName}</p>
      </div>

      <div className="relative">
        {workflowSteps.map((step, index) => {
          const IconComponent = step.icon;
          const status = getStepStatus(index);
          const isLast = index === workflowSteps.length - 1;
          
          return (
            <div key={step.id} className="relative flex items-center">
              {/* Timeline connector line */}
              {!isLast && (
                <div 
                  className={cn(
                    "absolute left-6 top-12 w-0.5 h-16 transition-colors duration-300",
                    getConnectorColor(index)
                  )}
                />
              )}
              
              {/* Step content */}
              <div className="flex items-start space-x-4 relative z-10 pb-8">
                {/* Step icon */}
                <div className={cn(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  getStepColor(status, step.color)
                )}>
                  <IconComponent className="w-5 h-5" />
                </div>
                
                {/* Step content */}
                <div className="flex-1 min-w-0 pt-1">
                  <h4 className={cn(
                    "text-sm font-semibold transition-colors duration-300",
                    status === 'current' ? 'text-gray-900' : 
                    status === 'completed' ? 'text-green-600' : 'text-gray-400'
                  )}>
                    {step.label}
                  </h4>
                  <p className={cn(
                    "text-xs mt-1 transition-colors duration-300",
                    status === 'current' ? 'text-gray-600' : 
                    status === 'completed' ? 'text-green-500' : 'text-gray-400'
                  )}>
                    {step.description}
                  </p>
                  
                  {/* Show current status indicator */}
                  {status === 'current' && (
                    <div className="flex items-center space-x-1 mt-2">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-600 font-medium">Current Step</span>
                    </div>
                  )}
                  
                  {/* Show completed indicator */}
                  {status === 'completed' && (
                    <div className="flex items-center space-x-1 mt-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Show progress percentage */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {Math.round(((adjustedCurrentStepIndex + 1) / workflowSteps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((adjustedCurrentStepIndex + 1) / workflowSteps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
