import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  Headphones,
  MessageSquare,
  User,
  Users,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Globe,
} from "lucide-react";
import { useAuth } from "../../../../supabase/auth";

interface SidebarProps {
  activeItem: string;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Sidebar = ({ activeItem, isCollapsed, setIsCollapsed }: SidebarProps) => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();

  const defaultItems = [
    {
      label: t("dashboard"),
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      label: t("sessions"),
      icon: <Headphones className="h-5 w-5" />,
      href: "/sessions",
    },
    {
      label: "Feedbacks",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/feedback",
    },
    {
      label: t("supervisors"),
      icon: <Users className="h-5 w-5" />,
      href: "/supervisors",
    },
    {
      label: t("notifications"),
      icon: <Bell className="h-5 w-5" />,
      href: "/notifications",
    },
  ];

  const defaultBottomItems = [
    {
      label: t("help"),
      icon: <HelpCircle className="h-5 w-5" />,
      href: "/help",
    },
    {
      label: t("profile"),
      icon: <User className="h-5 w-5" />,
      href: "/profile",
    },
    {
      label: t("logout"),
      icon: <LogOut className="h-5 w-5" />,
      href: "/logout",
    },
  ];

  const handleNavigation = (label: string, href: string) => {
    if (label === t("logout")) {
      signOut();
      navigate("/");
      return;
    } else {
      navigate(href);
      // Close sidebar on small viewports
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ko" : "en");
  };

  return (
    <>
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${isCollapsed ? "w-[70px] md:translate-x-0 -translate-x-full" : "w-[240px]"}`}
      >
        <div className="p-2"></div>

        <ScrollArea className="h-[calc(100vh-var(--header-height,4rem)-1rem)]">
          <div className="space-y-1 p-2">
            {defaultItems.map((item) => (
              <Button
                key={item.label}
                variant={activeItem === item.label ? "secondary" : "ghost"}
                className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} gap-2 text-sm h-10 dark:text-gray-300`}
                onClick={() => handleNavigation(item.label, item.href)}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            ))}
            <Button
              variant={activeItem === "Settings" ? "secondary" : "ghost"}
              className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} gap-2 text-sm h-10 dark:text-gray-300`}
              onClick={() => handleNavigation(t("settings"), "/settings")}
            >
              <Settings className="h-5 w-5" />
              {!isCollapsed && <span>{t("settings")}</span>}
            </Button>
          </div>

          {!isCollapsed && (
            <div className="mt-6 px-3">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                {t("my_sessions")}
              </h3>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-sm h-9 dark:text-gray-300"
              >
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                {t("in_progress")}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-sm h-9 dark:text-gray-300"
              >
                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                {t("pending_review")}
              </Button>
            </div>
          )}
        </ScrollArea>

        <div
          className={`p-3 mt-auto border-t border-gray-200 dark:border-gray-700 ${isCollapsed ? "items-center" : ""}`}
        >
          {/* Theme toggle */}
          <Button
            variant="ghost"
            className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} gap-2 text-sm h-10 mb-1 dark:text-gray-300`}
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            {!isCollapsed && (
              <span>{theme === "dark" ? t("light_mode") : t("dark_mode")}</span>
            )}
          </Button>

          {/* Language toggle */}
          <Button
            variant="ghost"
            className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} gap-2 text-sm h-10 mb-1 dark:text-gray-300`}
            onClick={toggleLanguage}
          >
            <Globe className="h-5 w-5" />
            {!isCollapsed && (
              <span>{language === "en" ? "한국어" : "English"}</span>
            )}
          </Button>

          {/* Bottom navigation items */}
          {defaultBottomItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} gap-2 text-sm h-10 mb-1 dark:text-gray-300`}
              onClick={() => handleNavigation(item.label, item.href)}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </div>
      </div>
      {/* Overlay to close sidebar on mobile when sidebar is open */}
      {!isCollapsed && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;
