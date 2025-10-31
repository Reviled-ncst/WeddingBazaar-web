# 💼 Wedding Coordinator Registration Form - Requirements & Specifications

## 📅 Date: October 31, 2025

## 🎯 Overview
Wedding Coordinators require specialized registration fields that differ from both Couples and Vendors. They manage multiple weddings, work with vendor networks, and need business-oriented information.

---

## 📋 Required Form Fields

### **Section 1: Personal Information** (Same as Vendor)
All wedding coordinators need basic personal details for account creation.

```typescript
interface PersonalInfo {
  firstName: string;        // Required - First name
  lastName: string;         // Required - Last name
  email: string;           // Required - Business email (must be unique)
  phone: string;           // Required - Business phone number
  password: string;        // Required - Min 6 characters
  confirmPassword: string; // Required - Must match password
}
```

**Field Details:**
- **First Name**: Coordinator's first name
- **Last Name**: Coordinator's last name
- **Email**: Professional business email (e.g., jane@dreamweddings.com)
- **Phone**: Business contact number with country code
- **Password**: Secure password (min 6 chars, recommend 8+)

---

### **Section 2: Coordination Business Information** ⭐ **SPECIAL FOR COORDINATORS**
This is the key section that differentiates coordinators from regular vendors.

```typescript
interface CoordinationBusinessInfo {
  business_name: string;           // Required - Company/Business name
  business_type: string;           // Required - Coordinator specialty
  location: string;                // Required - Primary office location
  years_experience?: number;       // Optional - Years in business
  team_size?: number;              // Optional - Number of staff
  service_radius?: string;         // Optional - Service area radius
  company_website?: string;        // Optional - Business website URL
  social_media?: {                 // Optional - Social profiles
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
}
```

#### **Business Name** *
- Examples:
  - "Dream Day Wedding Coordinators"
  - "Elite Events Planning"
  - "Perfect Moments Wedding Services"
  - "Jane Smith Wedding Coordination"

#### **Business Category** * (Dropdown)
Specialized coordinator categories:

```typescript
const coordinatorCategories = [
  { value: 'Full-Service Wedding Planner', label: 'Full-Service Wedding Planner' },
  { value: 'Day-of Coordinator', label: 'Day-of Coordinator' },
  { value: 'Partial Planning Coordinator', label: 'Partial Planning Coordinator' },
  { value: 'Destination Wedding Coordinator', label: 'Destination Wedding Coordinator' },
  { value: 'Luxury Wedding Planner', label: 'Luxury Wedding Planner' },
  { value: 'Budget Wedding Coordinator', label: 'Budget Wedding Coordinator' },
  { value: 'Corporate Event Coordinator', label: 'Corporate Event Coordinator' },
  { value: 'Venue Coordinator', label: 'Venue Coordinator' },
  { value: 'Event Design & Planning', label: 'Event Design & Planning' },
  { value: 'Wedding Consultant', label: 'Wedding Consultant' },
  { value: 'Multi-Cultural Wedding Specialist', label: 'Multi-Cultural Wedding Specialist' },
  { value: 'Other', label: 'Other Coordination Services' }
];
```

**Category Descriptions:**
1. **Full-Service Wedding Planner**: Complete planning from engagement to reception
2. **Day-of Coordinator**: Manages execution on wedding day only
3. **Partial Planning Coordinator**: Helps with specific aspects (vendor selection, timeline, etc.)
4. **Destination Wedding Coordinator**: Specializes in destination/travel weddings
5. **Luxury Wedding Planner**: High-end, premium wedding planning services
6. **Budget Wedding Coordinator**: Affordable planning for cost-conscious couples
7. **Corporate Event Coordinator**: Wedding planners who also handle corporate events
8. **Venue Coordinator**: In-house coordinators for specific venues
9. **Event Design & Planning**: Focus on aesthetic design and decor coordination
10. **Wedding Consultant**: Advisory role, coaching couples through planning
11. **Multi-Cultural Wedding Specialist**: Expertise in cross-cultural ceremonies
12. **Other**: Any other coordination specialty

#### **Business Location** *
- Primary office or service area location
- Examples:
  - "Manila, Metro Manila, Philippines"
  - "Makati City, NCR"
  - "Cebu City, Cebu"
  - "Bonifacio Global City, Taguig"
- Should support location picker/autocomplete

#### **Years of Experience** (Optional)
- Dropdown: 0-1, 2-3, 4-5, 6-10, 10-15, 15-20, 20+ years
- Helps establish credibility

#### **Team Size** (Optional)
- Dropdown: Solo, 2-5, 6-10, 11-20, 21-50, 50+ employees
- Indicates capacity to handle multiple events

#### **Service Radius** (Optional)
- Examples: "Metro Manila Only", "Nationwide", "International"
- Multi-select or text input

---

### **Section 3: Service Offerings** (Optional but Recommended)
What services does the coordinator provide?

```typescript
interface ServiceOfferings {
  services: string[];              // Multi-select checkboxes
  average_weddings_per_year?: number;
  average_budget_range?: string;   // Min-max range
  specializations?: string[];      // Unique offerings
}
```

**Service Options:**
- [ ] Full Wedding Planning (Start to Finish)
- [ ] Partial Planning (3-6 months before)
- [ ] Month-of Coordination
- [ ] Day-of Coordination
- [ ] Vendor Management & Coordination
- [ ] Budget Management & Tracking
- [ ] Timeline & Schedule Creation
- [ ] Contract Review & Negotiation
- [ ] Guest List Management
- [ ] RSVP Tracking
- [ ] Seating Chart Creation
- [ ] Ceremony Coordination
- [ ] Reception Management
- [ ] Rehearsal Coordination
- [ ] Destination Wedding Planning
- [ ] Multi-Day Event Coordination
- [ ] Cultural/Religious Ceremony Expertise
- [ ] Emergency Problem Solving

---

### **Section 4: Business Verification** (Optional)
For trust and credibility.

```typescript
interface BusinessVerification {
  business_permit?: string;        // Optional - Government permit number
  tin?: string;                    // Optional - Tax Identification Number
  certifications?: string[];       // Optional - Professional certifications
  insurance?: boolean;             // Optional - Business insurance status
  portfolio_images?: string[];     // Optional - Past event photos
}
```

**Certifications:**
- Certified Wedding Planner (CWP)
- Certified Special Events Professional (CSEP)
- Certified Meeting Professional (CMP)
- Other industry certifications

---

### **Section 5: Preferences & Policies**
Important for business operations.

```typescript
interface BusinessPreferences {
  accepts_packages?: boolean;      // Accept package bookings
  accepts_custom_quotes?: boolean; // Provide custom quotes
  minimum_booking_lead_time?: string; // e.g., "3 months", "6 months"
  cancellation_policy?: string;    // Cancellation terms
  deposit_percentage?: number;     // Required deposit (e.g., 30%)
  payment_terms?: string;          // Payment schedule details
}
```

---

## 🎨 UI/UX Design Specifications

### **Form Layout:**

```
┌─────────────────────────────────────────────┐
│  👤 I am a: [Couple] [Vendor] [Coordinator] │
└─────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Personal Information                                   │
│  ────────────────────────────────────────────────────  │
│  [First Name*]           [Last Name*]                  │
│  [Email*]                [Phone*]                      │
│  [Password*]             [Confirm Password*]           │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  📋 Coordination Business Information                   │
│  ────────────────────────────────────────────────────  │
│  [Business Name*]        [Business Category*]          │
│  [Business Location*]                                  │
│                                                         │
│  📊 Additional Details (Optional)                       │
│  [Years of Experience]   [Team Size]                   │
│  [Service Radius]                                      │
│  [Company Website]                                     │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  ✓ Terms & Conditions                                  │
│  ────────────────────────────────────────────────────  │
│  ☐ I agree to Terms of Service and Privacy Policy *   │
│  ☐ Send me updates about new features                 │
└────────────────────────────────────────────────────────┘

          [Create Coordinator Account]
```

---

## 🎯 Validation Rules

### **Required Fields:**
1. ✅ First Name - Not empty, min 2 chars
2. ✅ Last Name - Not empty, min 2 chars
3. ✅ Email - Valid email format, unique in database
4. ✅ Phone - Valid phone number format
5. ✅ Password - Min 6 characters (recommend 8+)
6. ✅ Confirm Password - Must match password
7. ✅ Business Name - Not empty, min 3 chars
8. ✅ Business Category - Must select from dropdown
9. ✅ Business Location - Not empty
10. ✅ Agree to Terms - Must be checked

### **Optional Fields:**
- Years of Experience
- Team Size
- Service Radius
- Company Website (must be valid URL if provided)
- Social Media links (must be valid URLs if provided)

### **Business Rules:**
- Email must be unique across all users
- Business name should be unique (suggest if already exists)
- Phone number format: International format preferred
- Location should be verified/validated

---

## 🗄️ Database Schema

```sql
-- Users table (same for all user types)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'coordinator', -- 'coordinator'
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  profile_image_url TEXT
);

-- Coordinators table (business details)
CREATE TABLE coordinators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100), -- Coordinator specialty
  location VARCHAR(255),
  years_experience INTEGER,
  team_size INTEGER,
  service_radius VARCHAR(100),
  company_website VARCHAR(255),
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  linkedin VARCHAR(255),
  average_weddings_per_year INTEGER,
  average_budget_range VARCHAR(100),
  certifications TEXT[],
  has_insurance BOOLEAN DEFAULT FALSE,
  business_permit VARCHAR(100),
  tin VARCHAR(50),
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Coordinator services (what they offer)
CREATE TABLE coordinator_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id UUID REFERENCES coordinators(id) ON DELETE CASCADE,
  service_type VARCHAR(100), -- 'Full Planning', 'Day-of', 'Partial', etc.
  description TEXT,
  base_price DECIMAL(10,2),
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  inclusions TEXT[],
  duration VARCHAR(50), -- 'Full service', 'Month-of', 'Day-of'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Security Considerations

1. **Email Verification**: Send verification email after registration
2. **Password Hashing**: Use bcrypt with salt rounds
3. **Rate Limiting**: Prevent spam registrations
4. **Input Sanitization**: Clean all user inputs
5. **CSRF Protection**: Implement CSRF tokens
6. **Business Verification**: Manual or automated verification process

---

## 🚀 Registration Flow

```
1. User clicks "I am a Coordinator"
2. Form shows Personal Information section
3. Form shows Coordination Business Information section
4. User fills required fields (*)
5. User optionally fills additional details
6. User agrees to Terms & Conditions
7. User clicks "Create Coordinator Account"
8. System validates all fields
9. System creates user account + coordinator profile
10. System sends email verification
11. User verifies email
12. Admin reviews and verifies business (optional)
13. Coordinator gains full access to dashboard
```

---

## 📱 Mobile Responsiveness

- Form should be mobile-friendly
- Single column layout on mobile
- Large touch targets for inputs
- Dropdown menus should be mobile-optimized
- Location picker should work on mobile devices

---

## 🎨 Design Tokens (Wedding Theme)

**Colors for Coordinator Section:**
- Background: `bg-gradient-to-br from-amber-50/80 to-yellow-50/60`
- Border: `border-amber-200/50`
- Text: `text-amber-800`
- Icon: `text-amber-500`
- Accent: Golden/Amber tones (represents professionalism & luxury)

**Why Amber/Yellow for Coordinators?**
- **Pink/Rose**: Reserved for couples (romance)
- **Purple/Indigo**: Reserved for vendors (creativity)
- **Amber/Golden**: Coordinators (professionalism, trust, luxury)

---

## 💡 Suggested Enhancements

### **Step 1: Basic Registration** (Current)
- Personal info
- Business name, category, location
- Terms agreement

### **Step 2: Profile Completion** (Post-registration)
- Upload portfolio photos
- Add detailed service descriptions
- Set pricing packages
- Add certifications
- Complete business verification

### **Step 3: Dashboard Onboarding**
- Tour of coordinator dashboard
- Setup first wedding project
- Connect with vendor network
- Enable calendar integration

---

## 📊 Coordinator vs Vendor Comparison

| Field | Vendor | Coordinator |
|-------|--------|-------------|
| **Business Type** | Photography, Catering, etc. | Full Planning, Day-of, etc. |
| **Focus** | Single service specialty | Multi-service coordination |
| **Client Relationship** | One service per wedding | Manages entire wedding |
| **Vendor Network** | Works alone | Works with multiple vendors |
| **Pricing Model** | Per service | Per wedding or hourly |
| **Key Features** | Portfolio, packages | Client management, vendor coordination |

---

## ✅ Implementation Checklist

- [x] Define required fields
- [x] Design form UI/UX
- [x] Create database schema
- [x] Define validation rules
- [x] Specify coordinator categories
- [ ] Update RegisterModal.tsx with coordinator-specific fields
- [ ] Add coordinator category dropdown options
- [ ] Implement coordinator validation logic
- [ ] Update backend API to handle coordinator registration
- [ ] Add coordinator profile creation
- [ ] Create coordinator dashboard
- [ ] Add coordinator-specific features (client management, vendor network, etc.)
- [ ] Test registration flow end-to-end
- [ ] Deploy and verify in production

---

## 🎯 Immediate Action Items

1. **Update `RegisterModal.tsx`:**
   - Add coordinator-specific business categories
   - Differentiate coordinator form from vendor form
   - Update styling for coordinator section (amber theme)

2. **Update Backend API:**
   - Ensure `/api/auth/register` accepts `role: 'coordinator'`
   - Create coordinator profile in database
   - Send appropriate welcome email

3. **Database Migration:**
   - Ensure coordinators table exists
   - Add coordinator specialty categories
   - Create indexes for performance

---

## 📝 Sample Form Data

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@dreamweddings.com",
  "phone": "+63 917 123 4567",
  "password": "SecurePass123!",
  "role": "coordinator",
  "business_name": "Dream Day Wedding Coordinators",
  "business_type": "Full-Service Wedding Planner",
  "location": "Makati City, Metro Manila",
  "years_experience": 8,
  "team_size": 5,
  "service_radius": "Nationwide",
  "company_website": "https://dreamweddings.com",
  "instagram": "https://instagram.com/dreamweddings",
  "agreeToTerms": true,
  "receiveUpdates": true
}
```

---

## 🎉 Summary

**Minimum Required Fields for Wedding Coordinator:**
1. ✅ First Name
2. ✅ Last Name
3. ✅ Email
4. ✅ Phone
5. ✅ Password
6. ✅ Confirm Password
7. ✅ Business Name
8. ✅ Business Category (Coordinator Specialty)
9. ✅ Business Location
10. ✅ Agree to Terms

**Recommended Optional Fields:**
- Years of Experience
- Team Size
- Service Radius
- Company Website
- Social Media Links

**Next Steps:**
1. Implement coordinator-specific categories in RegisterModal
2. Update form styling with amber/golden theme
3. Test registration flow
4. Deploy to production

---

**Status**: ✅ **SPECIFICATION COMPLETE** - Ready for implementation
**Last Updated**: October 31, 2025
**Author**: GitHub Copilot (AI-Assisted Business Analysis)
