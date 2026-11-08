-- Update all listings to have coordinates within Charlotte, NC
-- Charlotte, NC approximate center: 35.2271, -80.8431
-- This will add some variation so clubs aren't all at the exact same location

-- Option 1: Set all clubs to Charlotte center coordinates (exact same location)
-- UPDATE lisitngs
-- SET 
--     latitude = 35.2271,
--     longitude = -80.8431
-- WHERE latitude IS NULL OR longitude IS NULL OR latitude = 0 OR longitude = 0;

-- Option 2: Set all clubs to Charlotte center with small random variations (recommended)
-- This spreads clubs around Charlotte within a ~5km radius
UPDATE lisitngs
SET 
    latitude = 35.2271 + (RANDOM() * 0.05 - 0.025),  -- ±0.025 degrees ≈ ±2.8km
    longitude = -80.8431 + (RANDOM() * 0.05 - 0.025)  -- ±0.025 degrees ≈ ±2.8km
WHERE latitude IS NULL 
   OR longitude IS NULL 
   OR latitude = 0 
   OR longitude = 0
   OR latitude NOT BETWEEN 35.0 AND 35.5  -- Rough Charlotte area bounds
   OR longitude NOT BETWEEN -81.0 AND -80.5;  -- Rough Charlotte area bounds

-- Option 3: If you want to update ALL records regardless of current values
-- Uncomment the following and comment out Option 2:
-- UPDATE lisitngs
-- SET 
--     latitude = 35.2271 + (RANDOM() * 0.05 - 0.025),
--     longitude = -80.8431 + (RANDOM() * 0.05 - 0.025);

-- Verify the update
SELECT 
    id,
    title,
    latitude,
    longitude,
    CASE 
        WHEN latitude BETWEEN 35.0 AND 35.5 AND longitude BETWEEN -81.0 AND -80.5 
        THEN 'Within Charlotte'
        ELSE 'Outside Charlotte'
    END AS location_status
FROM lisitngs
ORDER BY latitude, longitude
LIMIT 20;


