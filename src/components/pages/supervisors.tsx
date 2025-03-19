import React, { useState, useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { useNavigate } from "react-router-dom";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { getSupervisors, Supervisor } from "@/lib/api";
import {
  Award,
  Briefcase,
  GraduationCap,
  ChevronRight,
  Loader2,
} from "lucide-react";

const SupervisorsPage = () => {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialization: "Cognitive Behavioral Therapy",
      education: "Ph.D. in Psychology",
      experience: "10+ years experience",
      certifications: ["Licensed Professional Counselor"],
      isAvailable: true,
      avatar: "sarah",
      level: "Senior",
      background: "Clinical Psychology",
      introduction: "Specializes in CBT and trauma-informed care",
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      specialization: "Family Therapy",
      education: "Ph.D. in Clinical Psychology",
      experience: "8 years experience",
      certifications: ["Board Certified Psychologist"],
      isAvailable: true,
      avatar: "michael",
      level: "Mid-level",
      background: "Family Therapy",
      introduction: "Focuses on family dynamics and cultural contexts",
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      specialization: "Trauma-Focused Therapy",
      education: "Psy.D. in Clinical Psychology",
      experience: "12 years experience",
      certifications: ["Certified Trauma Specialist"],
      isAvailable: false,
      avatar: "emily",
      level: "Senior",
      background: "Trauma Psychology",
      introduction: "Specializes in trauma recovery and resilience",
    },
    {
      id: "4",
      name: "Dr. James Wilson",
      specialization: "Child and Adolescent Therapy",
      education: "Ph.D. in Developmental Psychology",
      experience: "15 years experience",
      certifications: ["Child Mental Health Specialist"],
      isAvailable: true,
      avatar: "james",
      level: "Senior",
      background: "Developmental Psychology",
      introduction: "Expert in child and adolescent mental health",
    },
    {
      id: "5",
      name: "Dr. Aisha Patel",
      specialization: "Mindfulness-Based Therapy",
      education: "Ph.D. in Counseling Psychology",
      experience: "7 years experience",
      certifications: ["Certified Mindfulness Practitioner"],
      isAvailable: true,
      avatar: "aisha",
      level: "Mid-level",
      background: "Counseling Psychology",
      introduction: "Focuses on mindfulness and stress reduction",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        setIsLoading(false); // Set to false since we're using mock data
        // In a real application, you would fetch from API
        // const data = await getSupervisors();
        // setSupervisors(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch supervisors:", err);
        setError("Failed to load supervisors. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load supervisors. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupervisors();
  }, [toast]);

  const handleSupervisorClick = (supervisorId: string) => {
    navigate(`/supervisors/${supervisorId}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
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

        <main className="flex-1 overflow-auto p-4 md:p-6 transition-all duration-300 dark:bg-gray-900 dark:text-gray-100">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
              Supervisors
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse and select supervisors for your counseling sessions.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Loading supervisors...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-800 dark:text-red-200">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supervisors.map((supervisor) => (
                <Card
                  key={supervisor.id}
                  className="border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer dark:bg-gray-800 dark:border-gray-700"
                  onClick={() => handleSupervisorClick(supervisor.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${supervisor.id}`}
                            alt={supervisor.name}
                          />
                          <AvatarFallback>
                            {supervisor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base dark:text-white">
                            {supervisor.name}
                          </CardTitle>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {supervisor.specialization}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={supervisor.isAvailable ? "default" : "outline"}
                        className={
                          supervisor.isAvailable
                            ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200"
                            : "text-gray-500 dark:text-gray-400"
                        }
                      >
                        {supervisor.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <GraduationCap className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                        <span className="dark:text-gray-300">
                          {supervisor.education || "Ph.D. in Psychology"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Briefcase className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                        <span className="dark:text-gray-300">
                          {supervisor.experience || "10+ years experience"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Award className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                        <span className="dark:text-gray-300">
                          {supervisor.certifications?.[0] ||
                            "Licensed Professional Counselor"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Profile <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SupervisorsPage;
