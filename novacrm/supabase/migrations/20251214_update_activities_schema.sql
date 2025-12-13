-- Story 7.1: Update Activities Database Table Schema
-- Align existing activities table with Story 7.1 requirements

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_activities_contact;
DROP INDEX IF EXISTS idx_activities_deal;
DROP INDEX IF EXISTS idx_activities_date;
DROP INDEX IF EXISTS idx_activities_logged_by;
DROP INDEX IF EXISTS idx_activities_type;

-- Rename user_id to logged_by
ALTER TABLE activities RENAME COLUMN user_id TO logged_by;

-- Rename type to activity_type
ALTER TABLE activities RENAME COLUMN type TO activity_type;

-- Rename notes to description
ALTER TABLE activities RENAME COLUMN notes TO description;

-- Add updated_at column if it doesn't exist
ALTER TABLE activities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Make subject NOT NULL (update any null values first)
UPDATE activities SET subject = 'No subject' WHERE subject IS NULL;
ALTER TABLE activities ALTER COLUMN subject SET NOT NULL;

-- Set default for activity_date
ALTER TABLE activities ALTER COLUMN activity_date SET DEFAULT NOW();

-- Add CHECK constraint for activity_type
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_activity_type_check;
ALTER TABLE activities ADD CONSTRAINT activities_activity_type_check
  CHECK (activity_type IN ('Email', 'Call', 'Meeting', 'LinkedIn Message', 'WhatsApp', 'Note'));

-- Recreate indexes for performance
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_activities_date ON activities(activity_date DESC);
CREATE INDEX idx_activities_logged_by ON activities(logged_by);
CREATE INDEX idx_activities_type ON activities(activity_type);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own activities" ON activities;
DROP POLICY IF EXISTS "Users can create activities" ON activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;

-- Create RLS Policies for activities table
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
