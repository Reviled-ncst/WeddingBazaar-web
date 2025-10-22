/**
 * Generate URL-friendly slug from text
 * Removes special characters, converts to lowercase, replaces spaces with hyphens
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate service slug from service title and vendor name
 * Format: {service-title}-by-{vendor-name}
 */
export function generateServiceSlug(serviceTitle: string, vendorName: string): string {
  const titleSlug = generateSlug(serviceTitle);
  const vendorSlug = generateSlug(vendorName);
  return `${titleSlug}-by-${vendorSlug}`;
}

/**
 * Create shareable service URL (public-safe, no IDs exposed)
 */
export function createServiceShareUrl(serviceTitle: string, vendorName: string, serviceId: string): string {
  const slug = generateServiceSlug(serviceTitle, vendorName);
  // Include service ID as query parameter for backend lookup (hidden from visual URL)
  return `/service/${slug}?id=${serviceId}`;
}
