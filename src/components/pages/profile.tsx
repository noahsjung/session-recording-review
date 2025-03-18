import React, { useState } from "react";
import { useSidebar } from "@/context/SidebarContext";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  Clock,
  FileAudio,
  MessageSquare,
  User,
  Edit,
  Upload,
  Headphones,
  Award,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../../../supabase/auth";

interface Session {
  id: string;
  title: string;
  date: Date;
  duration: number;
  type: string;
  feedbackCount: number;
}

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: Date;
  expiryDate?: Date;
  verified: boolean;
}

const ProfilePage = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const userProfile = {
    name: "John Doe",
    email: user?.email || "john.doe@example.com",
    role: "Counselor",
    specialization: "Cognitive Behavioral Therapy",
    experience: "5 years",
    bio: "Licensed therapist specializing in cognitive behavioral therapy with experience in treating anxiety, depression, and trauma. Passionate about helping clients develop effective coping strategies and achieve their mental health goals.",
    location: "New York, NY",
    joinDate: new Date(2021, 5, 15),
  };

  const recentSessions: Session[] = [
    {
      id: "1",
      title: "Client A - Initial Assessment",
      date: new Date(2023, 5, 15),
      duration: 2580, // 43 minutes
      type: "Initial Assessment",
      feedbackCount: 5,
    },
    {
      id: "2",
      title: "Client B - Cognitive Behavioral Therapy Session",
      date: new Date(2023, 5, 22),
      duration: 3120, // 52 minutes
      type: "Cognitive Behavioral Therapy",
      feedbackCount: 3,
    },
    {
      id: "3",
      title: "Client C - Follow-up Session",
      date: new Date(2023, 5, 29),
      duration: 1920, // 32 minutes
      type: "Follow-up",
      feedbackCount: 0,
    },
  ];

  const certificates: Certificate[] = [
    {
      id: "cert1",
      title: "Licensed Professional Counselor",
      issuer: "State Board of Professional Counselors",
      date: new Date(2018, 3, 10),
      expiryDate: new Date(2024, 3, 10),
      verified: true,
    },
    {
      id: "cert2",
      title: "Certified Cognitive Behavioral Therapist",
      issuer: "American Institute for Cognitive Therapy",
      date: new Date(2019, 7, 22),
      verified: true,
    },
    {
      id: "cert3",
      title: "Trauma-Focused Therapy Certification",
      issuer: "International Association of Trauma Professionals",
      date: new Date(2020, 11, 5),
      verified: false,
    },
  ];

  const stats = {
    totalSessions: 87,
    totalFeedback: 142,
    averageSessionDuration: 48, // minutes
    completionRate: 95, // percentage
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
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
          activeItem="Profile"
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <main className="flex-1 overflow-auto p-6 transition-all duration-300">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-600">
              View and manage your professional profile.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Profile sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.email}`}
                      alt={userProfile.name}
                    />
                    <AvatarFallback>{userProfile.name[0]}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{userProfile.name}</h2>
                  <p className="text-gray-500">{userProfile.email}</p>
                  <Badge className="mt-2">{userProfile.role}</Badge>

                  <div className="mt-4 w-full">
                    <Button variant="outline" className="w-full">
                      <Edit size={16} className="mr-2" />
                      Edit Profile
                    </Button>
                  </div>

                  <Separator className="my-4" />

                  <div className="w-full text-left space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen size={16} className="text-gray-500" />
                      <span className="font-medium">Specialization:</span>
                      <span className="text-gray-600">
                        {userProfile.specialization}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award size={16} className="text-gray-500" />
                      <span className="font-medium">Experience:</span>
                      <span className="text-gray-600">
                        {userProfile.experience}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="font-medium">Joined:</span>
                      <span className="text-gray-600">
                        {formatDate(userProfile.joinDate)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Headphones size={16} className="text-gray-500" />
                      <span className="text-sm">Total Sessions</span>
                    </div>
                    <span className="font-medium">{stats.totalSessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-gray-500" />
                      <span className="text-sm">Total Feedback</span>
                    </div>
                    <span className="font-medium">{stats.totalFeedback}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-500" />
                      <span className="text-sm">Avg. Session</span>
                    </div>
                    <span className="font-medium">
                      {stats.averageSessionDuration} min
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-gray-500" />
                      <span className="text-sm">Completion Rate</span>
                    </div>
                    <span className="font-medium">{stats.completionRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main content */}
            <div className="lg:col-span-3">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="sessions">Sessions</TabsTrigger>
                  <TabsTrigger value="certifications">
                    Certifications
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About Me</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{userProfile.bio}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Sessions</CardTitle>
                      <CardDescription>
                        Your most recent counseling sessions.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentSessions.slice(0, 3).map((session) => (
                          <div
                            key={session.id}
                            className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50"
                          >
                            <div className="bg-blue-100 p-2 rounded-full">
                              <FileAudio className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{session.title}</h3>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  <span>{formatDate(session.date)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock size={14} />
                                  <span>
                                    {formatDuration(session.duration)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare size={14} />
                                  <span>{session.feedbackCount} feedback</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline">{session.type}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab("sessions")}
                      >
                        View All Sessions
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Certifications</CardTitle>
                      <CardDescription>
                        Your professional certifications and licenses.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {certificates.slice(0, 2).map((cert) => (
                          <div
                            key={cert.id}
                            className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50"
                          >
                            <div className="bg-green-100 p-2 rounded-full">
                              <Award className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{cert.title}</h3>
                                {cert.verified && (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200"
                                  >
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {cert.issuer}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Issued: {formatDate(cert.date)}
                                {cert.expiryDate &&
                                  ` · Expires: ${formatDate(cert.expiryDate)}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab("certifications")}
                      >
                        View All Certifications
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>All Sessions</CardTitle>
                        <Button>
                          <Upload size={16} className="mr-2" />
                          Upload New Session
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentSessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 border border-gray-100"
                          >
                            <div className="bg-blue-100 p-2 rounded-full">
                              <FileAudio className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{session.title}</h3>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  <span>{formatDate(session.date)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock size={14} />
                                  <span>
                                    {formatDuration(session.duration)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare size={14} />
                                  <span>{session.feedbackCount} feedback</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline">{session.type}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="certifications" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Certifications & Licenses</CardTitle>
                        <Button>
                          <Upload size={16} className="mr-2" />
                          Add Certification
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {certificates.map((cert) => (
                          <div
                            key={cert.id}
                            className="flex items-start gap-3 p-4 rounded-md hover:bg-gray-50 border border-gray-100"
                          >
                            <div className="bg-green-100 p-2 rounded-full">
                              <Award className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{cert.title}</h3>
                                {cert.verified ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200"
                                  >
                                    Verified
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                  >
                                    Pending Verification
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {cert.issuer}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                Issued: {formatDate(cert.date)}
                                {cert.expiryDate &&
                                  ` · Expires: ${formatDate(cert.expiryDate)}`}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Edit size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
