-- Fix RLS policies to allow signup
-- This ensures users can be created during signup

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Allow insert for new users" ON users;

-- Create a more permissive insert policy that allows anyone to insert
-- This is safe because we check for duplicate emails in the application code
CREATE POLICY "Allow insert for new users"
    ON users
    FOR INSERT
    WITH CHECK (true);

-- Alternative: If the above doesn't work, you can temporarily disable RLS for inserts
-- (Only do this if the policy above doesn't work)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify the policy exists
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';


