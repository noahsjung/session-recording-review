# Authentication and User Roles

## Authentication System

The Counseling Session Review application uses Supabase for authentication. The authentication flow is managed through the `AuthProvider` context in `supabase/auth.tsx`, which provides authentication state and methods to all components in the application.

### Implementation Details

- **Supabase Client**: The Supabase client is initialized in `src/supabase/supabase.ts` with authentication configuration.
- **Auth Context**: The `AuthContext` in `supabase/auth.tsx` manages user state and provides authentication methods.
- **Session Persistence**: Sessions are automatically persisted using Supabase's built-in session management.
- **Protected Routes**: The `PrivateRoute` component in `App.tsx` ensures that certain routes are only accessible to authenticated users.

## User Roles

The application has three primary user roles:

### 1. Counselor

Counselors are the primary users who record and upload counseling sessions for review.

**Permissions:**
- Upload and manage their own sessions
- View feedback provided by supervisors
- Update their profile information
- Assign sessions to supervisors for review

### 2. Supervisor

Supervisors review counseling sessions and provide feedback.

**Permissions:**
- View assigned sessions
- Provide timestamped feedback (text and audio)
- Review and approve counselor work
- Access supervisor-specific analytics

**Special Notes:**
- Supervisors require approval before they can access supervisor features
- Supervisors have a "supervisor_level" attribute that can be set during registration

### 3. Admin

Administrators manage the overall system and user access.

**Permissions:**
- Manage all users (counselors and supervisors)
- Approve supervisor applications
- View system-wide analytics
- Configure system settings

## Authentication Flow

1. **Registration (`signUp` function)**:
   - User creates an account with email, password, full name, and role
   - For supervisors, additional fields like supervisor_level are collected
   - A corresponding record is created in the `user_profiles` table
   - Supervisors are set as unapproved by default

2. **Login (`signIn` function)**:
   - User signs in with email and password
   - The auth state is updated throughout the application
   - Role-specific routes and UI become available

3. **Session Management**:
   - Sessions are automatically refreshed
   - The app listens for auth state changes with `onAuthStateChange`

4. **Role Verification**:
   - Functions like `isAdmin()`, `isSupervisor()`, and `isApprovedSupervisor()` check user roles
   - These are used throughout the application to conditionally render components and enable features

## Database Schema

The authentication system relies on two primary tables:

### auth.users (Managed by Supabase)

Contains the core authentication information:
- `id`: UUID primary key
- `email`: User's email address
- `password`: Hashed password (not directly accessible)
- `user_metadata`: JSON field containing:
  - `full_name`: User's full name
  - `role`: User's role (counselor, supervisor, admin)
  - `supervisor_level`: For supervisors only

### user_profiles

Contains extended user information:
- `id`: UUID primary key (matches auth.users id)
- `full_name`: User's full name
- `role`: User's role
- `supervisor_level`: Level of supervisor (if applicable)
- `is_approved`: Whether the supervisor is approved
- Additional profile fields

## Security Considerations

- Row-Level Security (RLS) is enabled on all tables to enforce access control
- Policies ensure users can only access data they are authorized to see
- Sensitive operations require re-verification of credentials 