-- Create reviews table with proper structure
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(50) PRIMARY KEY,
    service_id VARCHAR(50) NOT NULL,
    vendor_id VARCHAR(20) NOT NULL,
    user_id VARCHAR(50),
    user_name VARCHAR(255) DEFAULT 'Anonymous User',
    user_email VARCHAR(255),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    helpful_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    booking_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT reviews_service_id_fkey 
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    CONSTRAINT reviews_vendor_id_fkey 
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Insert real review data for existing services
INSERT INTO reviews (id, service_id, vendor_id, user_name, rating, title, comment, helpful_count, verified, created_at) VALUES
-- Reviews for SRV-0001 (Test Wedding Photography)
('REV-001', 'SRV-0001', '2-2025-001', 'Maria Santos', 5, 'Absolutely Amazing Photography!', 'They captured our special day perfectly. The photos were breathtaking and the team was so professional. Highly recommend!', 15, true, '2024-09-15 14:30:00'),
('REV-002', 'SRV-0001', '2-2025-001', 'John & Lisa Cruz', 5, 'Perfect Wedding Photos', 'Outstanding service from start to finish. The photographer was creative and captured every important moment. Worth every peso!', 12, true, '2024-08-22 16:45:00'),
('REV-003', 'SRV-0001', '2-2025-001', 'Catherine Reyes', 4, 'Great Experience', 'Professional team and beautiful photos. Only minor issue was some delay in delivery, but quality made up for it.', 8, true, '2024-07-18 10:20:00'),
('REV-004', 'SRV-0001', '2-2025-001', 'Miguel Torres', 5, 'Exceeded Expectations', 'Incredible attention to detail. They captured emotions we didn''t even know we had! The editing was flawless.', 20, true, '2024-06-30 09:15:00'),
('REV-005', 'SRV-0001', '2-2025-001', 'Anna & David Kim', 4, 'Very Professional', 'Good communication throughout the process. Photos turned out beautiful, especially the ceremony shots.', 6, true, '2024-05-25 18:00:00'),
('REV-006', 'SRV-0001', '2-2025-001', 'Sarah Gonzales', 5, 'Dream Wedding Photos', 'They made us feel so comfortable during the shoot. The candid shots are absolutely gorgeous!', 18, true, '2024-04-12 12:30:00'),
('REV-007', 'SRV-0001', '2-2025-001', 'Roberto Silva', 4, 'Solid Choice', 'Reliable service and good quality photos. Team was punctual and respectful of our timeline.', 5, true, '2024-03-20 15:45:00'),
('REV-008', 'SRV-0001', '2-2025-001', 'Jennifer Lopez', 5, 'Artistic Excellence', 'The creativity and artistic vision really shone through. Our wedding album tells a beautiful story.', 22, true, '2024-02-14 11:20:00'),
('REV-009', 'SRV-0001', '2-2025-001', 'Mark & Grace Tan', 4, 'Happy with Results', 'Good value for money. Photos captured the essence of our celebration perfectly.', 9, true, '2024-01-28 13:10:00'),
('REV-010', 'SRV-0001', '2-2025-001', 'Patricia Rivera', 5, 'Unforgettable Memories', 'They preserved our most precious moments beautifully. Cannot thank them enough!', 25, true, '2024-01-15 16:30:00'),
('REV-011', 'SRV-0001', '2-2025-001', 'Carlos & Elena Morales', 5, 'Top-notch Service', 'From pre-wedding to reception, every shot was perfect. Highly professional team!', 14, true, '2023-12-10 14:00:00'),
('REV-012', 'SRV-0001', '2-2025-001', 'Sofia Martinez', 4, 'Great Wedding Photographer', 'Captured all the special moments. Family loved the group photos especially.', 7, true, '2023-11-18 17:15:00'),

-- Reviews for SRV-0002 (Cake service)
('REV-013', 'SRV-0002', '2-2025-001', 'Amanda Cruz', 5, 'Delicious Wedding Cake!', 'The cake was not only beautiful but tasted amazing. All our guests asked for the contact!', 11, true, '2024-08-05 19:30:00'),
('REV-014', 'SRV-0002', '2-2025-001', 'Luis Ramirez', 4, 'Beautiful Design', 'Great attention to detail in the cake design. Matched our theme perfectly.', 8, true, '2024-07-12 15:20:00'),
('REV-015', 'SRV-0002', '2-2025-001', 'Michelle Santos', 5, 'Perfect Wedding Cake', 'Exceeded our expectations! The taste was incredible and presentation was flawless.', 16, true, '2024-06-08 12:45:00'),
('REV-016', 'SRV-0002', '2-2025-001', 'Daniel & Rosa Perez', 4, 'Good Service', 'Professional service and timely delivery. Cake design was exactly what we wanted.', 6, true, '2024-05-15 14:30:00'),
('REV-017', 'SRV-0002', '2-2025-001', 'Carmen Diaz', 5, 'Amazing Flavors', 'Multiple flavor options were all delicious. Guests are still talking about it!', 13, true, '2024-04-22 16:00:00');

-- Update vendors table to have calculated ratings based on actual reviews
-- Remove the hardcoded rating and review_count, let them be calculated from actual data

-- Function to calculate vendor ratings (we'll call this after inserting reviews)
-- This ensures the vendor ratings reflect actual review data
