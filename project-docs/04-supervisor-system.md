# Supervisor System

## Overview

The supervisor system is a core component of the Counseling Session Review application, enabling experienced professionals to review and provide feedback on counseling sessions. Supervisors play a critical role in the professional development of counselors, offering guidance, feedback, and evaluation.

## Supervisor Workflow

1. **Registration**: Professionals register as supervisors with their credentials and supervisor level
2. **Approval**: Administrators review and approve supervisor applications
3. **Assignment**: Supervisors are assigned to counselors or specific sessions
4. **Review**: Supervisors listen to assigned sessions and provide timestamped feedback
5. **Follow-up**: Supervisors track improvements and provide additional guidance

## Supervisor Levels

The application supports different supervisor levels, which may correspond to certification levels or experience:

- **Level 1**: Beginning supervisors
- **Level 2**: Intermediate supervisors
- **Level 3**: Advanced supervisors

Each level may have different permissions or capabilities within the system.

## Key Components

### Supervisors Page (`src/components/pages/supervisors.tsx`)

This page allows:
- Counselors to view and select supervisors
- Administrators to manage supervisors
- Filtering and sorting of supervisors by various criteria

### SupervisorDetail Page (`src/components/pages/supervisor-detail.tsx`)

Provides detailed information about a specific supervisor:
- Professional background
- Areas of expertise
- Current workload
- Rating and reviews
- Sessions supervised

### Admin Dashboard - Supervisor Section

The admin dashboard includes supervisor management capabilities:
- Approve or reject supervisor applications
- Monitor supervisor activity
- Assign supervisors to counselors
- Set supervisor levels and permissions

## Database Schema

### supervisors Table

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

### user_profiles Table (Relevant Fields)

The `user_profiles` table includes supervisor-specific fields:
- `role`: Identifies users with the "supervisor" role
- `supervisor_level`: The level of the supervisor (1-3)
- `is_approved`: Whether the supervisor has been approved

## Supervisor Assignment

Supervisors can be assigned to counselors or individual sessions:

1. **Session-based Assignment**: Counselors select a supervisor when uploading a session
2. **Regular Assignment**: Counselors can have a default supervisor for all sessions
3. **Admin Assignment**: Administrators can assign or reassign supervisors

## Feedback Capabilities

Supervisors have enhanced feedback capabilities:

- **Timestamped Feedback**: Add text feedback at specific points in the session
- **Audio Feedback**: Record audio responses to specific sections
- **General Feedback**: Provide overall session evaluation
- **Rating**: Rate various aspects of the counseling session
- **Development Plans**: Create professional development goals

## Approval Workflow

The supervisor approval process ensures quality:

1. Potential supervisor registers with credentials
2. Application is marked as pending in the system
3. Administrator reviews application and professional qualifications
4. If approved, supervisor status is activated
5. Supervisor can then be assigned to sessions

## Implementation Details

### Security Considerations

- Row-Level Security (RLS) ensures supervisors can only access sessions assigned to them
- Supervisors cannot modify feedback after it has been acknowledged by counselors
- Session data is encrypted at rest and in transit

### Supervisor Analytics

The application provides analytics for supervisors:
- Number of sessions reviewed
- Average feedback provided per session
- Counselor improvement metrics
- Time spent on reviews

### Supervisor Notification System

Supervisors receive notifications for:
- New session assignments
- Feedback acknowledgments
- Questions from counselors
- Approaching deadlines 