ALTER TABLE hotel_websites ALTER COLUMN template SET DEFAULT 'editorial';
ALTER TABLE hotel_websites ALTER COLUMN theme SET DEFAULT 'amber';

UPDATE hotel_websites SET template = 'editorial' WHERE template = 'aurora';
UPDATE hotel_websites SET theme = 'amber' WHERE theme = 'midnight-gold';
