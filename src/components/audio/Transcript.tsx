import React, { useEffect, useRef, useState } from "react";
import { MessageSquare, ThumbsUp, Play } from "lucide-react";

interface TranscriptSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

interface TranscriptProps {
  segments: TranscriptSegment[];
  currentTime: number;
  highlightedSegmentIds: string[];
  onSegmentClick: (segmentId: string, timestamp: number) => void;
  onSelectionChange?: (
    selection: {
      startId: string;
      endId: string;
      startTime: number;
      endTime: number;
      text: string;
    } | null,
  ) => void;
  className?: string;
  onFeedbackClick?: (segmentId: string) => void;
  onLikeClick?: (segmentId: string) => void;
  isPlaying: boolean;
  feedbackItems?: Record<string, any[]>;
  likedSegments?: string[];
}

const Transcript = ({
  segments,
  currentTime,
  highlightedSegmentIds,
  onSegmentClick,
  onSelectionChange,
  className,
  onFeedbackClick,
  onLikeClick,
  isPlaying,
  feedbackItems = {},
  likedSegments = [],
}: TranscriptProps) => {
  const activeSegmentRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const currentSegment = segments.find(
    (segment) => currentTime >= segment.start && currentTime <= segment.end,
  );

  // Scroll to the active segment when currentTime changes, but only if playing
  useEffect(() => {
    if (
      isPlaying &&
      currentSegment &&
      activeSegmentRef.current &&
      transcriptRef.current
    ) {
      const containerRect = transcriptRef.current.getBoundingClientRect();
      const elementRect = activeSegmentRef.current.getBoundingClientRect();

      // Only scroll if the element is outside the visible area
      if (
        elementRect.top < containerRect.top ||
        elementRect.bottom > containerRect.bottom
      ) {
        activeSegmentRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [currentSegment?.id, isPlaying]);

  // Handle selection
  const handleMouseDown = (segmentId: string) => {
    setSelectionStart(segmentId);
    setSelectionEnd(segmentId);
    setIsSelecting(true);
  };

  const handleMouseOver = (segmentId: string) => {
    if (isSelecting && selectionStart) {
      setSelectionEnd(segmentId);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    if (selectionStart && selectionEnd && onSelectionChange) {
      // Find the start and end segments
      const startIndex = segments.findIndex((seg) => seg.id === selectionStart);
      const endIndex = segments.findIndex((seg) => seg.id === selectionEnd);

      if (startIndex !== -1 && endIndex !== -1) {
        // Ensure start is before end
        const [actualStartIndex, actualEndIndex] =
          startIndex <= endIndex
            ? [startIndex, endIndex]
            : [endIndex, startIndex];

        const startSegment = segments[actualStartIndex];
        const endSegment = segments[actualEndIndex];

        // Get all text between start and end
        const selectedText = segments
          .slice(actualStartIndex, actualEndIndex + 1)
          .map((seg) => seg.text)
          .join(" ");

        onSelectionChange({
          startId: startSegment.id,
          endId: endSegment.id,
          startTime: startSegment.start,
          endTime: endSegment.end,
          text: selectedText,
        });
      }
    }
  };

  const clearSelection = () => {
    if (onSelectionChange) {
      onSelectionChange(null);
    }
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  // Determine if a segment is within the current selection
  const isInSelection = (segmentId: string) => {
    if (!selectionStart || !selectionEnd) return false;

    const startIndex = segments.findIndex((seg) => seg.id === selectionStart);
    const endIndex = segments.findIndex((seg) => seg.id === selectionEnd);
    const currentIndex = segments.findIndex((seg) => seg.id === segmentId);

    if (startIndex === -1 || endIndex === -1 || currentIndex === -1)
      return false;

    return (
      currentIndex >= Math.min(startIndex, endIndex) &&
      currentIndex <= Math.max(startIndex, endIndex)
    );
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 flex flex-col ${className}`}
    >
      <h3 className="text-lg font-medium mb-4">Transcript</h3>
      <div
        ref={transcriptRef}
        className="w-full max-h-[calc(100vh-250px)] overflow-y-auto"
        onMouseLeave={() => isSelecting && handleMouseUp()}
      >
        <div className="space-y-4">
          {segments.map((segment) => {
            const isActive = currentSegment?.id === segment.id;
            const isHighlighted = highlightedSegmentIds.includes(segment.id);
            const isSelected = isInSelection(segment.id);

            return (
              <div
                key={segment.id}
                ref={isActive ? activeSegmentRef : null}
                className={`p-3 rounded-md transition-colors 
                  ${isActive ? "bg-blue-50 border-l-4 border-blue-500" : ""} 
                  ${isHighlighted ? "bg-yellow-50" : ""}
                  ${isSelected ? "bg-blue-100" : ""}
                  cursor-pointer relative group
                `}
                onClick={() => onSegmentClick(segment.id, segment.start)}
                onMouseDown={() => handleMouseDown(segment.id)}
                onMouseOver={() => handleMouseOver(segment.id)}
                onMouseUp={handleMouseUp}
              >
                {segment.speaker && (
                  <div className="font-semibold text-sm text-gray-700 mb-1">
                    {segment.speaker} ({formatTime(segment.start)} -{" "}
                    {formatTime(segment.end)})
                  </div>
                )}
                <div className="text-gray-800">{segment.text}</div>

                {/* Action buttons that appear on selection */}
                {isSelected && (
                  <div className="absolute right-2 top-2 bg-white shadow-md rounded-md p-1 flex space-x-1">
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Play from here"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSegmentClick(segment.id, segment.start);
                      }}
                    >
                      <Play size={16} className="text-blue-600" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Leave feedback"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onFeedbackClick) {
                          onFeedbackClick(segment.id);
                        }
                      }}
                    >
                      <MessageSquare size={16} className="text-green-600" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Like"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onLikeClick) {
                          onLikeClick(segment.id);
                        }
                      }}
                    >
                      <ThumbsUp size={16} className="text-yellow-600" />
                    </button>
                  </div>
                )}

                {/* Feedback container that would be populated when feedback exists */}
                {highlightedSegmentIds.includes(segment.id) && (
                  <div className="mt-2 border-t pt-2 border-gray-200">
                    <div className="flex items-center gap-1 mb-1">
                      <MessageSquare size={14} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">
                        {feedbackItems[segment.id]?.length || 0} Feedback
                      </span>
                      {likedSegments.includes(segment.id) && (
                        <div className="ml-2 flex items-center gap-1">
                          <ThumbsUp size={14} className="text-yellow-600" />
                          <span className="text-xs text-yellow-600">Liked</span>
                        </div>
                      )}
                    </div>
                    {feedbackItems[segment.id]?.map((feedback, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-700 bg-yellow-50 p-2 rounded mb-2"
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${feedback.author?.avatar || "default"}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium text-xs">
                            {feedback.author?.name || "Anonymous"}
                          </span>
                        </div>
                        <div className="mt-1">{feedback.text}</div>
                        {feedback.audioFeedback && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                            <Play size={12} />
                            <span>Audio feedback available</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

export default Transcript;
