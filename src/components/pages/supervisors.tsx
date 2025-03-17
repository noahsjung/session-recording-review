import React, { useState, useEffect } from "react";
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
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        setIsLoading(true);
        const data = await getSupervisors();
        setSupervisors(data);
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

        <main className="flex-1 overflow-auto p-4 md:p-6 transition-all duration-300">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Supervisors
            </h1>
            <p className="text-gray-600">
              Browse and select supervisors for your counseling sessions.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Loading supervisors...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supervisors.map((supervisor) => (
                <Card
                  key={supervisor.id}
                  className="border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
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
                          <CardTitle className="text-base">
                            {supervisor.name}
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            {supervisor.specialization}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={supervisor.isAvailable ? "default" : "outline"}
                        className={
                          supervisor.isAvailable
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "text-gray-500"
                        }
                      >
                        {supervisor.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {supervisor.education || "Ph.D. in Psychology"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {supervisor.experience || "10+ years experience"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Award className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {supervisor.certifications ||
                            "Licensed Professional Counselor"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
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
