# DSS Micro Frontend Architecture Documentation

## Overview
The Decision Support System (DSS) has been refactored into a comprehensive micro frontend architecture, enabling scalable development and independent deployment of components.

## Architecture Principles

### 1. Micro Frontend Structure
```
src/pages/users/individual/services/dss/
├── index.ts                    # Main orchestrator index
├── DSSOrchestrator.tsx        # Main coordination component
├── DecisionSupportSystem.tsx  # Legacy component (to be deprecated)
├── types/
│   └── index.ts              # Centralized type definitions
├── services/
│   └── index.ts              # Business logic & API services
└── components/               # Micro frontend components
    ├── index.ts             # Component exports with architecture notes
    ├── RecommendationsTab.tsx # Service recommendation micro frontend
    ├── PackagesTab.tsx       # Package generation micro frontend
    ├── InsightsTab.tsx       # Market insights micro frontend
    ├── BudgetTab.tsx         # Budget analysis micro frontend
    ├── ComparisonTab.tsx     # Service comparison micro frontend
    ├── ServiceCard.tsx       # Reusable service display component
    ├── PackageCard.tsx       # Reusable package display component
    ├── LoadingSpinner.tsx    # Loading state component
    └── EmptyState.tsx        # Empty state component
```

### 2. Component Responsibilities

#### Main Orchestrator (`DSSOrchestrator.tsx`)
- Coordinates all micro frontend tabs
- Manages global state and navigation
- Handles currency detection and localization
- Provides consistent header and layout
- Real-time stats computation

#### Tab Micro Components
Each tab is a complete micro frontend with:
- Independent business logic
- Real API integration
- Own state management
- Loading and error states
- Accessibility features

#### Shared Components
- `ServiceCard`: Displays service information with real API actions
- `PackageCard`: Shows package details and pricing
- `LoadingSpinner`: Consistent loading states
- `EmptyState`: User-friendly empty states

### 3. Real API Integration

#### VendorAPIService Methods
```typescript
- getServices(filters)          # Fetch filtered services
- saveRecommendation(serviceId) # Save service to favorites
- contactVendor(serviceId, msg) # Send inquiry to vendor
- bookService(serviceId, data)  # Create booking request
```

#### Currency Detection
```typescript
CurrencyService.detectLocationAndCurrency(location)
- Auto-detects user location
- Provides currency conversion rates
- Supports 9+ major currencies
- Graceful fallback to USD
```

#### DSS Recommendation Engine
```typescript
DSSService.generateRecommendations(services, criteria)
- AI-powered scoring algorithm
- Considers rating, price, location, priorities
- Risk assessment and value rating
- Broader, more inclusive recommendations
```

### 4. Data Flow Architecture

```
User Input → DSS Orchestrator → Tab Components → Services → API
    ↓              ↓                ↓             ↓        ↓
  Props      State Management   Business Logic   HTTP    Database
    ↓              ↓                ↓             ↓        ↓
UI Updates ← Component Render ← Data Transform ← Response ← Query
```

### 4.5. Location-Based Currency Conversion

#### Automatic Currency Detection
The DSS now includes sophisticated location-based currency detection:

```typescript
// Detection Methods (Priority Order)
1. Browser Geolocation API → Coordinates → Country Code
2. Location String Analysis → City/Country Keywords → Country Code  
3. Browser Locale Detection → Language Tag → Country Code
4. Fallback → Default to USD
```

#### Supported Currencies & Exchange Rates
```typescript
{
  'US': { code: 'USD', symbol: '$', rate: 1.0 },
  'CA': { code: 'CAD', symbol: 'C$', rate: 1.35 },
  'GB': { code: 'GBP', symbol: '£', rate: 0.82 },
  'AU': { code: 'AUD', symbol: 'A$', rate: 1.52 },
  'NZ': { code: 'NZD', symbol: 'NZ$', rate: 1.65 },
  'IN': { code: 'INR', symbol: '₹', rate: 83.15 },
  'EU': { code: 'EUR', symbol: '€', rate: 0.92 },
  'SG': { code: 'SGD', symbol: 'S$', rate: 1.36 },
  'HK': { code: 'HKD', symbol: 'HK$', rate: 7.82 }
}
```

#### Currency Conversion Flow
```
User Location → CurrencyService.detectLocationAndCurrency()
      ↓
LocationData Object (country, currency, timezone)
      ↓  
DSSOrchestrator (state management)
      ↓
Tab Components (RecommendationsTab, PackagesTab, etc.)
      ↓
UI Components (ServiceCard, PackageCard, etc.)
      ↓
CurrencyService.formatCurrency() → Local Currency Display
```

#### User Experience Benefits
- **Seamless Conversion**: All prices automatically shown in local currency
- **No Configuration**: Works immediately without user input
- **Transparency**: Exchange rates and detection methods shown in insights
- **Accessibility**: Proper currency formatting with locale support
- **Global Ready**: Supports major wedding markets worldwide

### 5. Micro Frontend Benefits

#### Development Benefits
- **Independent Development**: Each tab can be developed separately
- **Team Scaling**: Different teams can own different tabs
- **Technology Flexibility**: Each component can use different approaches
- **Testing Isolation**: Components can be tested independently

#### Deployment Benefits
- **Independent Deployment**: Components can be deployed separately
- **Version Management**: Each component has its own versioning
- **Rollback Capability**: Individual component rollbacks
- **Performance Optimization**: Lazy loading and code splitting

#### Maintenance Benefits
- **Clear Boundaries**: Well-defined component responsibilities
- **Reduced Complexity**: Smaller, focused codebases
- **Error Isolation**: Failures in one component don't affect others
- **Documentation**: Each component is self-documenting

### 6. Implementation Details

#### Button Actions with Real API
All UI buttons now use real API endpoints:
```typescript
// Save service
await VendorAPIService.saveRecommendation(serviceId);

// Contact vendor
await VendorAPIService.contactVendor(serviceId, message);

// View details (triggers callback)
onServiceRecommend(serviceId);
```

#### Currency Auto-Detection
```typescript
// Detects currency based on:
1. Browser geolocation (if permitted)
2. Location string analysis
3. Browser locale settings
4. Fallback to USD

// Supports currencies:
USD, CAD, GBP, AUD, NZD, INR, EUR, SGD, HKD
```

#### Enhanced Recommendation Logic
- **Broader Suggestions**: Lowered scoring thresholds for diversity
- **Inclusive Scoring**: More vendors get "medium" or "high" priority
- **Market Intelligence**: Seasonal factors and trend analysis
- **Risk Assessment**: Balanced evaluation of new vs. established vendors

### 7. Migration Path

#### Phase 1: Current Implementation ✅
- Created micro frontend tab components
- Implemented real API integration
- Added currency detection
- Enhanced recommendation algorithm

#### Phase 2: Optimization (Future)
- Add error boundaries per component
- Implement component-level caching
- Add performance monitoring
- Create component testing suites

#### Phase 3: True Micro Frontend (Future)
- Implement Module Federation
- Separate CDN deployment
- Independent CI/CD pipelines
- Runtime composition

### 8. Configuration & Environment

#### Development
```typescript
VITE_API_URL=http://localhost:3001/api  # Local backend
VITE_DSS_CACHE_TTL=300000              # 5 minutes cache
VITE_CURRENCY_API_KEY=your_key         # Currency conversion
```

#### Production
```typescript
VITE_API_URL=https://api.weddingbazaar.com/api
VITE_DSS_CACHE_TTL=900000              # 15 minutes cache
VITE_CDN_URL=https://cdn.weddingbazaar.com
```

### 9. Performance Considerations

#### Bundle Optimization
- Tab components are lazy-loaded
- Shared dependencies are optimized
- API responses are cached
- Images are lazy-loaded with loading states

#### Memory Management
- Components clean up on unmount
- API requests are cancellable
- Event listeners are properly removed
- State is reset between sessions

### 10. Accessibility Features

#### Keyboard Navigation
- Tab navigation between components
- Arrow key navigation within components
- Enter/Space for button activation
- Escape key for modal closing

#### Screen Reader Support
- ARIA labels on all interactive elements
- Role attributes for complex components
- Live regions for dynamic content updates
- Descriptive text for all actions

#### Visual Accessibility
- High contrast color schemes
- Consistent focus indicators
- Responsive text sizing
- Motion respects user preferences

## Summary

The DSS micro frontend architecture provides:

1. **Scalability**: Easy to add new tabs and features
2. **Maintainability**: Clear separation of concerns
3. **Performance**: Optimized loading and caching
4. **User Experience**: Real API integration with responsive design
5. **Developer Experience**: Modern tooling and clear structure
6. **Accessibility**: Full WCAG compliance
7. **Internationalization**: Currency and locale support
8. **Quality**: Comprehensive error handling and loading states

This architecture positions the DSS for future growth while providing immediate benefits in terms of code organization, performance, and user experience.
