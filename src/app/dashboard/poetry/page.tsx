"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, FileText, Sparkles, Star, Pin, Search, Filter } from "lucide-react";
import { usePoetry } from "@/hooks/use-poetry";
import { PoetryEditor } from "@/components/poetry-editor";
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
          poem.tags.some(tag => tag.toLowerCase().includes(query))
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.main
      className="min-h-screen bg-background"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div className="mb-8" variants={fadeInUp}>
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Poetry Collection
          </h1>
          <p className="text-muted-foreground">
            Create and manage your poetry collection with AI assistance.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div className="mb-8" variants={staggerItem}>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCreatePoem} className="gap-2">
              <Plus className="w-4 h-4" />
              New Poem
            </Button>
            <Button variant="outline" className="gap-2">
              <Sparkles className="w-4 h-4" />
              AI Inspiration
            </Button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div className="mb-8" variants={staggerItem}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search poems by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="favorites">Favorites</SelectItem>
                  <SelectItem value="pinned">Pinned</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Poetry List */}
        <motion.div variants={staggerItem}>
          {filteredPoetry.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPoetry.map((poem) => (
                <Card 
                  key={poem.id} 
                  className="hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => handleEditPoem(poem.id)}
                  style={{ backgroundColor: poem.color !== '#ffffff' ? poem.color : undefined }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {poem.title || "Untitled Poem"}
                      </CardTitle>
                      <div className="flex items-center gap-1 ml-2">
                        {poem.is_favorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        {poem.is_pinned && (
                          <Pin className="w-4 h-4 text-blue-500 fill-current" />
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
                          : poem.style.font === 'cursive' ? 'cursive'
                          : 'fantasy',
                        textAlign: poem.style.alignment,
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
                    
                    {/* Tags */}
                    {poem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {poem.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
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
                          <span className="bg-muted px-2 py-1 rounded">
                            {poem.mood}
                          </span>
                        )}
                        {poem.theme && (
                          <span className="bg-muted px-2 py-1 rounded">
                            {poem.theme}
                          </span>
                        )}
                      </div>
                      <div>
                        {new Date(poem.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {searchQuery || filterBy !== "all" ? "No poems found" : "No poems yet"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filterBy !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Start creating your poetry collection today."
                }
              </p>
              {!searchQuery && filterBy === "all" && (
                <Button onClick={handleCreatePoem} className="gap-2">
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