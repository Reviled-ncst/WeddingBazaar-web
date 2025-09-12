# Wedding Bazaar - Booking System Database Schema Documentation

## Overview

This document describes the comprehensive database schema for the Wedding Bazaar booking and payment system. The schema is designed to support a full-featured wedding service marketplace with robust booking management, payment processing, and user interaction capabilities.

## Architecture Principles

### 1. **Scalability**
- UUID primary keys for better distribution across multiple databases
- Indexed foreign keys for optimal query performance
- JSON columns for flexible metadata storage
- Prepared for horizontal scaling and sharding

### 2. **Data Integrity**
- Strong foreign key relationships with appropriate cascade rules
- CHECK constraints for data validation
- UNIQUE constraints to prevent duplicates
- Custom ENUM types for consistent data values

### 3. **Extensibility**
- JSON metadata columns for future feature additions
- Flexible service category system
- Configurable system settings
- Modular design supporting micro-services architecture

### 4. **Security**
- Separation of authentication and profile data
- Encrypted storage considerations for sensitive data
- Audit trails for all critical operations
- GDPR compliance support

## Core Entity Relationships

```
Users (1) ←→ (1) UserProfiles
  ↓
  ├── CoupleProfiles (1:1 for couples)
  ├── VendorProfiles (1:1 for vendors)
  └── Bookings (1:many as couple or vendor)

VendorProfiles (1) ←→ (many) VendorServices
VendorProfiles (1) ←→ (many) VendorAvailability

Bookings (1) ←→ (many) Payments
Bookings (1) ←→ (many) BookingTimeline
Bookings (1) ←→ (1) Reviews
Bookings (1) ←→ (1) Conversations

Conversations (1) ←→ (many) Messages
```

## Key Tables and Their Purpose

### 1. User Management

#### `users`
- Core authentication and account management
- Supports multiple user types: individual, couple, vendor, admin
- Includes security features: email verification, password reset, account locking
- Status tracking for account lifecycle management

#### `user_profiles`
- Extended profile information for all user types
- Flexible location storage using JSONB
- Preferences and settings storage
- Timezone and language support

#### `couple_profiles`
- Specialized information for couples planning weddings
- Wedding-specific details: date, venue, budget, guest count
- Links primary user with optional partner user
- Wedding style and requirements tracking

#### `vendor_profiles`
- Business information for service providers
- Verification status and document tracking
- Portfolio and pricing information
- Business metrics: ratings, reviews, response time
- Social media and website integration

### 2. Service Management

#### `vendor_services`
- Specific services offered by each vendor
- Detailed pricing structure with flexibility for different models
- Package inclusions/exclusions
- Service duration and capacity limits
- Booking requirements and policies

#### `vendor_availability`
- Calendar-based availability management
- Flexible time slot configuration
- Support for multiple bookings per day
- Notes and special conditions

#### `service_categories`
- Standardized service categories with display configuration
- Icon and color theming support
- Active/inactive status management
- Sorting and organization features

### 3. Booking System

#### `bookings`
- Central booking entity linking couples with vendors
- Comprehensive event details and requirements
- Multi-stage pricing: quoted, final, payments
- Status workflow from quote to completion
- Contract and agreement tracking
- Flexible metadata for custom requirements

#### `booking_timeline`
- Complete audit trail of booking lifecycle
- Actor tracking for accountability
- Action descriptions and metadata
- Status change history
- Integration with notification system

### 4. Payment System

#### `payments`
- Complete payment transaction management
- Multiple payment types: deposits, partial, full payments
- Payment gateway integration with webhook support
- Fee tracking: platform fees, gateway fees, net amounts
- Refund and failure handling
- Multi-currency support

#### `payment_receipts`
- Generated receipt documents
- Detailed line item breakdown
- Customer information at time of payment
- Receipt numbering and URL storage
- Accounting and compliance support

### 5. Communication System

#### `conversations`
- Organized communication threads between couples and vendors
- Booking-specific or general conversations
- Archive functionality for organization
- Last message tracking for UI optimization

#### `messages`
- Individual messages within conversations
- Multiple message types: text, images, documents, system
- Read receipts and reply threading
- File attachment support
- Rich metadata for enhanced features

### 6. Review and Rating System

#### `reviews`
- Multi-dimensional rating system (overall, quality, service, value, communication)
- Detailed review content with pros/cons
- Image support for review evidence
- Vendor response capability
- Moderation and featured review support
- Verification for authentic reviews

### 7. Notification System

#### `notifications`
- Comprehensive notification management
- Multiple notification types for different events
- Action URLs for deep linking
- Expiration and read tracking
- Flexible metadata for customization

## Advanced Features

### 1. **Automatic Calculations**
- Vendor rating updates when reviews are added/modified
- Booking reference generation with year-based sequencing
- Payment balance calculations
- Timeline event triggers

### 2. **Performance Optimization**
- Strategic indexing on frequently queried columns
- Composite indexes for complex queries
- JSON indexes for metadata searches
- Partial indexes for conditional queries

### 3. **Data Views**
- `vendor_summary`: Complete vendor information in single query
- `booking_summary`: Booking details with related user information
- `payment_summary`: Payment information with context
- Optimized for dashboard and reporting features

### 4. **Business Logic Functions**
- `generate_booking_reference()`: Automatic reference numbering
- `update_vendor_rating()`: Recalculate vendor ratings
- Timestamp triggers for audit trails
- Extensible for custom business rules

## Data Flow Examples

### 1. **Booking Creation Flow**
1. Couple views vendor service and requests quote
2. Booking record created with status 'quote_requested'
3. Timeline entry logs the creation
4. Notification sent to vendor
5. Conversation thread created for communication

### 2. **Payment Processing Flow**
1. Vendor sends quote, booking status updates to 'quote_sent'
2. Couple accepts quote, status becomes 'quote_accepted'
3. Payment record created with gateway integration
4. Upon payment success, booking status updates to 'confirmed'
5. Payment receipt generated and stored
6. All status changes logged in timeline

### 3. **Review Submission Flow**
1. Booking completed, status becomes 'completed'
2. Review record created with ratings and content
3. Vendor rating automatically recalculated
4. Notification sent to vendor
5. Review appears in vendor profile

## Integration with Frontend

### 1. **API Endpoints**
The schema supports RESTful API endpoints for:
- User authentication and profile management
- Vendor service discovery and filtering
- Booking creation and management
- Payment processing and receipt generation
- Messaging and notification systems
- Review and rating submission

### 2. **Real-time Features**
- WebSocket integration for live messaging
- Real-time booking status updates
- Instant notifications for important events
- Live availability calendar updates

### 3. **Mobile Responsiveness**
- Optimized queries for mobile bandwidth
- Efficient data pagination
- Image compression and resizing support
- Offline capability considerations

## Security Considerations

### 1. **Data Protection**
- Password hashing with bcrypt
- Email verification token security
- Payment data encryption at rest
- PII data protection compliance

### 2. **Access Control**
- Row-level security (RLS) implementation
- Role-based access control
- API rate limiting
- Input validation and sanitization

### 3. **Audit and Compliance**
- Complete audit trails for all critical operations
- GDPR compliance with data deletion capabilities
- Financial transaction logging
- Security event monitoring

## Migration and Maintenance

### 1. **Schema Versioning**
- Version-controlled schema changes
- Backward compatibility considerations
- Data migration scripts
- Rollback procedures

### 2. **Performance Monitoring**
- Query performance analysis
- Index optimization
- Storage growth monitoring
- Backup and recovery procedures

### 3. **Scalability Planning**
- Horizontal scaling preparation
- Database sharding strategies
- Read replica configuration
- Caching layer integration

## Future Enhancements

### 1. **Advanced Features**
- Multi-language support expansion
- Advanced search with Elasticsearch
- Machine learning integration for recommendations
- IoT integration for venue management

### 2. **Business Expansion**
- Multi-tenant architecture for franchise operations
- International market support
- B2B vendor management tools
- Advanced analytics and reporting

### 3. **Technology Integration**
- Blockchain for contract verification
- AI-powered vendor matching
- Video conferencing integration
- Virtual reality venue tours

## Conclusion

This database schema provides a robust foundation for the Wedding Bazaar platform, supporting complex booking workflows, secure payment processing, and comprehensive user interactions. The design emphasizes scalability, security, and extensibility while maintaining optimal performance for both web and mobile applications.

The schema is production-ready and includes all necessary components for a full-featured wedding service marketplace, with clear paths for future enhancements and business growth.
