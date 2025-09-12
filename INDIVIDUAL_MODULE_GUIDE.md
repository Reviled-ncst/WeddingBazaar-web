# Wedding Bazaar - Individual Module Development Guide

## 🎯 Overview
This guide outlines the comprehensive development plan for the Wedding Bazaar individual user module, implementing a micro frontend architecture with modern React patterns.

## 📁 Current Individual Module Structure

```
src/pages/users/individual/
├── dashboard/               # ✅ COMPLETED
│   ├── IndividualDashboard.tsx
│   └── index.ts
├── services/               # ✅ COMPLETED  
│   ├── Services.tsx
│   └── index.ts
├── planning/               # ✅ COMPLETED
│   ├── WeddingPlanning.tsx
│   └── index.ts
├── budget/                 # ✅ COMPLETED
│   ├── BudgetManagement.tsx
│   └── index.ts
├── guests/                 # ✅ COMPLETED
│   ├── GuestManagement.tsx
│   └── index.ts
├── bookings/               # ✅ COMPLETED (Basic)
│   ├── IndividualBookings.tsx
│   └── index.ts
├── messages/               # 🚧 TO IMPLEMENT
├── profile/                # 🚧 TO IMPLEMENT
├── calendar/               # 🚧 TO IMPLEMENT
├── gallery/                # 🚧 TO IMPLEMENT
├── reviews/                # 🚧 TO IMPLEMENT
└── landing/                # ✅ COMPLETED
    ├── IndividualLanding.tsx
    ├── CoupleHeader.tsx
    └── index.ts
```

## 🛠️ Next Implementation Steps

### Phase 1: Core User Features (Week 1-2)

#### 1. Messages Module (`src/pages/users/individual/messages/`)
```typescript
// MessageCenter.tsx - Main messaging interface
- Real-time chat with vendors
- Message history and search
- File attachment support
- Read receipts and typing indicators
- Message categorization by vendor

// components/
- ChatList.tsx - List of conversations
- ChatWindow.tsx - Individual chat interface
- MessageComposer.tsx - Message input with attachments
- VendorCard.tsx - Vendor info in chat
```

#### 2. Profile Module (`src/pages/users/individual/profile/`)
```typescript
// ProfileManagement.tsx - Main profile interface
- Personal information management
- Wedding details (date, venue, style preferences)
- Privacy settings
- Notification preferences
- Account security

// components/
- PersonalInfo.tsx - Basic profile details
- WeddingDetails.tsx - Wedding-specific information
- PreferencesSettings.tsx - Style and vendor preferences
- SecuritySettings.tsx - Password and security
```

#### 3. Calendar Module (`src/pages/users/individual/calendar/`)
```typescript
// WeddingCalendar.tsx - Main calendar interface
- Appointment scheduling with vendors
- Task deadlines and reminders
- Wedding timeline visualization
- Event conflict detection
- Calendar integrations (Google, Outlook)

// components/
- CalendarView.tsx - Main calendar grid
- EventModal.tsx - Event creation/editing
- TimelineView.tsx - Wedding timeline
- ReminderSettings.tsx - Notification preferences
```

### Phase 2: Enhanced Features (Week 3-4)

#### 4. Gallery Module (`src/pages/users/individual/gallery/`)
```typescript
// WeddingGallery.tsx - Main gallery interface
- Inspiration board creation
- Vendor portfolio collections
- Photo sharing with vendors
- Mood board collaboration
- Image organization by category

// components/
- InspirationBoard.tsx - Pinterest-style boards
- VendorPortfolios.tsx - Saved vendor work
- PhotoUpload.tsx - Image upload interface
- CategoryTabs.tsx - Gallery organization
```

#### 5. Reviews Module (`src/pages/users/individual/reviews/`)
```typescript
// ReviewManagement.tsx - Review interface
- Write vendor reviews
- Photo/video review attachments
- Review history management
- Response to vendor replies
- Review sharing features

// components/
- ReviewForm.tsx - Review creation form
- ReviewCard.tsx - Individual review display
- RatingSystem.tsx - Star rating component
- PhotoReviewUpload.tsx - Image attachments
```

### Phase 3: Advanced Integrations (Week 5-6)

#### 6. Enhanced Booking System
```typescript
// AdvancedBookings.tsx - Enhanced booking interface
- Multi-vendor booking coordination
- Payment integration
- Contract management
- Booking timeline tracking
- Automatic reminders

// components/
- BookingWizard.tsx - Step-by-step booking process
- PaymentIntegration.tsx - Stripe/PayPal integration
- ContractViewer.tsx - Digital contract display
- BookingTimeline.tsx - Progress tracking
```

#### 7. AI-Powered Features
```typescript
// WeddingAssistant.tsx - AI assistant interface
- Vendor recommendations based on preferences
- Budget optimization suggestions
- Timeline conflict detection
- Style matching algorithms
- Automated task prioritization

// components/
- RecommendationEngine.tsx - AI vendor suggestions
- BudgetOptimizer.tsx - Cost optimization
- StyleMatcher.tsx - Aesthetic compatibility
- TaskPrioritizer.tsx - Smart task management
```

## 🎨 Design System Implementation

### Color Palette
```css
/* Wedding Theme Colors */
--rose-primary: #f43f5e;
--pink-primary: #ec4899;
--purple-accent: #8b5cf6;
--gold-accent: #f59e0b;
--neutral-light: #f8fafc;
--neutral-dark: #1e293b;
```

### Component Architecture
```typescript
// Shared component structure
interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Consistent styling patterns
const baseStyles = "rounded-2xl border border-white/50 backdrop-blur-xl";
const glassStyles = "bg-white/90 shadow-xl";
const gradientStyles = "bg-gradient-to-r from-rose-500 to-pink-500";
```

## 🔄 State Management Strategy

### React Context Structure
```typescript
// Individual-specific contexts
export const WeddingContext = createContext<WeddingContextType>();
export const BookingContext = createContext<BookingContextType>();
export const GuestContext = createContext<GuestContextType>();
export const BudgetContext = createContext<BudgetContextType>();

// Global shared contexts (already implemented)
export const AuthContext = createContext<AuthContextType>();
export const MessengerContext = createContext<MessengerContextType>();
```

### Data Flow Patterns
```typescript
// Service layer for API calls
class IndividualService {
  async getWeddingDetails(userId: string): Promise<WeddingDetails>;
  async updateBudget(budgetData: BudgetUpdate): Promise<Budget>;
  async manageGuests(guestData: GuestUpdate): Promise<Guest[]>;
  async bookVendor(bookingData: BookingRequest): Promise<Booking>;
}

// Custom hooks for data management
export const useWeddingData = () => {
  const [wedding, setWedding] = useState<Wedding>();
  const [loading, setLoading] = useState(true);
  // Implementation
};
```

## 🗄️ Database Integration

### API Endpoints for Individual Module
```typescript
// User-specific endpoints
GET    /api/individual/dashboard     # Dashboard data
GET    /api/individual/wedding       # Wedding details
PUT    /api/individual/wedding       # Update wedding info
GET    /api/individual/budget        # Budget data
PUT    /api/individual/budget        # Update budget
GET    /api/individual/guests        # Guest list
POST   /api/individual/guests        # Add guest
PUT    /api/individual/guests/:id    # Update guest
DELETE /api/individual/guests/:id    # Remove guest
GET    /api/individual/bookings      # User bookings
POST   /api/individual/bookings      # Create booking
GET    /api/individual/messages      # Message history
POST   /api/individual/messages      # Send message
```

### Database Schema Extensions
```sql
-- Individual-specific tables
CREATE TABLE wedding_details (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  wedding_date DATE,
  venue_name VARCHAR(255),
  guest_count INTEGER,
  budget_total DECIMAL(10,2),
  style_preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE guest_lists (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  side VARCHAR(20) CHECK (side IN ('bride', 'groom', 'mutual')),
  rsvp_status VARCHAR(20) DEFAULT 'pending',
  plus_one BOOLEAN DEFAULT FALSE,
  table_assignment INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE budget_categories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category_name VARCHAR(100),
  allocated_amount DECIMAL(10,2),
  spent_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🧪 Testing Strategy

### Component Testing
```typescript
// Example test structure
describe('IndividualDashboard', () => {
  test('displays wedding progress correctly', () => {
    render(<IndividualDashboard />);
    expect(screen.getByText(/wedding planning progress/i)).toBeInTheDocument();
  });

  test('navigates to budget management', () => {
    render(<IndividualDashboard />);
    fireEvent.click(screen.getByText(/manage budget/i));
    expect(mockNavigate).toHaveBeenCalledWith('/individual/budget');
  });
});
```

### Integration Testing
```typescript
// API integration tests
describe('Individual API Integration', () => {
  test('fetches wedding data on dashboard load', async () => {
    const mockWeddingData = { /* mock data */ };
    jest.spyOn(api, 'getWeddingDetails').mockResolvedValue(mockWeddingData);
    
    render(<IndividualDashboard />);
    await waitFor(() => {
      expect(screen.getByText(mockWeddingData.venue)).toBeInTheDocument();
    });
  });
});
```

## 🚀 Performance Optimization

### Code Splitting Strategy
```typescript
// Lazy loading for individual modules
const WeddingPlanning = lazy(() => import('./planning/WeddingPlanning'));
const BudgetManagement = lazy(() => import('./budget/BudgetManagement'));
const GuestManagement = lazy(() => import('./guests/GuestManagement'));

// Route-based splitting
const IndividualRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/planning" element={<WeddingPlanning />} />
      <Route path="/budget" element={<BudgetManagement />} />
      <Route path="/guests" element={<GuestManagement />} />
    </Routes>
  </Suspense>
);
```

### Caching Strategy
```typescript
// React Query for server state management
export const useWeddingQuery = (userId: string) => {
  return useQuery({
    queryKey: ['wedding', userId],
    queryFn: () => api.getWeddingDetails(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

## 📱 Mobile Responsiveness

### Responsive Design Patterns
```tsx
// Mobile-first component design
const DashboardCard = ({ children, className = "" }: CardProps) => (
  <div className={cn(
    "bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl",
    "p-4 md:p-6 lg:p-8", // Responsive padding
    "col-span-1 md:col-span-2 lg:col-span-1", // Responsive grid
    className
  )}>
    {children}
  </div>
);

// Responsive navigation
const MobileNavigation = () => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t">
    {/* Mobile navigation items */}
  </div>
);
```

## 🔧 Development Tools

### VS Code Configuration
```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### Development Scripts
```json
// package.json scripts
{
  "dev:individual": "vite --port 3000 --mode development",
  "build:individual": "tsc && vite build --outDir dist/individual",
  "test:individual": "jest src/pages/users/individual",
  "storybook:individual": "storybook dev -p 6006",
  "lint:individual": "eslint src/pages/users/individual --ext .ts,.tsx"
}
```

## 🎯 Success Metrics

### Key Performance Indicators (KPIs)
- **User Engagement**: Time spent on planning tools
- **Feature Adoption**: Usage rates of budget, guest, and planning modules
- **Conversion Rate**: From browsing to vendor bookings
- **User Satisfaction**: Ratings and feedback scores
- **Technical Performance**: Page load times, error rates

### Monitoring Implementation
```typescript
// Analytics integration
export const trackUserAction = (action: string, data?: any) => {
  // Google Analytics
  gtag('event', action, {
    event_category: 'Individual Module',
    event_label: data?.label,
    value: data?.value
  });
  
  // Custom analytics
  analytics.track(action, {
    module: 'individual',
    timestamp: new Date().toISOString(),
    ...data
  });
};
```

## 🔄 Continuous Improvement

### A/B Testing Framework
```typescript
// Feature flag system
export const useFeatureFlag = (flagName: string) => {
  const [isEnabled, setIsEnabled] = useState(false);
  
  useEffect(() => {
    // Check feature flag from backend or local config
    checkFeatureFlag(flagName).then(setIsEnabled);
  }, [flagName]);
  
  return isEnabled;
};

// Usage in components
const EnhancedBudgetView = () => {
  const isEnhancedViewEnabled = useFeatureFlag('enhanced_budget_view');
  
  return isEnhancedViewEnabled ? 
    <NewBudgetComponent /> : 
    <OriginalBudgetComponent />;
};
```

This comprehensive development guide provides the roadmap for building a world-class wedding planning platform with micro frontend architecture, focusing on user experience, performance, and scalability.
