-- Migration: Deals Schema and Pipeline Stage Tracking
-- Story 4.1: Deals Database Table & Pipeline Stage Relationships
-- Dependencies: contacts, pipeline_stages, users tables (from Story 1.2)

-- ============================================================================
-- DEALS TABLE
-- ============================================================================
-- Main table for tracking sales opportunities through pipeline stages
-- CASCADE delete on contact_id: Deals are meaningless without the contact
-- RESTRICT delete on stage_id: Protects pipeline integrity
-- SET NULL on owner_id: Preserves historical deal data if user deleted

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  value DECIMAL(10,2) CHECK (value >= 0),
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  stage_id UUID REFERENCES pipeline_stages(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Won', 'Lost')),
  expected_close_date DATE,
  notes TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
-- Optimize queries for dashboard, contact detail view, pipeline filtering

-- Contact detail view: Fetch all deals for a specific contact
CREATE INDEX idx_deals_contact ON deals(contact_id);

-- Pipeline view: Filter and group deals by pipeline stage
CREATE INDEX idx_deals_stage ON deals(stage_id);

-- Dashboard queries: Filter by Open/Won/Lost status
CREATE INDEX idx_deals_status ON deals(status);

-- Owner-specific views: Query deals by sales rep assignment
CREATE INDEX idx_deals_owner ON deals(owner_id);

-- Forecasting: Sort and filter by expected close date
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Automatic timestamp update on row modification
-- Reuses update_updated_at_column() function from Story 1.2

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEAL STAGE HISTORY TABLE
-- ============================================================================
-- Audit trail for all stage changes (FR5.7)
-- CASCADE delete on deal_id: Remove history when deal deleted
-- SET NULL on stage_ids and changed_by: Preserve history if stages/users deleted

CREATE TABLE deal_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  from_stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  to_stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Index for fast timeline retrieval: All history entries for a deal
CREATE INDEX idx_deal_stage_history_deal ON deal_stage_history(deal_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS as security framework (Architecture §3.1)
-- MVP: Team-wide visibility (all authenticated users can access all deals)
-- Future V2.0: Can be enhanced with per-user or role-based permissions

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stage_history ENABLE ROW LEVEL SECURITY;

-- MVP Policy: All authenticated users have full access to all deals
CREATE POLICY "authenticated_users_all_access" ON deals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- MVP Policy: All authenticated users can view/modify stage history
CREATE POLICY "authenticated_users_all_access" ON deal_stage_history
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
