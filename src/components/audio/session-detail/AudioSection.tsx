import React, { useRef, useEffect } from 'react';
import AudioPlayer from '../AudioPlayer';
import Transcript from '../Transcript';
import MiniPlayer from '../MiniPlayer';
import { FeedbackItem, TranscriptSegment, TranscriptSelection } from './types';

/**
 * AudioSection Props
 */
interface AudioSectionProps {
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
 * AudioSection Component
 * 
 * Displays the audio player and transcript sections.
 * Manages visibility of the full player vs. mini player.
 * 
 * @param props - Component props
 * @returns React component
 */
const AudioSection: React.FC<AudioSectionProps> = ({
  audioUrl,
  currentTimestamp,
  isPlaying,
  duration,
  highlightedSegmentIds,
  transcriptSegments,
  feedbackMarkers,
  feedbackToSegmentMap,
  likedSegments,
  isFullPlayerVisible,
  onVisibilityChange,
  onMarkerClick,
  onTimeUpdate,
  onSegmentClick,
  onSelectionChange,
  onFeedbackClick,
  onLikeClick,
  onPlayPause,
  onSeek,
  onSkipBackward,
  onSkipForward,
}) => {
  // Reference to the full player element for intersection observer
  const fullPlayerRef = useRef<HTMLDivElement>(null);

  // Set up intersection observer for the full player to determine visibility
  useEffect(() => {
    if (!fullPlayerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Call the callback when visibility changes
        onVisibilityChange(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    observer.observe(fullPlayerRef.current);

    return () => {
      if (fullPlayerRef.current) {
        observer.unobserve(fullPlayerRef.current);
      }
    };
  }, [onVisibilityChange]);

  return (
    <div className="md:w-2/3 flex flex-col overflow-hidden relative">
      {/* Audio player */}
      <div ref={fullPlayerRef} className="p-4">
        <AudioPlayer
          src={audioUrl}
          feedbackMarkers={feedbackMarkers}
          onMarkerClick={onMarkerClick}
          onTimeUpdate={onTimeUpdate}
        />
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-hidden">
        <Transcript
          segments={transcriptSegments}
          currentTime={currentTimestamp}
          highlightedSegmentIds={highlightedSegmentIds}
          onSegmentClick={onSegmentClick}
          onSelectionChange={onSelectionChange}
          onFeedbackClick={onFeedbackClick}
          onLikeClick={onLikeClick}
          isPlaying={isPlaying}
          feedbackItems={feedbackToSegmentMap}
          likedSegments={likedSegments}
          className="h-full"
        />
      </div>

      {/* Mini player - shown when full player is not visible */}
      {!isFullPlayerVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
          <MiniPlayer
            currentTime={currentTimestamp}
            duration={duration}
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onSeek={onSeek}
            onSkipBackward={onSkipBackward}
            onSkipForward={onSkipForward}
          />
        </div>
      )}
    </div>
  );
};

export default AudioSection; 