// For You Page Type Definitions
export interface ForYouContent {
  id: string;
  type: 'inspiration' | 'tip' | 'vendor-spotlight' | 'trend' | 'planning-advice' | 'real-wedding';
  title: string;
  subtitle?: string;
  content: string;
  media: {
    images: string[];
    videos?: string[];
    thumbnailUrl: string;
  };
  metadata: {
    readTime: number; // in minutes
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    tags: string[];
    publishedDate: Date;
    lastUpdated: Date;
  };
  personalization: {
    relevanceScore: number; // 0-100
    reasons: string[];
    userInterests: string[];
    personalizedFor: string[];
  };
  engagement: {
    views: number;
    likes: number;
    saves: number;
    shares: number;
    comments: number;
  };
  actionable: {
    ctaText?: string;
    ctaUrl?: string;
    relatedVendors?: string[];
    relatedProducts?: string[];
    bookmarkable: boolean;
  };
  source: 'editorial' | 'vendor' | 'user-generated' | 'ai-generated';
  aiGenerated: boolean;
}

export interface InspirationPost {
  id: string;
  title: string;
  description: string;
  images: string[];
  style: string[];
  budget: 'low' | 'medium' | 'high' | 'luxury';
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'any';
  venueType: string;
  guestCount: number;
  location: string;
  vendors: {
    id: string;
    name: string;
    category: string;
    featured: boolean;
  }[];
  realWedding: boolean;
  featured: boolean;
  trending: boolean;
  personalizedScore: number;
  saveCount: number;
  viewCount: number;
}

export interface TrendAlert {
  id: string;
  title: string;
  description: string;
  trendType: 'color' | 'style' | 'venue' | 'technology' | 'service' | 'seasonal';
  urgency: 'low' | 'medium' | 'high';
  impact: 'local' | 'regional' | 'national' | 'global';
  timeframe: 'immediate' | 'this-month' | 'this-season' | 'this-year';
  evidence: {
    searchVolume: number;
    socialMentions: number;
    vendorAdoption: number;
    expertPredictions: string[];
  };
  actionItems: string[];
  relatedContent: string[];
  expiryDate: Date;
}

export interface VendorSpotlight {
  id: string;
  vendorId: string;
  vendorName: string;
  category: string;
  spotlightType: 'new-vendor' | 'trending' | 'award-winner' | 'seasonal' | 'budget-friendly';
  reason: string;
  highlights: string[];
  specialOffer?: {
    description: string;
    discount: number;
    validUntil: Date;
    terms: string;
  };
  portfolio: {
    featuredWork: string[];
    clientTestimonials: string[];
    achievements: string[];
  };
  personalizedMatch: {
    matchScore: number;
    matchReasons: string[];
    userBenefits: string[];
  };
  featured: boolean;
  promoted: boolean;
}

export interface PlanningTip {
  id: string;
  title: string;
  content: string;
  category: 'budgeting' | 'planning' | 'coordination' | 'day-of' | 'post-wedding';
  difficulty: 'easy' | 'medium' | 'hard';
  timeToImplement: number; // in minutes
  costImpact: 'save-money' | 'neutral' | 'investment';
  seasonality?: 'spring' | 'summer' | 'fall' | 'winter';
  applicableStages: string[]; // which planning stages this applies to
  relatedTasks: string[];
  expertSource?: string;
  effectiveness: number; // success rate 0-100
  personalizedRelevance: number;
  implementations: {
    easy: string;
    detailed: string;
    expert: string;
  };
}

export interface UserPreferences {
  interests: string[];
  weddingStyle: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  planningStage: 'just-engaged' | 'early-planning' | 'active-planning' | 'final-details' | 'honeymoon';
  contentTypes: string[];
  engagementHistory: {
    viewedContent: string[];
    savedContent: string[];
    sharedContent: string[];
    likedContent: string[];
  };
  feedbackHistory: {
    ratings: Record<string, number>;
    comments: string[];
    reportedContent: string[];
  };
  personalizedSettings: {
    showTrends: boolean;
    showVendorSpotlights: boolean;
    showTips: boolean;
    showRealWeddings: boolean;
    contentFrequency: 'minimal' | 'moderate' | 'frequent';
    notificationPreferences: string[];
  };
}

export interface ForYouFeed {
  id: string;
  userId: string;
  generatedAt: Date;
  expiresAt: Date;
  content: ForYouContent[];
  metadata: {
    totalItems: number;
    personalizedItems: number;
    freshContent: number;
    algorithmVersion: string;
    generationTime: number; // in ms
  };
  performance: {
    impressions: number;
    clickThroughRate: number;
    engagementRate: number;
    averageTimeSpent: number;
    bounceRate: number;
  };
}

export interface ContentInteraction {
  id: string;
  userId: string;
  contentId: string;
  interactionType: 'view' | 'like' | 'save' | 'share' | 'comment' | 'skip' | 'report';
  timestamp: Date;
  duration?: number; // for view interactions
  context: {
    source: 'feed' | 'search' | 'recommendation' | 'trending';
    position: number;
    sessionId: string;
  };
  feedback?: {
    rating: number;
    comment: string;
    helpful: boolean;
  };
}

export interface ContentFilter {
  contentTypes: string[];
  categories: string[];
  sources: string[];
  minRelevanceScore: number;
  maxAge: number; // in days
  budgetRange?: {
    min: number;
    max: number;
  };
  weddingStage?: string;
  season?: string;
  location?: string;
  difficulty?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ContentCuration {
  curatedBy: 'ai' | 'editorial' | 'user' | 'vendor';
  curationReason: string;
  qualityScore: number;
  relevanceScore: number;
  freshnessScore: number;
  engagementScore: number;
  overallScore: number;
  curationDate: Date;
  reviewer?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
}
