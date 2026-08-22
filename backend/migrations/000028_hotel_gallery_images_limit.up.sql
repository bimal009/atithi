CREATE OR REPLACE FUNCTION enforce_hotel_gallery_images_limit() RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM hotel_gallery_images WHERE hotel_id = NEW.hotel_id) >= 10 THEN
        RAISE EXCEPTION 'hotel gallery image limit reached' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hotel_gallery_images_limit
    BEFORE INSERT ON hotel_gallery_images
    FOR EACH ROW
    EXECUTE FUNCTION enforce_hotel_gallery_images_limit();
