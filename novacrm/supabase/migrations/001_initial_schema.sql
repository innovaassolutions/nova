-- Migration: 001_initial_schema
-- Description: Database schema with 7 core tables, RLS policies, triggers, and indexes
-- Date: 2025-12-09
--
-- NOTE: This migration documents the complete database schema.
-- Tables, indexes, and triggers already exist from initial setup.
-- This migration will ENABLE RLS and CREATE POLICIES for security.
--
-- ROLLBACK (if needed):
-- DROP POLICY "authenticated_users_all_access" ON activities;
-- DROP POLICY "authenticated_users_all_access" ON deals;
-- DROP POLICY "authenticated_users_all_access" ON pipeline_stages;
-- DROP POLICY "authenticated_users_all_access" ON campaign_contacts;
-- DROP POLICY "authenticated_users_all_access" ON campaigns;
-- DROP POLICY "authenticated_users_all_access" ON contacts;
-- DROP POLICY "authenticated_users_all_access" ON users;
-- ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE pipeline_stages DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE campaign_contacts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 1: ENABLE UUID EXTENSION (already enabled, documented for reference)
-- ============================================================================
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 2: TABLE DEFINITIONS (already created, documented for reference)
-- ============================================================================

-- Table: users (INNOVAAS sales team members)
-- Purpose: Store team member profiles linked to Supabase Auth
-- CREATE TABLE users (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   email TEXT UNIQUE NOT NULL,
--   name TEXT NOT NULL,
--   role TEXT DEFAULT 'sales_rep',
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Table: contacts (LinkedIn connections)
-- Purpose: Primary CRM entity for tracking LinkedIn connections
-- CREATE TABLE contacts (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   first_name TEXT NOT NULL,
--   last_name TEXT NOT NULL,
--   linkedin_url TEXT UNIQUE NOT NULL,
--   email TEXT,
--   company TEXT,
--   position TEXT,
--   connected_on DATE,
--   source TEXT DEFAULT 'Manual Entry',
--   owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Table: campaigns (Outreach campaigns for lead attribution)
-- Purpose: Track distinct marketing/outreach campaigns
-- CREATE TABLE campaigns (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   name TEXT UNIQUE NOT NULL,
--   description TEXT,
--   status TEXT DEFAULT 'Active',
--   created_by UUID REFERENCES users(id) ON DELETE SET NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Table: campaign_contacts (Many-to-many junction)
-- Purpose: Associate contacts with campaigns
-- CREATE TABLE campaign_contacts (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
--   contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
--   added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   UNIQUE(campaign_id, contact_id)
-- );

-- Table: pipeline_stages (Hard-coded sales pipeline stages)
-- Purpose: Define 8 MVP sales stages for deal progression
-- CREATE TABLE pipeline_stages (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   name TEXT UNIQUE NOT NULL,
--   order_num INTEGER NOT NULL,
--   is_active BOOLEAN DEFAULT TRUE,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Seed data: 8 MVP pipeline stages (already seeded)
-- INSERT INTO pipeline_stages (name, order_num) VALUES
--   ('Initial LinkedIn Connect', 1),
--   ('First Conversation', 2),
--   ('Email Engaged', 3),
--   ('Meeting Scheduled', 4),
--   ('Proposal Sent', 5),
--   ('Negotiation', 6),
--   ('Closed Won', 7),
--   ('Closed Lost', 8);

-- Table: deals (Sales opportunities)
-- Purpose: Track sales opportunities through pipeline
-- CREATE TABLE deals (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
--   title TEXT NOT NULL,
--   value DECIMAL(12, 2),
--   probability INTEGER CHECK (probability >= 0 AND probability <= 100),
--   stage_id UUID REFERENCES pipeline_stages(id),
--   expected_close_date DATE,
--   status TEXT DEFAULT 'Open',
--   owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   closed_at TIMESTAMP WITH TIME ZONE
-- );

-- Table: activities (Interaction tracking)
-- Purpose: Log all interactions with contacts and deals
-- CREATE TABLE activities (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
--   deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
--   user_id UUID REFERENCES users(id) ON DELETE SET NULL,
--   type TEXT NOT NULL,
--   subject TEXT,
--   notes TEXT,
--   activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- ============================================================================
-- SECTION 3: PERFORMANCE INDEXES (already created, documented for reference)
-- ============================================================================

-- Contacts indexes (duplicate detection and foreign key performance)
-- CREATE INDEX idx_contacts_name ON contacts(first_name, last_name);
-- CREATE INDEX idx_contacts_linkedin ON contacts(linkedin_url);
-- CREATE INDEX idx_contacts_owner ON contacts(owner_id);

-- Campaign contacts indexes (junction table performance)
-- CREATE INDEX idx_campaign_contacts_campaign ON campaign_contacts(campaign_id);
-- CREATE INDEX idx_campaign_contacts_contact ON campaign_contacts(contact_id);

-- Deals indexes (foreign keys and status filtering)
-- CREATE INDEX idx_deals_contact ON deals(contact_id);
-- CREATE INDEX idx_deals_owner ON deals(owner_id);
-- CREATE INDEX idx_deals_stage ON deals(stage_id);
-- CREATE INDEX idx_deals_status ON deals(status);

-- Activities indexes (timeline and foreign key performance)
-- CREATE INDEX idx_activities_contact ON activities(contact_id);
-- CREATE INDEX idx_activities_deal ON activities(deal_id);
-- CREATE INDEX idx_activities_user ON activities(user_id);
-- CREATE INDEX idx_activities_date ON activities(activity_date DESC);

-- ============================================================================
-- SECTION 4: TRIGGERS & FUNCTIONS (already created, documented for reference)
-- ============================================================================

-- Function: Auto-update updated_at column
-- Purpose: Maintain updated_at timestamps on record modifications
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- Triggers: Apply update_updated_at_column to tables with updated_at
-- CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--
-- CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--
-- CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 5: ROW LEVEL SECURITY (RLS) - ENABLE AND CREATE POLICIES
-- ============================================================================
-- This is the PRIMARY WORK of this migration.
-- RLS provides defense-in-depth security by protecting data even if anon key is compromised.
--
-- MVP Approach: Permissive policies allow all authenticated users full access.
-- This maintains team visibility requirement while securing against unauthorized access.
--
-- V2.0 Enhancement: These policies can be updated to owner-based access control without
-- needing to enable RLS infrastructure (it's already enabled).

-- Enable RLS on all 7 tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create permissive policies: All authenticated users can perform all operations
-- This is functionally equivalent to RLS disabled, but provides security framework

CREATE POLICY "authenticated_users_all_access" ON users
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_users_all_access" ON contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_users_all_access" ON campaigns
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_users_all_access" ON campaign_contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_users_all_access" ON pipeline_stages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_users_all_access" ON deals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_users_all_access" ON activities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
--
-- Summary of changes:
-- - RLS ENABLED on all 7 tables (users, contacts, campaigns, campaign_contacts, pipeline_stages, deals, activities)
-- - 7 permissive policies created to allow all authenticated users full access
-- - Database schema, indexes, and triggers documented for reference
--
-- Security Impact:
-- - Database now protected from unauthorized access via compromised anon key
-- - All Supabase client queries must use authenticated connections
-- - Framework in place for V2.0 granular permissions
--
-- V2.0 Granular Permissions Example (future):
-- CREATE POLICY "users_view_own_contacts" ON contacts
--   FOR SELECT TO authenticated
--   USING (owner_id = auth.uid() OR auth.jwt()->>'role' = 'admin');
