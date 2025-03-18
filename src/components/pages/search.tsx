import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "@/context/SidebarContext";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Calendar,
  Clock,
  MessageSquare,
  Headphones,
  FileText,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: "session" | "feedback";
  date: Date;
  author?: {
    name: string;
    avatar: string;
  };
  sessionId?: string;
}

const SearchPage = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Extract search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q") || "";
    setSearchQuery(query);
    if (query) {
      performSearch(query);
    }
  }, [location.search]);

  const performSearch = async (query: string) => {
    setIsLoading(true);

    try {
      // Mock data for testing - this simulates database results
      // In a real app, this would be replaced with actual database queries
      const mockResults: SearchResult[] = [
        {
          id: "s1",
          title: "Initial Assessment with Client A",
          description: "First session with new client",
          type: "session",
          date: new Date(2023, 5, 15),
          author: {
            name: "Dr. Sarah Johnson",
            avatar: "sarah",
          },
        },
        {
          id: "s2",
          title: "Cognitive Behavioral Therapy Session",
          description: "Follow-up CBT session",
          type: "session",
          date: new Date(2023, 6, 2),
          author: {
            name: "Dr. Michael Chen",
            avatar: "michael",
          },
        },
        {
          id: "f1",
          title: "Great progress",
          description:
            "The client showed significant improvement in managing anxiety symptoms",
          type: "feedback",
          date: new Date(2023, 5, 16),
          author: {
            name: "Dr. Sarah Johnson",
            avatar: "sarah",
          },
          sessionId: "s1",
        },
        {
          id: "f2",
          title: "Technique suggestion",
          description:
            "Consider using more open-ended questions to encourage deeper reflection",
          type: "feedback",
          date: new Date(2023, 6, 3),
          author: {
            name: "Dr. Michael Chen",
            avatar: "michael",
          },
          sessionId: "s2",
        },
        {
          id: "f3",
          title: "Follow-up needed",
          description:
            "Schedule a follow-up session soon to reinforce progress",
          type: "feedback",
          date: new Date(2023, 6, 10),
          author: {
            name: "Dr. Emily Rodriguez",
            avatar: "emily",
          },
          sessionId: "s2",
        },
      ];

      // Filter results based on search query
      const filteredResults = mockResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          (result.description &&
            result.description.toLowerCase().includes(query.toLowerCase())),
      );

      setResults(filteredResults);

      // Uncomment and use this code when connected to a real Supabase database
      /*
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      // Search sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select("id, title, description, created_at, counselor_id, supervisor_id")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10);

      if (sessionsError) throw sessionsError;

      // Search feedback
      const { data: feedback, error: feedbackError } = await supabase
        .from("feedback")
        .select("id, title, text, created_at, session_id, supervisor_id")
        .or(`title.ilike.%${query}%,text.ilike.%${query}%`)
        .limit(10);

      if (feedbackError) throw feedbackError;

      // Format results
      const formattedSessions = sessions?.map(session => ({
        id: session.id,
        title: session.title,
        description: session.description,
        type: "session" as const,
        date: new Date(session.created_at),
        author: {
          name: "Supervisor Name", // You would fetch this from user_profiles
          avatar: "supervisor"
        }
      })) || [];

      const formattedFeedback = feedback?.map(item => ({
        id: item.id,
        title: item.title || "Feedback",
        description: item.text,
        type: "feedback" as const,
        date: new Date(item.created_at),
        author: {
          name: "Supervisor Name", // You would fetch this from user_profiles
          avatar: "supervisor"
        },
        sessionId: item.session_id
      })) || [];

      setResults([...formattedSessions, ...formattedFeedback]);
      */
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "session") {
      navigate(`/sessions/${result.id}`);
    } else if (result.type === "feedback" && result.sessionId) {
      navigate(`/sessions/${result.sessionId}?feedback=${result.id}`);
    }
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
          activeItem=""
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <main className="flex-1 overflow-auto p-6 transition-all duration-300 dark:bg-gray-900 dark:text-gray-100">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Search Results
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {results.length} results found for "{searchQuery}"
            </p>
          </div>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search sessions, feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
              <Button type="submit" className="absolute right-1 top-1 h-10">
                Search
              </Button>
            </div>
          </form>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result) => (
                <Card
                  key={`${result.type}-${result.id}`}
                  className="cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700"
                  onClick={() => handleResultClick(result)}
                >
                  <CardContent className="p-0">
                    <div className="p-4 flex items-start gap-4">
                      <div className="mt-1">
                        {result.type === "session" ? (
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Headphones className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-green-600 dark:text-green-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {result.title}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-3">
                              <span className="flex items-center">
                                <Calendar size={12} className="mr-1" />
                                {formatDate(result.date)}
                              </span>
                              {result.type === "feedback" &&
                                result.sessionId && (
                                  <span className="flex items-center">
                                    <MessageSquare size={12} className="mr-1" />
                                    From session
                                  </span>
                                )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              result.type === "session"
                                ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200"
                                : "bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-200"
                            }
                          >
                            {result.type === "session" ? "Session" : "Feedback"}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                            {result.description}
                          </p>
                        )}
                        {result.author && (
                          <div className="flex items-center mt-3">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${result.author.avatar}`}
                                alt={result.author.name}
                              />
                              <AvatarFallback>
                                {result.author.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {result.author.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium dark:text-white">
                No results found
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Try adjusting your search terms or browse all sessions instead.
              </p>
              <Button className="mt-4" onClick={() => navigate("/sessions")}>
                View All Sessions
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
