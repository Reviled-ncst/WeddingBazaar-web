# 👔 WEDDING BAZAAR COORDINATOR ROLE DOCUMENTATION

**Last Updated**: November 1, 2025  
**Status**: ✅ COMPLETE  
**Project**: Wedding Bazaar - Coordinator Role & Responsibilities

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Core Responsibilities](#core-responsibilities)
3. [Skills & Traits](#skills--traits)
4. [Platform Integration](#platform-integration)
5. [Database Schema](#database-schema)
6. [Registration Flow](#registration-flow)
7. [Coordinator Dashboard](#coordinator-dashboard)
8. [Vendor Management Features](#vendor-management-features)
9. [Event Planning Tools](#event-planning-tools)
10. [Communication System](#communication-system)
11. [Performance Metrics](#performance-metrics)
12. [Training & Onboarding](#training--onboarding)

---

## 🎯 OVERVIEW

### What is a Coordinator?

A **Wedding Bazaar Coordinator** is a specialized role within the platform that bridges the gap between vendors, couples, and event management. Coordinators are responsible for orchestrating wedding bazaar events, managing vendor participation, and ensuring seamless guest experiences.

### Role Classification

- **User Type**: `individual` (in database)
- **Role**: `coordinator` (in vendor_profiles)
- **Access Level**: Enhanced permissions beyond regular users
- **Profile Table**: `vendor_profiles` (shares with vendors)

### Key Differentiators

| Feature | Couple | Vendor | Coordinator | Admin |
|---------|--------|--------|-------------|-------|
| Browse Services | ✅ | ❌ | ✅ | ✅ |
| Create Bookings | ✅ | ❌ | ✅ | ✅ |
| Manage Vendors | ❌ | ❌ | ✅ | ✅ |
| Event Planning | ❌ | ❌ | ✅ | ✅ |
| Platform Analytics | ❌ | Limited | ✅ | ✅ |

---

## 🎪 CORE RESPONSIBILITIES

### 1. **Vendor Management** 🏪

#### Booth Assignments & Layouts
- **Assign booth locations** to vendors based on category and preference
- **Create floor plans** with interactive booth mapping
- **Manage booth sizes**: Standard, Premium, Corner booths
- **Track booth availability** and assignments in real-time

**Platform Features**:
```typescript
// Booth Assignment Interface
interface BoothAssignment {
  boothId: string;
  vendorId: string;
  vendorName: string;
  category: string;
  boothType: 'standard' | 'premium' | 'corner';
  location: { x: number; y: number };
  size: string; // e.g., "10x10 ft"
  status: 'assigned' | 'pending' | 'confirmed';
}
```

#### Vendor Communication
- **Setup Times**: Send automated reminders with setup schedules
- **Guidelines**: Share event rules, booth setup instructions, and branding guidelines
- **Expectations**: Set performance metrics and vendor requirements
- **Troubleshooting**: Real-time messaging for vendor concerns

**Communication Channels**:
- In-platform messaging system
- Email notifications
- SMS alerts for urgent updates
- WhatsApp/Viber integration (future)

#### On-Site Vendor Support
- **Check-in system**: Digital vendor check-in on event day
- **Issue resolution**: Quick response to booth setup, technical, or logistical problems
- **Resource coordination**: Connect vendors with AV, power, Wi-Fi support
- **Performance monitoring**: Track vendor engagement and booth traffic

---

### 2. **Event Flow & Program Coordination** 📅

#### Schedule Development
- **Create event timeline**: Multi-day or single-day event schedules
- **Segment planning**: Fashion shows, talks, raffles, networking sessions
- **Buffer time management**: Allocate time for transitions and contingencies
- **Vendor showcase slots**: Schedule vendor presentations or demos

**Event Schedule Structure**:
```typescript
interface EventSchedule {
  eventId: string;
  eventName: string;
  date: Date;
  segments: EventSegment[];
  breaks: BreakPeriod[];
  vendorShowcases: VendorSlot[];
}

interface EventSegment {
  id: string;
  name: string; // "Bridal Fashion Show", "Vendor Talks"
  startTime: string;
  endTime: string;
  location: string; // Main Stage, Booth Area
  speakers: Speaker[];
  requirements: string[]; // AV, lighting, setup needs
}
```

#### Program Execution
- **Cue speakers & performers**: Real-time notifications to presenters
- **Emcee coordination**: Briefing sheets and cue cards
- **Transition management**: Smooth handoffs between segments
- **Time tracking**: Live countdown timers and schedule adherence monitoring

**Platform Tools**:
- Backstage coordinator dashboard
- Live event timeline with alerts
- Speaker/performer contact list
- Emergency contact system

#### Real-Time Adjustments
- **Handle delays**: Adjust schedule dynamically
- **Swap segments**: Re-order program based on venue issues or attendance
- **Extend popular segments**: Add time to high-engagement activities
- **Cancel if needed**: Remove segments due to no-shows or technical failures

---

### 3. **Guest Experience** 🎉

#### Attendee Welcome & Information
- **Check-in desk management**: Oversee registration process
- **Information booth**: Answer questions about vendors, schedule, venue
- **Navigation assistance**: Help guests find specific vendors or event areas
- **VIP guest handling**: Special attention to sponsors or media

**Guest Management Features**:
```typescript
interface GuestManagement {
  totalRegistered: number;
  checkedIn: number;
  vipGuests: VIPGuest[];
  feedbackCollected: number;
  peakAttendance: number;
  heatmap: BoothTrafficData[];
}
```

#### Registration Management
- **Pre-registration system**: Online registration with QR code tickets
- **On-site registration**: Walk-in guest registration
- **Badge printing**: Name badges with QR codes for tracking
- **Guest lists**: Manage VIP, media, and general admission lists

#### Giveaways & Engagement
- **Raffle coordination**: Manage ticket distribution and drawings
- **Swag bags**: Coordinate vendor giveaways and promotional items
- **Photo opportunities**: Set up and manage photo booths or backdrops
- **Social media contests**: Run live contests and engagement activities

#### On-Site Support
- **Inquiries**: Answer questions about vendors, services, pricing
- **Concerns**: Handle complaints or issues professionally
- **Lost & found**: Manage lost items and guest belongings
- **Accessibility**: Ensure ADA compliance and assist guests with disabilities

---

### 4. **Logistics Oversight** 🚚

#### Setup & Teardown Supervision
- **Pre-event setup**: Oversee vendor booth setup (2-4 hours before)
- **Equipment checks**: Verify all AV, lighting, and power connections
- **Signage placement**: Ensure directional and sponsor signage is correct
- **Post-event teardown**: Manage efficient breakdown and cleanup

**Setup Checklist**:
```markdown
- [ ] Vendor check-in area ready
- [ ] All booths numbered and marked
- [ ] Power strips and Wi-Fi tested
- [ ] Main stage AV functional
- [ ] Registration desk setup
- [ ] Signage and branding in place
- [ ] Emergency exits marked
- [ ] First aid station identified
```

#### Technical Coordination
- **Sound system**: Coordinate with AV team for music, announcements, presentations
- **Lighting**: Manage stage lighting, booth lighting, and ambient lighting
- **Video/projection**: Oversee screens for presentations or live streams
- **Wi-Fi network**: Ensure stable internet for vendors and guests

#### Venue Management
- **Floor plan execution**: Match actual layout to planned booth assignments
- **Traffic flow**: Monitor and adjust pathways to prevent congestion
- **Climate control**: Coordinate with venue for temperature and ventilation
- **Cleanliness**: Schedule cleaning crew for restrooms and high-traffic areas

#### Team Coordination
- **Security**: Briefings on access control, emergency procedures, and VIP protection
- **Catering**: Coordinate refreshments for vendors, VIP guests, and staff
- **Medical**: Confirm first aid station and emergency medical contacts
- **Photography**: Coordinate with event photographer for coverage

---

### 5. **Marketing & Promotion Support** 📢

#### Pre-Event Promotion
- **Social media coordination**: Schedule posts, stories, and countdown content
- **Vendor spotlights**: Feature vendors in pre-event marketing
- **Email campaigns**: Send reminders and updates to registered guests
- **Influencer coordination**: Manage influencer invites and coverage

**Marketing Channels**:
- Facebook Events & Ads
- Instagram Stories & Reels
- TikTok short-form videos
- Email newsletters
- Wedding forums and groups

#### On-Site Branding
- **Banner placement**: Ensure sponsor and event banners are visible
- **Photo walls**: Set up branded backdrops for social media photos
- **Swag distribution**: Branded materials (tote bags, pens, etc.)
- **Vendor branding**: Ensure vendors follow branding guidelines

#### Content Capture
- **Behind-the-scenes**: Capture setup, vendor prep, and event execution
- **Live coverage**: Real-time social media updates during event
- **Photo/video collection**: Coordinate with photographer and videographer
- **Testimonials**: Capture guest and vendor testimonials on camera

**Content Strategy**:
```typescript
interface ContentPlan {
  preEvent: {
    vendorSpotlights: number; // 10+ vendors featured
    countdownPosts: number; // Daily countdown
    teasers: string[]; // Fashion show, celebrity appearances
  };
  liveEvent: {
    storiesPerHour: number; // 5-10 Instagram stories
    liveStreams: string[]; // Facebook Live, TikTok Live
    realTimeUpdates: boolean;
  };
  postEvent: {
    highlightReel: boolean;
    vendorThanks: boolean;
    attendeeTestimonials: boolean;
    nextEventTeaser: boolean;
  };
}
```

#### Post-Event Marketing
- **Highlight reel**: Edit and share event recap video
- **Thank you posts**: Acknowledge vendors, sponsors, and guests
- **Photo galleries**: Share event photos on website and social media
- **Survey distribution**: Collect feedback for improvement

---

### 6. **Contingency Planning** 🚨

#### Weather Contingencies
**Outdoor Events**:
- **Rain backup**: Indoor venue or tent rental
- **Heat mitigation**: Fans, misting systems, hydration stations
- **Wind protection**: Secure signage, booth materials, and decorations

**Indoor Events**:
- **Power outages**: Backup generator or battery packs for critical systems
- **HVAC failure**: Portable fans or heaters

#### Technical Issues
- **Sound system failure**: Backup microphones and speakers
- **Projection issues**: Backup projector or monitor
- **Wi-Fi outage**: Mobile hotspot backup
- **Payment system down**: Cash handling procedures

**Technical Emergency Kit**:
```markdown
- Backup microphones (2-3 units)
- Extension cords (10+ units)
- Power strips (5+ units)
- Duct tape, zip ties, scissors
- Batteries (AA, AAA, 9V)
- Mobile hotspot device
- Portable speaker
- Flashlights and headlamps
```

#### Vendor No-Shows
- **Backup vendor list**: Contact standby vendors for last-minute openings
- **Booth reassignment**: Redistribute space to other vendors
- **Guest notification**: Inform attendees of vendor absences

#### Medical Emergencies
- **First aid kit**: Fully stocked and accessible
- **Medical contact**: On-call EMT or nearby hospital contact
- **Evacuation plan**: Clear exit routes and assembly points
- **AED availability**: Automated External Defibrillator on-site

#### Emergency Contact List
```typescript
interface EmergencyContacts {
  venue: {
    manager: ContactInfo;
    maintenance: ContactInfo;
    security: ContactInfo;
  };
  medical: {
    firstAid: ContactInfo;
    nearestHospital: ContactInfo;
    ambulance: string; // Emergency number
  };
  technical: {
    avTech: ContactInfo;
    electrician: ContactInfo;
    itSupport: ContactInfo;
  };
  vendors: {
    backupVendors: VendorContact[];
    catering: ContactInfo;
    security: ContactInfo;
  };
  emergency: {
    police: string;
    fire: string;
    medical: string;
  };
}
```

---

## 🧠 SKILLS & TRAITS

### Essential Skills

#### 1. **Organizational Skills** 📊
- **Multitasking**: Manage 10+ tasks simultaneously during events
- **Time management**: Adhere to strict schedules and deadlines
- **Detail-oriented**: Track small details that impact overall experience
- **Prioritization**: Identify and address critical issues first

**Platform Support**:
- Task management dashboard
- Automated reminders and alerts
- Checklist templates for events
- Real-time progress tracking

#### 2. **Communication Skills** 💬
- **Clarity**: Convey information clearly to diverse audiences
- **Active listening**: Understand vendor and guest needs
- **Conflict resolution**: Mediate disputes professionally
- **Presentation skills**: Brief teams and address audiences

**Communication Tools**:
- In-platform messaging (1-on-1 and group chats)
- Email templates for common scenarios
- SMS/text message alerts
- Public address system for announcements

#### 3. **Interpersonal Skills** 🤝
- **Empathy**: Understand and address concerns with compassion
- **Professionalism**: Maintain composure in high-pressure situations
- **Networking**: Build relationships with vendors and industry partners
- **Leadership**: Inspire and guide teams effectively

#### 4. **Problem-Solving Skills** 🔧
- **Quick thinking**: Make fast decisions during emergencies
- **Resourcefulness**: Find creative solutions with limited resources
- **Adaptability**: Adjust plans on the fly
- **Critical thinking**: Analyze situations and choose best actions

#### 5. **Technical Skills** 💻
- **Event management software**: Proficiency in scheduling and vendor management tools
- **Social media**: Comfortable with Instagram, Facebook, TikTok for live updates
- **Basic AV knowledge**: Understand microphones, speakers, projectors
- **Data analysis**: Interpret attendance and engagement metrics

---

### Desired Traits

#### Personal Qualities
- ✅ **Calm under pressure**: Remain composed during stressful situations
- ✅ **Positive attitude**: Maintain enthusiasm and encourage others
- ✅ **Proactive mindset**: Anticipate issues before they arise
- ✅ **Flexibility**: Adapt to last-minute changes
- ✅ **Attention to detail**: Notice and address small issues
- ✅ **Team player**: Collaborate effectively with staff and vendors

#### Professional Background
- **Event planning experience**: 2+ years in events, hospitality, or coordination
- **Wedding industry knowledge**: Familiarity with vendors, trends, and expectations
- **Customer service**: Experience in guest-facing roles
- **Project management**: Certification or experience in project coordination

#### Nice-to-Have
- Certified Wedding Planner (CWP) or similar credential
- Experience with large-scale events (500+ attendees)
- Multilingual (English + local language)
- Photography or videography skills
- Graphic design skills for marketing materials

---

## 🖥️ PLATFORM INTEGRATION

### Coordinator User Journey

#### 1. **Registration** 📝
```
User selects "Register as Coordinator" 
→ Fills coordinator-specific fields:
   - Company name
   - Years of experience
   - Certifications
   - Event specializations
   - Service areas (regions)
→ Agrees to coordinator terms
→ Account created with `user_type: individual` and `role: coordinator`
→ Profile created in `vendor_profiles` table
```

#### 2. **Onboarding** 🎓
- Welcome email with platform guide
- Video tutorials on coordinator features
- Access to coordinator dashboard
- Assigned a platform support contact

#### 3. **Dashboard Access** 📊
- Events calendar (upcoming, in-progress, completed)
- Vendor management panel
- Guest registration dashboard
- Performance analytics
- Communication center

#### 4. **Event Management** 🎪
- Create new event
- Assign vendors to booths
- Build event schedule
- Invite guests and send reminders
- Monitor event in real-time

#### 5. **Post-Event** 📈
- Review analytics and feedback
- Export vendor performance reports
- Share event highlights
- Plan next event

---

## 🗄️ DATABASE SCHEMA

### Coordinator Profile Storage

**Primary Table**: `vendor_profiles`  
**User Type**: `individual` (in `users` table)  
**Role**: `coordinator` (in `vendor_profiles` table)

```sql
CREATE TABLE vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255), -- "ABC Events Coordination"
  business_type VARCHAR(100), -- "Wedding Coordination"
  role VARCHAR(50), -- "coordinator"
  description TEXT,
  years_experience INTEGER,
  certifications TEXT[], -- Array: ["CWP", "CMM"]
  specializations TEXT[], -- Array: ["Luxury Weddings", "Destination"]
  service_areas TEXT[], -- Array: ["Metro Manila", "Cebu"]
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  portfolio_images TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Coordinator-Specific Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `certifications` | `TEXT[]` | Array of certifications | `["CWP", "CMM", "PMP"]` |
| `specializations` | `TEXT[]` | Event types | `["Luxury", "Destination", "Cultural"]` |
| `service_areas` | `TEXT[]` | Geographic regions | `["Metro Manila", "Cebu", "Davao"]` |
| `years_experience` | `INTEGER` | Years in coordination | `5` |
| `role` | `VARCHAR(50)` | Identifies as coordinator | `"coordinator"` |

---

## 📱 COORDINATOR DASHBOARD

### Dashboard Overview

**URL**: `/coordinator/dashboard`

#### Key Sections

1. **Events Overview** 🎪
   - Upcoming events (next 30 days)
   - In-progress events (live monitoring)
   - Past events (archives)
   - Event creation button

2. **Vendor Management** 🏪
   - Total vendors registered
   - Vendors per category
   - Booth assignments status
   - Vendor check-in status (on event day)

3. **Guest Analytics** 📊
   - Total registrations
   - Check-ins (live count)
   - Peak attendance times
   - Demographic breakdown

4. **Quick Actions** ⚡
   - Send mass message to vendors
   - Update event schedule
   - Post live update to social media
   - Generate event report

5. **Notifications** 🔔
   - Vendor inquiries
   - Guest issues
   - Schedule changes
   - Technical alerts

---

### Event Management Dashboard

**URL**: `/coordinator/events/:eventId`

#### Live Event Monitor

```typescript
interface LiveEventDashboard {
  eventInfo: {
    name: string;
    date: Date;
    status: 'setup' | 'live' | 'ending' | 'teardown';
    attendanceNow: number;
  };
  
  schedule: {
    currentSegment: EventSegment;
    nextSegment: EventSegment;
    upcomingSegments: EventSegment[];
    delays: ScheduleDelay[];
  };
  
  vendors: {
    totalCheckedIn: number;
    totalAssigned: number;
    issues: VendorIssue[];
  };
  
  guests: {
    totalRegistered: number;
    checkedIn: number;
    vipCheckedIn: number;
  };
  
  alerts: {
    critical: Alert[];
    warnings: Alert[];
    info: Alert[];
  };
}
```

#### Dashboard Features

**Real-Time Updates**:
- Live attendance counter
- Current segment progress bar
- Vendor check-in status (green/red indicators)
- Emergency alert banner

**Interactive Floor Plan**:
- Visual booth layout
- Click booth to see vendor details
- Color-coded status (setup, open, closed)
- Heatmap of guest traffic

**Communication Hub**:
- Quick message templates
- Broadcast to all vendors
- Individual vendor chat
- Backstage team group chat

**Schedule Management**:
- Drag-and-drop segment reordering
- Add buffer time to segments
- Cancel or extend segments
- Send notifications to speakers/performers

---

## 🏪 VENDOR MANAGEMENT FEATURES

### Vendor Onboarding

#### Pre-Event Vendor Portal

**Vendor Access**: `/vendor/event/:eventId`

**Features for Vendors**:
1. **Booth Information**: View assigned booth location and details
2. **Setup Instructions**: Download setup guide and floor plan
3. **Schedule**: See event schedule and their showcase slot (if any)
4. **Checklist**: Pre-event checklist (bring items, setup requirements)
5. **Messaging**: Direct line to coordinator

#### Coordinator Tools

**Vendor Invite System**:
```typescript
interface VendorInvite {
  eventId: string;
  vendorId: string;
  boothAssignment: BoothAssignment;
  inviteStatus: 'sent' | 'viewed' | 'accepted' | 'declined';
  sentAt: Date;
  respondedAt: Date | null;
  customMessage: string;
}
```

**Bulk Actions**:
- Send mass messages to all vendors
- Export vendor contact list (CSV)
- Generate vendor badges (PDF)
- Share setup instructions (email blast)

---

### Booth Assignment System

#### Interactive Floor Plan Editor

**Features**:
- Drag-and-drop booth creation
- Resize booths (visual editor)
- Label booths (A1, A2, B1, etc.)
- Color-code by category
- Save multiple layout versions

**Booth Types**:
| Type | Size | Features | Price Tier |
|------|------|----------|------------|
| **Standard** | 10x10 ft | Basic table & chairs | Base |
| **Premium** | 10x15 ft | Corner location, better visibility | +30% |
| **Corner** | 10x10 ft | Two open sides, high traffic | +50% |
| **Double** | 10x20 ft | Large display area | 2x Base |

#### Assignment Algorithm

**Auto-Assignment Logic**:
1. **Category clustering**: Group similar vendors (all photographers together)
2. **Traffic distribution**: Spread high-demand vendors across floor
3. **Competitor separation**: Keep direct competitors apart
4. **Accessibility**: Ensure accessible booths for vendors with disabilities
5. **Power requirements**: Assign booths with power access to AV/tech vendors

**Manual Override**: Coordinator can drag-and-drop to reassign

---

### Vendor Communication System

#### Message Templates

**Pre-Event Templates**:
```markdown
1. **Welcome & Booth Assignment**
   Subject: Your Booth Assignment for [Event Name]
   Body: Welcome! You've been assigned Booth [X]. Setup time: [Time]. Floor plan attached.

2. **Setup Reminder (48 hours before)**
   Subject: Event Reminder - Setup on [Date]
   Body: Setup begins at [Time]. Bring [checklist]. Contact us if issues.

3. **Day-Before Confirmation**
   Subject: See You Tomorrow!
   Body: Event starts [Time]. Last-minute changes: [Details]. Excited to see you!
```

**Day-of Templates**:
```markdown
4. **Morning Check-In**
   Subject: Good Morning - Event Day!
   Body: Check-in opens at [Time]. Report to registration desk. Emergency contact: [Phone].

5. **Schedule Update**
   Subject: Schedule Change
   Body: [Segment] delayed by [X] minutes. New time: [Time]. Apologies for inconvenience.

6. **Issue Notification**
   Subject: Technical Issue - [Location]
   Body: We're aware of [Issue]. Team is working on it. ETA: [Time]. Updates soon.
```

**Post-Event Templates**:
```markdown
7. **Thank You & Feedback**
   Subject: Thank You for Participating!
   Body: Event success thanks to you! Please complete feedback survey: [Link]. See you next time!
```

---

## 📅 EVENT PLANNING TOOLS

### Event Creation Wizard

#### Step 1: Event Details
- Event name
- Date and time
- Venue information
- Expected attendance
- Event type (Bridal Fair, Vendor Showcase, etc.)

#### Step 2: Floor Plan
- Upload venue floor plan (PNG, JPG, PDF)
- Define booth areas
- Mark stage, registration, and amenity locations
- Set booth count and types

#### Step 3: Schedule Building
- Add segments (Fashion Show, Vendor Talks, etc.)
- Assign speakers/performers
- Set buffer times
- Schedule vendor showcases

#### Step 4: Vendor Invitations
- Select vendors to invite
- Assign booth types
- Set invitation deadline
- Customize invite message

#### Step 5: Guest Registration
- Create registration form
- Set ticket types (Free, VIP, Media)
- Generate registration link
- Set registration deadline

#### Step 6: Marketing Plan
- Pre-event posts schedule
- Email campaign setup
- Influencer invitations
- Sponsor acknowledgements

---

### Event Schedule Builder

**Drag-and-Drop Interface**:
```typescript
interface ScheduleBuilder {
  timeline: TimeSlot[];
  segments: EventSegment[];
  breaks: BreakPeriod[];
  vendorSlots: VendorShowcase[];
}

interface TimeSlot {
  startTime: string; // "09:00"
  endTime: string;   // "09:30"
  type: 'segment' | 'break' | 'vendor' | 'transition';
  content: EventSegment | BreakPeriod | VendorShowcase;
}
```

**Features**:
- Visual timeline (Gantt chart style)
- Conflict detection (overlapping segments)
- Buffer time calculator
- Speaker/performer scheduling
- Print schedule as PDF

---

### Guest Registration System

#### Registration Form Builder

**Field Options**:
- Name (required)
- Email (required)
- Phone
- Company/Organization
- Attending as (Couple, Vendor, Media, etc.)
- Interests (checkboxes for vendor categories)
- How did you hear about us?
- Special accommodations

#### Registration Types

| Type | Access | Badge Color | Perks |
|------|--------|-------------|-------|
| **General** | All areas | White | Basic access |
| **VIP** | All + VIP lounge | Gold | Priority seating, swag bag, meet-and-greet |
| **Media** | All + backstage | Red | Press kit, interview access |
| **Vendor** | Booth area | Blue | Vendor-only networking area |

#### Check-In System

**QR Code Check-In**:
1. Guest receives QR code via email upon registration
2. On event day, scan QR at registration desk
3. System logs check-in time
4. Print badge on-site
5. Guest receives swag bag (if applicable)

**Manual Check-In**:
- Search by name or email
- Walk-in registration option
- Issue temporary badge

---

## 💬 COMMUNICATION SYSTEM

### Multi-Channel Messaging

#### In-Platform Messaging

**Direct Messages**:
- Coordinator ↔ Individual vendor
- Coordinator ↔ Guest (for inquiries)
- Coordinator ↔ Team member

**Group Chats**:
- All vendors (broadcast)
- Category-specific (e.g., all photographers)
- Backstage team (coordinator, AV tech, security)
- Emergency contact group

**Features**:
- File attachments (images, PDFs)
- Read receipts
- Urgent flag for critical messages
- Message templates

#### Email Integration

**Automated Emails**:
- Vendor invite sent → Auto-email with details
- Guest registers → Confirmation email with QR code
- Schedule changes → Notification email to all affected parties
- Post-event → Thank you and feedback survey

**Email Templates**:
- Pre-written templates for common scenarios
- Customizable fields (event name, date, vendor name)
- Bulk email sending (BCC to protect privacy)

#### SMS/Text Alerts

**Use Cases**:
- Emergency alerts (venue evacuation, severe weather)
- Last-minute schedule changes
- Vendor no-show alerts
- Check-in reminders (1 hour before event)

**SMS Integration**:
- Twilio API for sending SMS
- Opt-in required (GDPR compliance)
- Character limit considerations (160 chars)

---

### Notification System

**Real-Time Notifications**:
```typescript
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string; // Link to relevant page
}
```

**Notification Types**:
- 🔵 **Info**: New vendor registered, guest checked in
- 🟡 **Warning**: Schedule running late, low attendance
- 🔴 **Critical**: Technical failure, medical emergency, vendor no-show

**Notification Channels**:
- In-app badge (red dot on bell icon)
- Push notifications (if enabled)
- Email (for critical issues)
- SMS (for emergencies)

---

## 📊 PERFORMANCE METRICS

### Event Success KPIs

#### Attendance Metrics
- **Total registrations**: Target vs. actual
- **Check-in rate**: % of registrants who attended
- **Peak attendance**: Highest concurrent attendees
- **Dwell time**: Average time guests spent at event
- **Return rate**: % of guests who attended previous events

#### Vendor Performance
- **Booth traffic**: Estimated visitors per booth
- **Lead generation**: Number of inquiries/bookings per vendor
- **Vendor satisfaction**: Post-event survey score (1-5 stars)
- **Booth setup time**: Average time vendors took to set up
- **Vendor participation rate**: % of invited vendors who confirmed

#### Engagement Metrics
- **Social media mentions**: Posts with event hashtag
- **Photo uploads**: Guest photos shared on social media
- **Survey responses**: % of attendees who completed feedback survey
- **Raffle participation**: Number of entries
- **Session attendance**: Attendance at talks, fashion shows, etc.

#### Financial Metrics
- **Revenue per booth**: If booths are paid
- **Sponsorship value**: Total sponsorship dollars
- **Cost per attendee**: Event cost divided by total attendees
- **ROI**: Return on investment for event

---

### Coordinator Performance Dashboard

**Personal Metrics**:
```typescript
interface CoordinatorMetrics {
  eventsManaged: number;
  totalAttendance: number;
  averageRating: number; // Vendor + guest feedback
  vendorRetentionRate: number; // % vendors who return
  issuesResolved: number;
  responseTime: number; // Average time to respond to inquiries
}
```

**Leaderboard** (Gamification):
- Top coordinators by event attendance
- Highest vendor satisfaction scores
- Fastest issue resolution times
- Most events managed in a year

---

## 🎓 TRAINING & ONBOARDING

### New Coordinator Onboarding

#### Phase 1: Platform Training (Week 1)
- **Day 1**: Account setup, dashboard tour
- **Day 2**: Vendor management tools
- **Day 3**: Event creation wizard
- **Day 4**: Guest registration system
- **Day 5**: Communication tools and templates

#### Phase 2: Shadowing (Week 2)
- **Attend 1-2 live events** as observer
- Shadow experienced coordinator
- Take notes on best practices
- Assist with minor tasks (check-in, vendor support)

#### Phase 3: Assisted Coordination (Month 1)
- **Co-coordinate** an event with mentor
- Manage 1-2 segments independently
- Handle vendor communications
- Post-event debrief and feedback

#### Phase 4: Independent Coordination (Month 2+)
- **Lead coordinator** for small-medium events
- Mentor provides backup support
- Monthly performance reviews
- Continuous learning via workshops

---

### Training Resources

#### Video Tutorials
1. **Platform Basics** (15 min): Dashboard, navigation, settings
2. **Vendor Management** (20 min): Invites, booth assignments, communication
3. **Event Creation** (30 min): End-to-end event setup
4. **Live Event Monitoring** (25 min): Real-time dashboard, emergency protocols
5. **Post-Event Reporting** (15 min): Analytics, feedback collection

#### Written Guides
- **Coordinator Handbook** (PDF): 50-page comprehensive guide
- **Quick Reference Cards**: One-pagers for common tasks
- **Emergency Protocols**: Step-by-step crisis management
- **Vendor Communication Best Practices**: Email and message templates

#### Live Workshops
- **Monthly coordinator meetups**: Share experiences, Q&A
- **Quarterly training sessions**: New features, industry trends
- **Annual coordinator summit**: Networking, awards, advanced training

---

### Certification Program

**Certified Wedding Bazaar Coordinator (CWBC)**

**Requirements**:
- Complete all training modules (100% pass rate)
- Coordinate 5+ events successfully
- Maintain 4.5+ star average rating
- Pass written exam (80+ score)
- Submit case study of best event

**Benefits**:
- CWBC badge on profile
- Priority event assignments
- Higher commission/pay rate
- Invitation to exclusive events
- Continuing education credits

---

## 🔗 INTEGRATION WITH WEDDING BAZAAR PLATFORM

### Cross-Functional Collaboration

#### With Vendors
- **Service Listings**: Coordinators can feature top vendors in event marketing
- **Booking Integration**: Guests can book vendors directly at events (tracked in platform)
- **Reviews**: Vendor performance at events contributes to overall rating
- **Portfolio**: Event photos added to vendor portfolios

#### With Couples
- **Event Discovery**: Couples can browse upcoming bazaars on platform
- **Saved Vendors**: Mark favorite vendors at events, save to profile
- **Booking History**: Track vendors met at events vs. online browsing
- **Planning Tools**: Use platform to organize vendors discovered at events

#### With Admins
- **Event Approval**: Coordinators submit events for admin approval
- **Vendor Verification**: Coordinators can recommend vendors for verification
- **Platform Analytics**: Coordinator metrics contribute to platform growth data
- **Support Escalation**: Critical issues escalated to admin team

---

### API Endpoints for Coordinators

**Coordinator-Specific Routes** (`/api/coordinator`):

```javascript
// Event Management
GET    /api/coordinator/events                  # Get all coordinator's events
POST   /api/coordinator/events                  # Create new event
GET    /api/coordinator/events/:id              # Get event details
PUT    /api/coordinator/events/:id              # Update event
DELETE /api/coordinator/events/:id              # Delete event

// Vendor Management
GET    /api/coordinator/events/:id/vendors      # Get event vendors
POST   /api/coordinator/events/:id/vendors      # Invite vendor to event
PUT    /api/coordinator/booths/:id              # Update booth assignment
DELETE /api/coordinator/events/:id/vendors/:vid # Remove vendor from event

// Schedule Management
GET    /api/coordinator/events/:id/schedule     # Get event schedule
POST   /api/coordinator/events/:id/schedule     # Add schedule segment
PUT    /api/coordinator/schedule/:id            # Update segment
DELETE /api/coordinator/schedule/:id            # Delete segment

// Guest Management
GET    /api/coordinator/events/:id/guests       # Get registered guests
POST   /api/coordinator/events/:id/guests       # Register guest
PUT    /api/coordinator/guests/:id/check-in     # Check in guest

// Communication
POST   /api/coordinator/messages/broadcast      # Send message to all vendors
POST   /api/coordinator/messages/category       # Send to vendor category
GET    /api/coordinator/messages/threads        # Get all message threads

// Analytics
GET    /api/coordinator/events/:id/analytics    # Event performance metrics
GET    /api/coordinator/performance             # Coordinator personal metrics
```

---

## 📈 FUTURE ENHANCEMENTS

### Phase 1: Core Features (Current)
- ✅ Coordinator registration
- ✅ Event creation and management
- ✅ Vendor booth assignments
- ✅ Guest registration system
- ✅ Basic communication tools

### Phase 2: Advanced Tools (Q1 2026)
- 🔄 Live event monitoring dashboard
- 🔄 Interactive floor plan editor
- 🔄 QR code check-in system
- 🔄 Automated email campaigns
- 🔄 Real-time schedule adjustments

### Phase 3: AI & Automation (Q2 2026)
- 🔮 AI-powered booth assignment (optimal layout)
- 🔮 Predictive attendance modeling
- 🔮 Chatbot for vendor/guest inquiries
- 🔮 Automated schedule conflict detection
- 🔮 Smart vendor recommendations for events

### Phase 4: Mobile App (Q3 2026)
- 📱 Coordinator mobile app (iOS & Android)
- 📱 Offline mode for event day
- 📱 Push notifications
- 📱 Mobile check-in with phone camera
- 📱 Live dashboard on mobile

---

## 📞 SUPPORT & RESOURCES

### Coordinator Support Team

**Contact Methods**:
- **Email**: coordinator-support@weddingbazaar.com
- **Phone**: +63 (XXX) XXX-XXXX (Mon-Fri, 9am-6pm)
- **In-App Chat**: Click "Help" in coordinator dashboard
- **Emergency Hotline**: +63 (XXX) XXX-XXXX (24/7 for event day emergencies)

**Response Times**:
- 🔴 Critical (event day emergency): < 5 minutes
- 🟡 Urgent (pre-event issue): < 2 hours
- 🟢 General inquiry: < 24 hours

---

### Community Resources

**Coordinator Community Forum**: `forum.weddingbazaar.com/coordinators`
- Share best practices
- Ask questions to peers
- Event templates and resources
- Industry news and trends

**Facebook Group**: "Wedding Bazaar Coordinators PH"
- Private group for coordinators
- Networking and peer support
- Event photos and stories

**Monthly Newsletter**: "Coordinator Chronicle"
- Platform updates and new features
- Coordinator spotlights
- Upcoming training sessions
- Industry trends and tips

---

## ✅ COORDINATOR CHECKLIST

### Pre-Event (1-2 Months Before)

- [ ] Create event in platform
- [ ] Design floor plan and booth layout
- [ ] Send vendor invitations
- [ ] Build event schedule
- [ ] Set up guest registration form
- [ ] Prepare marketing materials
- [ ] Confirm venue booking and requirements
- [ ] Order signage and branding materials
- [ ] Book AV, catering, security teams
- [ ] Send pre-event email to vendors (1 month out)

### Pre-Event (1-2 Weeks Before)

- [ ] Confirm vendor participation (send reminders)
- [ ] Finalize booth assignments
- [ ] Send setup instructions to vendors
- [ ] Review event schedule with team
- [ ] Prepare emergency contact list
- [ ] Test AV equipment at venue
- [ ] Confirm catering headcount
- [ ] Send reminder email to registered guests
- [ ] Prepare check-in materials (badges, swag bags)
- [ ] Conduct final walkthrough at venue

### Event Day (Morning)

- [ ] Arrive 2-3 hours before vendors
- [ ] Set up registration desk
- [ ] Test all AV equipment
- [ ] Place signage and directional markers
- [ ] Verify all booths are numbered correctly
- [ ] Check Wi-Fi and power connections
- [ ] Brief security and catering teams
- [ ] Vendor check-in begins (1-2 hours before event)
- [ ] Resolve any vendor setup issues
- [ ] Final sound check for presentations

### Event Day (During Event)

- [ ] Guest check-in and registration
- [ ] Monitor event schedule (stay on time)
- [ ] Cue speakers and performers
- [ ] Address vendor and guest inquiries
- [ ] Post live updates to social media
- [ ] Manage raffle or giveaway activities
- [ ] Monitor booth traffic and adjust as needed
- [ ] Capture photos and videos
- [ ] Handle any emergencies or issues
- [ ] Announce event closing and teardown time

### Event Day (Teardown)

- [ ] Supervise vendor teardown
- [ ] Collect feedback from vendors and guests
- [ ] Ensure all trash is removed
- [ ] Return borrowed equipment
- [ ] Conduct final walkthrough with venue
- [ ] Thank vendors and team members
- [ ] Secure any lost and found items

### Post-Event (1-3 Days After)

- [ ] Send thank you email to vendors
- [ ] Send thank you email to guests
- [ ] Distribute feedback survey
- [ ] Share event photos and videos
- [ ] Compile event analytics report
- [ ] Review feedback and identify improvements
- [ ] Update vendor profiles with event photos
- [ ] Process any unpaid vendor fees
- [ ] Debrief with team
- [ ] Plan next event (if applicable)

---

## 🎉 CONCLUSION

The **Wedding Bazaar Coordinator** role is a critical component of the platform's success. Coordinators orchestrate seamless event experiences, manage vendor relationships, and ensure guest satisfaction. With comprehensive training, powerful platform tools, and ongoing support, coordinators can deliver exceptional wedding bazaar events that connect couples with top vendors and create memorable experiences.

---

**Document Version**: 1.0  
**Last Updated**: November 1, 2025  
**Status**: ✅ COMPLETE  
**Author**: Wedding Bazaar Development Team

---

## 📚 RELATED DOCUMENTATION

- [Registration System Documentation](./REGISTRATION_DOCUMENTATION_INDEX.md)
- [Coordinator Registration Flow](./COORDINATOR_REGISTRATION_COMPLETE_DOCUMENTATION.md)
- [Database Schema Reference](./database-schema.md)
- [API Documentation](./api-documentation.md)
- [User Roles & Permissions](./user-roles-permissions.md)

---

**For Questions or Support**: coordinator-support@weddingbazaar.com
