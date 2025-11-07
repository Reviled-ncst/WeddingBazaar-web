/**
 * 🏠 VendorServices - Main Entry Point (REFACTORED)
 * 
 * This file now delegates to the new micro frontend architecture.
 * All logic has been moved to VendorServicesMain component.
 * 
 * Migration Date: November 6, 2025
 * Status: ✅ REFACTORED - Using micro frontends
 * 
 * OLD CODE: See VendorServices_OLD.tsx for legacy implementation
 * NEW CODE: Logic moved to components/VendorServicesMain.tsx
 */

import React from 'react';
import { VendorServicesMain } from './components/VendorServicesMain';

/**
 * VendorServices - Entry point component
 * 
 * This component now simply delegates to VendorServicesMain,
 * which orchestrates all the micro frontend components:
 * - ServiceFilters (search/filter UI)
 * - ServiceListView (grid/list rendering)
 * - ServiceCard (individual service cards)
 * - AddServiceForm (create/edit modal)
 * 
 * All business logic has been moved to micro services:
 * - vendorIdResolver.ts (vendor ID resolution)
 * - subscriptionValidator.ts (subscription limits)
 * - vendorServicesAPI.ts (API calls)
 * - serviceDataNormalizer.ts (data transformation)
 */
export const VendorServices: React.FC = () => {
  return <VendorServicesMain />;
};

export default VendorServices;
