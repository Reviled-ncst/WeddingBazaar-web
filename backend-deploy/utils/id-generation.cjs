/**
 * Updated ID generation functions for production backend
 * These functions replace the timestamp-based ID generation with proper sequential IDs
 */

// Helper function to get the next sequential ID for users
async function getNextUserId(sql, role) {
  try {
    const prefix = role === 'vendor' ? '2' : '1';
    const year = new Date().getFullYear();
    
    // Get the highest existing ID for this role and year
    const result = await sql`
      SELECT id FROM users 
      WHERE id LIKE ${`${prefix}-${year}-%`}
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    if (result.length === 0) {
      // First user of this type this year
      return `${prefix}-${year}-001`;
    }
    
    // Extract the number part and increment
    const lastId = result[0].id;
    const numberPart = parseInt(lastId.split('-')[2]);
    const nextNumber = (numberPart + 1).toString().padStart(3, '0');
    
    return `${prefix}-${year}-${nextNumber}`;
  } catch (error) {
    console.error('❌ Error generating user ID:', error);
    // Fallback to timestamp-based ID
    const prefix = role === 'vendor' ? '2' : '1';
    const year = new Date().getFullYear();
    return `${prefix}-${year}-${String(Date.now()).slice(-3)}`;
  }
}

// Helper function to get the next sequential ID for services
async function getNextServiceId(sql) {
  try {
    // Get the latest service ID
    const result = await sql`
      SELECT id FROM services 
      WHERE id LIKE 'SRV-%'
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    if (result.length === 0) {
      // First service
      return 'SRV-0001';
    }
    
    // Extract the number part and increment
    const lastId = result[0].id;
    const numberPart = parseInt(lastId.replace('SRV-', ''));
    const nextNumber = (numberPart + 1).toString().padStart(4, '0');
    
    return `SRV-${nextNumber}`;
  } catch (error) {
    console.error('❌ Error generating service ID:', error);
    // Fallback to timestamp-based ID
    return `SRV-${Date.now()}`;
  }
}

module.exports = {
  getNextUserId,
  getNextServiceId
};
