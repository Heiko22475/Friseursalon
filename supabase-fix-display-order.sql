-- Fix duplicate display_order values in services table
-- This script ensures all display_order values are unique and sequential from 0 to n-1

-- Create a temporary sequence based on current order and ID
WITH ordered_services AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY display_order, id) - 1 AS new_order
  FROM services
)
UPDATE services
SET display_order = ordered_services.new_order
FROM ordered_services
WHERE services.id = ordered_services.id;

-- Verify the fix
SELECT id, title, display_order 
FROM services 
ORDER BY display_order;
