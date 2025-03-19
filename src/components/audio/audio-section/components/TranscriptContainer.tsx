import React from 'react';
import Transcript from '../../Transcript';
import { TranscriptContainerProps } from '../types';

/**
 * TranscriptContainer Component
 * 
 * A wrapper component for the transcript.
 * 
 * @param props - Component props
 * @returns React component
 */
const TranscriptContainer: React.FC<TranscriptContainerProps> = ({
  segments,
  currentTime,
  highlightedSegmentIds,
  feedbackItems,
  likedSegments,
  isPlaying,
  onSegmentClick,
  onSelectionChange,
  onFeedbackClick,
  onLikeClick,
}) => {
  return (
    <div className="flex-1 overflow-hidden">
      <Transcript
        segments={segments}
        currentTime={currentTime}
        highlightedSegmentIds={highlightedSegmentIds}
        onSegmentClick={onSegmentClick}
        onSelectionChange={onSelectionChange}
        onFeedbackClick={onFeedbackClick}
        onLikeClick={onLikeClick}
        isPlaying={isPlaying}
        feedbackItems={feedbackItems}
        likedSegments={likedSegments}
        className="h-full"
      />
    </div>
  );
};

export default TranscriptContainer; 