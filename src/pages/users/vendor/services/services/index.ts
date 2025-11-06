/**
 * 📦 Vendor Services - Micro Services Export
 * 
 * Centralized export for all vendor services micro services
 */

// Vendor ID Resolution
export {
  resolveVendorId,
  getServicesVendorId,
  getProfileVendorId,
  type VendorIdResolution
} from './vendorIdResolver';

// Subscription Validation
export {
  checkServiceLimit,
  canFeatureService,
  getUpgradeMessage,
  ensureVendorProfile,
  type SubscriptionLimits,
  type SubscriptionPlan,
  type Subscription,
  type ServiceLimitCheck
} from './subscriptionValidator';

// API Services
export {
  fetchVendorServices,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  type Service,
  type ApiResponse
} from './vendorServicesAPI';
