"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import DashboardNavbar from "@/components/dashboard-navbar";
import {
  FileText,
  Star,
  Pin,
  Archive,
  Plus,
  TrendingUp,
  Calendar,
  Tag,
  BarChart3,
  Clock,
  ArrowRight,
} from "lucide-react";
import { createClient } from "../../../supabase/client";
import { useNotes } from "@/hooks/use-notes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { fadeInUp, staggerContainer, staggerItem } from "@/utils/animations";
import { NOTE_CATEGORIES } from "@/types/note";

export default function Dashboard() {
  const { notes = [], loading } = useNotes();
  const notesList = notes || [];
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setUserLoading(false);
    };
    getUser();
  }, []);

  // Calculate statistics
  const stats = {
    total: notesList.length,
    favorites: notesList.filter((n) => n.is_favorite).length,
    pinned: notesList.filter((n) => n.is_pinned).length,
    archived: notesList.filter((n) => n.is_archived).length,
    withReminders: notesList.filter((n) => n.reminder_date).length,
    recentlyUpdated: notesList.filter((n) => {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return new Date(n.updated_at) > dayAgo;
    }).length,
  };

  // Category distribution
  const categoryStats = NOTE_CATEGORIES.map((category) => ({
    category,
    count: notesList.filter((n) => n.category === category).length,
  })).filter((stat) => stat.count > 0);

  // Recent notes
  const recentNotes = notesList
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (userLoading || loading) {
    return (
      <>
        <DashboardNavbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <motion.main
        className="min-h-screen bg-background"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Header */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              {getGreeting()},{" "}
              {user?.user_metadata?.name ||
                user?.email?.split("@")[0] ||
                "there"}
              !
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your notes and activity.
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div className="mb-8" variants={staggerItem}>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/notes">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Note
                </Button>
              </Link>
              <Link href="/dashboard/notes?filter=favorites">
                <Button variant="outline" className="gap-2">
                  <Star className="w-4 h-4" />
                  Favorites
                </Button>
              </Link>
              <Link href="/dashboard/notes?filter=pinned">
                <Button variant="outline" className="gap-2">
                  <Pin className="w-4 h-4" />
                  Pinned
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={staggerItem}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Notes
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.recentlyUpdated} updated today
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.favorites}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0
                    ? Math.round((stats.favorites / stats.total) * 100)
                    : 0}
                  % of total
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pinned</CardTitle>
                <Pin className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pinned}</div>
                <p className="text-xs text-muted-foreground">
                  Quick access notes
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reminders</CardTitle>
                <Calendar className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.withReminders}</div>
                <p className="text-xs text-muted-foreground">Scheduled notes</p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Notes */}
            <motion.div className="lg:col-span-2" variants={staggerItem}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Notes
                  </CardTitle>
                  <Link href="/dashboard/notes">
                    <Button variant="ghost" size="sm" className="gap-2">
                      View all
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {recentNotes.length > 0 ? (
                    <div className="space-y-4">
                      {recentNotes.map((note) => (
                        <div
                          key={note.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div
                            className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                            style={{
                              backgroundColor:
                                note.color !== "#ffffff"
                                  ? note.color
                                  : "#e5e7eb",
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">
                                {note.title || "Untitled Note"}
                              </h4>
                              {note.is_favorite && (
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              )}
                              {note.is_pinned && (
                                <Pin className="w-3 h-3 text-blue-500 fill-current" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {note.content || "No content"}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {note.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(note.updated_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No notes yet</p>
                      <Link href="/dashboard/notes">
                        <Button className="gap-2">
                          <Plus className="w-4 h-4" />
                          Create your first note
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Distribution & Quick Stats */}
            <motion.div className="space-y-6" variants={staggerItem}>
              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryStats.length > 0 ? (
                    <div className="space-y-3">
                      {categoryStats.map((stat) => (
                        <div
                          key={stat.category}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm capitalize">
                            {stat.category}
                          </span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(stat.count / stats.total) * 100}
                              className="w-16 h-2"
                            />
                            <span className="text-sm font-medium w-8 text-right">
                              {stat.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No categories yet
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Activity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Updated today</span>
                      <Badge variant="secondary">{stats.recentlyUpdated}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Archived</span>
                      <Badge variant="outline">{stats.archived}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">With reminders</span>
                      <Badge variant="outline">{stats.withReminders}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.main>
    </>
  );
}
