ALTER TABLE dining_tables
    ADD COLUMN section TEXT;

UPDATE dining_tables dt
SET section = s.name
FROM sections s
WHERE s.id = dt.section_id;

ALTER TABLE dining_tables
    ALTER COLUMN section SET NOT NULL,
    ADD CONSTRAINT dining_tables_section_check CHECK (section IN ('indoor', 'outdoor', 'rooftop')),
    DROP COLUMN section_id;

DROP TABLE sections;
