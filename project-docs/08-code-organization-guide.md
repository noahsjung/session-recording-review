# Code Organization Guide

This document provides an overview of how the code in the Counseling Session Review application is organized and how the different components work together. This guide is intended for non-technical users who want to understand the codebase better.

## Main Application Structure

The application follows a component-based architecture using React and TypeScript. The main structure is organized as follows:

### App.tsx

This is the main entry point of the application. It sets up:

1. **Authentication and Authorization**:
   - Controls which users can access which parts of the application
   - Redirects unauthenticated users to the login page
   - Wraps the entire application in necessary "providers" that share data between components

2. **Routing**:
   - Defines all the pages accessible in the application
   - Protects routes that require authentication
   - Maps URLs to specific components (e.g., /sessions goes to the Sessions component)

### Authentication System (auth.tsx)

This module manages the entire user authentication flow:

1. **User Registration**:
   - Creates new user accounts with appropriate roles (counselor, supervisor, admin)
   - Sets up user profiles with required information
   - Handles special cases like supervisor approval requirements

2. **User Login**:
   - Authenticates users with email and password
   - Maintains login state across browser refreshes

3. **Role Management**:
   - Provides functions to check user roles and permissions
   - Controls access to role-specific features

### Core Functionality Components

#### SessionDetail.tsx

This is the heart of the application where counseling sessions are reviewed:

1. **Audio Playback**:
   - Allows supervisors to listen to counseling session recordings
   - Provides navigation controls to move through the recording

2. **Feedback Management**:
   - Enables adding timestamped feedback at specific points in the session
   - Supports both text and audio feedback
   - Organizes feedback for easy review

3. **Transcript Navigation**:
   - Displays synchronized transcript of the session
   - Allows navigating the audio by clicking on transcript segments
   - Supports selecting transcript segments for feedback

#### AudioPlayer.tsx

This component handles the audio playback functionality:

1. **Playback Controls**:
   - Play/pause controls
   - Skip forward/backward
   - Volume control
   - Playback speed adjustment

2. **Timeline Navigation**:
   - Visual indicators for feedback markers
   - Progress bar for seeking through the audio
   - Current timestamp display

#### FeedbackPanel.tsx

This component manages the feedback interface:

1. **Feedback Display**:
   - Lists all feedback in chronological order
   - Shows feedback details including author and timestamp
   - Highlights currently relevant feedback

2. **Feedback Creation**:
   - Form for adding new feedback
   - Support for recording audio feedback
   - Options for general vs. timestamped feedback

## How Data Flows Through the Application

Understanding how data flows helps comprehend how the application works:

1. **User Authentication**:
   - User logs in via LoginForm component
   - Authentication state is stored in AuthContext
   - This state is accessible throughout the application

2. **Session Selection**:
   - Sessions are listed in the Sessions component
   - When a user selects a session, they navigate to SessionDetail

3. **Session Review**:
   - SessionDetail loads session data, audio, and existing feedback
   - The AudioPlayer enables playback of the session
   - FeedbackPanel shows and allows adding feedback
   - Transcript component shows the session content with timestamps

4. **Feedback Creation**:
   - User selects a point in the audio or transcript
   - User enters feedback text or records audio feedback
   - Feedback is saved and associated with the timestamp
   - The feedback appears in the FeedbackPanel and as a marker in the AudioPlayer

## Key State Management

The application uses React's state management to keep track of:

1. **Authentication State**:
   - Current user information
   - Login status
   - User role and permissions

2. **Session Playback State**:
   - Current playback position
   - Playing/paused status
   - Volume settings
   - Highlighted transcript segments

3. **Feedback State**:
   - Existing feedback items
   - New feedback being created
   - Selected/active feedback

## How to Modify Different Parts of the Application

When you need to make changes to the application, it's important to understand which files to modify:

1. **To change authentication behavior**:
   - Modify the supabase/auth.tsx file
   - Update user roles or permissions logic

2. **To change session review interface**:
   - Modify src/components/audio/SessionDetail.tsx for the overall layout
   - Modify src/components/audio/AudioPlayer.tsx for playback behavior
   - Modify src/components/audio/FeedbackPanel.tsx for feedback functionality

3. **To update navigation or page structure**:
   - Modify src/App.tsx to add or change routes
   - Add new page components in src/components/pages/

4. **To change data models**:
   - Update the interfaces at the top of relevant files
   - Make corresponding changes to the Supabase database schema

## Code Conventions

The codebase follows several conventions to maintain consistency:

1. **Component Structure**:
   - Props interfaces are defined at the top of files
   - State variables are declared at the beginning of components
   - Helper functions are defined before they're used
   - JSX (the HTML-like code) appears at the end of components

2. **Naming Conventions**:
   - Components use PascalCase (e.g., AudioPlayer)
   - Functions and variables use camelCase (e.g., togglePlayPause)
   - Constants use UPPER_SNAKE_CASE (though these are rare)

3. **Comments**:
   - Interface fields include comments explaining their purpose
   - Functions have JSDoc comments explaining what they do
   - Complex sections of code have inline comments

## Common Patterns

Several patterns are used consistently throughout the codebase:

1. **Conditional Rendering**:
   ```jsx
   {isPlaying ? <PauseIcon /> : <PlayIcon />}
   ```
   This shows different content based on a condition.

2. **Event Handlers**:
   ```jsx
   const handleClick = () => {
     // Do something when clicked
   };
   ```
   Functions that respond to user actions.

3. **Effect Hooks**:
   ```jsx
   useEffect(() => {
     // Do something when dependencies change
   }, [dependency1, dependency2]);
   ```
   Code that runs when certain values change.

By understanding these patterns and the overall code organization, you'll be better equipped to navigate and modify the application even without deep technical knowledge. 