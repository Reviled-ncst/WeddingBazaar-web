# Vendor Subscription System - Access Control Improvements

## Overview
The subscription system provides tiered access control for vendors, ensuring they get value appropriate to their subscription level while encouraging upgrades as their business grows.

## How Vendor Access is Improved with Subscriptions

### 1. **Service Management** 
- **Basic**: 5 services max, 3 images per service
- **Premium**: Unlimited services, 10 images per service
- **Professional**: Unlimited services, 25 images per service
- **Enterprise**: Unlimited everything

**Benefits:**
- Prevents service spam from free users
- Encourages quality over quantity for basic users
- Scales with business growth

### 2. **Booking Management**
- **Basic**: 20 bookings/month, 5 concurrent bookings
- **Premium**: 100 bookings/month, 20 concurrent bookings
- **Professional**: 500 bookings/month, 50 concurrent bookings
- **Enterprise**: Unlimited bookings

**Benefits:**
- Ensures platform capacity is managed
- Revenue scales with vendor success
- High-volume vendors get appropriate resources

### 3. **Communication Features**
- **Basic**: 100 messages/month, no video calls
- **Premium**: 500 messages/month, 60min video calls
- **Professional**: 2000 messages/month, 180min video calls
- **Enterprise**: Unlimited communication

**Benefits:**
- Prevents spam and encourages meaningful communication
- Video calls add premium value
- Business growth supported with more communication

### 4. **Marketing & Visibility**
- **Basic**: No featured listings, 1 social integration
- **Premium**: 7 days featured/month, 5 social integrations, SEO tools
- **Professional**: 30 days featured/month, 15 integrations, competitor insights
- **Enterprise**: Unlimited featured listings, unlimited integrations

**Benefits:**
- Featured placement drives more bookings
- Social integrations expand reach
- SEO tools improve organic discovery

### 5. **Analytics & Business Intelligence**
- **Basic**: 30 days history, basic metrics
- **Premium**: 90 days history, advanced reports, data export
- **Professional**: 1 year history, competitor insights, custom reports
- **Enterprise**: Unlimited history, real-time analytics, custom dashboards

**Benefits:**
- Business insights help vendors optimize
- Historical data shows trends and patterns
- Competitive intelligence helps positioning

### 6. **Team & Business Management**
- **Basic**: 1 team member
- **Premium**: 3 team members, custom contracts
- **Professional**: 10 team members, multi-location, team permissions
- **Enterprise**: Unlimited team members, advanced permissions, audit logs

**Benefits:**
- Supports business growth and scaling
- Team collaboration improves service quality
- Multi-location support for expanding businesses

### 7. **Technical Features**
- **Basic**: 1000 API calls/month, 1 webhook, 2 integrations
- **Premium**: 5000 API calls/month, 3 webhooks, 10 integrations
- **Professional**: 25000 API calls/month, 10 webhooks, 25 integrations
- **Enterprise**: Unlimited API access, unlimited webhooks and integrations

**Benefits:**
- API access enables custom solutions
- Integrations streamline business operations
- Webhooks enable real-time automation

## Implementation Examples

### Service Creation with Limits
```typescript
const handleCreateService = () => {
  if (!canCreateService()) {
    showUpgradePrompt('You\'ve reached your service limit. Upgrade to add more services.');
    return;
  }
  // Proceed with service creation
};
```

### Image Upload with Restrictions
```typescript
const handleImageUpload = (files: FileList) => {
  const currentImages = service.images.length;
  if (!canUploadImages(currentImages + files.length)) {
    showUpgradePrompt('Upgrade to upload more images per service.');
    return;
  }
  // Proceed with upload
};
```

### Feature-Gated UI Components
```typescript
<SubscriptionGate 
  subscription={subscription}
  feature="featured_listings"
  requiredTier="premium"
  fallback={<UpgradePrompt feature="Featured Listings" />}
>
  <FeaturedListingButton />
</SubscriptionGate>
```

## Business Benefits

### For the Platform
1. **Predictable Revenue**: Monthly recurring revenue from subscriptions
2. **Usage-Based Pricing**: Costs scale with vendor success
3. **Reduced Abuse**: Limits prevent spam and misuse
4. **Quality Control**: Higher-tier vendors typically provide better service

### For Vendors
1. **Fair Pricing**: Pay for what you use and need
2. **Growth Path**: Clear upgrade path as business grows
3. **Professional Tools**: Access to business-grade features
4. **Competitive Advantage**: Premium features help stand out

### For Customers
1. **Quality Assurance**: Premium vendors often provide better service
2. **Verified Vendors**: Paying vendors are more committed
3. **Better Experience**: Premium features improve customer interaction
4. **Trust Indicators**: Subscription badges build confidence

## Usage Monitoring & Analytics

### Real-time Usage Tracking
- Track all feature usage in real-time
- Show progress toward limits in vendor dashboard
- Send notifications when approaching limits
- Provide upgrade suggestions based on usage patterns

### Business Intelligence
- Analyze which features drive upgrades
- Identify optimal pricing tiers
- Track vendor lifecycle and churn
- Measure feature adoption rates

### Automated Upgrade Suggestions
- Suggest upgrades when vendors hit limits frequently
- Recommend plans based on usage patterns
- Offer limited-time promotions for upgrades
- Provide ROI calculations for premium features

## Technical Implementation

### Database Schema
```sql
-- Vendor subscriptions table
CREATE TABLE vendor_subscriptions (
  id UUID PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id),
  plan_id VARCHAR(50),
  status VARCHAR(20),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  stripe_subscription_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE subscription_usage (
  id UUID PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id),
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  services_count INTEGER DEFAULT 0,
  monthly_bookings_count INTEGER DEFAULT 0,
  monthly_messages_count INTEGER DEFAULT 0,
  api_calls_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
```typescript
// Subscription management
GET /api/vendors/:id/subscription
PUT /api/vendors/:id/subscription
POST /api/vendors/:id/subscription/upgrade
DELETE /api/vendors/:id/subscription

// Usage tracking
GET /api/vendors/:id/usage
POST /api/vendors/:id/usage/track
GET /api/vendors/:id/usage/limits

// Feature access
GET /api/vendors/:id/features
POST /api/vendors/:id/features/check
```

This comprehensive subscription system ensures that vendors get appropriate access based on their investment while providing clear growth paths and value propositions for upgrading.
