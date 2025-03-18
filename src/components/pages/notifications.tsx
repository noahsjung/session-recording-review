import React, { useState } from "react";
import { useSidebar } from "@/context/SidebarContext";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  CheckCircle,
  Clock,
  FileAudio,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: "feedback" | "request" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  sessionId?: string;
  sender?: {
    name: string;
    avatar: string;
  };
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "feedback",
    title: "New feedback received",
    message:
      "Dr. Sarah Johnson has provided feedback on your session 'Client A - Initial Assessment'.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    sessionId: "1",
    sender: {
      name: "Dr. Sarah Johnson",
      avatar: "sarah",
    },
  },
  {
    id: "n2",
    type: "request",
    title: "Feedback request",
    message:
      "Your feedback has been requested for 'Client B - Cognitive Behavioral Therapy Session'.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    read: true,
    sessionId: "2",
  },
  {
    id: "n3",
    type: "system",
    title: "System maintenance",
    message:
      "The system will be undergoing maintenance on Saturday, July 15th from 2:00 AM to 4:00 AM EST.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
  {
    id: "n4",
    type: "feedback",
    title: "Audio feedback added",
    message:
      "Dr. Michael Chen has added audio feedback to your session 'Client B - Cognitive Behavioral Therapy Session'.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), // 26 hours ago
    read: false,
    sessionId: "2",
    sender: {
      name: "Dr. Michael Chen",
      avatar: "michael",
    },
  },
  {
    id: "n5",
    type: "system",
    title: "New feature available",
    message:
      "Audio visualization is now available for all session recordings. Try it out!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    read: true,
  },
];

const NotificationsPage = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    if (activeTab === "feedback") return notification.type === "feedback";
    if (activeTab === "requests") return notification.type === "request";
    if (activeTab === "system") return notification.type === "system";
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true })),
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.sessionId) {
      navigate(`/sessions`, { state: { sessionId: notification.sessionId } });
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "feedback":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "request":
        return <FileAudio className="h-5 w-5 text-purple-500" />;
      case "system":
        return <Bell className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

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
          activeItem="Notifications"
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <main className="flex-1 overflow-auto p-6 transition-all duration-300">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-600">
              Stay updated with feedback, requests, and system announcements.
            </p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  {unreadCount > 0 && (
                    <span className="ml-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>
            </Tabs>

            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No notifications</h3>
                <p className="mt-2 text-gray-500">
                  You're all caught up! Check back later for new notifications.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`overflow-hidden cursor-pointer transition-colors hover:bg-gray-50 ${!notification.read ? "border-l-4 border-l-blue-500" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-0">
                    <div className="p-4 flex items-start gap-4">
                      <div className="mt-1">
                        {notification.sender ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.sender.avatar}`}
                              alt={notification.sender.name}
                            />
                            <AvatarFallback>
                              {notification.sender.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3
                            className={`font-medium ${!notification.read ? "text-blue-600" : ""}`}
                          >
                            {notification.title}
                          </h3>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock size={12} className="mr-1" />
                            {formatTime(notification.timestamp)}
                          </div>
                        </div>
                        <p className="text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
