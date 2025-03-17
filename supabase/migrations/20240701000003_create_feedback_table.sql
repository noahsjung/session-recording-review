-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  timestamp INTEGER NOT NULL,
  text TEXT NOT NULL,
  audio_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback
DROP POLICY IF EXISTS "Users can view feedback on their sessions";
CREATE POLICY "Users can view feedback on their sessions"
  ON feedback FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert feedback";
CREATE POLICY "Users can insert feedback"
  ON feedback FOR INSERT
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own feedback";
CREATE POLICY "Users can update their own feedback"
  ON feedback FOR UPDATE
  USING (author_id = auth.uid());

-- Enable realtime
alter publication supabase_realtime add table feedback;
