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

interface FeedbackItem {
  id: string;
  title?: string;
  timestamp: number;
  endTimestamp?: number;
  text: string;
  audioResponse?: string;
  audioFeedback?: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: Date;
  isGeneral?: boolean;
}

interface TranscriptSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

interface TranscriptSelection {
  startId: string;
  endId: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface SessionDetailProps {
  session: Session;
  audioUrl: string;
  feedback: FeedbackItem[];
  onBack: () => void;
  onAddFeedback?: (
    title: string,
    text: string,
    timestamp: number,
    endTimestamp?: number,
    audioBlob?: Blob,
    isGeneral?: boolean,
  ) => void;
  onAddAudioResponse?: (audioBlob: Blob, feedbackId: string) => void;
  className?: string;
}

const SessionDetail = ({
  session,
  audioUrl,
  feedback,
  onBack,
  onAddFeedback,
  onAddAudioResponse,
  className,
}: SessionDetailProps) => {
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    null,
  );
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(true);
  const [highlightedSegmentIds, setHighlightedSegmentIds] = useState<string[]>(
    [],
  );
  const [transcriptSelection, setTranscriptSelection] =
    useState<TranscriptSelection | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [generalComment, setGeneralComment] = useState("");
  const [showGeneralCommentForm, setShowGeneralCommentForm] = useState(false);
  const [feedbackToSegmentMap, setFeedbackToSegmentMap] = useState<
    Record<string, FeedbackItem[]>
  >({});
  const [isFeedbackPanelMinimized, setIsFeedbackPanelMinimized] =
    useState(false);
  const [isRecordingFeedback, setIsRecordingFeedback] = useState(false);
  const [audioFeedbackBlob, setAudioFeedbackBlob] = useState<Blob | null>(null);
  const [isFeedbackAudioPlaying, setIsFeedbackAudioPlaying] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState<"text" | "audio">("text");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const [likedSegments, setLikedSegments] = useState<string[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fullPlayerRef = useRef<HTMLDivElement>(null);

  // Filter feedback into general and specific
  const generalFeedback = feedback.filter((item) => item.isGeneral);
  const specificFeedback = feedback.filter((item) => !item.isGeneral);

  // Mock transcript data - in a real app, this would come from an API
  const [transcriptSegments, setTranscriptSegments] = useState<
    TranscriptSegment[]
  >([
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
      text: "I'm glad to hear the exercises were helpful. Can you tell me more about those difficult moments? What was happening when you felt anxious?",
      speaker: "Counselor",
    },
    {
      id: "segment-4",
      start: 46,
      end: 70,
      text: "Well, I had a presentation at work on Tuesday, and I started feeling really nervous the night before. My heart was racing, and I couldn't sleep well. Then during the presentation, I felt like everyone was judging me.",
      speaker: "Client",
    },
    {
      id: "segment-5",
      start: 71,
      end: 90,
      text: "That sounds challenging. It's common to feel anxious before and during presentations. How did you manage those feelings in the moment?",
      speaker: "Counselor",
    },
    {
      id: "segment-6",
      start: 91,
      end: 120,
      text: "I tried the breathing technique we practiced. It helped a little bit, but I still stumbled over my words a few times. My boss said I did well afterward, but I'm not sure if he was just being nice.",
      speaker: "Client",
    },
    {
      id: "segment-7",
      start: 121,
      end: 150,
      text: "It's great that you used the breathing technique. That shows you're applying what we've discussed. It's also interesting that your boss gave you positive feedback, but you're questioning it. Let's explore that a bit more.",
      speaker: "Counselor",
    },
    {
      id: "segment-8",
      start: 151,
      end: 180,
      text: "I guess I have a hard time believing compliments. I always think people are just saying nice things to make me feel better, not because they actually mean it.",
      speaker: "Client",
    },
    {
      id: "segment-9",
      start: 181,
      end: 210,
      text: "That's an important insight. This relates to what we've discussed about negative thought patterns. When we consistently doubt positive feedback, it can reinforce our insecurities. Let's work on some strategies to help you recognize and accept genuine compliments.",
      speaker: "Counselor",
    },
    {
      id: "segment-10",
      start: 211,
      end: 240,
      text: "I'd like that. I know it's not rational to always doubt people, but it's hard to change how I think about these things.",
      speaker: "Client",
    },
    {
      id: "segment-11",
      start: 241,
      end: 270,
      text: "Change takes time, and you're already making progress by recognizing these patterns. For our next session, I'd like you to keep a small journal of any compliments or positive feedback you receive, and we can discuss your reactions to them.",
      speaker: "Counselor",
    },
    {
      id: "segment-12",
      start: 271,
      end: 300,
      text: "Okay, I can do that. Should I write down how I feel when I get the compliment too?",
      speaker: "Client",
    },
    {
      id: "segment-13",
      start: 301,
      end: 330,
      text: "Yes, that would be very helpful. Note your immediate emotional reaction, any thoughts that come up, and then try to take a moment to consider an alternative perspective. We'll review this together next week.",
      speaker: "Counselor",
    },
    {
      id: "segment-14",
      start: 331,
      end: 360,
      text: "Thanks, I think this will be useful. I'm looking forward to working on this.",
      speaker: "Client",
    },
    {
      id: "segment-15",
      start: 361,
      end: 390,
      text: "I appreciate your willingness to try these exercises. Before we wrap up, is there anything else you'd like to discuss today?",
      speaker: "Counselor",
    },
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

  const formatDate = (date: Date) => {
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
    return formatDuration(seconds);
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
      };

      const handleDurationChange = () => {
        setDuration(audio.duration);
      };

      const handlePlay = () => {
        setIsPlaying(true);
      };

      const handlePause = () => {
        setIsPlaying(false);
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("durationchange", handleDurationChange);
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("durationchange", handleDurationChange);
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, []);

  // Handle transcript selection
  const handleTranscriptSelection = (selection: TranscriptSelection | null) => {
    setTranscriptSelection(selection);
    // Don't automatically show feedback form - it will be triggered by button click
    if (!selection) {
      setShowFeedbackForm(false);
    }
  };

  // Start recording audio feedback
  const startRecordingFeedback = useCallback(async () => {
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
  }, []);

  // Stop recording audio feedback
  const stopRecordingFeedback = useCallback(() => {
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
  }, []);

  // Play recorded audio feedback
  const playFeedbackAudio = useCallback(() => {
    if (audioFeedbackBlob) {
      const audioUrl = URL.createObjectURL(audioFeedbackBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsFeedbackAudioPlaying(false);
      audio.onpause = () => setIsFeedbackAudioPlaying(false);
      audio.onerror = () => setIsFeedbackAudioPlaying(false);
      audio.play().catch((err) => {
        console.error("Error playing audio:", err);
        setIsFeedbackAudioPlaying(false);
      });
      setIsFeedbackAudioPlaying(true);
    }
  }, [audioFeedbackBlob]);

  // Clear recorded audio feedback
  const clearFeedbackAudio = useCallback(() => {
    setAudioFeedbackBlob(null);
  }, []);

  // Handle adding feedback for transcript selection
  const handleAddFeedbackForSelection = () => {
    if (transcriptSelection && onAddFeedback) {
      onAddFeedback(
        feedbackTitle,
        feedbackMode === "text" ? feedbackText : "Audio feedback provided",
        transcriptSelection.startTime,
        transcriptSelection.endTime,
        feedbackMode === "audio" ? audioFeedbackBlob : undefined,
      );
      setFeedbackTitle("");
      setFeedbackText("");
      setAudioFeedbackBlob(null);
      setShowFeedbackForm(false);
      setTranscriptSelection(null);
    }
  };

  // Handle adding general comment
  const handleAddGeneralComment = () => {
    if (onAddFeedback && generalComment.trim()) {
      onAddFeedback(
        "General Comment",
        generalComment,
        0, // No specific timestamp
        undefined,
        undefined,
        undefined,
        true, // Mark as general comment
      );
      setGeneralComment("");
      setShowGeneralCommentForm(false);
    }
  };

  // Create feedback markers for the audio player
  const feedbackMarkers = specificFeedback.map((item) => ({
    timestamp: item.timestamp,
    endTimestamp: item.endTimestamp,
    id: item.id,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Sessions
        </Button>
        <Badge className={getStatusColor(session.status)}>
          {getStatusText(session.status)}
        </Badge>
      </div>
      <div
        ref={fullPlayerRef}
        className="bg-white dark:bg-gray-900 pb-4 shadow-md"
      >
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl dark:text-white">
                  {session.title}
                </CardTitle>
                <CardDescription className="mt-2 flex flex-wrap items-center gap-4 dark:text-gray-300">
                  <span className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    Date: {formatDate(session.createdAt)}
                  </span>
                  <span className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    Duration: {formatDuration(session.duration)}
                  </span>
                  <span className="flex items-center">
                    <MessageSquare size={14} className="mr-1" />
                    {feedback.length} comments
                  </span>
                  {session.sessionType && (
                    <span className="flex items-center">
                      Type: {session.sessionType}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-right dark:text-gray-300">
                  <p className="font-medium">Supervisor Reviewed By</p>
                  <p>{session.supervisor.name}</p>
                </div>
                <Avatar>
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.supervisor.avatar}`}
                    alt={session.supervisor.name}
                  />
                  <AvatarFallback>{session.supervisor.name[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AudioPlayer
              src={audioUrl}
              feedbackMarkers={feedbackMarkers}
              onMarkerClick={handleMarkerClick}
              onTimeUpdate={setCurrentTimestamp}
              onAddFeedback={() => {
                setShowFeedbackForm(true);
                setTranscriptSelection({
                  startId: "",
                  endId: "",
                  startTime: currentTimestamp,
                  endTime: currentTimestamp,
                  text: "",
                });
              }}
            />
          </CardContent>
        </Card>
      </div>
      {/* General Comments Section - Simplified */}
      <Card className="dark:bg-gray-800 dark:border-gray-700 mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">General Comments</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGeneralCommentForm(!showGeneralCommentForm)}
            className="flex items-center gap-1"
          >
            <Plus size={16} />
            Add Comment
          </Button>
        </CardHeader>
        <CardContent>
          {showGeneralCommentForm && (
            <div className="mb-4 p-4 border rounded-md bg-gray-50">
              <Textarea
                placeholder="Add a general comment about the entire session..."
                className="mb-2"
                value={generalComment}
                onChange={(e) => setGeneralComment(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowGeneralCommentForm(false);
                    setGeneralComment("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddGeneralComment}
                  disabled={!generalComment.trim()}
                >
                  Save Comment
                </Button>
              </div>
            </div>
          )}

          {generalFeedback.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No general comments yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {generalFeedback.map((item) => (
                <div key={item.id} className="p-4 border rounded-md bg-gray-50">
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.author.avatar}`}
                        alt={item.author.name}
                      />
                      <AvatarFallback>{item.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{item.author.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Flexible layout for Transcript and Feedback */}
      <div className="flex w-full relative">
        {/* Transcript section */}
        <div
          className={`${isFeedbackPanelMinimized ? "w-full" : "w-3/4"} transition-all duration-300`}
        >
          <Transcript
            segments={transcriptSegments}
            currentTime={currentTimestamp}
            highlightedSegmentIds={highlightedSegmentIds}
            onSegmentClick={handleSegmentClick}
            onSelectionChange={handleTranscriptSelection}
            className="h-full"
            isPlaying={isPlaying}
            feedbackItems={feedbackToSegmentMap}
            likedSegments={likedSegments}
            onFeedbackClick={(segmentId) => {
              const segment = transcriptSegments.find(
                (seg) => seg.id === segmentId,
              );
              if (segment) {
                setShowFeedbackForm(true);
                setTranscriptSelection({
                  startId: segmentId,
                  endId: segmentId,
                  startTime: segment.start,
                  endTime: segment.end,
                  text: segment.text,
                });
              }
            }}
            onLikeClick={(segmentId) => {
              // Handle like functionality
              const segment = transcriptSegments.find(
                (seg) => seg.id === segmentId,
              );
              if (segment && onAddFeedback) {
                onAddFeedback(
                  "Liked segment",
                  "👍 This segment was helpful",
                  segment.start,
                  segment.end,
                );
                // Add to liked segments immediately for UI feedback
                setLikedSegments([...likedSegments, segmentId]);
                console.log(`Liked segment ${segmentId}`);
              }
            }}
          />
        </div>

        {/* Toggle button for feedback panel - sticky on right side */}
        <div className="sticky top-20 right-0 h-0">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 h-12 w-6 p-0 bg-gray-200 hover:bg-gray-300 rounded-r-md rounded-l-none shadow-md"
            onClick={() =>
              setIsFeedbackPanelMinimized(!isFeedbackPanelMinimized)
            }
          >
            {isFeedbackPanelMinimized ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </Button>
        </div>

        {/* Feedback panel - simplified, only shows list of feedback */}
        {!isFeedbackPanelMinimized && (
          <div className="w-1/4 pl-4 transition-all duration-300">
            <div className="bg-white rounded-lg shadow-md p-4 h-full">
              <h3 className="text-lg font-medium mb-4">Feedback List</h3>
              <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
                {specificFeedback.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>No feedback yet for this session.</p>
                    <p className="text-sm mt-1">
                      Select text in the transcript to add feedback.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {specificFeedback.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-lg p-3 text-sm"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.author.avatar}`}
                              alt={item.author.name}
                              className="w-full h-full"
                            />
                          </div>
                          <span className="font-medium text-xs">
                            {item.author.name}
                          </span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </div>
                        {item.title && (
                          <p className="font-medium text-xs">{item.title}</p>
                        )}
                        <p className="text-gray-700">{item.text}</p>
                        {item.audioFeedback && (
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
            </div>
          </div>
        )}
      </div>
      {/* Inline feedback form that appears when text is selected */}
      {showFeedbackForm && transcriptSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">Add Feedback</CardTitle>
              <CardDescription>
                {transcriptSelection.text ? (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm">
                    <p className="font-medium">Selected text:</p>
                    <p>"{transcriptSelection.text}"</p>
                    <p className="text-xs mt-1">
                      {formatDuration(transcriptSelection.startTime)} -{" "}
                      {formatDuration(transcriptSelection.endTime)}
                    </p>
                  </div>
                ) : (
                  <p>At {formatDuration(transcriptSelection.startTime)}</p>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Title (optional)"
                    value={feedbackTitle}
                    onChange={(e) => setFeedbackTitle(e.target.value)}
                  />
                </div>

                {/* Feedback Mode Toggle */}
                <div className="flex items-center space-x-4 mb-2">
                  <label className="block text-sm font-medium">
                    Feedback Type:
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={feedbackMode === "text"}
                        onChange={() => setFeedbackMode("text")}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span>Text Feedback</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={feedbackMode === "audio"}
                        onChange={() => setFeedbackMode("audio")}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span>Audio Feedback</span>
                    </label>
                  </div>
                </div>

                {/* Text Feedback Input */}
                {feedbackMode === "text" && (
                  <div>
                    <Textarea
                      placeholder="Your feedback..."
                      className="min-h-[150px]"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    />
                  </div>
                )}

                {/* Audio feedback recording controls */}
                {feedbackMode === "audio" && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <label className="block text-sm font-medium mb-2">
                      Audio Feedback
                    </label>
                    <div className="flex items-center gap-2">
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
                          className="flex items-center gap-2"
                        >
                          <Mic
                            size={16}
                            className={
                              isRecordingFeedback ? "animate-pulse" : ""
                            }
                          />
                          {isRecordingFeedback
                            ? "Stop Recording"
                            : "Record Audio Feedback"}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={playFeedbackAudio}
                            disabled={false}
                            className="flex items-center gap-1"
                          >
                            {isFeedbackAudioPlaying ? (
                              <Pause size={14} />
                            ) : (
                              <Play size={14} />
                            )}
                            {isFeedbackAudioPlaying ? "Playing..." : "Play"}
                          </Button>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex-1">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: isFeedbackAudioPlaying ? "100%" : "0%",
                                transition: "width 3s linear",
                              }}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFeedbackAudio}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFeedbackForm(false);
                  setTranscriptSelection(null);
                  setFeedbackTitle("");
                  setFeedbackText("");
                  setAudioFeedbackBlob(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddFeedbackForSelection}
                disabled={
                  (feedbackMode === "text" && !feedbackText.trim()) ||
                  (feedbackMode === "audio" && !audioFeedbackBlob)
                }
              >
                Save Feedback
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      {/* Mini player that stays visible when scrolling, only when full player is not visible */}
      <div className="h-16"></div> {/* Spacer for the mini player */}
      {!isFullPlayerVisible && (
        <MiniPlayer
          currentTime={currentTimestamp}
          duration={duration}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onSkipBackward={handleSkipBackward}
          onSkipForward={handleSkipForward}
          className="z-30"
        />
      )}
    </div>
  );
};

export default SessionDetail;
