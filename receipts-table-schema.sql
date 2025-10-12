-- RECEIPTS TABLE CREATION
-- This table will store payment receipts for the Wedding Bazaar platform

CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL, -- Format: WB-YYYY-XXXXXX
    booking_id INTEGER REFERENCES bookings(id),
    couple_id VARCHAR(50) NOT NULL,
    vendor_id VARCHAR(50) NOT NULL,
    
    -- Payment Details
    payment_type VARCHAR(20) NOT NULL, -- 'deposit', 'balance', 'full_payment'
    payment_method VARCHAR(20) NOT NULL, -- 'card', 'gcash', 'maya', 'grabpay'
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Amounts (in centavos for precision)
    amount_paid INTEGER NOT NULL, -- Amount in centavos (₱100.00 = 10000)
    currency VARCHAR(3) DEFAULT 'PHP',
    
    -- PayMongo Integration
    paymongo_payment_id VARCHAR(100), -- PayMongo payment intent ID
    paymongo_source_id VARCHAR(100), -- PayMongo source ID for e-wallets
    payment_status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    
    -- Business Information
    service_name VARCHAR(255) NOT NULL,
    service_category VARCHAR(50),
    event_date DATE,
    event_location TEXT,
    
    -- Receipt Details
    description TEXT,
    notes TEXT,
    tax_amount INTEGER DEFAULT 0, -- Tax in centavos
    total_amount INTEGER NOT NULL, -- Total in centavos (amount_paid + tax_amount)
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issued_by VARCHAR(100) DEFAULT 'Wedding Bazaar System'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_receipts_booking_id ON receipts(booking_id);
CREATE INDEX IF NOT EXISTS idx_receipts_couple_id ON receipts(couple_id);
CREATE INDEX IF NOT EXISTS idx_receipts_vendor_id ON receipts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_receipts_payment_date ON receipts(payment_date);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);

-- Create function to generate receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    year_part VARCHAR(4);
    sequence_part VARCHAR(6);
    next_sequence INTEGER;
BEGIN
    -- Get current year
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(
        CASE 
            WHEN receipt_number LIKE 'WB-' || year_part || '-%' 
            THEN CAST(SUBSTRING(receipt_number FROM LENGTH('WB-' || year_part || '-') + 1) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO next_sequence
    FROM receipts;
    
    -- Format sequence with leading zeros
    sequence_part := LPAD(next_sequence::VARCHAR, 6, '0');
    
    -- Return formatted receipt number
    RETURN 'WB-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Sample receipt data for testing
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
    generate_receipt_number(),
    662340,
    '1-2025-001',
    '2-2025-004', -- Perfect Weddings Co.
    'deposit',
    'gcash',
    750000, -- ₱7,500.00 in centavos
    'Professional Cake Designer Service',
    'catering',
    '2025-10-31',
    'Bayan Luma IV, Imus, Cavite, Calabarzon, 4103, Philippines',
    'Deposit payment for wedding cake design and catering services',
    750000,
    'pi_test_1234567890gcash'
),
(
    generate_receipt_number(),
    544943,
    '1-2025-001',
    '2-2025-004', -- Perfect Weddings Co.
    'full_payment',
    'card',
    2650000, -- ₱26,500.00 in centavos
    'Professional Cake Designer Service',
    'catering',
    '2025-10-08',
    'Bayan Luma IV, Imus, Cavite, Calabarzon, 4103, Philippines',
    'Full payment for itemized quote: Wedding Cake, Catering Service, Photography',
    2650000,
    'pi_test_0987654321card'
);

-- Create view for receipt display with formatted amounts
CREATE OR REPLACE VIEW receipt_display AS
SELECT 
    r.*,
    v.business_name as vendor_name,
    v.category as vendor_category,
    -- Format amounts from centavos to peso display
    CONCAT('₱', TO_CHAR(r.amount_paid::DECIMAL / 100, 'FM999,999,999.00')) as amount_paid_formatted,
    CONCAT('₱', TO_CHAR(r.total_amount::DECIMAL / 100, 'FM999,999,999.00')) as total_amount_formatted,
    CONCAT('₱', TO_CHAR(r.tax_amount::DECIMAL / 100, 'FM999,999,999.00')) as tax_amount_formatted
FROM receipts r
LEFT JOIN vendors v ON r.vendor_id = v.id
ORDER BY r.created_at DESC;
