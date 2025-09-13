/**
 * DSS Main Index - Micro Frontend Orchestrator
 * 
 * ARCHITECTURAL NOTES:
 * This is the main orchestrator for the Decision Support System micro frontend.
 * It coordinates between different micro components while maintaining separation of concerns.
 * 
 * MICRO FRONTEND ARCHITECTURE:
 * - Each tab component is a complete micro frontend unit
 * - Shared state management through props (avoid global state)
 * - Real API integration through services layer
 * - Currency detection and localization built-in
 * - Error boundaries and loading states per component
 * 
 * INDEXING STRUCTURE:
 * 1. Main Orchestrator (DecisionSupportSystem.tsx)
 * 2. Tab Components (/components/*.Tab.tsx)
 * 3. UI Components (/components/*.tsx)
 * 4. Business Logic (/services/index.ts)
 * 5. Type Definitions (/types/index.ts)
 */

export { DecisionSupportSystemOrchestrator as DecisionSupportSystem } from './DSSOrchestrator';
export { dataOptimizationService, useOptimizedData } from './DataOptimizationService';

// Export micro components for independent use
export * from './components';
export * from './services';
export * from './types';

/**
 * MICRO FRONTEND DEPLOYMENT STRATEGY:
 * 
 * Development Mode:
 * - All components in single bundle
 * - Hot reloading for rapid development
 * - Shared dependencies
 * 
 * Production Mode (Future):
 * - Each tab component can be deployed independently
 * - Module federation for micro frontend architecture
 * - Separate CDN deployment for components
 * - Independent versioning and updates
 * 
 * COMPONENT BOUNDARIES:
 * ┌─────────────────────────────────────┐
 * │        DSS Orchestrator             │
 * │  ┌─────────────────────────────────┐ │
 * │  │      Recommendations Tab        │ │
 * │  │  - Service filtering            │ │
 * │  │  - AI scoring algorithm         │ │
 * │  │  - Real API integration         │ │
 * │  └─────────────────────────────────┘ │
 * │  ┌─────────────────────────────────┐ │
 * │  │        Packages Tab             │ │
 * │  │  - Package generation           │ │
 * │  │  - Cost optimization            │ │
 * │  │  - Bundle recommendations       │ │
 * │  └─────────────────────────────────┘ │
 * │  ┌─────────────────────────────────┐ │
 * │  │        Insights Tab             │ │
 * │  │  - Market analysis              │ │
 * │  │  - Trend detection              │ │
 * │  │  - Risk assessment              │ │
 * │  └─────────────────────────────────┘ │
 * │  ┌─────────────────────────────────┐ │
 * │  │         Budget Tab              │ │
 * │  │  - Cost breakdown               │ │
 * │  │  - Budget optimization          │ │
 * │  │  - Saving opportunities         │ │
 * │  └─────────────────────────────────┘ │
 * │  ┌─────────────────────────────────┐ │
 * │  │       Comparison Tab            │ │
 * │  │  - Side-by-side analysis        │ │
 * │  │  - Feature comparison           │ │
 * │  │  - Decision matrix              │ │
 * │  └─────────────────────────────────┘ │
 * └─────────────────────────────────────┘
 * 
 * DATA FLOW:
 * User Input → DSS Orchestrator → Tab Components → Services → API
 *     ↓              ↓                ↓             ↓        ↓
 * Props        State Management    Business Logic  HTTP    Database
 *     ↓              ↓                ↓             ↓        ↓
 * UI Updates ← Component Render ← Data Transform ← Response ← Query
 */
