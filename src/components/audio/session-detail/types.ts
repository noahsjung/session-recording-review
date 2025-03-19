import { Session } from "../SessionList";

/**
 * FeedbackItem Interface
 * 
 * Represents feedback provided by a supervisor on a specific part of a counseling session.
 * Feedback can be attached to particular timestamps in the audio recording.
 */
export interface FeedbackItem {
  id: string;                 // Unique identifier for the feedback
  title?: string;             // Optional title for the feedback
  timestamp: number;          // Position in seconds where the feedback starts
  endTimestamp?: number;      // Optional end position for segment feedback
  text: string;               // The text content of the feedback
  audioResponse?: string;     // Optional URL to an audio response from the counselor
  audioFeedback?: string;     // Optional URL to an audio recording of the feedback
  author: {                   // Information about who provided the feedback
    name: string;             // Supervisor's name
    avatar: string;           // Supervisor's avatar image identifier
  };
  createdAt: Date;            // When the feedback was created
  isGeneral?: boolean;        // Whether this is general feedback vs. timestamp-specific
}

/**
 * TranscriptSegment Interface
 * 
 * Represents a segment of the session transcript with timing information.
 * The transcript helps users navigate the audio and understand the content.
 */
export interface TranscriptSegment {
  id: string;                 // Unique identifier for the segment
  start: number;              // Start time in seconds
  end: number;                // End time in seconds
  text: string;               // The transcribed text content
  speaker?: string;           // Who is speaking in this segment (e.g., "Counselor" or "Client")
}

/**
 * TranscriptSelection Interface
 * 
 * Represents a user-selected portion of the transcript.
 * Used when providing feedback on a specific part of the session.
 */
export interface TranscriptSelection {
  startId: string;            // ID of the starting transcript segment
  endId: string;              // ID of the ending transcript segment
  startTime: number;          // Start time in seconds
  endTime: number;            // End time in seconds
  text: string;               // The selected text content
}

/**
 * SessionDetailProps Interface
 * 
 * Properties that can be passed to the SessionDetail component.
 */
export interface SessionDetailProps {
  session: Session;           // The counseling session being reviewed
  audioUrl: string;           // URL to the audio recording
  feedback: FeedbackItem[];   // Array of existing feedback items
  onBack: () => void;         // Function to navigate back to the sessions list
  onAddFeedback?: (           // Function called when new feedback is added
    title: string,            // Title of the feedback
    text: string,             // Content of the feedback
    timestamp: number,        // Timestamp where feedback applies
    endTimestamp?: number,    // Optional end timestamp for segment feedback
    audioBlob?: Blob,         // Optional audio recording of the feedback
    isGeneral?: boolean,      // Whether this is general feedback vs. timestamp-specific
  ) => void;
  onAddAudioResponse?: (      // Function called when a response is added to feedback
    audioBlob: Blob,          // The audio response recording
    feedbackId: string        // ID of the feedback being responded to
  ) => void;
  className?: string;         // Optional CSS class name for styling
} 