ALTER TABLE hotel_websites ALTER COLUMN template SET DEFAULT 'editorial';
ALTER TABLE hotel_websites ALTER COLUMN theme SET DEFAULT 'amber';

UPDATE hotel_websites
SET template = 'editorial'
WHERE template NOT IN ('editorial', 'minimal');

UPDATE hotel_websites
SET theme = 'amber'
WHERE template = 'editorial' AND theme = 'midnight-gold';
