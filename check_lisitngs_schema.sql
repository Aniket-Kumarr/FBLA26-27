-- Check the columns in the lisitngs table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'lisitngs'
ORDER BY ordinal_position;


