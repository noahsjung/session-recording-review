import React, { useState, useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { useParams, useNavigate } from "react-router-dom";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { getSupervisorById, Supervisor } from "@/lib/api";
import {
  ArrowLeft,
  Award,
  Briefcase,
  GraduationCap,
  Calendar,
  MessageSquare,
  Loader2,
} from "lucide-react";

const SupervisorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  useEffect(() => {
    const fetchSupervisor = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await getSupervisorById(id);
        setSupervisor(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch supervisor:", err);
        setError("Failed to load supervisor details. Please try again later.");
        toast({
          title: "Error",
          description:
            "Failed to load supervisor details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupervisor();
  }, [id, toast]);

  const handleBack = () => {
    navigate("/supervisors");
  };

  const handleRequestSession = () => {
    navigate("/sessions", { state: { uploadMode: true, supervisorId: id } });
  };

  if (isLoading) {
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
            activeItem="Supervisors"
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">
                Loading supervisor details...
              </span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !supervisor) {
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
            activeItem="Supervisors"
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error || "Supervisor not found"}
            </div>
          </main>
        </div>
      </div>
    );
  }

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
          activeItem="Supervisors"
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Supervisors
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${supervisor.avatar}`}
                        alt={supervisor.name}
                      />
                      <AvatarFallback>
                        {supervisor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold">{supervisor.name}</h2>
                    <p className="text-gray-500 mb-2">{supervisor.title}</p>
                    <Badge variant="outline" className="mb-4">
                      {supervisor.status}
                    </Badge>
                    <Button onClick={handleRequestSession} className="w-full">
                      Request Session Review
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Briefcase className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium">Specialization</p>
                        <p className="text-gray-500">
                          {supervisor.specialization}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <GraduationCap className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium">Experience</p>
                        <p className="text-gray-500">
                          {supervisor.yearsOfExperience} years
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Award className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium">Certifications</p>
                        <p className="text-gray-500">
                          {supervisor.certifications?.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium">Availability</p>
                        <p className="text-gray-500">
                          {supervisor.availability}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{supervisor.bio}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {supervisor.recentActivity &&
                    supervisor.recentActivity.length > 0 ? (
                      supervisor.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start">
                          <MessageSquare className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-gray-500">{activity.date}</p>
                            <p className="text-gray-700 mt-1">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupervisorDetailPage;
