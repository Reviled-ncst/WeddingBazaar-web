// Timeline Module Type Definitions
export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'milestone' | 'task' | 'deadline' | 'booking' | 'payment' | 'meeting';
  status: 'upcoming' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  relatedVendorId?: string;
  relatedBookingId?: string;
  estimatedDuration?: number; // in minutes
  location?: string;
  notes?: string;
  attachments?: string[];
  reminderSettings?: {
    enabled: boolean;
    intervals: number[]; // days before event
  };
  dependencies?: string[]; // other event IDs this depends on
  aiGenerated: boolean;
  userCreated: boolean;
}

export interface TimelineMilestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  completionDate?: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  progress: number; // 0-100
  associatedTasks: string[]; // task IDs
  importance: 'low' | 'medium' | 'high' | 'critical';
  category: 'planning' | 'booking' | 'preparation' | 'coordination' | 'final';
  aiRecommendations?: string[];
}

export interface TimelineTask {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  createdDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: number; // in hours
  actualTime?: number;
  assignedTo?: 'couple' | 'partner' | 'vendor' | 'planner';
  category: string;
  tags: string[];
  subtasks?: SubTask[];
  relatedVendorId?: string;
  relatedMilestoneId?: string;
  aiSuggested: boolean;
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'expert';
  resourcesNeeded?: string[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  assignedTo?: string;
}

export interface TimelineView {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: Date;
  endDate: Date;
  filters: {
    eventTypes: string[];
    priorities: string[];
    categories: string[];
    statuses: string[];
  };
  groupBy: 'date' | 'category' | 'priority' | 'vendor';
  sortBy: 'date' | 'priority' | 'status' | 'category';
  showCompleted: boolean;
}

export interface TimelineStats {
  totalEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  overdueEvents: number;
  completionRate: number;
  averageTaskTime: number;
  daysUntilWedding: number;
  planningProgress: number;
  criticalTasksRemaining: number;
  vendorBookingsCompleted: number;
  budgetTasksCompleted: number;
}

export interface TimelineAIInsights {
  suggestedTasks: TimelineTask[];
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    riskFactors: string[];
    recommendations: string[];
  };
  optimizationSuggestions: {
    reorderTasks: string[];
    parallelTasks: string[][];
    delegationSuggestions: string[];
  };
  deadlineAnalysis: {
    achievableDeadlines: string[];
    riskyDeadlines: string[];
    impossibleDeadlines: string[];
  };
  progressPrediction: {
    expectedCompletionDate: Date;
    confidenceLevel: number;
    factorsAffectingProgress: string[];
  };
}
