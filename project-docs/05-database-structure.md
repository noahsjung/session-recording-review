# Database Structure

## Overview

The Counseling Session Review application uses Supabase as its database provider, which is built on PostgreSQL. The database schema is designed to support the application's core features: user management, session recordings, feedback, and supervisor relationships.

## Schema Organization

The database consists of several key tables:

1. **Authentication Tables** (managed by Supabase Auth)
2. **User Profile Tables** (extending auth information)
3. **Session Management Tables** (recording metadata)
4. **Feedback Tables** (timestamped feedback)
5. **Supervisor Management Tables** (supervisor profiles and relationships)

## Key Tables

### auth.users (Managed by Supabase)

Authentication user records with core identity information.

### user_profiles

```sql
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('counselor', 'supervisor', 'admin')),
  supervisor_level TEXT,
  is_approved BOOLEAN DEFAULT false,
  organization TEXT,
  profile_image TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Extended user information linked to auth accounts.

### supervisors

```sql
CREATE TABLE IF NOT EXISTS supervisors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  bio TEXT,
  specialty TEXT[],
  years_experience INTEGER,
  max_sessions INTEGER,
  hourly_rate NUMERIC(10,2),
  availability JSON,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Detailed information about supervisors.

### sessions

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES supervisors(id),
  audio_url TEXT,
  duration INTEGER,
  notes TEXT,
  session_type TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Recording sessions uploaded by counselors.

### feedback

```sql
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
```

Timestamped feedback on sessions.

## Relationships

The database uses several key relationships:

1. **User to Profile**: One-to-one relationship between auth.users and user_profiles
2. **User to Supervisor**: One-to-one relationship for users with the supervisor role
3. **User to Sessions**: One-to-many relationship (a user can have many sessions)
4. **Session to Feedback**: One-to-many relationship (a session can have many feedback items)
5. **Supervisor to Sessions**: One-to-many relationship (a supervisor can be assigned to many sessions)

## Row-Level Security (RLS)

Supabase RLS policies control access to data:

### Sessions RLS Policies

```sql
-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Supervisors can view assigned sessions
CREATE POLICY "Supervisors can view assigned sessions"
  ON sessions FOR SELECT
  USING (supervisor_id IN (
    SELECT id FROM supervisors WHERE id = supervisor_id
  ));
```

### Feedback RLS Policies

```sql
-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON feedback
  FOR SELECT
  USING (
    author_id = auth.uid() OR
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid() OR supervisor_id = auth.uid()
    )
  );

-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON feedback
  FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- Users can update their own feedback
CREATE POLICY "Users can update their own feedback"
  ON feedback
  FOR UPDATE
  USING (author_id = auth.uid());

-- Users can delete their own feedback
CREATE POLICY "Users can delete their own feedback"
  ON feedback
  FOR DELETE
  USING (author_id = auth.uid());
```

## Indexes

Performance is improved through strategic indexes:

- Primary keys on all tables
- Foreign key indexes for frequent joins
- Indexes on commonly filtered fields like session status and creation date

## Storage

Supabase Storage is used for:

- Audio file storage
- Profile images
- Supporting documents

## Realtime Features

The database supports realtime subscriptions for:

- New feedback notifications
- Session status updates
- User profile changes

This is configured through the Supabase realtime publication:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE feedback;
```

## Migrations

Database migrations are stored in `supabase/migrations/` and include:

- Initial schema setup
- Table creation scripts
- Policy definitions
- Seed data (if applicable)

## Type Safety

The database schema is reflected in TypeScript types:

- Generated using `supabase gen types typescript`
- Stored in `src/types/supabase.ts`
- Provides type safety for database operations 