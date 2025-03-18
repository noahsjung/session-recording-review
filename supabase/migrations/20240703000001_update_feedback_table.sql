-- Create feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp FLOAT NOT NULL,
  end_timestamp FLOAT,
  title TEXT,
  text TEXT NOT NULL,
  audio_response TEXT,
  audio_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own feedback" ON feedback;
CREATE POLICY "Users can view their own feedback"
  ON feedback
  FOR SELECT
  USING (
    author_id = auth.uid() OR
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid() OR supervisor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own feedback" ON feedback;
CREATE POLICY "Users can insert their own feedback"
  ON feedback
  FOR INSERT
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own feedback" ON feedback;
CREATE POLICY "Users can update their own feedback"
  ON feedback
  FOR UPDATE
  USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own feedback" ON feedback;
CREATE POLICY "Users can delete their own feedback"
  ON feedback
  FOR DELETE
  USING (author_id = auth.uid());

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE feedback;