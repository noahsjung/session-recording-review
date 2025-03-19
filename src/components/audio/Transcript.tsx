import React, { useEffect, useRef, useState, useCallback } from "react";
import { MessageSquare, ThumbsUp, Play, Pause, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const reactionContainerRef = useRef<HTMLDivElement>(null);
  const topHandleRef = useRef<HTMLDivElement>(null);
  const bottomHandleRef = useRef<HTMLDivElement>(null);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [stickyReactionVisible, setStickyReactionVisible] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(
    null,
  );
  const [replyingToFeedbackId, setReplyingToFeedbackId] = useState<
    string | null
  >(null);

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
  const handleMouseDown = (
    segmentId: string,
    isDragHandle: boolean = false,
    event?: React.MouseEvent,
  ) => {
    // If clicking on text, don't start selection
    if (
      event &&
      (event.target as HTMLElement).tagName === "DIV" &&
      (event.target as HTMLElement).classList.contains("text-gray-800")
    ) {
      return;
    }

    if (isDragHandle) {
      setIsDragging(true);
      // Stop audio when dragging starts
      const audioElement = document.querySelector("audio");
      if (audioElement) {
        audioElement.pause();
      }
    } else {
      setSelectionStart(segmentId);
      setSelectionEnd(segmentId);
      setIsSelecting(true);
    }
  };

  const handleMouseOver = (segmentId: string) => {
    if (isSelecting && selectionStart && !isDragging) {
      setSelectionEnd(segmentId);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    setIsDragging(false);
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

  // Handle sticky reaction container
  useEffect(() => {
    if (!selectionStart || !selectionEnd) {
      setStickyReactionVisible(false);
      return;
    }

    const handleScroll = () => {
      if (!transcriptRef.current || !reactionContainerRef.current) return;

      const startIndex = segments.findIndex((seg) => seg.id === selectionStart);
      const endIndex = segments.findIndex((seg) => seg.id === selectionEnd);

      if (startIndex === -1) return;

      const firstSelectedSegment = document.getElementById(
        `segment-${segments[Math.min(startIndex, endIndex)].id}`,
      );

      if (!firstSelectedSegment) return;

      const containerRect = transcriptRef.current.getBoundingClientRect();
      const segmentRect = firstSelectedSegment.getBoundingClientRect();

      // If the top of the first selected segment is above the viewport
      if (segmentRect.top < containerRect.top) {
        setStickyReactionVisible(true);
      } else {
        setStickyReactionVisible(false);
      }
    };

    const container = transcriptRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [selectionStart, selectionEnd, segments]);

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

  // Check if segment is the first or last in selection
  const isFirstInSelection = (segmentId: string) => {
    if (!selectionStart || !selectionEnd) return false;

    const startIndex = segments.findIndex((seg) => seg.id === selectionStart);
    const endIndex = segments.findIndex((seg) => seg.id === selectionEnd);
    const currentIndex = segments.findIndex((seg) => seg.id === segmentId);

    if (startIndex === -1 || endIndex === -1 || currentIndex === -1)
      return false;

    return currentIndex === Math.min(startIndex, endIndex);
  };

  const isLastInSelection = (segmentId: string) => {
    if (!selectionStart || !selectionEnd) return false;

    const startIndex = segments.findIndex((seg) => seg.id === selectionStart);
    const endIndex = segments.findIndex((seg) => seg.id === selectionEnd);
    const currentIndex = segments.findIndex((seg) => seg.id === segmentId);

    if (startIndex === -1 || endIndex === -1 || currentIndex === -1)
      return false;

    return currentIndex === Math.max(startIndex, endIndex);
  };

  // Toggle like for a segment
  const handleToggleLike = useCallback(
    (segmentId: string) => {
      if (likedSegments.includes(segmentId)) {
        // Unlike - in a real app, you would call an API to remove the like
        if (onLikeClick) {
          // This is a placeholder for unlike functionality
          console.log(`Unlike segment ${segmentId}`);
        }
      } else if (onLikeClick) {
        onLikeClick(segmentId);
      }
    },
    [likedSegments, onLikeClick],
  );

  // Get first and last selected segments
  const getFirstAndLastSelectedSegments = () => {
    if (!selectionStart || !selectionEnd) return { first: null, last: null };

    const startIndex = segments.findIndex((seg) => seg.id === selectionStart);
    const endIndex = segments.findIndex((seg) => seg.id === selectionEnd);

    if (startIndex === -1 || endIndex === -1)
      return { first: null, last: null };

    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);

    return {
      first: segments[minIndex],
      last: segments[maxIndex],
    };
  };

  const { first: firstSelectedSegment, last: lastSelectedSegment } =
    getFirstAndLastSelectedSegments();

  return (
    <div className={`bg-white shadow-md p-4 flex flex-col ${className}`}>
      <h3 className="text-lg font-medium mb-4">Transcript</h3>

      {/* Sticky reaction container */}
      {stickyReactionVisible && selectionStart && selectionEnd && (
        <div
          className="sticky top-0 z-20 bg-white shadow-md rounded-md p-2 flex space-x-2 mb-2"
          ref={reactionContainerRef}
        >
          <button
            className="p-1 hover:bg-gray-100 rounded"
            title="Play from here"
            onClick={() => {
              const startIndex = segments.findIndex(
                (seg) => seg.id === selectionStart,
              );
              if (startIndex !== -1) {
                onSegmentClick(
                  segments[startIndex].id,
                  segments[startIndex].start,
                );
              }
            }}
          >
            {isPlaying &&
            selectionStart &&
            (() => {
              const startIndex = segments.findIndex(
                (seg) => seg.id === selectionStart,
              );
              if (startIndex !== -1) {
                const segment = segments[startIndex];
                return (
                  currentTime >= segment.start && currentTime <= segment.end
                );
              }
              return false;
            })() ? (
              <Pause size={16} className="text-blue-600" />
            ) : (
              <Play size={16} className="text-blue-600" />
            )}
          </button>
          <button
            className="p-1 hover:bg-gray-100 rounded"
            title="Leave feedback"
            onClick={() => {
              if (onFeedbackClick && selectionStart) {
                onFeedbackClick(selectionStart);
              }
            }}
          >
            <MessageSquare size={16} className="text-green-600" />
          </button>
          <button
            className="p-1 hover:bg-gray-100 rounded"
            title="Like"
            onClick={() => {
              if (selectionStart) {
                handleToggleLike(selectionStart);
              }
            }}
          >
            <ThumbsUp
              size={16}
              className={
                likedSegments.includes(selectionStart)
                  ? "text-yellow-600 fill-yellow-600"
                  : "text-yellow-600"
              }
            />
          </button>
          <button
            className="p-1 hover:bg-gray-100 rounded ml-auto"
            title="Clear selection"
            onClick={clearSelection}
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>
      )}

      {/* Top grab handle for entire selection */}
      {firstSelectedSegment && (
        <div
          ref={topHandleRef}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-4 bg-blue-300 opacity-30 rounded-t-md z-10"
          style={{ cursor: "row-resize" }}
          style={{
            top:
              document
                .getElementById(`segment-${firstSelectedSegment.id}`)
                ?.getBoundingClientRect().top + "px",
            position: "absolute",
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMouseDown(firstSelectedSegment.id, true);
          }}
        />
      )}

      {/* Bottom grab handle for entire selection */}
      {lastSelectedSegment && (
        <div
          ref={bottomHandleRef}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-16 h-4 bg-blue-300 opacity-30 rounded-b-md z-10"
          style={{ cursor: "row-resize" }}
          style={{
            bottom:
              document
                .getElementById(`segment-${lastSelectedSegment.id}`)
                ?.getBoundingClientRect().bottom + "px",
            position: "absolute",
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMouseDown(lastSelectedSegment.id, true);
          }}
        />
      )}

      <div className="overflow-y-auto flex-grow relative" ref={transcriptRef}>
        {segments.map((segment) => {
          const isActive = currentSegment?.id === segment.id;
          const isHighlighted = highlightedSegmentIds.includes(segment.id);
          const isSelected = isInSelection(segment.id);
          const isFirst = isFirstInSelection(segment.id);
          const isLast = isLastInSelection(segment.id);

          return (
            <div
              key={segment.id}
              id={`segment-${segment.id}`}
              ref={isActive ? activeSegmentRef : null}
              className={`p-3 transition-colors 
                ${isActive ? "bg-blue-50 border-l-4 border-blue-500 font-medium" : ""} 
                ${isHighlighted ? "bg-yellow-50" : ""}
                ${isSelected ? "bg-blue-100" : ""}
                ${isFirst && isSelected ? "border-t-2 border-blue-300" : ""}
                ${isLast && isSelected ? "border-b-2 border-blue-300" : ""}
                ${isSelected && !isFirst && !isLast ? "border-y-0" : ""}
                relative group pr-16
              `}
              onClick={() => onSegmentClick(segment.id, segment.start)}
              onMouseDown={(e) => handleMouseDown(segment.id, false, e)}
              onMouseOver={() => handleMouseOver(segment.id)}
              onMouseUp={handleMouseUp}
              style={{ cursor: "default" }}
            >
              {segment.speaker && (
                <div className="font-semibold text-sm text-gray-700 mb-1 select-none">
                  {segment.speaker} ({formatTime(segment.start)} -{" "}
                  {formatTime(segment.end)})
                </div>
              )}
              <div
                className="text-gray-800 select-text"
                style={{ cursor: "text" }}
              >
                {segment.text}
              </div>

              {/* Single reaction container at the top of the first selected segment */}
              {isSelected && isFirst && !stickyReactionVisible && (
                <div className="absolute right-2 top-2 bg-white shadow-md rounded-md p-1 flex space-x-1">
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Play from here"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSegmentClick(segment.id, segment.start);
                    }}
                  >
                    {isPlaying &&
                    currentTime >= segment.start &&
                    currentTime <= segment.end ? (
                      <Pause size={16} className="text-blue-600" />
                    ) : (
                      <Play size={16} className="text-blue-600" />
                    )}
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
                      handleToggleLike(segment.id);
                    }}
                  >
                    <ThumbsUp
                      size={16}
                      className={
                        likedSegments.includes(segment.id)
                          ? "text-yellow-600 fill-yellow-600"
                          : "text-yellow-600"
                      }
                    />
                  </button>
                </div>
              )}

              {/* Feedback and Like indicators - always reserve space */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center gap-2">
                  {feedbackItems[segment.id]?.length > 0 && (
                    <>
                      <MessageSquare size={14} className="text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">
                        {feedbackItems[segment.id]?.length || 0}
                      </span>
                    </>
                  )}
                  {likedSegments.includes(segment.id) && (
                    <ThumbsUp
                      size={14}
                      className="text-yellow-600 fill-yellow-600"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
