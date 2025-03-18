import React, { useState, useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  Clock,
  MessageSquare,
  Search,
  Play,
  Pause,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeedbackItem {
  id: string;
  sessionId: string;
  sessionTitle: string;
  timestamp: number;
  endTimestamp?: number;
  text: string;
  title?: string;
  audioResponse?: string;
  audioFeedback?: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: Date;
}

const FeedbackPage = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock data for feedback items
  const mockFeedbackItems: FeedbackItem[] = [
    {
      id: "f1",
      sessionId: "1",
      sessionTitle: "Client A - Initial Assessment",
      timestamp: 120,
      text: "Great introduction and rapport building. You established trust quickly with the client.",
      title: "Introduction Feedback",
      author: {
        name: "Dr. Sarah Johnson",
        avatar: "sarah",
      },
      createdAt: new Date("2023-06-16"),
    },
    {
      id: "f2",
      sessionId: "1",
      sessionTitle: "Client A - Initial Assessment",
      timestamp: 450,
      text: "Consider using more open-ended questions here to encourage the client to elaborate.",
      title: "Questioning Technique",
      audioResponse: "audio-response-1.mp3",
      author: {
        name: "Dr. Sarah Johnson",
        avatar: "sarah",
      },
      createdAt: new Date("2023-06-16"),
    },
    {
      id: "f3",
      sessionId: "2",
      sessionTitle: "Client B - Cognitive Behavioral Therapy Session",
      timestamp: 890,
      text: "Good use of reflection. The client seemed to respond well to this technique.",
      title: "Reflection Technique",
      author: {
        name: "Dr. Michael Chen",
        avatar: "michael",
      },
      createdAt: new Date("2023-06-23"),
    },
    {
      id: "f4",
      sessionId: "2",
      sessionTitle: "Client B - Cognitive Behavioral Therapy Session",
      timestamp: 1500,
      text: "This would be a good opportunity to introduce the concept of cognitive restructuring.",
      title: "Missed Opportunity",
      audioResponse: "audio-response-2.mp3",
      audioFeedback: "audio-feedback-1.webm",
      author: {
        name: "Dr. Michael Chen",
        avatar: "michael",
      },
      createdAt: new Date("2023-06-23"),
    },
    {
      id: "f5",
      sessionId: "3",
      sessionTitle: "Client C - Follow-up Session",
      timestamp: 300,
      endTimestamp: 360,
      text: "I noticed you seemed hesitant during this segment. Consider preparing some transition phrases for these situations.",
      title: "Transitions",
      author: {
        name: "Dr. Aisha Patel",
        avatar: "aisha",
      },
      createdAt: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 days ago
    },
  ];

  useEffect(() => {
    // Simulate API call to fetch feedback
    const fetchFeedback = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, you would fetch from your API
        // const { data } = await supabase.from('feedback').select('*');

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setFeedbackItems(mockFeedbackItems);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        toast({
          title: "Error",
          description: "Failed to load feedback. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [toast]);

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePlayAudio = (feedbackId: string) => {
    if (isPlaying === feedbackId) {
      setIsPlaying(null);
    } else {
      setIsPlaying(feedbackId);
      // In a real implementation, you would play the audio here
      // and set isPlaying to null when it finishes
      setTimeout(() => setIsPlaying(null), 3000);
    }
  };

  const navigateToSession = (sessionId: string) => {
    navigate(`/sessions`, { state: { sessionId } });
  };

  // Filter feedback based on active tab and search query
  const filteredFeedback = feedbackItems.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.title &&
        item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "text") return !item.audioFeedback && matchesSearch;
    if (activeTab === "audio") return !!item.audioFeedback && matchesSearch;
    if (activeTab === "recent") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return item.createdAt >= oneWeekAgo && matchesSearch;
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-white">
      <TopNavigation
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="flex flex-col md:flex-row pt-16">
        <div
          className={isCollapsed ? "w-[70px]" : "w-[240px]"}
          aria-hidden="true"
        ></div>
        <Sidebar
          activeItem="Feedback"
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <main className="flex-1 overflow-auto p-6 transition-all duration-300">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Feedbacks</h1>
            <p className="text-gray-600">
              View and manage all feedback across your counseling sessions.
            </p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Search feedback..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Feedback</TabsTrigger>
              <TabsTrigger value="text">Text Feedback</TabsTrigger>
              <TabsTrigger value="audio">Audio Feedback</TabsTrigger>
              <TabsTrigger value="recent">Recent (7 days)</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-2">Loading feedback...</span>
                </div>
              ) : filteredFeedback.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">
                    No feedback found
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {searchQuery
                      ? "Try adjusting your search query."
                      : "You don't have any feedback yet."}
                  </p>
                </div>
              ) : (
                filteredFeedback.map((item) => (
                  <FeedbackCard
                    key={item.id}
                    feedback={item}
                    onPlayAudio={handlePlayAudio}
                    isPlaying={isPlaying === item.id}
                    onNavigateToSession={navigateToSession}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-2">Loading feedback...</span>
                </div>
              ) : filteredFeedback.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">
                    No text feedback found
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {searchQuery
                      ? "Try adjusting your search query."
                      : "You don't have any text feedback yet."}
                  </p>
                </div>
              ) : (
                filteredFeedback.map((item) => (
                  <FeedbackCard
                    key={item.id}
                    feedback={item}
                    onPlayAudio={handlePlayAudio}
                    isPlaying={isPlaying === item.id}
                    onNavigateToSession={navigateToSession}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-2">Loading feedback...</span>
                </div>
              ) : filteredFeedback.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">
                    No audio feedback found
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {searchQuery
                      ? "Try adjusting your search query."
                      : "You don't have any audio feedback yet."}
                  </p>
                </div>
              ) : (
                filteredFeedback.map((item) => (
                  <FeedbackCard
                    key={item.id}
                    feedback={item}
                    onPlayAudio={handlePlayAudio}
                    isPlaying={isPlaying === item.id}
                    onNavigateToSession={navigateToSession}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-2">Loading feedback...</span>
                </div>
              ) : filteredFeedback.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">
                    No recent feedback found
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {searchQuery
                      ? "Try adjusting your search query."
                      : "You don't have any feedback from the last 7 days."}
                  </p>
                </div>
              ) : (
                filteredFeedback.map((item) => (
                  <FeedbackCard
                    key={item.id}
                    feedback={item}
                    onPlayAudio={handlePlayAudio}
                    isPlaying={isPlaying === item.id}
                    onNavigateToSession={navigateToSession}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

interface FeedbackCardProps {
  feedback: FeedbackItem;
  onPlayAudio: (id: string) => void;
  isPlaying: boolean;
  onNavigateToSession: (sessionId: string) => void;
}

const FeedbackCard = ({
  feedback,
  onPlayAudio,
  isPlaying,
  onNavigateToSession,
}: FeedbackCardProps) => {
  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${feedback.author.avatar}`}
                  alt={feedback.author.name}
                />
                <AvatarFallback>{feedback.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{feedback.author.name}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(feedback.createdAt)}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-600 bg-blue-50">
              {feedback.audioFeedback ? "Audio Feedback" : "Text Feedback"}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2">
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 font-medium hover:underline"
              onClick={() => onNavigateToSession(feedback.sessionId)}
            >
              {feedback.sessionTitle}
            </Button>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Clock size={14} className="mr-1" />
              <span>
                {formatTimestamp(feedback.timestamp)}
                {feedback.endTimestamp &&
                  ` - ${formatTimestamp(feedback.endTimestamp)}`}
              </span>
            </div>
          </div>

          {feedback.title && (
            <h3 className="text-lg font-semibold mb-2">{feedback.title}</h3>
          )}

          <p className="text-gray-700 mb-3">{feedback.text}</p>

          {feedback.audioFeedback && (
            <div className="bg-blue-50 p-3 rounded-md flex items-center gap-2 mb-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600"
                onClick={() => onPlayAudio(feedback.id)}
              >
                {isPlaying ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} className="ml-0.5" />
                )}
              </Button>
              <div className="flex-1">
                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: isPlaying ? "100%" : "0%",
                      transition: "width 3s linear",
                    }}
                  />
                </div>
              </div>
              <span className="text-xs text-blue-700">
                {isPlaying ? "Playing..." : "Audio Feedback"}
              </span>
            </div>
          )}

          {feedback.audioResponse && (
            <div className="bg-gray-100 p-3 rounded-md flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPlayAudio(feedback.id + "-response")}
              >
                {isPlaying ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} className="ml-0.5" />
                )}
              </Button>
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-500 rounded-full"
                    style={{
                      width: isPlaying ? "100%" : "0%",
                      transition: "width 3s linear",
                    }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {isPlaying ? "Playing..." : "Audio Response"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackPage;
