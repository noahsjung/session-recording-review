# Session Management and Audio Playback

## Session Management Overview

The Counseling Session Review application allows counselors to upload and manage audio recordings of their counseling sessions, which can then be reviewed by supervisors. The core of this functionality is implemented in the `sessions.tsx` page component and several specialized components in the `audio` directory.

## Session Workflow

1. **Session Creation**: Counselors record their counseling sessions (outside the application)
2. **Upload**: Counselors upload the audio file through the `SessionUploader` component
3. **Assignment**: Sessions are assigned to specific supervisors for review
4. **Review**: Supervisors review the session and provide feedback at specific timestamps
5. **Status Tracking**: Sessions move through different statuses (pending, in progress, completed)

## Key Components

### SessionUploader (`src/components/audio/SessionUploader.tsx`)

This component provides the interface for uploading new audio sessions:

- File selection and upload
- Session metadata entry (title, notes, session type)
- Supervisor selection
- Upload progress tracking
- Integration with Supabase storage

### SessionList (`src/components/audio/SessionList.tsx`)

Displays a list of sessions with:

- Filtering and sorting options
- Status indicators
- Duration and creation date
- Feedback count
- Supervisor information

### SessionDetail (`src/components/audio/SessionDetail.tsx`)

The main interface for reviewing a session:

- Advanced audio player
- Feedback panel
- Transcript display (when available)
- Session metadata
- Navigation between different views (audio, transcript, feedback)

## Audio Playback System

### AudioPlayer (`src/components/audio/AudioPlayer.tsx`)

A comprehensive audio player component that provides:

- Play/pause controls
- Seek functionality with drag support
- Speed control (0.5x to 2x playback)
- Volume control
- Timestamp display and navigation
- Feedback markers at specific timestamps
- Time-based segment highlighting
- Waveform visualization

### MiniPlayer (`src/components/audio/MiniPlayer.tsx`)

A compact version of the audio player that:

- Provides basic playback controls
- Displays current timestamp
- Maintains playback state when navigating away from the main player

## Feedback System

### FeedbackPanel (`src/components/audio/FeedbackPanel.tsx`)

This component enables supervisors to:

- Add text feedback at specific timestamps
- Record audio feedback
- View all feedback for a session in a chronological list
- Filter feedback by type or timestamp
- Reply to existing feedback

## Transcript System

### Transcript (`src/components/audio/Transcript.tsx`)

When transcripts are available, this component:

- Displays the text transcript synchronized with the audio
- Highlights the current segment
- Allows selection of segments for feedback
- Enables navigation by clicking on segments
- Provides feedback directly on transcript segments

## Database Schema

### sessions Table

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

### feedback Table

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

## Storage System

Session audio files are stored in Supabase Storage with the following structure:

- Each user has a dedicated storage bucket
- Audio files are saved with a UUID-based filename to prevent collisions
- URLs to audio files are stored in the sessions table
- Access control is managed through Supabase RLS policies

## Implementation Details

### Audio Processing

- The application supports standard audio formats (MP3, WAV, etc.)
- Audio duration is calculated and stored when the file is uploaded
- Audio files can be large, so streaming is used for playback
- A custom audio context is used for advanced playback controls

### Error Handling

- Upload failures are gracefully handled with retry options
- Playback errors provide user-friendly messages
- Network issues during streaming are managed through buffering

### Performance Considerations

- Audio is streamed rather than fully downloaded before playback
- Long sessions may be chunked for efficient processing
- Audio visualization is optimized for performance 