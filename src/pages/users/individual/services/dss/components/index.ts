/**
 * DSS Components Module
 * Reusable UI components for the Decision Support System micro frontend
 * 
 * ARCHITECTURAL NOTES:
 * - Each component is a self-contained micro frontend unit
 * - Components use real API services for data operations
 * - Consistent prop interfaces across all components
 * - Error boundaries and loading states built-in
 * - Accessibility features included
 * 
 * INDEXING:
 * 1. Base UI Components (reusable)
 * 2. Tab Components (feature-specific)
 * 3. Card Components (data display)
 * 4. State Components (loading, empty)
 */

// Base UI Components
export * from './ServiceCard';
export * from './PackageCard';
export * from './LoadingSpinner';
export * from './EmptyState';

// Tab Micro Components (each is a complete micro frontend)
export * from './RecommendationsTab';
export * from './PackagesTab';
export * from './InsightsTab';
export * from './BudgetTab';
export * from './ComparisonTab';

/**
 * COMPONENT DEPENDENCY MAP:
 * 
 * RecommendationsTab
 * ├── ServiceCard (displays service recommendations)
 * ├── LoadingSpinner (loading states)
 * └── EmptyState (no results)
 * 
 * PackagesTab
 * ├── PackageCard (displays package recommendations)
 * ├── LoadingSpinner (loading states)
 * └── EmptyState (no packages)
 * 
 * InsightsTab
 * └── Pure component (no dependencies)
 * 
 * BudgetTab
 * └── Pure component (no dependencies)
 * 
 * ComparisonTab
 * └── Pure component (no dependencies)
 * 
 * MICRO FRONTEND ARCHITECTURE:
 * - Each tab is independently deployable
 * - Shared services through ../services
 * - Shared types through ../types
 * - Common utilities through cn() helper
 * - Real API integration via VendorAPIService
 */
