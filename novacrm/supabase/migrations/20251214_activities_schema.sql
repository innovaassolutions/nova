-- Story 7.1: Activities Database Table & Activity Types
-- Create activities table for tracking all relationship interactions

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('Email', 'Call', 'Meeting', 'LinkedIn Message', 'WhatsApp', 'Note')),
  subject TEXT NOT NULL,
  description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_activities_date ON activities(activity_date DESC);
CREATE INDEX idx_activities_logged_by ON activities(logged_by);
CREATE INDEX idx_activities_type ON activities(activity_type);

-- Create updated_at trigger
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activities table
-- Sales reps can only see activities they logged
-- Admins and executives can see all activities

-- Policy: Users can view activities they logged
CREATE POLICY "Users can view their own activities"
  ON activities
  FOR SELECT
  USING (
    logged_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'executive')
    )
  );

-- Policy: Users can insert activities
CREATE POLICY "Users can create activities"
  ON activities
  FOR INSERT
  WITH CHECK (logged_by = auth.uid());

-- Policy: Users can update their own activities
CREATE POLICY "Users can update their own activities"
  ON activities
  FOR UPDATE
  USING (logged_by = auth.uid());

-- Policy: Users can delete their own activities (admin can delete any)
CREATE POLICY "Users can delete their own activities"
  ON activities
  FOR DELETE
  USING (
    logged_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
