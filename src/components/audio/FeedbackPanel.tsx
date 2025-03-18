import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, Send, Play, Pause, Clock, MessageSquare, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
}

interface FeedbackPanelProps {
  sessionId: string;
  feedback: FeedbackItem[];
  onAddFeedback?: (
    title: string,
    text: string,
    timestamp: number,
    endTimestamp?: number,
    audioBlob?: Blob,
  ) => void;
  onAddAudioResponse?: (audioBlob: Blob, feedbackId: string) => void;
  currentTimestamp: number;
  className?: string;
  selectedFeedback?: string | null;
  title?: string;
}

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
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [newFeedback, setNewFeedback] = useState("");
  const [startTimestamp, setStartTimestamp] = useState(0);
  const [endTimestamp, setEndTimestamp] = useState<number | undefined>(
    undefined,
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingFeedback, setIsRecordingFeedback] = useState(false);
  const [audioFeedbackBlob, setAudioFeedbackBlob] = useState<Blob | null>(null);
  const [activeSelectedFeedback, setActiveSelectedFeedback] = useState<
    string | null
  >(initialSelectedFeedback);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isFeedbackAudioPlaying, setIsFeedbackAudioPlaying] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState<"text" | "audio">("text");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Set current timestamp when it updates
  useEffect(() => {
    if (!startTimestamp) {
      setStartTimestamp(currentTimestamp);
    }
  }, [currentTimestamp]);

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
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onloadedmetadata = () => {
          console.log(`Recorded audio duration: ${audio.duration}s`);
        };
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
      audio.onpause = () => setIsFeedbackAudioPlaying(false);
      audio.onerror = () => setIsFeedbackAudioPlaying(false);
      audio.play().catch((err) => {
        console.error("Error playing audio:", err);
        setIsFeedbackAudioPlaying(false);
      });
      setIsFeedbackAudioPlaying(true);
    }
  };

  // Clear recorded audio feedback
  const clearFeedbackAudio = () => {
    setAudioFeedbackBlob(null);
  };

  const handleSubmitFeedback = () => {
    if (
      onAddFeedback &&
      ((feedbackMode === "text" && newFeedback.trim()) ||
        (feedbackMode === "audio" && audioFeedbackBlob))
    ) {
      onAddFeedback(
        feedbackTitle.trim() || "Untitled Feedback",
        feedbackMode === "text" ? newFeedback : "",
        startTimestamp || currentTimestamp, // Use current timestamp if no start time is set
        endTimestamp,
        feedbackMode === "audio" ? audioFeedbackBlob : undefined,
      );
      // Reset form fields after submission
      setFeedbackTitle("");
      setNewFeedback("");
      setStartTimestamp(currentTimestamp);
      setEndTimestamp(undefined);
      setAudioFeedbackBlob(null);

      // Force a re-render to show the new feedback immediately
      setTimeout(() => {
        const feedbackContainer = document.querySelector(".space-y-4");
        if (feedbackContainer) {
          feedbackContainer.scrollTop = 0;
        }
      }, 100);
    }
  };

  const toggleRecording = (feedbackId: string) => {
    if (isRecording && activeSelectedFeedback === feedbackId) {
      // Stop recording and save
      setIsRecording(false);
      setActiveSelectedFeedback(null);
      // In a real implementation, you would save the recorded audio here
      // and call onAddAudioResponse with the audio blob
    } else {
      // Start recording
      setIsRecording(true);
      setActiveSelectedFeedback(feedbackId);
    }
  };

  const togglePlayAudio = (feedbackId: string) => {
    if (isPlaying === feedbackId) {
      setIsPlaying(null);
    } else {
      setIsPlaying(feedbackId);
      // In a real implementation, you would play the audio here
      // and set isPlaying to null when it finishes
      setTimeout(() => setIsPlaying(null), 3000);
    }
  };

  // Scroll to feedback when selected
  useEffect(() => {
    if (activeSelectedFeedback) {
      const element = document.getElementById(
        `feedback-${activeSelectedFeedback}`,
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("bg-blue-50");
        setTimeout(() => {
          element.classList.remove("bg-blue-50");
          element.classList.add("bg-gray-50");
        }, 2000);
      }
    }
  }, [activeSelectedFeedback]);

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
                onClick={handleSubmitFeedback}
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
                    className="bg-gray-50 rounded-lg p-4 transition-colors duration-300"
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
                              // In a real implementation, you would seek to this timestamp
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
                                // In a real implementation, you would play the audio feedback
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
                    </div>

                    {/* Audio response section */}
                    <div className="mt-3 pl-12">
                      {item.audioResponse ? (
                        <div className="flex items-center gap-2 bg-gray-100 rounded-md p-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => togglePlayAudio(item.id)}
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
                          onClick={() => toggleRecording(item.id)}
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
