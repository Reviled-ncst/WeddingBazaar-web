import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Users, 
  MapPin,
  Camera,
  ArrowRight,
  DollarSign,
  MessageCircle,
  HelpCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Lightbulb,
  Navigation,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../../utils/cn';
import { CoupleHeader } from '../landing/CoupleHeader';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';
import { dashboardService, type IndividualDashboardData } from '../../../../services/api/dashboardService';

// Tutorial steps configuration
const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Wedding Bazaar! 💕',
    content: 'Let us guide you through your wedding planning journey. This dashboard is your central hub for managing everything related to your special day.',
    target: 'dashboard-header',
    icon: Star,
    action: {
      label: 'Get Started',
      type: 'next'
    }
  },
  {
    id: 'progress',
    title: 'Track Your Progress',
    content: 'Monitor your budget, completed tasks, and guest confirmations at a glance. These cards give you real-time insights into your wedding planning status.',
    target: 'progress-cards',
    icon: CheckCircle,
    action: {
      label: 'Next',
      type: 'next'
    }
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions Hub',
    content: 'Use these shortcuts to quickly navigate to important sections: find vendors, plan tasks, track budget, and manage guests.',
    target: 'quick-actions',
    icon: Lightbulb,
    action: {
      label: 'Try Services',
      type: 'route',
      route: '/individual/services'
    }
  },
  {
    id: 'activities',
    title: 'Stay Updated',
    content: 'Your recent activities keep you informed about bookings, completed tasks, messages, and budget updates.',
    target: 'recent-activities',
    icon: MessageCircle,
    action: {
      label: 'Next',
      type: 'next'
    }
  },
  {
    id: 'events',
    title: 'Upcoming Events',
    content: 'Never miss important appointments! View and manage your upcoming vendor meetings, fittings, and venue visits.',
    target: 'upcoming-events',
    icon: Calendar,
    action: {
      label: 'Finish Tour',
      type: 'close'
    }
  }
];

const quickTips = [
  {
    title: 'Smart Budget Tracking',
    description: 'Set category budgets and get alerts when approaching limits',
    icon: DollarSign,
    route: '/individual/budget'
  },
  {
    title: 'Vendor Discovery',
    description: 'Browse verified vendors with ratings, portfolios, and instant booking',
    icon: Users,
    route: '/individual/services'
  },
  {
    title: 'Guest Management',
    description: 'Import contacts, track RSVPs, and manage table assignments',
    icon: Users,
    route: '/individual/guests'
  }
];

export const IndividualDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showQuickTips, setShowQuickTips] = useState(false);

  // Real data state
  const [dashboardData, setDashboardData] = useState<IndividualDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        console.log('⚠️ [Dashboard] No user ID, using fallback data');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📊 [Dashboard] Fetching data for user:', user.id);
        const data = await dashboardService.getIndividualDashboard(user.id);
        console.log('✅ [Dashboard] Data fetched successfully:', data);
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('❌ [Dashboard] Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  // Mock data - in a real app, this would come from your backend
  const weddingData = {
    weddingDate: '2024-08-15',
    partnerName: user?.firstName || 'Guest',
    venue: 'Sunset Garden Venue',
    guestCount: 150,
    budget: dashboardData?.budget.total || 50000,
    spent: dashboardData?.budget.spent || 32000,
    tasksCompleted: 12,
    totalTasks: 25,
    daysToWedding: 45
  };

  const recentActivities = dashboardData?.recentActivities || [
    {
      id: '1',
      type: 'booking' as const,
      title: 'No recent activities',
      description: 'Start by browsing services and making bookings',
      timestamp: 'Just now',
      icon: 'Calendar',
      color: 'text-gray-600'
    }
  ];

  const upcomingEvents = dashboardData?.upcomingEvents || [];

  // Icon mapping helper
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Calendar,
      Camera,
      CheckCircle,
      MessageCircle,
      DollarSign,
      Users,
      Clock,
      MapPin
    };
    return icons[iconName] || Calendar;
  };

  const quickActions = [
    {
      title: 'Find Vendors',
      description: 'Browse and book wedding services',
      icon: Users,
      color: 'bg-pink-500',
      onClick: () => navigate('/individual/services')
    },
    {
      title: 'Track Budget',
      description: 'Monitor expenses and payments',
      icon: DollarSign,
      color: 'bg-green-500',
      onClick: () => navigate('/individual/budget')
    },
    {
      title: 'Manage Guests',
      description: 'Guest list and RSVPs',
      icon: Users,
      color: 'bg-blue-500',
      onClick: () => navigate('/individual/guests')
    }
  ];

  const budgetProgress = (weddingData.spent / weddingData.budget) * 100;

  const handleTutorialAction = (action: any) => {
    switch (action.type) {
      case 'next':
        if (currentStep < tutorialSteps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
        break;
      case 'route':
        setShowTutorial(false);
        navigate(action.route);
        break;
      case 'close':
        setShowTutorial(false);
        setCurrentStep(0);
        break;
    }
  };

  const scrollToTarget = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const currentTutorialStep = tutorialSteps[currentStep];

  return (
    <>
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative shadow-2xl">
            <button
              onClick={() => setShowTutorial(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close tutorial"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <currentTutorialStep.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {currentTutorialStep.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {currentTutorialStep.content}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      index === currentStep ? "bg-pink-500 w-8" : "bg-gray-300"
                    )}
                  />
                ))}
              </div>
              
              <div className="flex space-x-3">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    if (currentTutorialStep.target) {
                      scrollToTarget(currentTutorialStep.target);
                    }
                    handleTutorialAction(currentTutorialStep.action);
                  }}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <span>{currentTutorialStep.action.label}</span>
                  {currentTutorialStep.action.type === 'next' && <ChevronRight className="h-4 w-4" />}
                  {currentTutorialStep.action.type === 'route' && <Navigation className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Tips Modal */}
      {showQuickTips && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 relative shadow-2xl">
            <button
              onClick={() => setShowQuickTips(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close quick tips"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Quick Tips & Features
              </h3>
              <p className="text-gray-600">
                Discover powerful features to make your wedding planning easier
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickTips.map((tip, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setShowQuickTips(false);
                    navigate(tip.route);
                  }}
                  className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 text-left hover:shadow-lg hover:scale-105 transition-all duration-300 group border border-pink-100"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <tip.icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">{tip.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{tip.description}</p>
                  <div className="flex items-center text-pink-600 text-sm font-medium">
                    <span>Explore Feature</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <CoupleHeader />
      
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Help Button */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
          <button
            onClick={() => setShowQuickTips(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
            title="Quick Tips"
          >
            <Lightbulb className="h-6 w-6" />
          </button>
          <button
            onClick={() => setShowTutorial(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
            title="Take Tutorial"
          >
            <HelpCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div id="dashboard-header" className="mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {weddingData.partnerName}! 💕
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {weddingData.daysToWedding} days until your special day
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-4">
                    <Calendar className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Wedding Date</p>
                    <p className="text-lg font-bold">{new Date(weddingData.weddingDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div id="progress-cards" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Budget Progress */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Budget</h3>
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">
                    ₱{weddingData.spent.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    of ₱{weddingData.budget.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={cn(
                      "bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300",
                      budgetProgress >= 100 ? "w-full" :
                      budgetProgress >= 75 ? "w-3/4" :
                      budgetProgress >= 50 ? "w-1/2" :
                      budgetProgress >= 25 ? "w-1/4" : "w-1/12"
                    )}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {budgetProgress.toFixed(1)}% of budget used
                </p>
              </div>
            </div>

            {/* Bookings Overview */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Bookings</h3>
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {dashboardData?.stats.totalBookings || 0}
                  </span>
                  <span className="text-sm text-gray-500">total</span>
                </div>
                <div className="flex space-x-2 text-sm flex-wrap">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {dashboardData?.stats.confirmedBookings || 0} confirmed
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    {dashboardData?.stats.pendingBookings || 0} pending
                  </span>
                </div>
              </div>
            </div>

            {/* Guest Count */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Guests</h3>
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {weddingData.guestCount}
                  </span>
                  <span className="text-sm text-gray-500">invited</span>
                </div>
                <div className="flex space-x-2 text-sm">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    120 confirmed
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    30 pending
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="space-y-6" id="quick-actions">
              <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100 hover:shadow-xl hover:scale-105 transition-all duration-300 text-left group"
                  >
                    <div className={cn(action.color, "w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300")}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                    <ArrowRight className="h-4 w-4 text-gray-400 mt-2 group-hover:text-pink-500 group-hover:translate-x-1 transition-all duration-300" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="space-y-6" id="recent-activities">
              <h2 className="text-2xl font-bold text-gray-900">Recent Activities</h2>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
                    <span className="ml-3 text-gray-600">Loading activities...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-2">Failed to load activities</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-pink-600 hover:text-pink-700 font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const IconComponent = getIconComponent(activity.icon);
                      return (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-pink-50/50 transition-colors duration-200">
                          <div className={cn("p-2 rounded-lg", activity.color.replace('text-', 'bg-').replace('-600', '-100'))}>
                            <IconComponent className={cn("h-4 w-4", activity.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="mt-8" id="upcoming-events">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12 bg-white/70 backdrop-blur-sm rounded-2xl">
                <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
                <span className="ml-3 text-gray-600">Loading events...</span>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-pink-100 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Events</h3>
                <p className="text-gray-600 mb-6">Book services to see your upcoming appointments here</p>
                <button
                  onClick={() => navigate('/individual/services')}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 inline-flex items-center space-x-2"
                >
                  <span>Browse Services</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <Calendar className="h-6 w-6 text-pink-600" />
                      <span className="text-sm font-medium text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                        Upcoming
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      {event.time && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{event.vendor}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
