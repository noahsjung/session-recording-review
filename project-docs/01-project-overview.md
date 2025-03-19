# Counseling Session Review - Project Overview

## Introduction

The Counseling Session Review application is a web-based platform designed to facilitate the supervision and review of counseling sessions. It allows counselors to upload audio recordings of their sessions, which can then be reviewed by supervisors who provide timestamped feedback. The platform aims to improve the quality of counseling sessions through structured feedback and professional development.

## Project Architecture

This project is built using:

- **React** with **TypeScript**: Frontend framework and type safety
- **Vite**: Build tool and development server
- **Supabase**: Backend-as-a-Service for authentication, database, and storage
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn/UI**: Component library based on Radix UI
- **React Router**: Client-side routing

## Core Features

1. **User Authentication**
   - Role-based access control (counselors, supervisors, admins)
   - User profiles and account management

2. **Session Management**
   - Upload and manage audio recordings of counseling sessions
   - Assign sessions to supervisors for review
   - Track session status (pending, in progress, completed)

3. **Audio Playback and Review**
   - Advanced audio player with timestamping capabilities
   - Transcript display and navigation
   - Ability to select segments of audio for feedback

4. **Feedback System**
   - Text-based feedback at specific timestamps
   - Audio feedback responses
   - Feedback organization and categorization

5. **Supervisory Tools**
   - Supervisor assignment and management
   - Approval workflows for supervisors
   - Performance tracking and analytics

## Directory Structure

- `src/`: Main application code
  - `components/`: React components
    - `audio/`: Audio-related components (players, transcript, etc.)
    - `auth/`: Authentication components
    - `pages/`: Page-level components
    - `ui/`: Reusable UI components
  - `context/`: React contexts for state management
  - `lib/`: Utility functions and helpers
  - `supabase/`: Supabase client configuration and helpers
  - `types/`: TypeScript type definitions
- `supabase/`: Supabase configuration and migrations
  - `migrations/`: Database schema migrations
  - `functions/`: Supabase Edge Functions
- `public/`: Static assets

## Database Schema

The application uses a relational database with the following main tables:

1. **users**: Authentication users
2. **user_profiles**: Extended user information
3. **sessions**: Counseling session recordings
4. **supervisors**: Supervisor information
5. **feedback**: Timestamped feedback on sessions

## Getting Started

To begin working with this project, you'll need to:

1. Install dependencies with `npm install`
2. Set up environment variables (see `.env` file)
3. Start the development server with `npm run dev`

For more detailed information on specific aspects of the application, refer to the other documentation files in this directory. 