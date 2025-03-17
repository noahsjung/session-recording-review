import React, { useState } from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../../../supabase/auth";
import { Link } from "react-router-dom";
import {
  FileAudio,
  Clock,
  MessageSquare,
  Users,
  Calendar,
  ChevronRight,
  BarChart2,
  Headphones,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";

// Mock data for recent sessions
const recentSessions = [
  {
    id: "1",
    title: "Client A - Initial Assessment",
    date: "2023-06-15",
    duration: "43:00",
    status: "completed",
    feedbackCount: 5,
    supervisor: {
      name: "Dr. Sarah Johnson",
      avatar: "sarah",
    },
  },
  {
    id: "2",
    title: "Client B - Cognitive Behavioral Therapy",
    date: "2023-06-22",
    duration: "52:00",
    status: "in_progress",
    feedbackCount: 3,
    supervisor: {
      name: "Dr. Michael Chen",
      avatar: "michael",
    },
  },
  {
    id: "3",
    title: "Client C - Follow-up Session",
    date: "2023-06-29",
    duration: "32:00",
    status: "pending",
    feedbackCount: 0,
    supervisor: {
      name: "Dr. Aisha Patel",
      avatar: "aisha",
    },
  },
];

// Mock data for feedback statistics
const feedbackStats = {
  totalSessions: 12,
  pendingReviews: 3,
  completedFeedback: 8,
  upcomingSessions: 4,
};

// Mock data for supervisor availability
const supervisors = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    avatar: "sarah",
    availability: "Available",
    specialization: "Cognitive Behavioral Therapy",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    avatar: "michael",
    availability: "Busy until June 30",
    specialization: "Family Therapy",
  },
  {
    id: "3",
    name: "Dr. Aisha Patel",
    avatar: "aisha",
    availability: "Available",
    specialization: "Trauma-Focused Therapy",
  },
];

// Mock data for recent feedback
const recentFeedback = [
  {
    id: "f1",
    sessionTitle: "Client A - Initial Assessment",
    timestamp: "12:45",
    text: "Great introduction and rapport building. You established trust quickly with the client.",
    author: {
      name: "Dr. Sarah Johnson",
      avatar: "sarah",
    },
    date: "2023-06-16",
  },
  {
    id: "f2",
    sessionTitle: "Client B - Cognitive Behavioral Therapy",
    timestamp: "23:18",
    text: "Consider exploring the underlying beliefs more here. There seems to be a core belief about perfectionism.",
    author: {
      name: "Dr. Michael Chen",
      avatar: "michael",
    },
    date: "2023-06-23",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
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

const Dashboard = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        <main className="flex-1 overflow-auto p-4 md:p-6 transition-all duration-300">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Welcome to Your Counseling Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your session recordings and feedback in one place.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Summary Cards */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sessions
                </CardTitle>
                <Headphones className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {feedbackStats.totalSessions}
                </div>
                <p className="text-xs text-gray-500">Uploaded recordings</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Reviews
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {feedbackStats.pendingReviews}
                </div>
                <p className="text-xs text-gray-500">
                  Awaiting supervisor feedback
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Feedback
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {feedbackStats.completedFeedback}
                </div>
                <p className="text-xs text-gray-500">Sessions with feedback</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Sessions
                </CardTitle>
                <Calendar className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {feedbackStats.upcomingSessions}
                </div>
                <p className="text-xs text-gray-500">Scheduled this week</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            {/* Recent Sessions */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Recent Sessions</CardTitle>
                <Link to="/sessions">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus size={16} />
                    New Session
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[320px] pr-4">
                  <div className="space-y-4">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium truncate">
                            {session.title}
                          </h3>
                          <Badge className={getStatusColor(session.status)}>
                            {getStatusText(session.status)}
                          </Badge>
                        </div>

                        <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {session.duration}
                          </div>
                          <div className="flex items-center">
                            <MessageSquare size={14} className="mr-1" />
                            {session.feedbackCount} comments
                          </div>
                          <div>Date: {session.date}</div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.supervisor.avatar}`}
                                alt={session.supervisor.name}
                              />
                              <AvatarFallback>
                                {session.supervisor.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {session.supervisor.name}
                            </span>
                          </div>

                          <Link
                            to={`/sessions`}
                            state={{ sessionId: session.id }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                            >
                              View <ChevronRight size={14} className="ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Recent Feedback */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFeedback.map((feedback) => (
                  <div key={feedback.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <Avatar>
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${feedback.author.avatar}`}
                          alt={feedback.author.name}
                        />
                        <AvatarFallback>
                          {feedback.author.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {feedback.author.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {feedback.date} at {feedback.timestamp} in{" "}
                              <span className="font-medium">
                                {feedback.sessionTitle}
                              </span>
                            </p>
                          </div>
                          <Link
                            to={`/sessions?id=${feedback.id.replace("f", "")}`}
                          >
                            <Button variant="outline" size="sm">
                              Go to timestamp
                            </Button>
                          </Link>
                        </div>
                        <p className="mt-2">{feedback.text}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="text-center">
                  <Link to="/sessions">
                    <Button variant="outline">
                      View All Sessions and Feedback
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
