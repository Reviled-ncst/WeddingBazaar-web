-- Check bookings table constraints
-- Run this query to see what status values are allowed

SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE contype = 'c'
AND conrelid = 'bookings'::regclass
ORDER BY conname;
