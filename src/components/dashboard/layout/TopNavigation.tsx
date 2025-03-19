import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/supabase/supabase";
import {
  Search,
  User,
  PanelLeft,
  PanelRight,
  Headphones,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../../../../supabase/auth";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  title: string;
  type: "session" | "feedback";
  path: string;
}

interface TopNavigationProps {
  onSearch?: (query: string) => void;
  notifications?: Array<{ id: string; title: string }>;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const TopNavigation = ({
  onSearch = () => {},
  notifications = [
    { id: "1", title: "New project assigned" },
    { id: "2", title: "Meeting reminder" },
  ],
  isCollapsed: propIsCollapsed,
  setIsCollapsed: propSetIsCollapsed,
}: TopNavigationProps) => {
  // Use the context values but allow props to override them
  const sidebarContext = useSidebar();
  const isCollapsed =
    propIsCollapsed !== undefined
      ? propIsCollapsed
      : sidebarContext.isCollapsed;
  const setIsCollapsed = propSetIsCollapsed || sidebarContext.setIsCollapsed;
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        // Mock data for testing - this simulates database results
        // In a real app, this would be replaced with actual database queries
        const mockSessions = [
          {
            id: "s1",
            title: "Initial Assessment with Client A",
            description: "First session with new client",
          },
          {
            id: "s2",
            title: "Cognitive Behavioral Therapy Session",
            description: "Follow-up CBT session",
          },
          {
            id: "s3",
            title: "Family Therapy Session",
            description: "Working with family dynamics",
          },
          {
            id: "s4",
            title: "Crisis Intervention",
            description: "Emergency session for client in distress",
          },
          {
            id: "s5",
            title: "Mindfulness Training",
            description: "Teaching mindfulness techniques",
          },
        ];

        const mockFeedback = [
          {
            id: "f1",
            title: "Great progress",
            text: "The client showed significant improvement",
            session_id: "s1",
          },
          {
            id: "f2",
            title: null,
            text: "Consider using more open-ended questions",
            session_id: "s2",
          },
          {
            id: "f3",
            title: "Technique suggestion",
            text: "Try incorporating role-playing exercises",
            session_id: "s3",
          },
          {
            id: "f4",
            title: null,
            text: "Good handling of difficult emotions",
            session_id: "s4",
          },
          {
            id: "f5",
            title: "Follow-up needed",
            text: "Schedule a follow-up session soon",
            session_id: "s5",
          },
        ];

        // Filter sessions based on search query
        const filteredSessions = mockSessions.filter(
          (session) =>
            session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            session.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
        );

        // Filter feedback based on search query
        const filteredFeedback = mockFeedback.filter(
          (item) =>
            (item.title &&
              item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            item.text.toLowerCase().includes(searchQuery.toLowerCase()),
        );

        // Format results
        const formattedSessions = filteredSessions.map((session) => ({
          id: session.id,
          title: session.title,
          type: "session" as const,
          path: `/sessions/${session.id}`,
        }));

        const formattedFeedback = filteredFeedback.map((item) => ({
          id: item.id,
          title: item.title || item.text.substring(0, 30) + "...",
          type: "feedback" as const,
          path: `/sessions/${item.session_id}?feedback=${item.id}`,
        }));

        setSearchResults([...formattedSessions, ...formattedFeedback]);

        // Uncomment and use this code when connected to a real Supabase database
        /*
        // Search sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from("sessions")
          .select("id, title, description")
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .limit(5);

        if (sessionsError) throw sessionsError;

        // Search feedback
        const { data: feedback, error: feedbackError } = await supabase
          .from("feedback")
          .select("id, title, text, session_id")
          .or(`title.ilike.%${searchQuery}%,text.ilike.%${searchQuery}%`)
          .limit(5);

        if (feedbackError) throw feedbackError;

        // Format results
        const formattedSessions =
          sessions?.map((session) => ({
            id: session.id,
            title: session.title,
            type: "session" as const,
            path: `/sessions/${session.id}`,
          })) || [];

        const formattedFeedback =
          feedback?.map((item) => ({
            id: item.id,
            title: item.title || item.text.substring(0, 30) + "...",
            type: "feedback" as const,
            path: `/sessions/${item.session_id}?feedback=${item.id}`,
          })) || [];

        setSearchResults([...formattedSessions, ...formattedFeedback]);
        */
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  if (!user) return null;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(true);
    onSearch(query);
  };

  const handleResultClick = (path: string) => {
    setShowResults(false);
    setSearchQuery("");
    navigate(path);
  };

  return (
    <div className="w-full h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between px-4 fixed top-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-700 dark:text-gray-300"
        >
          {isCollapsed ? (
            <PanelRight className="h-5 w-5" />
          ) : (
            <PanelLeft className="h-5 w-5" />
          )}
        </Button>

        <Link to="/" className="flex items-center">
          <span className="font-bold text-lg dark:text-white">
            AudioFeedback Pro
          </span>
        </Link>

        <div className="relative w-64 ml-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder={t("search_placeholder")}
            className="pl-8 h-9 text-sm border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:border-gray-300"
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim() !== "") {
                e.preventDefault();
                setShowResults(false);
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
              }
            }}
          />

          {/* Search Results Dropdown */}
          {showResults && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div>
                  {searchResults.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                      onClick={() => handleResultClick(result.path)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm dark:text-gray-200">
                          {result.title}
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                  {t("no_results_found")}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-2 text-gray-700 dark:text-gray-300"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt={user.email || ""}
                />
                <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block text-sm">
                {user.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 dark:bg-gray-800 dark:border-gray-700"
          >
            <DropdownMenuLabel className="dark:text-gray-300">
              {t("my_account")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="py-2 dark:text-gray-300 dark:hover:bg-gray-700"
              onSelect={() => navigate("/profile")}
            >
              <User className="mr-2 h-4 w-4" />
              {t("profile")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="py-2 dark:text-gray-300 dark:hover:bg-gray-700"
              onSelect={() => navigate("/settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              {t("settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => signOut()}
              className="py-2 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopNavigation;
