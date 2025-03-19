import { Session } from "../SessionList";
import { FeedbackItem, TranscriptSegment } from "./types";

/**
 * Format a timestamp in seconds to a readable format (MM:SS)
 * 
 * @param seconds - Number of seconds to format
 * @returns Formatted time string, e.g. "3:45"
 */
export const formatTimestamp = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

/**
 * Format a date to a readable format
 * 
 * @param date - Date to format
 * @returns Formatted date string, e.g. "Monday, January 1, 2023"
 */
export const formatDate = (date?: Date): string => {
  if (!date) return "No date available";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format duration in seconds to a readable format (MM:SS)
 * 
 * @param seconds - Number of seconds to format
 * @returns Formatted duration string, e.g. "10:15"
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

/**
 * Get CSS color class based on session status
 * 
 * @param status - Session status
 * @returns CSS class string for the given status
 */
export const getStatusColor = (status: Session["status"]): string => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "in_progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

/**
 * Get human-readable text for session status
 * 
 * @param status - Session status
 * @returns Human-readable status text
 */
export const getStatusText = (status: Session["status"]): string => {
  switch (status) {
    case "pending":
      return "Pending Review";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Review Completed";
    default:
      return status;
  }
};

/**
 * Map feedback items to transcript segments
 * 
 * Creates a mapping of segment IDs to the feedback items that reference those segments.
 * Also identifies which segments should be highlighted.
 * 
 * @param feedback - Array of feedback items
 * @param transcriptSegments - Array of transcript segments
 * @returns Object containing highlighted segment IDs and feedback mapping
 */
export const mapFeedbackToSegments = (
  feedback: FeedbackItem[],
  transcriptSegments: TranscriptSegment[]
) => {
  const specificFeedback = feedback.filter((item) => !item.isGeneral);
  
  // Find which segments should be highlighted based on feedback
  const highlightedSegmentIds = specificFeedback
    .map((item) => {
      const segment = transcriptSegments.find(
        (seg) => item.timestamp >= seg.start && item.timestamp <= seg.end
      );
      return segment?.id || "";
    })
    .filter((id) => id !== "");

  // Create a mapping of segment IDs to feedback items
  const feedbackToSegmentMap: Record<string, FeedbackItem[]> = {};
  specificFeedback.forEach((item) => {
    const segment = transcriptSegments.find(
      (seg) => item.timestamp >= seg.start && item.timestamp <= seg.end
    );
    if (segment) {
      if (!feedbackToSegmentMap[segment.id]) {
        feedbackToSegmentMap[segment.id] = [];
      }
      feedbackToSegmentMap[segment.id].push(item);
    }
  });

  // Extract segments that have been "liked"
  const likedSegments = specificFeedback
    .filter(
      (item) => item.text.includes("👍") || item.title?.includes("Liked")
    )
    .map((item) => {
      const segment = transcriptSegments.find(
        (seg) => item.timestamp >= seg.start && item.timestamp <= seg.end
      );
      return segment?.id || "";
    })
    .filter((id) => id !== "");

  return { highlightedSegmentIds, feedbackToSegmentMap, likedSegments };
};

/**
 * Get mock transcript data
 * 
 * Provides mock transcript segments for the session.
 * In a real application, this would be replaced by an API call.
 * 
 * @returns Array of transcript segments
 */
export const getMockTranscriptData = (): TranscriptSegment[] => {
  return [
    {
      id: "segment-1",
      start: 0,
      end: 15,
      text: "Hello and welcome to today's session. How have you been feeling since our last meeting?",
      speaker: "Counselor",
    },
    {
      id: "segment-2",
      start: 16,
      end: 30,
      text: "I've been doing okay, I guess. The exercises you suggested helped a bit with my anxiety, but I still had a few difficult moments this week.",
      speaker: "Client",
    },
    {
      id: "segment-3",
      start: 31,
      end: 45,
      text: "I'm glad to hear the exercises were helpful. Can you tell me more about those difficult moments?",
      speaker: "Counselor",
    },
    {
      id: "segment-4",
      start: 46,
      end: 60,
      text: "Well, I had a presentation at work and started feeling really nervous. My heart was racing and I couldn't focus.",
      speaker: "Client",
    },
    {
      id: "segment-5",
      start: 61,
      end: 75,
      text: "That sounds challenging. How did you manage those feelings in the moment?",
      speaker: "Counselor",
    },
  ];
}; 