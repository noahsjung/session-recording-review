import React from 'react';
import { AudioSectionProps } from './types';
import { usePlayerVisibility } from './usePlayerVisibility';
import FullPlayer from './components/FullPlayer';
import TranscriptContainer from './components/TranscriptContainer';
import MiniPlayerContainer from './components/MiniPlayerContainer';

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
  // Use custom hook to track player visibility
  const playerRef = usePlayerVisibility(onVisibilityChange);

  return (
    <div className="md:w-2/3 flex flex-col overflow-hidden relative">
      {/* Full-sized audio player */}
      <FullPlayer
        audioUrl={audioUrl}
        feedbackMarkers={feedbackMarkers}
        onMarkerClick={onMarkerClick}
        onTimeUpdate={onTimeUpdate}
        playerRef={playerRef}
      />

      {/* Transcript section */}
      <TranscriptContainer
        segments={transcriptSegments}
        currentTime={currentTimestamp}
        highlightedSegmentIds={highlightedSegmentIds}
        feedbackItems={feedbackToSegmentMap}
        likedSegments={likedSegments}
        isPlaying={isPlaying}
        onSegmentClick={onSegmentClick}
        onSelectionChange={onSelectionChange}
        onFeedbackClick={onFeedbackClick}
        onLikeClick={onLikeClick}
      />

      {/* Mini player - shown when full player is not visible */}
      {!isFullPlayerVisible && (
        <MiniPlayerContainer
          currentTime={currentTimestamp}
          duration={duration}
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onSeek={onSeek}
          onSkipBackward={onSkipBackward}
          onSkipForward={onSkipForward}
        />
      )}
    </div>
  );
};

export default AudioSection; 