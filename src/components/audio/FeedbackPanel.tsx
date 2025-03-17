import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, Send, Play, Pause, Clock, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface FeedbackItem {
  id: string;
  timestamp: number;
  text: string;
  audioResponse?: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: Date;
}

interface FeedbackPanelProps {
  sessionId: string;
  feedback: FeedbackItem[];
  onAddFeedback?: (text: string, timestamp: number) => void;
  onAddAudioResponse?: (audioBlob: Blob, feedbackId: string) => void;
  currentTimestamp: number;
  className?: string;
  selectedFeedback?: string | null;
}

const FeedbackPanel = ({
  sessionId,
  feedback,
  onAddFeedback,
  onAddAudioResponse,
  currentTimestamp,
  className,
  selectedFeedback: initialSelectedFeedback,
}: FeedbackPanelProps) => {
  const [newFeedback, setNewFeedback] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [activeSelectedFeedback, setActiveSelectedFeedback] = useState<
    string | null
  >(initialSelectedFeedback);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleSubmitFeedback = () => {
    if (newFeedback.trim() && onAddFeedback) {
      onAddFeedback(newFeedback, currentTimestamp);
      setNewFeedback("");
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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl">Session Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Feedback input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Add feedback at current timestamp..."
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 flex items-center">
                <Clock size={14} className="mr-1" />
                Current time: {formatTimestamp(currentTimestamp)}
              </div>
              <Button
                onClick={handleSubmitFeedback}
                disabled={!newFeedback.trim()}
              >
                <Send size={16} className="mr-2" /> Post Feedback
              </Button>
            </div>
          </div>

          <Separator />

          {/* Feedback list */}
          <ScrollArea className="h-[400px] pr-4">
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
                        <p className="mt-2">{item.text}</p>
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
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackPanel;
