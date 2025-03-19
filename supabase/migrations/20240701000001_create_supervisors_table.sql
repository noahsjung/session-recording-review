-- Create supervisors table
CREATE TABLE IF NOT EXISTS supervisors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  avatar TEXT,
  level TEXT NOT NULL,
  experience TEXT,
  background TEXT,
  introduction TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE supervisors ENABLE ROW LEVEL SECURITY;

-- Create policy for supervisors
DROP POLICY IF EXISTS "Public read access for supervisors" ON supervisors;
CREATE POLICY "Public read access for supervisors"
  ON supervisors FOR SELECT
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE supervisors;

-- Insert sample data
INSERT INTO supervisors (name, avatar, level, experience, background, introduction)
VALUES 
  ('Dr. Sarah Johnson', 'sarah', 'Senior', '15 years', 'Cognitive Behavioral Therapy Specialist', 'Dr. Johnson specializes in cognitive behavioral therapy with a focus on anxiety and depression. She has extensive experience working with young adults and professionals in high-stress environments.'),
  ('Dr. Michael Chen', 'michael', 'Senior', '12 years', 'Family Therapy Expert', 'Dr. Chen is an expert in family systems therapy with additional training in trauma-informed care. He works primarily with families and couples navigating complex relationship dynamics.'),
  ('Dr. Aisha Patel', 'aisha', 'Associate', '8 years', 'Trauma-Focused Therapy Specialist', 'Dr. Patel specializes in trauma-focused therapy and EMDR. She has experience working with survivors of various forms of trauma and focuses on culturally sensitive approaches to healing.');
