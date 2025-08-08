"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import {
  User,
  MapPin,
  Building,
  Globe,
  Calendar,
  FileText,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";
import { fadeInUp, staggerContainer, staggerItem } from "@/utils/animations";
import { Note } from "@/types/note";
import { cn } from "@/lib/utils";

interface PublicUserProfile {
  id: string;
  username: string;
  name: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  created_at: string;
  location?: string;
  website?: string;
  company?: string;
  job_title?: string;
  public_notes_count: number;
}

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchPublicNotes();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/profile`);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          // Profile not found or private - set profile to null to show not found message
          setProfile(null);
          return;
        }
        throw new Error(result.error || "Failed to fetch profile");
      }

      // Ensure we have valid profile data
      if (result.data) {
        setProfile(result.data);
      } else {
        setProfile(null);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      setProfile(null);
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicNotes = async () => {
    try {
      setNotesLoading(true);
      const response = await fetch(`/api/users/${userId}/notes?limit=10`);
      const result = await response.json();

      if (response.ok) {
        setNotes(result.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching notes:", error);
    } finally {
      setNotesLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
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
          <p className="text-muted-foreground mb-4">
            This user profile is not available or has been set to private.
          </p>
          <Link href="/dashboard/search">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </Link>
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
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard/search">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Search
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-2xl">
                {getInitials(
                  profile.full_name || profile.name || profile.username,
                )}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {profile.full_name || profile.name || profile.username}
              </h1>
              <p className="text-muted-foreground mb-4">@{profile.username}</p>

              {profile.bio && (
                <p className="text-foreground mb-4 max-w-2xl">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.company && (
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    <span>
                      {profile.job_title
                        ? `${profile.job_title} at ${profile.company}`
                        : profile.company}
                    </span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <a
                      href={
                        profile.website.startsWith("http")
                          ? profile.website
                          : `https://${profile.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {profile.website.replace(/^https?:\/\//, "")}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined{" "}
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {profile.public_notes_count}
                  </span>
                  <span className="text-muted-foreground">public notes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Public Notes */}
      <div className="container mx-auto px-4 py-8">
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Public Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-lg border p-4">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded w-5/6"></div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-5 bg-muted rounded w-16"></div>
                          <div className="h-5 bg-muted rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : notes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notes.map((note) => (
                    <motion.div
                      key={note.id}
                      className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
                      style={{ backgroundColor: note.color }}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="font-semibold mb-2 line-clamp-2 text-foreground">
                        {note.title || "Untitled Note"}
                      </h3>
                      {note.content && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                          {truncateContent(note.content, 120)}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs capitalize">
                          {note.category}
                        </Badge>
                        {note.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            #{tag}
                          </Badge>
                        ))}
                        {note.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{note.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(note.updated_at)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    This user hasn't shared any public notes yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
