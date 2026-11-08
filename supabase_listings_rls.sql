-- Enable Row Level Security on lisitngs table (if not already enabled)
ALTER TABLE lisitngs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to listings
-- This allows anyone to read all listings (clubs)
CREATE POLICY "Allow public read access to listings"
    ON lisitngs
    FOR SELECT
    USING (true);

-- Optional: If you want to allow authenticated users to insert/update/delete
-- Uncomment the policies below if needed:

-- CREATE POLICY "Allow authenticated users to insert listings"
--     ON lisitngs
--     FOR INSERT
--     WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to update listings"
--     ON lisitngs
--     FOR UPDATE
--     USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to delete listings"
--     ON lisitngs
--     FOR DELETE
--     USING (auth.role() = 'authenticated');



