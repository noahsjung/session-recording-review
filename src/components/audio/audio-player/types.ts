/**
 * Marker Interface
 * 
 * Represents a point or segment in the audio timeline where feedback has been added.
 * These markers will be displayed on the audio progress bar.
 */
export interface Marker {
  id: string;               // Unique identifier for the marker
  timestamp: number;        // Position in seconds where the marker starts
  endTimestamp?: number;    // Optional end position for segment markers
}

/**
 * AudioPlayerProps Interface
 * 
 * Properties that can be passed to the AudioPlayer component.
 */
export interface AudioPlayerProps {
  src: string;              // URL of the audio file to play
  feedbackMarkers?: Marker[]; // Optional array of feedback markers to display
  onMarkerClick?: (markerId: string) => void;  // Called when a marker is clicked
  onTimeUpdate?: (time: number) => void;       // Called when playback position changes
  onAddFeedback?: () => void;                 // Called when user wants to add feedback
}

/**
 * PlaybackControlsProps Interface
 * 
 * Properties for the PlaybackControls component.
 */
export interface PlaybackControlsProps {
  isPlaying: boolean;           // Whether audio is currently playing
  onPlayPause: () => void;      // Handler for play/pause button click
  onSkipBackward: () => void;   // Handler for skip backward button click
  onSkipForward: () => void;    // Handler for skip forward button click
}

/**
 * VolumeControlsProps Interface
 * 
 * Properties for the VolumeControls component.
 */
export interface VolumeControlsProps {
  volume: number;               // Current volume level (0-1)
  isMuted: boolean;             // Whether audio is muted
  onVolumeChange: (values: number[]) => void;  // Handler for volume slider change
  onToggleMute: () => void;     // Handler for mute button click
}

/**
 * ProgressBarProps Interface
 * 
 * Properties for the ProgressBar component.
 */
export interface ProgressBarProps {
  currentTime: number;          // Current playback position in seconds
  duration: number;             // Total audio duration in seconds
  markers: Marker[];            // Feedback markers to display
  onSeek: (values: number[]) => void;  // Handler for seeking to a new position
  onMarkerClick?: (markerId: string) => void;  // Handler for marker click
} 