import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageSquare,
  Plus,
  ChevronRight,
  ChevronLeft,
  Mic,
  Play,
  Pause,
  X,
  ThumbsUp,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import AudioPlayer from "./AudioPlayer";
import MiniPlayer from "./MiniPlayer";
import FeedbackPanel from "./FeedbackPanel";
import Transcript from "./Transcript";
import { Session } from "./SessionList";

/**
 * FeedbackItem Interface
 * 
 * Represents feedback provided by a supervisor on a specific part of a counseling session.
 * Feedback can be attached to particular timestamps in the audio recording.
 */
interface FeedbackItem {
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
interface TranscriptSegment {
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
interface TranscriptSelection {
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
interface SessionDetailProps {
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

/**
 * SessionDetail Component
 * 
 * The main component for reviewing a counseling session.
 * Provides audio playback, feedback management, and transcript navigation.
 * This is the central feature of the application where supervisors review and
 * provide feedback on counseling sessions.
 */
const SessionDetail = ({
  session,
  audioUrl,
  feedback,
  onBack,
  onAddFeedback,
  onAddAudioResponse,
  className,
}: SessionDetailProps) => {
  // Playback state
  const [currentTimestamp, setCurrentTimestamp] = useState(0);    // Current playback position in seconds
  const [isPlaying, setIsPlaying] = useState(false);             // Whether audio is currently playing
  const [duration, setDuration] = useState(0);                   // Total audio duration in seconds
  
  // Feedback state
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null); // Currently selected feedback
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(true);  // Whether to show the full-size player
  const [highlightedSegmentIds, setHighlightedSegmentIds] = useState<string[]>([]); // Transcript segments to highlight
  
  // Transcript interaction state
  const [transcriptSelection, setTranscriptSelection] = useState<TranscriptSelection | null>(null); // User's transcript selection
  const [showFeedbackForm, setShowFeedbackForm] = useState(false); // Whether to show the feedback form
  const [feedbackTitle, setFeedbackTitle] = useState("");        // Title for new feedback
  const [feedbackText, setFeedbackText] = useState("");          // Content for new feedback
  
  // General comment state
  const [generalComment, setGeneralComment] = useState("");      // General comment on the session
  const [showGeneralCommentForm, setShowGeneralCommentForm] = useState(false); // Whether to show the general comment form
  
  // UI state
  const [feedbackToSegmentMap, setFeedbackToSegmentMap] = useState<Record<string, FeedbackItem[]>>({}); // Maps transcript segments to feedback
  const [isFeedbackPanelMinimized, setIsFeedbackPanelMinimized] = useState(false); // Whether the feedback panel is minimized
  
  // Audio recording state
  const [isRecordingFeedback, setIsRecordingFeedback] = useState(false); // Whether currently recording feedback
  const [audioFeedbackBlob, setAudioFeedbackBlob] = useState<Blob | null>(null); // Recorded audio blob
  const [isFeedbackAudioPlaying, setIsFeedbackAudioPlaying] = useState(false); // Whether feedback audio is playing
  const [feedbackMode, setFeedbackMode] = useState<"text" | "audio">("text"); // Which type of feedback to record
  
  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);   // Reference to the MediaRecorder instance
  const audioChunksRef = useRef<BlobPart[]>([]);                // Storage for audio chunks during recording
  const audioRef = useRef<HTMLAudioElement>(null);              // Reference to the audio element
  const fullPlayerRef = useRef<HTMLDivElement>(null);           // Reference to the player container
  
  // Track which transcript segments the user has liked
  const [likedSegments, setLikedSegments] = useState<string[]>([]);

  /**
   * Separate feedback into general and specific categories
   * General feedback applies to the entire session
   * Specific feedback is tied to particular timestamps
   */
  const generalFeedback = feedback.filter((item) => item.isGeneral);
  const specificFeedback = feedback.filter((item) => !item.isGeneral);

  // Mock transcript data - in a real app, this would come from an API or database
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([
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
    // Additional transcript segments would be here in a real implementation
  ]);

  // Map feedback to transcript segments
  useEffect(() => {
    // This is a simplified mapping - in a real app, you would have a more sophisticated algorithm
    // to match feedback to transcript segments based on timestamps
    const segmentIds = specificFeedback
      .map((item) => {
        const segment = transcriptSegments.find(
          (seg) => item.timestamp >= seg.start && item.timestamp <= seg.end,
        );
        return segment?.id || "";
      })
      .filter((id) => id !== "");

    setHighlightedSegmentIds(segmentIds);

    // Create a mapping of segment IDs to feedback items
    const mapping: Record<string, FeedbackItem[]> = {};
    specificFeedback.forEach((item) => {
      const segment = transcriptSegments.find(
        (seg) => item.timestamp >= seg.start && item.timestamp <= seg.end,
      );
      if (segment) {
        if (!mapping[segment.id]) {
          mapping[segment.id] = [];
        }
        mapping[segment.id].push(item);
      }
    });

    setFeedbackToSegmentMap(mapping);

    // Extract liked segments
    const liked = specificFeedback
      .filter(
        (item) => item.text.includes("👍") || item.title?.includes("Liked"),
      )
      .map((item) => {
        const segment = transcriptSegments.find(
          (seg) => item.timestamp >= seg.start && item.timestamp <= seg.end,
        );
        return segment?.id || "";
      })
      .filter((id) => id !== "");

    setLikedSegments(liked);
  }, [specificFeedback, transcriptSegments]);

  // Set up intersection observer for the full player
  useEffect(() => {
    if (!fullPlayerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFullPlayerVisible(entry.isIntersecting);
      },
      { threshold: 0.3 },
    );

    observer.observe(fullPlayerRef.current);

    return () => {
      if (fullPlayerRef.current) {
        observer.unobserve(fullPlayerRef.current);
      }
    };
  }, []);

  // Scroll to the selected feedback when marker is clicked
  useEffect(() => {
    if (selectedFeedbackId) {
      const feedbackElement = document.getElementById(
        `feedback-${selectedFeedbackId}`,
      );
      if (feedbackElement) {
        feedbackElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Find the corresponding transcript segment
      const feedbackItem = specificFeedback.find(
        (item) => item.id === selectedFeedbackId,
      );
      if (feedbackItem) {
        const segment = transcriptSegments.find(
          (seg) =>
            feedbackItem.timestamp >= seg.start &&
            feedbackItem.timestamp <= seg.end,
        );
        if (segment) {
          setHighlightedSegmentIds([segment.id]);
        }
      }
    }
  }, [selectedFeedbackId, specificFeedback, transcriptSegments]);

  const formatDate = (date?: Date) => {
    if (!date) return "No date available";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const getStatusColor = (status: Session["status"]) => {
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

  const getStatusText = (status: Session["status"]) => {
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

  const handleMarkerClick = (feedbackId: string) => {
    setSelectedFeedbackId(feedbackId);

    // Find the feedback item with this ID to get its timestamp
    const feedbackItem = specificFeedback.find(
      (item) => item.id === feedbackId,
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
          item.timestamp >= segment.start && item.timestamp <= segment.end,
      );
      if (relatedFeedback) {
        setSelectedFeedbackId(relatedFeedback.id);
      }
    }
  };

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

  const handleSeek = (value: number[]) => {
    const audio = document.querySelector("audio");
    if (audio) {
      const newTime = value[0];
      audio.currentTime = newTime;
      setCurrentTimestamp(newTime);
    }
  };

  const handleSkipBackward = () => {
    const audio = document.querySelector("audio");
    if (audio) {
      const newTime = Math.max(0, audio.currentTime - 10);
      audio.currentTime = newTime;
      setCurrentTimestamp(newTime);
    }
  };

  const handleSkipForward = () => {
    const audio = document.querySelector("audio");
    if (audio) {
      const newTime = Math.min(audio.duration, audio.currentTime + 10);
      audio.currentTime = newTime;
      setCurrentTimestamp(newTime);
    }
  };

  // Update audio player state
  useEffect(() => {
    const audio = document.querySelector("audio");
    if (audio) {
      const handleTimeUpdate = () => {
        setCurrentTimestamp(audio.currentTime);
        setDuration(audio.duration);
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, []);

  // Handle transcript selection
  const handleTranscriptSelection = (selection: TranscriptSelection | null) => {
    setTranscriptSelection(selection);
    if (selection) {
      setFeedbackTitle("");
      setFeedbackText(selection.text);
      setShowFeedbackForm(true);
    } else {
      setShowFeedbackForm(false);
    }
  };

  // Handle feedback form submission
  const handleFeedbackSubmit = () => {
    if (onAddFeedback) {
      if (transcriptSelection) {
        onAddFeedback(
          feedbackTitle || "Feedback on transcript",
          feedbackText,
          transcriptSelection.startTime,
          transcriptSelection.endTime,
          undefined,
          false,
        );
      } else if (showGeneralCommentForm) {
        onAddFeedback(
          "General Comment",
          generalComment,
          0,
          undefined,
          undefined,
          true,
        );
      }
    }
    setShowFeedbackForm(false);
    setShowGeneralCommentForm(false);
    setTranscriptSelection(null);
    setFeedbackTitle("");
    setFeedbackText("");
    setGeneralComment("");
  };

  // Handle feedback on a specific segment
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
      setFeedbackTitle("");
      setFeedbackText("");
      setShowFeedbackForm(true);
    }
  };

  // Handle like on a segment
  const handleLikeSegment = (segmentId: string) => {
    const segment = transcriptSegments.find((seg) => seg.id === segmentId);
    if (segment && onAddFeedback) {
      onAddFeedback(
        "Liked",
        "👍 This part was well done.",
        segment.start,
        undefined,
        undefined,
        false,
      );

      // Add to liked segments immediately for UI feedback
      setLikedSegments((prev) => {
        if (prev.includes(segmentId)) return prev;
        return [...prev, segmentId];
      });
    }
  };

  // Start recording audio feedback
  const startRecordingFeedback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioFeedbackBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecordingFeedback(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // Stop recording audio feedback
  const stopRecordingFeedback = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecordingFeedback(false);
    }
  };

  // Play recorded audio feedback
  const playFeedbackAudio = () => {
    if (audioFeedbackBlob) {
      const audioUrl = URL.createObjectURL(audioFeedbackBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsFeedbackAudioPlaying(false);
      audio.play();
      setIsFeedbackAudioPlaying(true);
    }
  };

  // Submit audio feedback
  const submitAudioFeedback = () => {
    if (onAddFeedback && audioFeedbackBlob && transcriptSelection) {
      onAddFeedback(
        feedbackTitle || "Audio Feedback",
        "",
        transcriptSelection.startTime,
        transcriptSelection.endTime,
        audioFeedbackBlob,
        false,
      );
      setAudioFeedbackBlob(null);
      setShowFeedbackForm(false);
      setTranscriptSelection(null);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{session.title}</h2>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="mr-3">{formatDate(session.createdAt)}</span>
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
        </div>
        <Badge className={getStatusColor(session.status)}>
          {getStatusText(session.status)}
        </Badge>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left panel - Audio player and transcript */}
        <div className="md:w-2/3 flex flex-col overflow-hidden">
          {/* Audio player */}
          <div ref={fullPlayerRef} className="p-4">
            <AudioPlayer
              src={audioUrl}
              feedbackMarkers={specificFeedback.map((item) => ({
                id: item.id,
                timestamp: item.timestamp,
                endTimestamp: item.endTimestamp,
              }))}
              onMarkerClick={handleMarkerClick}
              onTimeUpdate={setCurrentTimestamp}
            />
          </div>

          {/* Transcript */}
          <div className="flex-1 overflow-hidden">
            <Transcript
              segments={transcriptSegments}
              currentTime={currentTimestamp}
              highlightedSegmentIds={highlightedSegmentIds}
              onSegmentClick={handleSegmentClick}
              onSelectionChange={handleTranscriptSelection}
              onFeedbackClick={handleFeedbackOnSegment}
              onLikeClick={handleLikeSegment}
              isPlaying={isPlaying}
              feedbackItems={feedbackToSegmentMap}
              likedSegments={likedSegments}
              className="h-full"
            />
          </div>
        </div>

        {/* Right panel - Feedback */}
        <div
          className={`md:w-1/3 border-l transition-all duration-300 ${isFeedbackPanelMinimized ? "md:w-12" : ""}`}
        >
          {isFeedbackPanelMinimized ? (
            <Button
              variant="ghost"
              className="w-full h-12 flex justify-center items-center"
              onClick={() => setIsFeedbackPanelMinimized(false)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-medium">Session Feedback</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGeneralCommentForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add General Comment
                  </Button>
                  {session.status !== "completed" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        // In a real app, this would call an API to update the session status
                        // For now, we'll just show a toast message
                        alert(
                          "Review completed! Notification sent to counselor.",
                        );
                      }}
                    >
                      Complete Review
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFeedbackPanelMinimized(true)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Feedback content */}
              <div className="flex-1 overflow-hidden">
                {showFeedbackForm ? (
                  <div className="p-4 space-y-4">
                    <h3 className="font-medium">
                      {transcriptSelection
                        ? "Add Feedback for Selected Text"
                        : "Add Feedback"}
                    </h3>

                    {/* Feedback mode toggle */}
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={feedbackMode === "text"}
                          onChange={() => setFeedbackMode("text")}
                          className="h-4 w-4"
                        />
                        <span>Text Feedback</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={feedbackMode === "audio"}
                          onChange={() => setFeedbackMode("audio")}
                          className="h-4 w-4"
                        />
                        <span>Audio Feedback</span>
                      </label>
                    </div>

                    {/* Selected text display */}
                    {transcriptSelection && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-gray-600 mb-1">
                          Selected text (
                          {formatTimestamp(transcriptSelection.startTime)} -{" "}
                          {formatTimestamp(transcriptSelection.endTime)}):
                        </p>
                        <p className="text-sm">"{transcriptSelection.text}"</p>
                      </div>
                    )}

                    {/* Feedback title */}
                    <div>
                      <label
                        htmlFor="feedback-title"
                        className="block text-sm font-medium mb-1"
                      >
                        Feedback Title (Optional)
                      </label>
                      <Input
                        id="feedback-title"
                        value={feedbackTitle}
                        onChange={(e) => setFeedbackTitle(e.target.value)}
                        placeholder="Enter a title for your feedback"
                      />
                    </div>

                    {/* Text feedback */}
                    {feedbackMode === "text" && (
                      <div>
                        <label
                          htmlFor="feedback-text"
                          className="block text-sm font-medium mb-1"
                        >
                          Feedback
                        </label>
                        <Textarea
                          id="feedback-text"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Enter your feedback here"
                          rows={5}
                        />
                      </div>
                    )}

                    {/* Audio feedback */}
                    {feedbackMode === "audio" && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          Audio Feedback
                        </label>
                        {!audioFeedbackBlob ? (
                          <Button
                            variant={
                              isRecordingFeedback ? "destructive" : "outline"
                            }
                            onClick={
                              isRecordingFeedback
                                ? stopRecordingFeedback
                                : startRecordingFeedback
                            }
                            className="w-full flex items-center justify-center"
                          >
                            <Mic
                              className={`h-4 w-4 mr-2 ${isRecordingFeedback ? "animate-pulse" : ""}`}
                            />
                            {isRecordingFeedback
                              ? "Stop Recording"
                              : "Start Recording"}
                          </Button>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={playFeedbackAudio}
                              className="flex-1 flex items-center justify-center"
                            >
                              {isFeedbackAudioPlaying ? (
                                <Pause className="h-4 w-4 mr-2" />
                              ) : (
                                <Play className="h-4 w-4 mr-2" />
                              )}
                              {isFeedbackAudioPlaying ? "Playing..." : "Play"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAudioFeedbackBlob(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowFeedbackForm(false);
                          setTranscriptSelection(null);
                          setAudioFeedbackBlob(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={
                          feedbackMode === "audio" && audioFeedbackBlob
                            ? submitAudioFeedback
                            : handleFeedbackSubmit
                        }
                        disabled={
                          (feedbackMode === "text" && !feedbackText.trim()) ||
                          (feedbackMode === "audio" && !audioFeedbackBlob)
                        }
                      >
                        Submit Feedback
                      </Button>
                    </div>
                  </div>
                ) : showGeneralCommentForm ? (
                  <div className="p-4 space-y-4">
                    <h3 className="font-medium">Add General Comment</h3>
                    <Textarea
                      value={generalComment}
                      onChange={(e) => setGeneralComment(e.target.value)}
                      placeholder="Enter a general comment about the session"
                      rows={5}
                    />
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowGeneralCommentForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleFeedbackSubmit}
                        disabled={!generalComment.trim()}
                      >
                        Submit Comment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <FeedbackPanel
                    sessionId={session.id}
                    feedback={feedback}
                    onAddFeedback={onAddFeedback}
                    onAddAudioResponse={onAddAudioResponse}
                    currentTimestamp={currentTimestamp}
                    selectedFeedback={selectedFeedbackId}
                    className="h-full"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mini player - shown when full player is not visible */}
      {!isFullPlayerVisible && (
        <MiniPlayer
          currentTime={currentTimestamp}
          duration={duration}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onSkipBackward={handleSkipBackward}
          onSkipForward={handleSkipForward}
        />
      )}
    </div>
  );
};

export default SessionDetail;
