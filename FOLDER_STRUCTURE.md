# Wedding Bazaar - Reorganized Folder Structure

## 📁 New Folder Structure

```
src/
├── pages/
│   ├── homepage/                    # Main landing/marketing page
│   │   ├── components/
│   │   │   ├── Hero.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── FeaturedVendors.tsx
│   │   │   └── Testimonials.tsx
│   │   └── Homepage.tsx
│   │
│   ├── individual/                  # Couple/Individual user pages
│   │   ├── landing/
│   │   │   ├── IndividualLanding.tsx
│   │   │   ├── CoupleHeader.tsx
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── Services.tsx
│   │   │   └── index.ts
│   │   ├── bookings/
│   │   │   ├── IndividualBookings.tsx
│   │   │   └── index.ts
│   │   ├── messages/               # TODO: Create messaging pages
│   │   ├── profile/                # TODO: Create profile pages
│   │   └── dashboard/              # TODO: Create dashboard
│   │
│   ├── vendor/                      # Vendor pages
│   │   ├── landing/
│   │   │   ├── VendorLanding.tsx
│   │   │   └── index.ts
│   │   ├── bookings/
│   │   │   ├── VendorBookings.tsx
│   │   │   └── index.ts
│   │   ├── profile/                # TODO: Create vendor profile
│   │   ├── messages/               # TODO: Create vendor messaging
│   │   ├── analytics/              # TODO: Create vendor analytics
│   │   └── dashboard/              # TODO: Create vendor dashboard
│   │
│   ├── admin/                       # Admin pages
│   │   ├── landing/
│   │   │   ├── AdminLanding.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   └── index.ts
│   │   ├── bookings/
│   │   │   ├── AdminBookings.tsx
│   │   │   └── index.ts
│   │   ├── users/                  # TODO: Create user management
│   │   ├── vendors/                # TODO: Create vendor management
│   │   ├── analytics/              # TODO: Create platform analytics
│   │   └── dashboard/              # TODO: Create admin dashboard
│   │
│   └── shared/                      # Shared components between user types
│       └── messenger/
│
├── shared/                          # Global shared components/contexts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── VendorHeader.tsx
│   │   ├── modals/
│   │   └── messaging/
│   ├── contexts/
│   └── services/
│
└── modules/                         # Feature modules (if needed)
```

## ✅ Completed Reorganization

1. **Moved all landing pages** to appropriate folders:
   - `IndividualLanding.tsx` → `pages/individual/landing/`
   - `VendorLanding.tsx` → `pages/vendor/landing/`
   - `AdminLanding.tsx` → `pages/admin/landing/`

2. **Moved services pages**:
   - `Services.tsx` → `pages/individual/services/`

3. **Created proper folder structure** for:
   - Individual/Couple pages (bookings, services, messages, profile, dashboard)
   - Vendor pages (bookings, profile, messages, analytics, dashboard)
   - Admin pages (bookings, users, vendors, analytics, dashboard)

4. **Updated all import paths** in:
   - `AppRouter.tsx`
   - All moved component files
   - Created proper `index.ts` files for clean imports

5. **Created initial placeholder files** for:
   - Individual bookings system
   - Vendor bookings system
   - Admin bookings system

## 🚀 What's Next

### TODO: Create remaining pages

1. **Dashboard pages** for each user type
2. **Profile management** pages
3. **Messaging system** pages (beyond existing shared messenger)
4. **Analytics pages** for vendors and admins
5. **User/Vendor management** for admins

### Benefits of New Structure

- **Clear separation** of concerns by user type
- **Logical grouping** of functionality (all bookings together, all profiles together)
- **Easier navigation** for developers
- **Scalable architecture** for adding new features
- **Consistent naming** conventions
- **Better import organization** with index files

The structure now clearly separates:
- **Homepage** - Marketing/landing page for unauthenticated users
- **Individual** - All couple/individual user functionality
- **Vendor** - All vendor business functionality  
- **Admin** - All administrative functionality
- **Shared** - Components used across all user types
