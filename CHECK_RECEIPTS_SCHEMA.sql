-- Check what columns exist in receipts table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'receipts'
ORDER BY ordinal_position;
