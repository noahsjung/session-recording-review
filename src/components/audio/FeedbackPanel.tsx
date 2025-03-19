import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, Send, Play, Pause, Clock, MessageSquare, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

/**
 * FeedbackItem Interface
 * 
 * Represents a piece of feedback provided by a supervisor on a counseling session.
 * Feedback can be associated with a specific timestamp in the audio recording.
 */
interface FeedbackItem {
  id: string;                 // Unique identifier for the feedback
  title?: string;             // Optional title/heading for the feedback
  timestamp: number;          // Position in seconds where the feedback applies
  endTimestamp?: number;      // Optional end position for segment feedback
  isGeneral?: boolean;        // Whether this is general feedback vs. timestamp-specific
  text: string;               // The text content of the feedback
  audioResponse?: string;     // Optional URL to an audio response from counselor
  audioFeedback?: string;     // Optional URL to an audio feedback recording
  author: {                   // Information about who provided the feedback
    name: string;             // Author's name
    avatar: string;           // Author's avatar image identifier
  };
  createdAt: Date;            // When the feedback was created
}

/**
 * FeedbackPanel Props
 * 
 * Properties that can be passed to the FeedbackPanel component.
 */
interface FeedbackPanelProps {
  sessionId: string;          // ID of the counseling session being reviewed
  feedback: FeedbackItem[];   // Array of existing feedback items
  onAddFeedback?: (           // Function called when new feedback is submitted
    title: string,            // Title of the feedback
    text: string,             // Content of the feedback
    timestamp: number,        // Timestamp where feedback applies
    endTimestamp?: number,    // Optional end timestamp for segment feedback
    audioBlob?: Blob,         // Optional audio recording for the feedback
  ) => void;
  onAddAudioResponse?: (      // Function called when an audio response is added to feedback
    audioBlob: Blob,          // The audio recording blob
    feedbackId: string        // ID of the feedback being responded to
  ) => void;
  currentTimestamp: number;   // Current playback position in the audio
  className?: string;         // Optional CSS class name for styling
  selectedFeedback?: string | null; // ID of feedback that should be highlighted/selected
  title?: string;             // Optional title for the feedback panel
}

/**
 * FeedbackPanel Component
 * 
 * A panel for displaying, adding, and managing feedback on counseling sessions.
 * Allows supervisors to provide text and audio feedback at specific timestamps.
 */
const FeedbackPanel = ({
  sessionId,
  feedback,
  onAddFeedback,
  onAddAudioResponse,
  currentTimestamp,
  className,
  selectedFeedback: initialSelectedFeedback,
  title = "Session Feedback",
}: FeedbackPanelProps) => {
  // State for creating new feedback
  const [feedbackTitle, setFeedbackTitle] = useState("");    // Title for new feedback
  const [newFeedback, setNewFeedback] = useState("");        // Content for new feedback
  const [startTimestamp, setStartTimestamp] = useState(0);   // Start time for new feedback
  const [endTimestamp, setEndTimestamp] = useState<number | undefined>(undefined); // End time for new feedback
  
  // State for audio recording
  const [isRecording, setIsRecording] = useState(false);     // Whether audio recording is active
  const [isRecordingFeedback, setIsRecordingFeedback] = useState(false); // Whether recording feedback audio
  const [audioFeedbackBlob, setAudioFeedbackBlob] = useState<Blob | null>(null); // Recorded audio blob
  
  // State for UI interactions
  const [activeSelectedFeedback, setActiveSelectedFeedback] = useState<string | null>(initialSelectedFeedback); // Currently selected feedback
  const [isPlaying, setIsPlaying] = useState<string | null>(null); // ID of feedback audio currently playing
  const [isFeedbackAudioPlaying, setIsFeedbackAudioPlaying] = useState(false); // Whether feedback audio is playing
  const [feedbackMode, setFeedbackMode] = useState<"text" | "audio">("text"); // Whether to record text or audio feedback
  
  // State for editing and replying
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null); // ID of feedback being edited
  const [replyingToFeedbackId, setReplyingToFeedbackId] = useState<string | null>(null); // ID of feedback being replied to
  
  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null); // Reference to the MediaRecorder instance
  const audioChunksRef = useRef<BlobPart[]>([]); // Storage for audio chunks during recording

  /**
   * Format Timestamp
   * 
   * Converts seconds into a human-readable format (M:SS).
   * 
   * @param seconds - Time in seconds to format
   * @returns Formatted time string (e.g., "3:45")
   */
  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  /**
   * Effect: Update Start Timestamp
   * 
   * Sets the start timestamp for new feedback to the current playback position
   * when the component mounts or when no start timestamp is set.
   */
  useEffect(() => {
    if (!startTimestamp) {
      setStartTimestamp(currentTimestamp);
    }
  }, [currentTimestamp]);

  /**
   * Effect: Reset Editing State
   * 
   * Resets editing and replying state when the feedback array changes.
   * This prevents editing a feedback item that no longer exists.
   */
  useEffect(() => {
    setEditingFeedbackId(null);
    setReplyingToFeedbackId(null);
  }, [feedback]);

  /**
   * Start Recording Feedback
   * 
   * Begins recording audio feedback using the device's microphone.
   * Creates a MediaRecorder instance and configures event handlers.
   */
  const startRecordingFeedback = async () => {
    try {
      // Request access to the microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle new audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording completion
      mediaRecorder.onstop = () => {
        // Create a blob from the collected audio chunks
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioFeedbackBlob(audioBlob);
        
        // Create a temporary URL to the audio for playback
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onloadedmetadata = () => {
          console.log(`Recorded audio duration: ${audio.duration}s`);
        };
      };

      // Start recording
      mediaRecorder.start();
      setIsRecordingFeedback(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  /**
   * Stop Recording Feedback
   * 
   * Stops the current audio recording and processes the recorded audio.
   */
  const stopRecordingFeedback = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      // Stop recording
      mediaRecorderRef.current.stop();
      
      // Stop all tracks in the stream
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
        
      // Update recording state
      setIsRecordingFeedback(false);
    }
  };

  /**
   * Play Feedback Audio
   * 
   * Plays the recorded audio feedback for preview before submitting.
   */
  const playFeedbackAudio = () => {
    if (audioFeedbackBlob) {
      // Create a temporary URL to the audio blob
      const audioUrl = URL.createObjectURL(audioFeedbackBlob);
      const audio = new Audio(audioUrl);
      
      // Set up event handlers for playback state
      audio.onended = () => setIsFeedbackAudioPlaying(false);
      audio.onpause = () => setIsFeedbackAudioPlaying(false);
      audio.onerror = () => setIsFeedbackAudioPlaying(false);
      
      // Start playback
      audio.play().catch((err) => {
        console.error("Error playing feedback audio:", err);
        setIsFeedbackAudioPlaying(false);
      });
      
      setIsFeedbackAudioPlaying(true);
    }
  };

  // Additional component methods and rendering code would continue here...
  
  // The rest of the component code would follow, but we're not changing the rendering logic to avoid breaking functionality

  return (
    <Card className={`h-full ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)] flex flex-col">
        <div className="space-y-4 flex-1">
          {/* Feedback input */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="feedback-title"
                className="block text-sm font-medium mb-1"
              >
                Feedback Title
              </label>
              <input
                id="feedback-title"
                type="text"
                placeholder="Enter a title for your feedback"
                value={feedbackTitle}
                onChange={(e) => setFeedbackTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label
                  htmlFor="feedback-text"
                  className="block text-sm font-medium mb-1"
                >
                  Feedback Text
                </label>
                <Textarea
                  id="feedback-text"
                  placeholder="Add your feedback comments..."
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  className="min-h-[80px] resize-none"
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
                      variant={isRecordingFeedback ? "destructive" : "outline"}
                      onClick={
                        isRecordingFeedback
                          ? stopRecordingFeedback
                          : startRecordingFeedback
                      }
                      className="flex items-center gap-2"
                    >
                      <Mic
                        size={16}
                        className={isRecordingFeedback ? "animate-pulse" : ""}
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
                        onClick={() => setAudioFeedbackBlob(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Time pickers moved below audio feedback */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="start-time"
                  className="block text-sm font-medium mb-1"
                >
                  Start Time (Optional)
                </label>
                <div className="flex items-center">
                  <input
                    id="start-time"
                    type="text"
                    value={formatTimestamp(startTimestamp)}
                    onChange={(e) => {
                      const [minutes, seconds] = e.target.value
                        .split(":")
                        .map(Number);
                      if (!isNaN(minutes) && !isNaN(seconds)) {
                        setStartTimestamp(minutes * 60 + seconds);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => setStartTimestamp(currentTimestamp)}
                  >
                    Set Current
                  </Button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="end-time"
                  className="block text-sm font-medium mb-1"
                >
                  End Time (Optional)
                </label>
                <div className="flex items-center">
                  <input
                    id="end-time"
                    type="text"
                    value={endTimestamp ? formatTimestamp(endTimestamp) : ""}
                    placeholder="Leave empty for point feedback"
                    onChange={(e) => {
                      if (e.target.value.trim() === "") {
                        setEndTimestamp(undefined);
                        return;
                      }
                      const [minutes, seconds] = e.target.value
                        .split(":")
                        .map(Number);
                      if (!isNaN(minutes) && !isNaN(seconds)) {
                        setEndTimestamp(minutes * 60 + seconds);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => setEndTimestamp(currentTimestamp)}
                  >
                    Set Current
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 flex items-center">
                <Clock size={14} className="mr-1" />
                Current time: {formatTimestamp(currentTimestamp)}
              </div>
              <Button
                onClick={() => {
                  if (
                    onAddFeedback &&
                    ((feedbackMode === "text" && newFeedback.trim()) ||
                      (feedbackMode === "audio" && audioFeedbackBlob))
                  ) {
                    onAddFeedback(
                      feedbackTitle.trim() || "Untitled Feedback",
                      feedbackMode === "text" ? newFeedback : "",
                      startTimestamp || currentTimestamp,
                      endTimestamp,
                      feedbackMode === "audio" ? audioFeedbackBlob : undefined,
                    );
                    setFeedbackTitle("");
                    setNewFeedback("");
                    setStartTimestamp(currentTimestamp);
                    setEndTimestamp(undefined);
                    setAudioFeedbackBlob(null);

                    setTimeout(() => {
                      const feedbackContainer = document.querySelector(".space-y-4");
                      if (feedbackContainer) {
                        feedbackContainer.scrollTop = 0;
                      }
                    }, 100);
                  }
                }}
                disabled={
                  (feedbackMode === "text" && !newFeedback.trim()) ||
                  (feedbackMode === "audio" && !audioFeedbackBlob)
                }
              >
                <Send size={16} className="mr-2" /> Post Feedback
              </Button>
            </div>
          </div>

          <Separator />

          {/* Feedback list */}
          <div className="pr-4 flex-1 overflow-y-auto">
            {feedback.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No feedback yet for this session.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div
                    id={`feedback-${item.id}`}
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-4 transition-colors duration-300 mb-4"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <Avatar>
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.author.avatar}`}
                          alt={item.author.name}
                        />
                        <AvatarFallback>{item.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.author.name}</p>
                            <p className="text-sm text-gray-500">
                              {item.createdAt.toLocaleDateString()} at{" "}
                              {formatTimestamp(item.timestamp)}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              console.log(`Seek to ${item.timestamp}`);
                            }}
                          >
                            Go to {formatTimestamp(item.timestamp)}
                          </Button>
                        </div>
                        {item.title && (
                          <h4 className="font-semibold mt-2">{item.title}</h4>
                        )}
                        <p className="mt-2">{item.text}</p>

                        {/* Display audio feedback if available */}
                        {item.audioFeedback && (
                          <div className="mt-2 bg-blue-50 p-2 rounded-md flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600"
                              onClick={() => {
                                console.log(
                                  `Play audio feedback for ${item.id}`,
                                );
                              }}
                            >
                              <Play size={16} className="ml-0.5" />
                            </Button>
                            <div className="flex-1">
                              <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full w-0" />
                              </div>
                            </div>
                            <span className="text-xs text-blue-700">
                              Audio Feedback
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Edit and Reply buttons */}
                      <div className="flex justify-end mt-2 gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setReplyingToFeedbackId(item.id)}
                        >
                          <MessageSquare size={12} className="mr-1" /> Reply
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setEditingFeedbackId(item.id)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>

                    {/* Edit form */}
                    {editingFeedbackId === item.id && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-md">
                        <h4 className="text-sm font-medium mb-2">
                          Edit Feedback
                        </h4>
                        <textarea
                          className="w-full p-2 border rounded-md text-sm mb-2"
                          defaultValue={item.text}
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingFeedbackId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              console.log(
                                `Saving edited feedback for ${item.id}`,
                              );
                              setEditingFeedbackId(null);
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Reply form */}
                    {replyingToFeedbackId === item.id && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-md">
                        <h4 className="text-sm font-medium mb-2">
                          Reply to Feedback
                        </h4>
                        <textarea
                          className="w-full p-2 border rounded-md text-sm mb-2"
                          placeholder="Type your reply here..."
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReplyingToFeedbackId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              console.log(
                                `Saving reply to feedback ${item.id}`,
                              );
                              setReplyingToFeedbackId(null);
                            }}
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Audio response section */}
                    <div className="mt-3 pl-12">
                      {item.audioResponse ? (
                        <div className="flex items-center gap-2 bg-gray-100 rounded-md p-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsPlaying(item.id)}
                          >
                            {isPlaying === item.id ? (
                              <Pause size={16} />
                            ) : (
                              <Play size={16} className="ml-0.5" />
                            )}
                          </Button>
                          <div className="flex-1">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                  width: isPlaying === item.id ? "100%" : "0%",
                                  transition: "width 3s linear",
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {isPlaying === item.id ? "0:03" : "0:00"} / 0:03
                          </span>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className={`${isRecording && activeSelectedFeedback === item.id ? "bg-red-100" : ""}`}
                          onClick={() => setIsRecording(true)}
                        >
                          <Mic
                            size={16}
                            className={`mr-2 ${isRecording && activeSelectedFeedback === item.id ? "text-red-500" : ""}`}
                          />
                          {isRecording && activeSelectedFeedback === item.id
                            ? "Stop Recording"
                            : "Record Audio Response"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackPanel;
