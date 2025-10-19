/**
 * Analytics Utility for WeddingBazaar
 * Tracks user interactions, form submissions, and business metrics
 */

export interface AnalyticsEvent {
  event: string;
  category: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  vendorId?: string;
}

class Analytics {
  private enabled: boolean = true;
  private eventQueue: AnalyticsEvent[] = [];
  private maxQueueSize: number = 100;

  constructor() {
    // Check if we're in development mode
    const isDev = import.meta.env.DEV;
    if (isDev) {
      console.log('[Analytics] Initialized in development mode');
    }
  }

  /**
   * Track a generic event
   */
  track(event: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      category: 'general',
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.logEvent(analyticsEvent);
    this.queueEvent(analyticsEvent);
  }

  /**
   * Track cultural specialty selection
   */
  trackCulturalSpecialty(data: {
    specialty: string;
    action: 'added' | 'removed';
    vendorId?: string;
    serviceCategory?: string;
    totalSelected: number;
  }): void {
    this.track('cultural_specialty_interaction', {
      ...data,
      category: 'service_creation',
    });
  }

  /**
   * Track wedding style selection
   */
  trackWeddingStyle(data: {
    style: string;
    action: 'added' | 'removed';
    vendorId?: string;
    serviceCategory?: string;
    totalSelected: number;
  }): void {
    this.track('wedding_style_interaction', {
      ...data,
      category: 'service_creation',
    });
  }

  /**
   * Track service tier selection
   */
  trackServiceTier(data: {
    tier: 'Basic' | 'Premium' | 'Luxury';
    vendorId?: string;
    serviceCategory?: string;
  }): void {
    this.track('service_tier_selected', {
      ...data,
      category: 'service_creation',
    });
  }

  /**
   * Track availability calendar usage
   */
  trackAvailabilityCalendar(data: {
    action: 'opened' | 'saved' | 'cancelled';
    datesSelected?: number;
    vendorId?: string;
  }): void {
    this.track('availability_calendar_interaction', {
      ...data,
      category: 'service_creation',
    });
  }

  /**
   * Track form step completion
   */
  trackFormStep(data: {
    step: number;
    stepName: string;
    action: 'completed' | 'skipped' | 'error';
    vendorId?: string;
  }): void {
    this.track('form_step_interaction', {
      ...data,
      category: 'service_creation',
    });
  }

  /**
   * Track service submission
   */
  trackServiceSubmission(data: {
    serviceId?: string;
    category: string;
    yearsInBusiness?: number;
    serviceTier?: string;
    culturalSpecialtiesCount: number;
    weddingStylesCount: number;
    vendorId?: string;
    success: boolean;
    error?: string;
  }): void {
    this.track('service_submission', {
      ...data,
      category: 'service_creation',
    });
  }

  /**
   * Track validation warnings
   */
  trackValidationWarning(data: {
    field: string;
    warningType: string;
    currentValue?: any;
    vendorId?: string;
  }): void {
    this.track('validation_warning_shown', {
      ...data,
      category: 'service_creation',
    });
  }

  /**
   * Track user interactions with tooltips
   */
  trackTooltipView(data: {
    field: string;
    value: string;
    section: string;
  }): void {
    this.track('tooltip_viewed', {
      ...data,
      category: 'user_guidance',
    });
  }

  /**
   * Generate insights from tracked events
   */
  getInsights(): {
    mostPopularCulturalSpecialties: string[];
    mostPopularWeddingStyles: string[];
    averageSpecialtiesSelected: number;
    averageStylesSelected: number;
    serviceTierDistribution: Record<string, number>;
  } {
    const culturalSpecialties: Record<string, number> = {};
    const weddingStyles: Record<string, number> = {};
    const serviceTiers: Record<string, number> = {};
    let totalSpecialties = 0;
    let totalStyles = 0;
    let specialtySelections = 0;
    let styleSelections = 0;

    this.eventQueue.forEach((event) => {
      if (event.event === 'cultural_specialty_interaction' && event.metadata?.action === 'added') {
        const specialty = event.metadata.specialty;
        culturalSpecialties[specialty] = (culturalSpecialties[specialty] || 0) + 1;
        totalSpecialties += event.metadata.totalSelected || 0;
        specialtySelections++;
      }

      if (event.event === 'wedding_style_interaction' && event.metadata?.action === 'added') {
        const style = event.metadata.style;
        weddingStyles[style] = (weddingStyles[style] || 0) + 1;
        totalStyles += event.metadata.totalSelected || 0;
        styleSelections++;
      }

      if (event.event === 'service_tier_selected') {
        const tier = event.metadata?.tier;
        if (tier) {
          serviceTiers[tier] = (serviceTiers[tier] || 0) + 1;
        }
      }
    });

    return {
      mostPopularCulturalSpecialties: Object.entries(culturalSpecialties)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([specialty]) => specialty),
      mostPopularWeddingStyles: Object.entries(weddingStyles)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([style]) => style),
      averageSpecialtiesSelected: specialtySelections > 0 ? totalSpecialties / specialtySelections : 0,
      averageStylesSelected: styleSelections > 0 ? totalStyles / styleSelections : 0,
      serviceTierDistribution: serviceTiers,
    };
  }

  /**
   * Export analytics data for reporting
   */
  exportData(): AnalyticsEvent[] {
    return [...this.eventQueue];
  }

  /**
   * Clear analytics queue
   */
  clearQueue(): void {
    this.eventQueue = [];
    console.log('[Analytics] Event queue cleared');
  }

  /**
   * Private method to log events to console in dev mode
   */
  private logEvent(event: AnalyticsEvent): void {
    if (import.meta.env.DEV) {
      console.log(
        `[Analytics] ${event.event}`,
        event.metadata || '',
        event.timestamp
      );
    }
  }

  /**
   * Private method to queue events for batch processing
   */
  private queueEvent(event: AnalyticsEvent): void {
    this.eventQueue.push(event);

    // Prevent queue from growing too large
    if (this.eventQueue.length > this.maxQueueSize) {
      this.eventQueue.shift();
    }
  }

  /**
   * Enable or disable analytics tracking
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`[Analytics] Tracking ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export helper functions for common tracking scenarios
export const trackCulturalSpecialty = (
  specialty: string, 
  action: 'added' | 'removed', 
  totalSelected: number,
  metadata?: Record<string, any>
) => {
  analytics.trackCulturalSpecialty({
    specialty,
    action,
    totalSelected,
    ...metadata,
  });
};

export const trackWeddingStyle = (
  style: string, 
  action: 'added' | 'removed', 
  totalSelected: number,
  metadata?: Record<string, any>
) => {
  analytics.trackWeddingStyle({
    style,
    action,
    totalSelected,
    ...metadata,
  });
};

export const trackServiceTier = (tier: 'Basic' | 'Premium' | 'Luxury', metadata?: Record<string, any>) => {
  analytics.trackServiceTier({
    tier,
    ...metadata,
  });
};

export const trackAvailabilityCalendar = (action: 'opened' | 'saved' | 'cancelled', metadata?: Record<string, any>) => {
  analytics.trackAvailabilityCalendar({
    action,
    ...metadata,
  });
};
