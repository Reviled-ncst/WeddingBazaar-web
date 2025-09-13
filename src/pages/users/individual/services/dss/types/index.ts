/**
 * DSS Types Module
 * Centralized type definitions for the Decision Support System
 */

import type { Service } from '../../../../../../modules/services/types';

export interface DSSProps {
  services: Service[];
  budget?: number;
  location?: string;
  weddingDate?: Date;
  guestCount?: number;
  priorities?: string[];
  isOpen: boolean;
  onClose: () => void;
  onServiceRecommend: (serviceId: string) => void;
}

export interface DSSTabProps {
  services: Service[];
  budget?: number;
  location?: string;
  weddingDate?: Date;
  guestCount?: number;
  priorities?: string[];
  locationData?: LocationData | null;
}

export interface DSSRecommendation {
  serviceId: string;
  score: number;
  reasons: string[];
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedCost: number;
  valueRating: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface DSSInsight {
  type: 'budget' | 'trend' | 'risk' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  data?: any;
}

export interface BudgetAnalysis {
  totalEstimated: number;
  percentageUsed: number;
  categoryBreakdown: Record<string, number>;
  recommendations: string[];
  riskAreas: string[];
  savingOpportunities: string[];
}

export interface PackageRecommendation {
  id: string;
  name: string;
  description: string;
  services: string[]; // Service IDs
  totalCost: number;
  originalCost: number;
  savings: number;
  savingsPercentage: number;
  category: 'essential' | 'standard' | 'premium' | 'luxury';
  suitability: number; // 0-100 score
  reasons: string[];
  timeline: string;
  flexibility: 'high' | 'medium' | 'low';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface WeddingStyle {
  style: string;
  description: string;
  essentialCategories: string[];
  recommendedBudgetSplit: Record<string, number>;
  averageCost: number;
  popularFeatures: string[];
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Exchange rate to USD
}

export interface LocationData {
  country: string;
  region: string;
  currency: CurrencyConfig;
  timezone: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type TabType = 'recommendations' | 'insights' | 'budget' | 'comparison' | 'packages';
export type SortType = 'score' | 'price' | 'rating';
export type PackageFilterType = 'all' | 'essential' | 'standard' | 'premium' | 'luxury';
