"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Settings,
  Camera,
  Save,
  Edit,
  Shield,
  Activity,
  Globe,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Clock,
  Languages,
  Link,
  Eye,
  Smartphone,
  Monitor,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

import { UserProfile, UserActivityLog, UserSession } from "@/types/note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";
import { fadeInUp, staggerContainer, staggerItem } from "@/utils/animations";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    full_name: "",
    bio: "",
    avatar_url: "",
    phone: "",
    location: "",
    website: "",
    company: "",
    job_title: "",
    timezone: "UTC",
    language: "en",
    date_of_birth: "",
    social_links: {} as Record<string, string>,
    privacy_settings: {
      profile_visibility: "public" as "public" | "private" | "friends",
      email_visibility: "private" as "public" | "private" | "friends",
      activity_visibility: "friends" as "public" | "private" | "friends",
    },
    theme_preference: "system" as "light" | "dark" | "system",
    notification_preferences: {
      email: true,
      push: true,
      reminders: true,
    },
    two_factor_enabled: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchActivityLogs();
    fetchSessions();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/users");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch profile");
      }

      const userProfile = result.data;
      setProfile(userProfile);
      setFormData({
        name: userProfile.name || "",
        full_name: userProfile.full_name || "",
        bio: userProfile.bio || "",
        avatar_url: userProfile.avatar_url || "",
        phone: userProfile.phone || "",
        location: userProfile.location || "",
        website: userProfile.website || "",
        company: userProfile.company || "",
        job_title: userProfile.job_title || "",
        timezone: userProfile.timezone || "UTC",
        language: userProfile.language || "en",
        date_of_birth: userProfile.date_of_birth || "",
        social_links: userProfile.social_links || {},
        privacy_settings: userProfile.privacy_settings || {
          profile_visibility: "public",
          email_visibility: "private",
          activity_visibility: "friends",
        },
        theme_preference: userProfile.theme_preference,
        notification_preferences: userProfile.notification_preferences,
        two_factor_enabled: userProfile.two_factor_enabled || false,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);

      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          full_name: formData.full_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          phone: formData.phone,
          location: formData.location,
          website: formData.website,
          company: formData.company,
          job_title: formData.job_title,
          timezone: formData.timezone,
          language: formData.language,
          date_of_birth: formData.date_of_birth,
          social_links: formData.social_links,
          privacy_settings: formData.privacy_settings,
          theme_preference: formData.theme_preference,
          notification_preferences: formData.notification_preferences,
          two_factor_enabled: formData.two_factor_enabled,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      setProfile((prev) => (prev ? { ...prev, ...formData } : null));
      setIsEditing(false);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
        phone: profile.phone || "",
        location: profile.location || "",
        website: profile.website || "",
        company: profile.company || "",
        job_title: profile.job_title || "",
        timezone: profile.timezone || "UTC",
        language: profile.language || "en",
        date_of_birth: profile.date_of_birth || "",
        social_links: profile.social_links || {},
        privacy_settings: profile.privacy_settings || {
          profile_visibility: "public",
          email_visibility: "private",
          activity_visibility: "friends",
        },
        theme_preference: profile.theme_preference,
        notification_preferences: profile.notification_preferences,
        two_factor_enabled: profile.two_factor_enabled || false,
      });
    }
    setIsEditing(false);
  };

  const fetchActivityLogs = async () => {
    try {
      setLoadingActivity(true);
      const response = await fetch("/api/users/activity?limit=20");
      const result = await response.json();

      if (response.ok) {
        setActivityLogs(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await fetch("/api/users/sessions");
      const result = await response.json();

      if (response.ok) {
        setSessions(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const response = await fetch(
        `/api/users/sessions?sessionId=${sessionId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        setSessions(sessions.filter((s) => s.id !== sessionId));
        toast({
          title: "Success",
          description: "Session revoked successfully",
        });
      }
    } catch (error) {
      console.error("Error revoking session:", error);
      toast({
        title: "Error",
        description: "Failed to revoke session",
        variant: "destructive",
      });
    }
  };

  const logActivity = async (activityType: string, description?: string) => {
    try {
      await fetch("/api/users/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activity_type: activityType,
          activity_description: description,
        }),
      });
      fetchActivityLogs(); // Refresh activity logs
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const updateSocialLink = (platform: string, url: string) => {
    setFormData((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: url,
      },
    }));
  };

  const removeSocialLink = (platform: string) => {
    const newLinks = { ...formData.social_links };
    delete newLinks[platform];
    setFormData((prev) => ({
      ...prev,
      social_links: newLinks,
    }));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
          <p className="text-muted-foreground">
            Unable to load your profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div
        className="border-b bg-card/50 backdrop-blur-sm"
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Profile Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Overview */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Profile Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Profile Completion
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {profile?.profile_completion_percentage || 0}%
                        </span>
                      </div>
                      <Progress
                        value={profile?.profile_completion_percentage || 0}
                        className="h-2 bg-muted dark:bg-muted"
                      />
                    </div>

                    {/* Avatar */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={formData.avatar_url} />
                          <AvatarFallback className="text-lg">
                            {getInitials(
                              formData.full_name || formData.name || "U",
                            )}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                          >
                            <Camera className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {isEditing && (
                        <div className="w-full">
                          <Label
                            htmlFor="avatar_url"
                            className="text-sm font-medium"
                          >
                            Avatar URL
                          </Label>
                          <Input
                            id="avatar_url"
                            placeholder="https://example.com/avatar.jpg"
                            value={formData.avatar_url}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                avatar_url: e.target.value,
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{profile?.email}</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Member since
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {profile?.created_at &&
                              new Date(profile.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Account Status
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              (profile?.account_status || "active") === "active"
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs capitalize"
                          >
                            {profile?.account_status || "active"}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Login Count
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {profile?.login_count || 0} logins
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Profile Details */}
              <motion.div className="lg:col-span-2" variants={staggerItem}>
                <div className="space-y-6">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Display Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            className={cn(!isEditing && "bg-muted")}
                          />
                        </div>
                        <div>
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                full_name: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            className={cn(!isEditing && "bg-muted")}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              placeholder="+1 (555) 123-4567"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
                              }
                              disabled={!isEditing}
                              className={cn("pl-10", !isEditing && "bg-muted")}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="location"
                              placeholder="City, Country"
                              value={formData.location}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  location: e.target.value,
                                }))
                              }
                              disabled={!isEditing}
                              className={cn("pl-10", !isEditing && "bg-muted")}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="website"
                              placeholder="https://example.com"
                              value={formData.website}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  website: e.target.value,
                                }))
                              }
                              disabled={!isEditing}
                              className={cn("pl-10", !isEditing && "bg-muted")}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="date_of_birth">Date of Birth</Label>
                          <Input
                            id="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                date_of_birth: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            className={cn(!isEditing && "bg-muted")}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              bio: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          className={cn(
                            "min-h-[100px]",
                            !isEditing && "bg-muted",
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Professional Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Professional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="company">Company</Label>
                          <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="company"
                              placeholder="Company Name"
                              value={formData.company}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  company: e.target.value,
                                }))
                              }
                              disabled={!isEditing}
                              className={cn("pl-10", !isEditing && "bg-muted")}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="job_title">Job Title</Label>
                          <Input
                            id="job_title"
                            placeholder="Software Engineer"
                            value={formData.job_title}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                job_title: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            className={cn(!isEditing && "bg-muted")}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Links */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link className="w-5 h-5" />
                        Social Links
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(formData.social_links).map(
                        ([platform, url]) => (
                          <div
                            key={platform}
                            className="flex items-center gap-2"
                          >
                            <Input
                              placeholder="Platform"
                              value={platform}
                              disabled
                              className="w-32 bg-muted"
                            />
                            <Input
                              placeholder="URL"
                              value={url}
                              onChange={(e) =>
                                updateSocialLink(platform, e.target.value)
                              }
                              disabled={!isEditing}
                              className={cn(!isEditing && "bg-muted")}
                            />
                            {isEditing && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeSocialLink(platform)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ),
                      )}
                      {isEditing && (
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Platform (e.g., twitter)"
                            id="new-platform"
                            className="w-32"
                          />
                          <Input placeholder="URL" id="new-url" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const platform = (
                                document.getElementById(
                                  "new-platform",
                                ) as HTMLInputElement
                              )?.value;
                              const url = (
                                document.getElementById(
                                  "new-url",
                                ) as HTMLInputElement
                              )?.value;
                              if (platform && url) {
                                updateSocialLink(platform, url);
                                (
                                  document.getElementById(
                                    "new-platform",
                                  ) as HTMLInputElement
                                ).value = "";
                                (
                                  document.getElementById(
                                    "new-url",
                                  ) as HTMLInputElement
                                ).value = "";
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Preferences */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium mb-2 block">
                            Theme Preference
                          </Label>
                          <Select
                            value={formData.theme_preference}
                            onValueChange={(value: any) =>
                              setFormData((prev) => ({
                                ...prev,
                                theme_preference: value,
                              }))
                            }
                            disabled={!isEditing}
                          >
                            <SelectTrigger
                              className={cn(!isEditing && "bg-muted")}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-2 block">
                            Language
                          </Label>
                          <Select
                            value={formData.language}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                language: value,
                              }))
                            }
                            disabled={!isEditing}
                          >
                            <SelectTrigger
                              className={cn(!isEditing && "bg-muted")}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="it">Italian</SelectItem>
                              <SelectItem value="pt">Portuguese</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Timezone
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Select
                            value={formData.timezone}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                timezone: value,
                              }))
                            }
                            disabled={!isEditing}
                          >
                            <SelectTrigger
                              className={cn("pl-10", !isEditing && "bg-muted")}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="America/New_York">
                                Eastern Time
                              </SelectItem>
                              <SelectItem value="America/Chicago">
                                Central Time
                              </SelectItem>
                              <SelectItem value="America/Denver">
                                Mountain Time
                              </SelectItem>
                              <SelectItem value="America/Los_Angeles">
                                Pacific Time
                              </SelectItem>
                              <SelectItem value="Europe/London">
                                London
                              </SelectItem>
                              <SelectItem value="Europe/Paris">
                                Paris
                              </SelectItem>
                              <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      {/* Notifications */}
                      <div>
                        <Label className="text-sm font-medium mb-4 block">
                          Notification Preferences
                        </Label>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label
                                htmlFor="email-notifications"
                                className="font-normal"
                              >
                                Email Notifications
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Receive notifications via email
                              </p>
                            </div>
                            <Switch
                              id="email-notifications"
                              checked={formData.notification_preferences.email}
                              onCheckedChange={(checked) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  notification_preferences: {
                                    ...prev.notification_preferences,
                                    email: checked,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label
                                htmlFor="push-notifications"
                                className="font-normal"
                              >
                                Push Notifications
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Receive push notifications in browser
                              </p>
                            </div>
                            <Switch
                              id="push-notifications"
                              checked={formData.notification_preferences.push}
                              onCheckedChange={(checked) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  notification_preferences: {
                                    ...prev.notification_preferences,
                                    push: checked,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label
                                htmlFor="reminder-notifications"
                                className="font-normal"
                              >
                                Reminder Notifications
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified about note reminders
                              </p>
                            </div>
                            <Switch
                              id="reminder-notifications"
                              checked={
                                formData.notification_preferences.reminders
                              }
                              onCheckedChange={(checked) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  notification_preferences: {
                                    ...prev.notification_preferences,
                                    reminders: checked,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.two_factor_enabled}
                      onCheckedChange={(checked) => {
                        setFormData((prev) => ({
                          ...prev,
                          two_factor_enabled: checked,
                        }));
                        logActivity(
                          "security_change",
                          `Two-factor authentication ${checked ? "enabled" : "disabled"}`,
                        );
                      }}
                    />
                    <Badge
                      variant={
                        formData.two_factor_enabled ? "default" : "secondary"
                      }
                    >
                      {formData.two_factor_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="font-medium mb-4 block">Password</Label>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Last updated:{" "}
                      {profile?.updated_at
                        ? new Date(profile.updated_at).toLocaleDateString()
                        : "Never"}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        logActivity(
                          "security_change",
                          "Password change requested",
                        )
                      }
                    >
                      Change Password
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="font-medium mb-4 block">
                    Account Recovery
                  </Label>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Download your account data or delete your account
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          logActivity(
                            "data_export",
                            "Account data export requested",
                          )
                        }
                      >
                        Export Data
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Delete Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your account and remove your
                              data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                logActivity(
                                  "account_deletion",
                                  "Account deletion requested",
                                )
                              }
                            >
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingActivity ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No activity logs found
                      </p>
                    ) : (
                      activityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 p-3 border rounded-lg bg-card dark:bg-card"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-foreground">
                                {log.activity_type
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </p>
                              <span className="text-sm text-muted-foreground">
                                {new Date(log.created_at).toLocaleString()}
                              </span>
                            </div>
                            {log.activity_description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {log.activity_description}
                              </p>
                            )}
                            {log.ip_address && (
                              <p className="text-xs text-muted-foreground mt-1">
                                IP: {log.ip_address}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Active Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSessions ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No active sessions found
                      </p>
                    ) : (
                      sessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-card dark:bg-card"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted dark:bg-muted rounded-lg">
                              {session.device_info?.includes("Mobile") ? (
                                <Smartphone className="w-4 h-4 text-foreground" />
                              ) : (
                                <Monitor className="w-4 h-4 text-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {session.device_info || "Unknown Device"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {session.location ||
                                  session.ip_address ||
                                  "Unknown Location"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Last active:{" "}
                                {new Date(
                                  session.last_accessed_at,
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                session.is_active ? "default" : "secondary"
                              }
                            >
                              {session.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {session.is_active && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => revokeSession(session.id)}
                              >
                                Revoke
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium mb-4 block">
                    Profile Visibility
                  </Label>
                  <Select
                    value={formData.privacy_settings.profile_visibility}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({
                        ...prev,
                        privacy_settings: {
                          ...prev.privacy_settings,
                          profile_visibility: value,
                        },
                      }))
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={cn(!isEditing && "bg-muted")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Control who can see your profile information
                  </p>
                </div>

                <div>
                  <Label className="font-medium mb-4 block">
                    Email Visibility
                  </Label>
                  <Select
                    value={formData.privacy_settings.email_visibility}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({
                        ...prev,
                        privacy_settings: {
                          ...prev.privacy_settings,
                          email_visibility: value,
                        },
                      }))
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={cn(!isEditing && "bg-muted")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Control who can see your email address
                  </p>
                </div>

                <div>
                  <Label className="font-medium mb-4 block">
                    Activity Visibility
                  </Label>
                  <Select
                    value={formData.privacy_settings.activity_visibility}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({
                        ...prev,
                        privacy_settings: {
                          ...prev.privacy_settings,
                          activity_visibility: value,
                        },
                      }))
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={cn(!isEditing && "bg-muted")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Control who can see your activity and login history
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
