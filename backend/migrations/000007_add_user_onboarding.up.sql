ALTER TABLE users ADD COLUMN IF NOT EXISTS is_onboarded boolean NOT NULL DEFAULT false;

-- OTP signup seeds name = phone_number and a placeholder @atithi.com email, so
-- anyone already past both has in effect been through onboarding.
UPDATE users
SET is_onboarded = true
WHERE name <> phone_number
  AND email NOT LIKE '%@atithi.com';
