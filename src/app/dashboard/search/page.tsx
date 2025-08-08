"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  User,
  MapPin,
  Building,
  Globe,
  Calendar,
  FileText,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";
import { fadeInUp, staggerContainer, staggerItem } from "@/utils/animations";
import { cn } from "@/lib/utils";

interface PublicUser {
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
  public_notes_count?: number;
  public_profile?: boolean;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PublicUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const searchUsers = async (query: string) => {
    if (query.trim().length < 1) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    try {
      console.log("Searching for:", query);
      const response = await fetch(
        `/api/search/users?q=${encodeURIComponent(query)}&limit=20`,
      );
      const result = await response.json();

      console.log("Search response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to search users");
      }

      setSearchResults(result.data || []);
      setHasSearched(true);
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: error.message,
        variant: "destructive",
      });
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search with shorter delay for smoother experience
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div
        className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40"
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-6 h-6" />
                Discover Users
              </h1>
              <p className="text-muted-foreground">
                Search for users by username or display name
              </p>
            </div>

            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background dark:bg-background text-foreground dark:text-foreground border-border dark:border-border"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {!hasSearched && !isSearching && (
          <motion.div
            className="text-center py-16"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <div className="bg-muted/50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Start searching
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start typing to search for users by username, name, or full name
            </p>
          </motion.div>
        )}

        {hasSearched && !isSearching && searchResults.length === 0 && (
          <motion.div
            className="text-center py-16"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <div className="bg-muted/50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              No users found
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try searching with different keywords or check your spelling
            </p>
          </motion.div>
        )}

        {searchResults.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {searchResults.map((user) => (
              <motion.div key={user.id} variants={staggerItem}>
                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="text-lg">
                          {getInitials(
                            user.full_name || user.name || user.username,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {user.full_name || user.name || user.username}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* User Info */}
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {user.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{user.location}</span>
                          </div>
                        )}
                        {user.company && (
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            <span>{user.company}</span>
                          </div>
                        )}
                        {user.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            <span className="truncate max-w-24">
                              {user.website.replace(/^https?:\/\//, "")}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>
                              {user.public_notes_count || 0} public notes
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {formatDate(user.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* View Profile Button */}
                      <Link href={`/profile/${user.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                        >
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
