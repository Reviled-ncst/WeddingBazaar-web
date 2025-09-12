import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Lightbulb,
  Navigation,
  Users,
  Calendar,
  DollarSign,
  BookOpen,
  Search,
  Star,
  Crown
} from 'lucide-react';

interface InstructionStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  tips?: string[];
}

interface InstructionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  steps: InstructionStep[];
  title: string;
  subtitle?: string;
}

export const InstructionDialog: React.FC<InstructionDialogProps> = ({
  isOpen,
  onClose,
  steps,
  title,
  subtitle
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const markStepCompleted = (stepIndex: number) => {
    setCompletedSteps(prev => new Set(prev).add(stepIndex));
  };

  const handleStepAction = () => {
    const step = steps[currentStep];
    if (step.action) {
      markStepCompleted(currentStep);
      if (step.action.onClick) {
        step.action.onClick();
      } else if (step.action.href) {
        window.location.href = step.action.href;
      }
    }
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            title="Close instructions"
            aria-label="Close instructions dialog"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Lightbulb className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              {subtitle && <p className="text-white/80 mt-1">{subtitle}</p>}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className={`bg-white h-full transition-all duration-500 ease-out ${progress >= 100 ? 'w-full' : progress >= 75 ? 'w-3/4' : progress >= 50 ? 'w-1/2' : progress >= 25 ? 'w-1/4' : 'w-1/12'}`}
            />
          </div>
          <div className="flex justify-between text-sm mt-2 text-white/80">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start space-x-4 mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center">
                <currentStepData.icon className="h-6 w-6 text-rose-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {currentStepData.description}
              </p>
            </div>
            {completedSteps.has(currentStep) && (
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
            )}
          </div>

          {/* Tips */}
          {currentStepData.tips && currentStepData.tips.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Pro Tips</span>
              </div>
              <ul className="space-y-1">
                {currentStepData.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start space-x-2">
                    <span className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Button */}
          {currentStepData.action && (
            <div className="mb-6">
              <button
                onClick={handleStepAction}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium hover:from-rose-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2 group"
              >
                <Play className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span>{currentStepData.action.label}</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-200/50 p-6 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  title={`Go to step ${index + 1}: ${steps[index].title}`}
                  aria-label={`Go to step ${index + 1}: ${steps[index].title}`}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentStep
                      ? 'bg-rose-500 scale-125'
                      : completedSteps.has(index)
                      ? 'bg-green-500'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={onClose}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Complete</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Predefined instruction sets for different features
export const weddingPlanningInstructions: InstructionStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Wedding Planning Journey!',
    description: 'Let\'s get you started with the essential tools to plan your perfect wedding. This guide will walk you through each feature and help you make the most of your Wedding Bazaar experience.',
    icon: Crown,
    tips: [
      'Take your time to explore each feature',
      'Don\'t worry - you can always come back to this guide',
      'Your progress is automatically saved'
    ]
  },
  {
    id: 'dashboard',
    title: 'Your Personal Dashboard',
    description: 'Your dashboard is your wedding planning command center. Here you\'ll see your progress, upcoming tasks, budget overview, and quick access to all features.',
    icon: Navigation,
    action: {
      label: 'Visit Dashboard',
      href: '/individual/dashboard'
    },
    tips: [
      'Check your dashboard daily for updates',
      'Use the progress tracker to stay motivated',
      'Quick actions help you jump to important tasks'
    ]
  },
  {
    id: 'planning',
    title: 'Wedding Planning & Tasks',
    description: 'Organize your wedding with our comprehensive task management system. Track what needs to be done, set priorities, and never miss an important deadline.',
    icon: BookOpen,
    action: {
      label: 'Start Planning',
      href: '/individual/planning'
    },
    tips: [
      'Start with high-priority tasks first',
      'Set realistic deadlines for each task',
      'Use categories to organize different aspects of your wedding'
    ]
  },
  {
    id: 'budget',
    title: 'Budget Management',
    description: 'Keep your wedding expenses on track with our detailed budget management tools. Track spending by category and stay within your budget.',
    icon: DollarSign,
    action: {
      label: 'Manage Budget',
      href: '/individual/budget'
    },
    tips: [
      'Set aside 10-20% as a contingency fund',
      'Update expenses regularly for accuracy',
      'Use the category breakdown to identify overspending'
    ]
  },
  {
    id: 'guests',
    title: 'Guest List Management',
    description: 'Manage your guest list, track RSVPs, and organize seating arrangements. Import contacts and send invitations directly from the platform.',
    icon: Users,
    action: {
      label: 'Manage Guests',
      href: '/individual/guests'
    },
    tips: [
      'Start with immediate family, then expand',
      'Use dietary restrictions field for catering',
      'Export guest lists for vendors'
    ]
  },
  {
    id: 'services',
    title: 'Find Wedding Services',
    description: 'Discover and connect with top wedding vendors in your area. Browse portfolios, read reviews, and contact vendors directly.',
    icon: Search,
    action: {
      label: 'Browse Services',
      href: '/individual/services'
    },
    tips: [
      'Read reviews and check portfolios carefully',
      'Compare multiple vendors before deciding',
      'Book popular vendors early to secure your date'
    ]
  },
  {
    id: 'bookings',
    title: 'Manage Your Bookings',
    description: 'Keep track of all your vendor appointments, contracts, and bookings in one place. Never miss a meeting or payment deadline.',
    icon: Calendar,
    action: {
      label: 'View Bookings',
      href: '/individual/bookings'
    },
    tips: [
      'Confirm all bookings 48 hours in advance',
      'Keep important documents organized',
      'Set reminders for payment deadlines'
    ]
  }
];

export const quickStartInstructions: InstructionStep[] = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Start by completing your profile information. This helps us personalize your experience and connect you with the right vendors.',
    icon: Users,
    action: {
      label: 'Edit Profile',
      href: '/individual/profile'
    }
  },
  {
    id: 'budget',
    title: 'Set Your Budget',
    description: 'Establish your wedding budget early. This will help you make informed decisions and stay on track financially.',
    icon: DollarSign,
    action: {
      label: 'Set Budget',
      href: '/individual/budget'
    }
  },
  {
    id: 'planning',
    title: 'Create Your Timeline',
    description: 'Set your wedding date and create a planning timeline. This will help you prioritize tasks and stay organized.',
    icon: Calendar,
    action: {
      label: 'Start Planning',
      href: '/individual/planning'
    }
  }
];
