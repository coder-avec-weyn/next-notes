"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  FileText,
  Star,
  Pin,
  Archive,
  TrendingUp,
  Calendar,
  Tag,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotes } from "@/hooks/use-notes";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { fadeInUp } from "@/utils/animations";

interface AnalyticsData {
  totalNotes: number;
  favoriteNotes: number;
  pinnedNotes: number;
  archivedNotes: number;
  categoryStats: Record<string, number>;
  tagStats: Record<string, number>;
  monthlyStats: Record<string, number>;
  averageWordCount: number;
  totalWords: number;
  mostUsedCategory: string;
  mostUsedTag: string | null;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
  "#ff00ff",
  "#00ffff",
  "#ffff00",
];

export function NotesAnalytics() {
  const { getAnalytics, analyticsLoading } = useNotes();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const data = await getAnalytics();
      if (data) {
        setAnalytics(data);
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, [getAnalytics]);

  if (loading || analyticsLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </div>
                <div className="h-8 bg-muted rounded w-16"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading skeleton for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-32"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading skeleton for additional sections */}
        <div className="bg-card rounded-lg border p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-24"></div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-4 bg-muted rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    );
  }

  const categoryData = Object.entries(analytics.categoryStats).map(
    ([category, count]) => ({
      name: category,
      value: count,
    }),
  );

  const monthlyData = Object.entries(analytics.monthlyStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      notes: count,
    }));

  const topTags = Object.entries(analytics.tagStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  return (
    <motion.div
      className="space-y-6"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalNotes}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalWords} total words
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.favoriteNotes}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalNotes > 0
                ? Math.round(
                    (analytics.favoriteNotes / analytics.totalNotes) * 100,
                  )
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pinned</CardTitle>
            <Pin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pinnedNotes}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalNotes > 0
                ? Math.round(
                    (analytics.pinnedNotes / analytics.totalNotes) * 100,
                  )
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Words</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageWordCount}
            </div>
            <p className="text-xs text-muted-foreground">per note</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="notes"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Most Used Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topTags.length > 0 ? (
              topTags.map(({ tag, count }) => (
                <div key={tag} className="flex items-center justify-between">
                  <Badge variant="secondary">{tag}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {count} notes
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No tags used yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Most used category</p>
              <p className="font-medium capitalize">
                {analytics.mostUsedCategory}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Most used tag</p>
              <p className="font-medium">
                {analytics.mostUsedTag || "No tags used"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Archived notes</p>
              <p className="font-medium">{analytics.archivedNotes}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
