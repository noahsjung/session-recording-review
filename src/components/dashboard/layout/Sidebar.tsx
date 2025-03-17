import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  HelpCircle,
  FolderKanban,
  Headphones,
  MessageSquare,
  FileAudio,
  UserCheck,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

interface SidebarProps {
  items?: NavItem[];
  activeItem?: string;
  onItemClick?: (label: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const defaultNavItems: NavItem[] = [
  {
    icon: <LayoutDashboard size={18} />,
    label: "Dashboard",
    href: "/dashboard",
    isActive: true,
  },
  { icon: <Headphones size={18} />, label: "Sessions", href: "/sessions" },
  { icon: <MessageSquare size={18} />, label: "Feedback", href: "/feedback" },
  { icon: <UserCheck size={18} />, label: "Supervisors", href: "/supervisors" },
];

const adminNavItems: NavItem[] = [
  { icon: <Users size={18} />, label: "Admin", href: "/admin" },
];

const defaultBottomItems: NavItem[] = [
  { icon: <Bell size={18} />, label: "Notifications", href: "/notifications" },
  { icon: <Settings size={18} />, label: "Settings", href: "/settings" },
  { icon: <HelpCircle size={18} />, label: "Help", href: "/help" },
];

const Sidebar = ({
  items = defaultNavItems,
  activeItem = "Dashboard",
  onItemClick = () => {},
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) => {
  // Check if user is admin - in a real app, this would come from auth context
  const isAdmin = false; // Replace with actual admin check
  return (
    <div
      className={`${isCollapsed ? "w-0 md:w-[70px]" : "w-[240px]"} h-screen border-r border-gray-200 bg-white flex flex-col fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ease-in-out ${isCollapsed ? "overflow-hidden" : ""}`}
    >
      <ScrollArea className="flex-1 px-3 overflow-y-auto">
        <div className="space-y-1 mt-4">
          {items.map((item) => (
            <Link to={item.href} key={item.label}>
              <Button
                variant={item.label === activeItem ? "secondary" : "ghost"}
                className={`${isCollapsed ? "justify-center md:flex hidden" : "justify-start"} w-full gap-2 text-sm h-10`}
                onClick={() => onItemClick(item.label)}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          ))}

          {isAdmin &&
            adminNavItems.map((item) => (
              <Link to={item.href} key={item.label}>
                <Button
                  variant={item.label === activeItem ? "secondary" : "ghost"}
                  className={`${isCollapsed ? "justify-center md:flex hidden" : "justify-start"} w-full gap-2 text-sm h-10`}
                  onClick={() => onItemClick(item.label)}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            ))}
        </div>

        {!isCollapsed && <Separator className="my-4" />}

        {!isCollapsed && (
          <div className="space-y-1">
            <h3 className="text-xs font-medium px-3 py-2 text-gray-500">
              Session Status
            </h3>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm h-9"
            >
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Completed
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm h-9"
            >
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              In Progress
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm h-9"
            >
              <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
              Pending Review
            </Button>
          </div>
        )}
      </ScrollArea>

      <div
        className={`p-3 mt-auto border-t border-gray-200 ${isCollapsed ? "items-center" : ""}`}
      >
        {defaultBottomItems.map((item) => (
          <Link to={item.href} key={item.label}>
            <Button
              variant="ghost"
              className={`w-full ${isCollapsed ? "justify-center md:flex hidden" : "justify-start"} gap-2 text-sm h-10 mb-1`}
              onClick={() => onItemClick(item.label)}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
