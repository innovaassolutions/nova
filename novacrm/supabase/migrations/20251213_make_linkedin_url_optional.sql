-- Migration: Make linkedin_url optional in contacts table
-- Description: Remove NOT NULL constraint from linkedin_url to allow contacts without LinkedIn profiles
-- Date: 2025-12-13
--
-- This change allows contacts to be created without a LinkedIn URL,
-- making the field truly optional as intended for the business logic.

-- Remove NOT NULL constraint and UNIQUE constraint from linkedin_url
ALTER TABLE contacts
  ALTER COLUMN linkedin_url DROP NOT NULL;

-- Drop the existing unique constraint
ALTER TABLE contacts
  DROP CONSTRAINT IF EXISTS contacts_linkedin_url_key;

-- Add a unique constraint that allows NULL values
-- In PostgreSQL, NULL values are considered distinct, so multiple NULL values are allowed
CREATE UNIQUE INDEX contacts_linkedin_url_unique_idx
  ON contacts (linkedin_url)
  WHERE linkedin_url IS NOT NULL;

-- ROLLBACK (if needed):
-- DROP INDEX IF EXISTS contacts_linkedin_url_unique_idx;
-- ALTER TABLE contacts ADD CONSTRAINT contacts_linkedin_url_key UNIQUE (linkedin_url);
-- ALTER TABLE contacts ALTER COLUMN linkedin_url SET NOT NULL;
