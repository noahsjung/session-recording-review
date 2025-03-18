import React, { useState, useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Bell,
  Lock,
  User,
  Volume2,
  Shield,
  Mail,
  Moon,
  Sun,
  Smartphone,
  Globe,
} from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "@/supabase/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SettingsPage = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);

  // Account settings
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [feedbackNotifications, setFeedbackNotifications] = useState(true);
  const [requestNotifications, setRequestNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(false);

  // Audio settings
  const [autoPlay, setAutoPlay] = useState(false);
  const [defaultVolume, setDefaultVolume] = useState(80);

  // Appearance settings
  const [darkMode, setDarkMode] = useState(theme === "dark");
  const [highContrast, setHighContrast] = useState(false);

  // Privacy settings
  const [shareUsageData, setShareUsageData] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setName(data.full_name || "");
          setPhone(data.phone || "");
          setEmail(user.email || "");

          // Load preferences if available
          if (data.preferences) {
            const prefs = data.preferences;
            setEmailNotifications(prefs.emailNotifications ?? true);
            setPushNotifications(prefs.pushNotifications ?? true);
            setFeedbackNotifications(prefs.feedbackNotifications ?? true);
            setRequestNotifications(prefs.requestNotifications ?? true);
            setSystemNotifications(prefs.systemNotifications ?? false);
            setAutoPlay(prefs.autoPlay ?? false);
            setDefaultVolume(prefs.defaultVolume ?? 80);
            setHighContrast(prefs.highContrast ?? false);
            setShareUsageData(prefs.shareUsageData ?? true);
            setTwoFactorAuth(prefs.twoFactorAuth ?? false);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      }
    };

    fetchUserProfile();
  }, [user, toast]);

  // Update dark mode when theme changes
  useEffect(() => {
    setDarkMode(theme === "dark");
  }, [theme]);

  // Handle dark mode toggle
  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    setTheme(checked ? "dark" : "light");
  };

  const handleSaveSettings = async (section: string) => {
    if (!user) return;

    setLoading(true);
    try {
      // Prepare the data based on the section
      let updateData: any = {};

      if (section === "account") {
        updateData = {
          full_name: name,
          phone: phone,
        };
      } else {
        // For other sections, update the preferences object
        const { data: currentData } = await supabase
          .from("user_profiles")
          .select("preferences")
          .eq("id", user.id)
          .single();

        const currentPreferences = currentData?.preferences || {};

        let newPreferences = { ...currentPreferences };

        if (section === "notifications") {
          newPreferences = {
            ...newPreferences,
            emailNotifications,
            pushNotifications,
            feedbackNotifications,
            requestNotifications,
            systemNotifications,
          };
        } else if (section === "audio") {
          newPreferences = {
            ...newPreferences,
            autoPlay,
            defaultVolume,
          };
        } else if (section === "appearance") {
          newPreferences = {
            ...newPreferences,
            darkMode,
            highContrast,
          };
        } else if (section === "privacy") {
          newPreferences = {
            ...newPreferences,
            shareUsageData,
            twoFactorAuth,
          };
        }

        updateData = {
          preferences: newPreferences,
        };
      }

      // Update the user profile
      const { error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          activeItem="Settings"
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <main className="flex-1 overflow-auto p-6 transition-all duration-300 dark:bg-gray-900 dark:text-gray-100">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {t("settings")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {language === "en"
                ? "Manage your account settings and preferences."
                : "계정 설정 및 환경설정을 관리하세요."}
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-5 w-full max-w-3xl">
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User size={16} />
                <span className="hidden sm:inline">{t("accountSettings")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell size={16} />
                <span className="hidden sm:inline">
                  {t("notificationSettings")}
                </span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Volume2 size={16} />
                <span className="hidden sm:inline">{t("audioSettings")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex items-center gap-2"
              >
                <Sun size={16} />
                <span className="hidden sm:inline">
                  {t("appearanceSettings")}
                </span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield size={16} />
                <span className="hidden sm:inline">{t("privacySettings")}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">
                    Account Information
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Update your personal information and contact details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-white">
                      {t("fullName")}
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-white">
                      {t("emailAddress")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="dark:text-white">
                      {t("phoneNumber")}
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSaveSettings("account")}
                    disabled={loading}
                    className="dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    {loading ? "Saving..." : t("saveChanges")}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">
                    {t("password")}
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Change your password to keep your account secure.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="current-password"
                      className="dark:text-white"
                    >
                      {t("currentPassword")}
                    </Label>
                    <Input
                      id="current-password"
                      type="password"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="dark:text-white">
                      {t("newPassword")}
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="dark:text-white"
                    >
                      {t("confirmPassword")}
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="dark:bg-blue-600 dark:hover:bg-blue-700">
                    {t("updatePassword")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">
                    {t("notificationSettings")}
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Choose how you want to receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium dark:text-white">
                      Delivery Methods
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Label
                          htmlFor="email-notifications"
                          className="flex-1 dark:text-white"
                        >
                          {t("emailNotifications")}
                        </Label>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Label
                          htmlFor="push-notifications"
                          className="flex-1 dark:text-white"
                        >
                          {t("pushNotifications")}
                        </Label>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                  </div>

                  <Separator className="dark:bg-gray-700" />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium dark:text-white">
                      Notification Types
                    </h3>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="feedback-notifications"
                        className="flex-1 dark:text-white"
                      >
                        {t("feedbackNotifications")}
                      </Label>
                      <Switch
                        id="feedback-notifications"
                        checked={feedbackNotifications}
                        onCheckedChange={setFeedbackNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="request-notifications"
                        className="flex-1 dark:text-white"
                      >
                        {t("requestNotifications")}
                      </Label>
                      <Switch
                        id="request-notifications"
                        checked={requestNotifications}
                        onCheckedChange={setRequestNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="system-notifications"
                        className="flex-1 dark:text-white"
                      >
                        {t("systemNotifications")}
                      </Label>
                      <Switch
                        id="system-notifications"
                        checked={systemNotifications}
                        onCheckedChange={setSystemNotifications}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSaveSettings("notifications")}
                    disabled={loading}
                    className="dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    {loading ? "Saving..." : t("saveChanges")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="audio" className="space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">
                    {t("audioSettings")}
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Configure your audio playback preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="auto-play"
                      className="flex-1 dark:text-white"
                    >
                      {t("autoPlayAudio")}
                    </Label>
                    <Switch
                      id="auto-play"
                      checked={autoPlay}
                      onCheckedChange={setAutoPlay}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="default-volume"
                        className="dark:text-white"
                      >
                        {t("defaultVolume")}
                      </Label>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {defaultVolume}%
                      </span>
                    </div>
                    <Input
                      id="default-volume"
                      type="range"
                      min="0"
                      max="100"
                      value={defaultVolume}
                      onChange={(e) =>
                        setDefaultVolume(parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSaveSettings("audio")}
                    disabled={loading}
                    className="dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    {loading ? "Saving..." : t("saveChanges")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">
                    {t("appearanceSettings")}
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Customize the look and feel of the application.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Label
                        htmlFor="dark-mode"
                        className="flex-1 dark:text-white"
                      >
                        {t("darkMode")}
                      </Label>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={handleDarkModeToggle}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="high-contrast"
                      className="flex-1 dark:text-white"
                    >
                      {t("highContrastMode")}
                    </Label>
                    <Switch
                      id="high-contrast"
                      checked={highContrast}
                      onCheckedChange={setHighContrast}
                    />
                  </div>

                  <Separator className="dark:bg-gray-700" />

                  <div className="space-y-2">
                    <Label
                      htmlFor="language-select"
                      className="dark:text-white"
                    >
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span>{t("language")}</span>
                      </div>
                    </Label>
                    <Select
                      value={language}
                      onValueChange={(value) =>
                        setLanguage(value as "en" | "ko")
                      }
                    >
                      <SelectTrigger
                        id="language-select"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="en">{t("english")}</SelectItem>
                        <SelectItem value="ko">{t("korean")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSaveSettings("appearance")}
                    disabled={loading}
                    className="dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    {loading ? "Saving..." : t("saveChanges")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">
                    {t("privacySettings")}
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Manage your privacy settings and account security.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="usage-data"
                      className="flex-1 dark:text-white"
                    >
                      {t("shareUsageData")}
                    </Label>
                    <Switch
                      id="usage-data"
                      checked={shareUsageData}
                      onCheckedChange={setShareUsageData}
                    />
                  </div>

                  <Separator className="dark:bg-gray-700" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <Label
                            htmlFor="two-factor"
                            className="flex-1 dark:text-white"
                          >
                            {t("twoFactorAuth")}
                          </Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="two-factor"
                        checked={twoFactorAuth}
                        onCheckedChange={setTwoFactorAuth}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="destructive">{t("deleteAccount")}</Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSaveSettings("privacy")}
                    disabled={loading}
                    className="dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    {loading ? "Saving..." : t("saveChanges")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
