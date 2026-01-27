-- Update all building blocks to allow repetition
UPDATE building_blocks 
SET can_repeat = true 
WHERE block_type IN ('hero', 'about', 'hours', 'contact');
