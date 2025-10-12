const fetch = require('node-fetch');

async function fixVendorIdMapping() {
  console.log('🔧 [FIX] Fixing vendor ID mapping in bookings...');
  
  const baseUrl = 'https://weddingbazaar-web.onrender.com';
  
  try {
    // First, get all vendors
    console.log('1️⃣ [VENDORS] Getting available vendors...');
    const vendorsResponse = await fetch(`${baseUrl}/api/vendors`);
    const vendorsData = await vendorsResponse.json();
    
    console.log('📋 [VENDORS] Available vendors:');
    vendorsData.vendors.forEach(vendor => {
      console.log(`   ${vendor.id}: ${vendor.business_name || vendor.name} (${vendor.category})`);
    });
    
    // Find the most appropriate vendor for "Professional Cake Designer Service"
    // Let's use "Perfect Weddings Co." since it's a wedding planning company that could offer cake services
    const cakeServiceVendor = vendorsData.vendors.find(v => 
      v.business_name?.includes('Perfect') || 
      v.business_name?.includes('Wedding') ||
      v.category?.includes('Wedding')
    );
    
    if (cakeServiceVendor) {
      console.log(`\n🎯 [MAPPING] Using vendor: ${cakeServiceVendor.business_name} (${cakeServiceVendor.id})`);
      console.log('   This vendor will be mapped to the "Professional Cake Designer Service" bookings');
      
      // Note: We can't directly update the database via API, but we can create the mapping
      // This would need to be done via database administration
      console.log('\n📋 [DATABASE UPDATE NEEDED]');
      console.log('Run this SQL to fix the vendor mapping:');
      console.log(`UPDATE bookings SET vendor_id = '${cakeServiceVendor.id}' WHERE vendor_id = '2';`);
      
      return {
        suggestedVendor: cakeServiceVendor,
        sqlUpdate: `UPDATE bookings SET vendor_id = '${cakeServiceVendor.id}' WHERE vendor_id = '2';`
      };
    } else {
      console.log('⚠️ [MAPPING] No suitable vendor found for cake services');
      return null;
    }
    
  } catch (error) {
    console.error('❌ [FIX] Error:', error.message);
    return null;
  }
}

async function createReceiptsTableScript() {
  console.log('\n🧾 [RECEIPTS] Creating receipts table setup script...');
  
  // This would be the SQL to run on the database
  const sqlScript = `
-- Create receipts table and sample data
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    booking_id INTEGER,
    couple_id VARCHAR(50) NOT NULL,
    vendor_id VARCHAR(50) NOT NULL,
    payment_type VARCHAR(20) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount_paid INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'PHP',
    paymongo_payment_id VARCHAR(100),
    paymongo_source_id VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'completed',
    service_name VARCHAR(255) NOT NULL,
    service_category VARCHAR(50),
    event_date DATE,
    event_location TEXT,
    description TEXT,
    notes TEXT,
    tax_amount INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issued_by VARCHAR(100) DEFAULT 'Wedding Bazaar System'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_receipts_couple_id ON receipts(couple_id);
CREATE INDEX IF NOT EXISTS idx_receipts_vendor_id ON receipts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_receipts_payment_date ON receipts(payment_date);

-- Create receipt number generator function
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    year_part VARCHAR(4);
    sequence_part VARCHAR(6);
    next_sequence INTEGER;
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    SELECT COALESCE(MAX(
        CASE 
            WHEN receipt_number LIKE 'WB-' || year_part || '-%' 
            THEN CAST(SUBSTRING(receipt_number FROM LENGTH('WB-' || year_part || '-') + 1) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO next_sequence
    FROM receipts;
    
    sequence_part := LPAD(next_sequence::VARCHAR, 6, '0');
    
    RETURN 'WB-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Insert sample receipts for testing
INSERT INTO receipts (
    receipt_number,
    booking_id,
    couple_id,
    vendor_id,
    payment_type,
    payment_method,
    amount_paid,
    service_name,
    service_category,
    event_date,
    event_location,
    description,
    total_amount,
    paymongo_payment_id
) VALUES
(
    'WB-2025-000001',
    662340,
    '1-2025-001',
    '2-2025-004',
    'deposit',
    'gcash',
    750000,
    'Professional Cake Designer Service',
    'catering',
    '2025-10-31',
    'Bayan Luma IV, Imus, Cavite, Calabarzon, 4103, Philippines',
    'Deposit payment for wedding cake design and catering services',
    750000,
    'pi_test_1234567890gcash'
),
(
    'WB-2025-000002',
    544943,
    '1-2025-001',
    '2-2025-004',
    'balance',
    'maya',
    1900000,
    'Professional Cake Designer Service',
    'catering',
    '2025-10-08',
    'Bayan Luma IV, Imus, Cavite, Calabarzon, 4103, Philippines',
    'Balance payment for itemized quote: Wedding Cake, Catering Service, Photography',
    1900000,
    'pi_test_0987654321maya'
);
`;

  console.log('📄 [SQL] Receipts table creation script ready');
  return sqlScript;
}

async function main() {
  console.log('🚀 [MAIN] Starting vendor and receipts fix process...');
  
  const vendorFix = await fixVendorIdMapping();
  const sqlScript = await createReceiptsTableScript();
  
  console.log('\n🎯 [SUMMARY] Fix Process Complete');
  console.log('\n📋 [REQUIRED ACTIONS]:');
  
  if (vendorFix) {
    console.log('1️⃣ [DATABASE] Run vendor mapping fix:');
    console.log(`   ${vendorFix.sqlUpdate}`);
    console.log(`   This will map bookings to: ${vendorFix.suggestedVendor.business_name}`);
  }
  
  console.log('\n2️⃣ [DATABASE] Set up receipts table (see receipts-table-schema.sql)');
  console.log('3️⃣ [BACKEND] Deploy updated backend with vendor joins');
  console.log('4️⃣ [FRONTEND] Test updated booking display with vendor names');
  console.log('5️⃣ [RECEIPTS] Test receipts functionality');
  
  console.log('\n✅ [EXPECTED RESULTS]:');
  console.log('• Bookings will show proper vendor names instead of "vendor 2"');
  console.log('• Receipts table will be available for payment tracking');
  console.log('• Frontend will display complete booking information');
  console.log('• Users can view payment receipts and history');
}

main();
