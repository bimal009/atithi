CREATE TABLE notifications (
    id         UUID PRIMARY KEY,
    hotel_id   UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    type       TEXT NOT NULL,
    title      TEXT NOT NULL,
    subtitle   TEXT,
    read       BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_hotel_id ON notifications (hotel_id, created_at DESC);
