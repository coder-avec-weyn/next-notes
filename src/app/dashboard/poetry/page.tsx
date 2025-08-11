"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, FileText, Sparkles, Star, Pin, Search, Filter, Grid3X3, List, BookOpen, Feather, Eye, Volume2, Download, Share2, Palette, Wand2 } from "lucide-react";
import { usePoetry } from "@/hooks/use-poetry";
import { PoetryEditor } from "@/components/poetry-editor";
import { PoetryShowcase } from "@/components/poetry-showcase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fadeInUp, staggerContainer, staggerItem } from "@/utils/animations";
import { cn } from "@/lib/utils";

export default function PoetryPage() {
  const { poetry, isLoading, getPoetry } = usePoetry();
  const [showEditor, setShowEditor] = useState(false);
  const [editingPoemId, setEditingPoemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "showcase">("grid");
  const [showcaseMode, setShowcaseMode] = useState<"scroll" | "page" | "minimal">("scroll");

  useEffect(() => {
    getPoetry();
  }, []);

  const filteredPoetry = poetry
    .filter((poem) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          poem.title.toLowerCase().includes(query) ||
          poem.content.toLowerCase().includes(query) ||
          poem.tags.some(tag => tag.toLowerCase().includes(query)) ||
          (poem.mood && poem.mood.toLowerCase().includes(query)) ||
          (poem.theme && poem.theme.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter((poem) => {
      // Status filter
      switch (filterBy) {
        case "favorites":
          return poem.is_favorite;
        case "pinned":
          return poem.is_pinned;
        case "public":
          return poem.is_public;
        case "private":
          return !poem.is_public;
        case "romantic":
        case "melancholic":
        case "joyful":
        case "nature":
        case "mystical":
        case "contemplative":
          return poem.mood === filterBy;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      // Sort
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "mood":
          return (a.mood || "").localeCompare(b.mood || "");
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const handleCreatePoem = () => {
    setEditingPoemId(null);
    setShowEditor(true);
  };

  const handleEditPoem = (poemId: string) => {
    setEditingPoemId(poemId);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingPoemId(null);
  };

  if (isLoading && poetry.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Feather className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Loading your poetry collection...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div className="mb-8" variants={fadeInUp}>
          <div className="flex items-center gap-3 mb-4">
            <Feather className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Poetry Studio
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl">
            Create, edit, and showcase your poetry with advanced formatting tools, 
            AI assistance, and beautiful presentation modes.
          </p>
        </motion.div>

        {/* Enhanced Quick Actions */}
        <motion.div className="mb-8" variants={staggerItem}>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCreatePoem} className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4" />
              New Poem
            </Button>
            <Button variant="outline" className="gap-2">
              <Sparkles className="w-4 h-4" />
              AI Inspiration
            </Button>
            <Button variant="outline" className="gap-2">
              <Wand2 className="w-4 h-4" />
              Poetry Tools
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Collection
            </Button>
          </div>
        </motion.div>

        {/* Enhanced Search and Filters */}
        <motion.div className="mb-8" variants={staggerItem}>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search poems by title, content, tags, mood, or theme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-purple-200">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Poems</SelectItem>
                  <SelectItem value="favorites">Favorites</SelectItem>
                  <SelectItem value="pinned">Pinned</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="romantic">Romantic</SelectItem>
                  <SelectItem value="melancholic">Melancholic</SelectItem>
                  <SelectItem value="joyful">Joyful</SelectItem>
                  <SelectItem value="nature">Nature</SelectItem>
                  <SelectItem value="mystical">Mystical</SelectItem>
                  <SelectItem value="contemplative">Contemplative</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-purple-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="mood">Mood</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">View:</span>
              <div className="flex items-center gap-1 border rounded-lg p-1 bg-white/80 backdrop-blur-sm">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="gap-1"
                >
                  <Grid3X3 className="w-4 h-4" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "showcase" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("showcase")}
                  className="gap-1"
                >
                  <BookOpen className="w-4 h-4" />
                  Showcase
                </Button>
              </div>
            </div>

            {viewMode === "showcase" && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Mode:</span>
                <Select value={showcaseMode} onValueChange={(value: any) => setShowcaseMode(value)}>
                  <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-purple-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scroll">Scroll</SelectItem>
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="text-sm text-gray-500">
              {filteredPoetry.length} poem{filteredPoetry.length !== 1 ? 's' : ''}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div variants={staggerItem}>
          {filteredPoetry.length > 0 ? (
            viewMode === "showcase" ? (
              <PoetryShowcase 
                poems={filteredPoetry}
                viewMode={showcaseMode}
                showControls={true}
                autoPlay={false}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPoetry.map((poem) => (
                  <Card 
                    key={poem.id} 
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/80 backdrop-blur-sm border-purple-200 hover:border-purple-400"
                    onClick={() => handleEditPoem(poem.id)}
                    style={{ 
                      background: poem.color !== '#ffffff' 
                        ? `linear-gradient(135deg, ${poem.color}, ${poem.color}20)` 
                        : undefined 
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {poem.title || "Untitled Poem"}
                        </CardTitle>
                        <div className="flex items-center gap-1 ml-2">
                          {poem.is_favorite && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          {poem.is_pinned && (
                            <Pin className="w-4 h-4 text-blue-500 fill-current" />
                          )}
                          {poem.is_public && (
                            <Eye className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div 
                        className="line-clamp-4 text-sm text-muted-foreground mb-4 whitespace-pre-wrap"
                        style={{
                          fontFamily: poem.style.font === 'serif' ? 'Georgia, serif' 
                            : poem.style.font === 'sans-serif' ? 'Arial, sans-serif'
                            : poem.style.font === 'monospace' ? 'monospace'
                            : poem.style.font === 'cursive' ? 'Dancing Script, cursive'
                            : 'Cinzel, fantasy',
                          textAlign: poem.style.alignment as any,
                          lineHeight: poem.style.lineSpacing,
                          fontSize: poem.style.fontSize === 'small' ? '0.8rem' 
                            : poem.style.fontSize === 'medium' ? '0.9rem' 
                            : '1rem',
                          fontStyle: poem.style.italics ? 'italic' : 'normal',
                          fontWeight: poem.style.bold ? 'bold' : 'normal',
                          textTransform: poem.style.uppercase ? 'uppercase' : 'none',
                        }}
                      >
                        {poem.content || "No content"}
                      </div>
                      
                      {/* Enhanced Tags and Mood */}
                      <div className="space-y-3">
                        {poem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {poem.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                            {poem.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{poem.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Mood and Theme */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {poem.mood && (
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                {poem.mood}
                              </span>
                            )}
                            {poem.theme && (
                              <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                                {poem.theme}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{new Date(poem.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <Feather className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-700">
                {searchQuery || filterBy !== "all" ? "No poems found" : "No poems yet"}
              </h2>
              <p className="text-gray-500 mb-6">
                {searchQuery || filterBy !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Start creating your poetry collection with our advanced editor."
                }
              </p>
              {!searchQuery && filterBy === "all" && (
                <Button onClick={handleCreatePoem} className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="w-4 h-4" />
                  Create your first poem
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Poetry Editor Modal */}
      {showEditor && (
        <PoetryEditor
          poemId={editingPoemId}
          onClose={handleCloseEditor}
        />
      )}
    </motion.main>
  );
}