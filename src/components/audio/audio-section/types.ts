import { FeedbackItem, TranscriptSegment, TranscriptSelection } from '../session-detail/types';
import React from 'react';

/**
 * Props for the AudioSection component
 */
export interface AudioSectionProps {
  audioUrl: string;
  currentTimestamp: number;
  isPlaying: boolean;
  duration: number;
  highlightedSegmentIds: string[];
  transcriptSegments: TranscriptSegment[];
  feedbackMarkers: { id: string; timestamp: number; endTimestamp?: number }[];
  feedbackToSegmentMap: Record<string, FeedbackItem[]>;
  likedSegments: string[];
  isFullPlayerVisible: boolean;
  onVisibilityChange: (isVisible: boolean) => void;
  onMarkerClick: (feedbackId: string) => void;
  onTimeUpdate: (time: number) => void;
  onSegmentClick: (segmentId: string, timestamp: number) => void;
  onSelectionChange: (selection: TranscriptSelection | null) => void;
  onFeedbackClick: (segmentId: string) => void;
  onLikeClick: (segmentId: string) => void;
  onPlayPause: () => void;
  onSeek: (values: number[]) => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
}

/**
 * Props for the FullPlayer component
 */
export interface FullPlayerProps {
  audioUrl: string;
  feedbackMarkers: { id: string; timestamp: number; endTimestamp?: number }[];
  onMarkerClick: (feedbackId: string) => void;
  onTimeUpdate: (time: number) => void;
  playerRef: React.Ref<HTMLDivElement>;
}

/**
 * Props for the TranscriptContainer component
 */
export interface TranscriptContainerProps {
  segments: TranscriptSegment[];
  currentTime: number;
  highlightedSegmentIds: string[];
  feedbackItems: Record<string, FeedbackItem[]>;
  likedSegments: string[];
  isPlaying: boolean;
  onSegmentClick: (segmentId: string, timestamp: number) => void;
  onSelectionChange: (selection: TranscriptSelection | null) => void;
  onFeedbackClick: (segmentId: string) => void;
  onLikeClick: (segmentId: string) => void;
}

/**
 * Props for the MiniPlayerContainer component
 */
export interface MiniPlayerContainerProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (values: number[]) => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
} 