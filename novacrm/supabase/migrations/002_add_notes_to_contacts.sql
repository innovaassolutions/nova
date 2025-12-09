-- Migration: Add notes column to contacts table
-- Story: 2.4 - Contact Detail View & Edit Modal
-- Description: Add TEXT column for storing contact notes in Markdown format

ALTER TABLE contacts
ADD COLUMN notes TEXT;

COMMENT ON COLUMN contacts.notes IS 'Contact notes in Markdown format';
