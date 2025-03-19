import React, { useState, useEffect, useRef } from "react";
import { SessionDetailProps, FeedbackItem, TranscriptSegment, TranscriptSelection } from "./types";
import { mapFeedbackToSegments, getMockTranscriptData } from "./utils";
import SessionHeader from "./SessionHeader";
import AudioSection from "./AudioSection";
import FeedbackSidebar from "./FeedbackSidebar";

/**
 * SessionDetail Component
 * 
 * The main component for reviewing a counseling session.
 * This component coordinates all the subcomponents and manages the shared state.
 * 
 * @param props - Component props
 * @returns React component
 */
const SessionDetail: React.FC<SessionDetailProps> = ({
  session,
  audioUrl,
  feedback,
  onBack,
  onAddFeedback,
  onAddAudioResponse,
  className,
}) => {
  // Playback state
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(true);
  
  // Feedback state
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);
  
  // Transcript state
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>(getMockTranscriptData());
  const [transcriptSelection, setTranscriptSelection] = useState<TranscriptSelection | null>(null);
  
  // Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Split feedback into general and timestamp-specific
  const generalFeedback = feedback.filter((item) => item.isGeneral);
  const specificFeedback = feedback.filter((item) => !item.isGeneral);

  // Map feedback to transcript segments
  const { 
    highlightedSegmentIds, 
    feedbackToSegmentMap, 
    likedSegments 
  } = mapFeedbackToSegments(feedback, transcriptSegments);

  // Create state for highlighted segment IDs so we can update it
  const [activeHighlightedSegments, setActiveHighlightedSegments] = useState<string[]>(highlightedSegmentIds);

  // Update active highlighted segments when the derived value changes
  useEffect(() => {
    setActiveHighlightedSegments(highlightedSegmentIds);
  }, [highlightedSegmentIds]);

  /**
   * Handle player visibility changes
   * 
   * Updates the isFullPlayerVisible state when the intersection observer
   * detects that the player has scrolled in or out of view
   * 
   * @param isVisible - Whether the player is currently visible
   */
  const handlePlayerVisibilityChange = (isVisible: boolean) => {
    setIsFullPlayerVisible(isVisible);
  };

  /**
   * Handle click on a feedback marker
   * 
   * Selects the feedback and seeks to its timestamp
   * 
   * @param feedbackId - ID of the selected feedback
   */
  const handleMarkerClick = (feedbackId: string) => {
    setSelectedFeedbackId(feedbackId);

    // Find the feedback item with this ID to get its timestamp
    const feedbackItem = specificFeedback.find(
      (item) => item.id === feedbackId
    );
    if (feedbackItem) {
      // Seek to the timestamp in the audio player
      const audioElement = document.querySelector("audio");
      if (audioElement) {
        audioElement.currentTime = feedbackItem.timestamp;
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  /**
   * Handle click on a transcript segment
   * 
   * Seeks to the segment's timestamp and plays the audio
   * 
   * @param segmentId - ID of the clicked segment
   * @param timestamp - Timestamp of the segment
   */
  const handleSegmentClick = (segmentId: string, timestamp: number) => {
    // Seek to the timestamp in the audio player
    const audioElement = document.querySelector("audio");
    if (audioElement) {
      audioElement.currentTime = timestamp;
      audioElement.play();
      setIsPlaying(true);
      setCurrentTimestamp(timestamp);
    }

    // Find any feedback associated with this segment
    const segment = transcriptSegments.find((seg) => seg.id === segmentId);
    if (segment) {
      const relatedFeedback = specificFeedback.find(
        (item) =>
          item.timestamp >= segment.start && item.timestamp <= segment.end
      );
      if (relatedFeedback) {
        setSelectedFeedbackId(relatedFeedback.id);
      }
    }
  };

  /**
   * Toggle play/pause
   */
  const handlePlayPause = () => {
    const audio = document.querySelector("audio");
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  /**
   * Seek to a specific time
   * 
   * @param value - Array containing the new timestamp
   */
  const handleSeek = (value: number[]) => {
    const audio = document.querySelector("audio");
    if (audio) {
      const newTime = value[0];
      audio.currentTime = newTime;
      setCurrentTimestamp(newTime);
    }
  };

  /**
   * Skip backward by 10 seconds
   */
  const handleSkipBackward = () => {
    const audio = document.querySelector("audio");
    if (audio) {
      const newTime = Math.max(0, audio.currentTime - 10);
      audio.currentTime = newTime;
      setCurrentTimestamp(newTime);
    }
  };

  /**
   * Skip forward by 10 seconds
   */
  const handleSkipForward = () => {
    const audio = document.querySelector("audio");
    if (audio) {
      const newTime = Math.min(audio.duration, audio.currentTime + 10);
      audio.currentTime = newTime;
      setCurrentTimestamp(newTime);
    }
  };

  /**
   * Add feedback for a transcript segment
   * 
   * @param segmentId - ID of the segment to add feedback for
   */
  const handleFeedbackOnSegment = (segmentId: string) => {
    const segment = transcriptSegments.find((seg) => seg.id === segmentId);
    if (segment) {
      setTranscriptSelection({
        startId: segment.id,
        endId: segment.id,
        startTime: segment.start,
        endTime: segment.end,
        text: segment.text,
      });
    }
  };

  /**
   * Add a "like" to a transcript segment
   * 
   * @param segmentId - ID of the segment to like
   */
  const handleLikeSegment = (segmentId: string) => {
    const segment = transcriptSegments.find((seg) => seg.id === segmentId);
    if (segment && onAddFeedback) {
      onAddFeedback(
        "Liked",
        "👍 This part was well done.",
        segment.start,
        undefined,
        undefined,
        false
      );
    }
  };

  // Set up audio event listeners
  useEffect(() => {
    const audio = document.querySelector("audio");
    if (!audio) return;

    // Update time and duration
    const handleTimeUpdate = () => {
      setCurrentTimestamp(audio.currentTime);
      setDuration(audio.duration);
    };

    // Update playing state
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    // Add event listeners
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    // Clean up event listeners
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Scroll to selected feedback when marker is clicked
  useEffect(() => {
    if (selectedFeedbackId) {
      const feedbackElement = document.getElementById(
        `feedback-${selectedFeedbackId}`
      );
      if (feedbackElement) {
        feedbackElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Find the corresponding transcript segment
      const feedbackItem = specificFeedback.find(
        (item) => item.id === selectedFeedbackId
      );
      if (feedbackItem) {
        const segment = transcriptSegments.find(
          (seg) =>
            feedbackItem.timestamp >= seg.start &&
            feedbackItem.timestamp <= seg.end
        );
        if (segment) {
          // Update the highlighted segments when a feedback is selected
          setActiveHighlightedSegments([segment.id]);
        }
      }
    }
  }, [selectedFeedbackId, specificFeedback, transcriptSegments]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with session info and back button */}
      <SessionHeader 
        session={session} 
        duration={duration} 
        onBack={onBack} 
      />

      {/* Main content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left panel - Audio player and transcript */}
        <AudioSection
          audioUrl={audioUrl}
          currentTimestamp={currentTimestamp}
          isPlaying={isPlaying}
          duration={duration}
          highlightedSegmentIds={activeHighlightedSegments}
          transcriptSegments={transcriptSegments}
          feedbackMarkers={specificFeedback.map((item) => ({
            id: item.id,
            timestamp: item.timestamp,
            endTimestamp: item.endTimestamp,
          }))}
          feedbackToSegmentMap={feedbackToSegmentMap}
          likedSegments={likedSegments}
          isFullPlayerVisible={isFullPlayerVisible}
          onVisibilityChange={handlePlayerVisibilityChange}
          onMarkerClick={handleMarkerClick}
          onTimeUpdate={setCurrentTimestamp}
          onSegmentClick={handleSegmentClick}
          onSelectionChange={setTranscriptSelection}
          onFeedbackClick={handleFeedbackOnSegment}
          onLikeClick={handleLikeSegment}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onSkipBackward={handleSkipBackward}
          onSkipForward={handleSkipForward}
        />

        {/* Right panel - Feedback */}
        <div className="md:w-1/3 border-l">
          <FeedbackSidebar
            sessionId={session.id}
            feedback={feedback}
            currentTimestamp={currentTimestamp}
            selectedFeedbackId={selectedFeedbackId}
            sessionStatus={session.status}
            onAddFeedback={onAddFeedback || (() => {})}
            onAddAudioResponse={onAddAudioResponse || (() => {})}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionDetail; 