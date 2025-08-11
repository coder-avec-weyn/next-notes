"use client";

import { useState } from "react";
import { X, Save, Palette, Type, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface PoetryEditorProps {
  poemId?: string | null;
  onClose: () => void;
}

export function PoetryEditor({ poemId = null, onClose }: PoetryEditorProps) {
  const [title, setTitle] = useState("Untitled Poem");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [style, setStyle] = useState({
    font: "serif",
    alignment: "left",
    lineSpacing: 1.5,
    fontSize: "medium",
    indentation: 0,
    firstLineIndent: false,
    italics: false,
    bold: false,
    uppercase: false,
  });
  const [color, setColor] = useState("#ffffff");
  const [mood, setMood] = useState("");
  const [theme, setTheme] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    // Save logic here
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {poemId ? "Edit Poem" : "Create New Poem"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Editor */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              <Input
                placeholder="Poem title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium"
              />
              
              <Textarea
                placeholder="Write your poem here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] resize-none"
                style={{
                  fontFamily: style.font === 'serif' ? 'Georgia, serif' 
                    : style.font === 'sans-serif' ? 'Arial, sans-serif'
                    : style.font === 'monospace' ? 'monospace'
                    : style.font === 'cursive' ? 'cursive'
                    : 'fantasy',
                  textAlign: style.alignment as any,
                  lineHeight: style.lineSpacing,
                  fontSize: style.fontSize === 'small' ? '0.9rem' 
                    : style.fontSize === 'medium' ? '1rem' 
                    : '1.1rem',
                  fontStyle: style.italics ? 'italic' : 'normal',
                  fontWeight: style.bold ? 'bold' : 'normal',
                  textTransform: style.uppercase ? 'uppercase' : 'none',
                }}
              />

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddTag} size="sm">Add</Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Style Panel */}
          <div className="w-80 border-l p-6 overflow-y-auto bg-gray-50">
            <h3 className="font-semibold mb-4">Styling Options</h3>
            
            <div className="space-y-4">
              {/* Font Family */}
              <div>
                <Label>Font</Label>
                <Select value={style.font} onValueChange={(value) => setStyle({...style, font: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="sans-serif">Sans Serif</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                    <SelectItem value="cursive">Cursive</SelectItem>
                    <SelectItem value="fantasy">Fantasy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div>
                <Label>Font Size</Label>
                <Select value={style.fontSize} onValueChange={(value) => setStyle({...style, fontSize: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Alignment */}
              <div>
                <Label>Alignment</Label>
                <div className="flex gap-1">
                  <Button
                    variant={style.alignment === 'left' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStyle({...style, alignment: 'left'})}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={style.alignment === 'center' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStyle({...style, alignment: 'center'})}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={style.alignment === 'right' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStyle({...style, alignment: 'right'})}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Line Spacing */}
              <div>
                <Label>Line Spacing: {style.lineSpacing}</Label>
                <Slider
                  value={[style.lineSpacing]}
                  onValueChange={([value]) => setStyle({...style, lineSpacing: value})}
                  min={1}
                  max={3}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              {/* Text Style Toggles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Bold</Label>
                  <Switch
                    checked={style.bold}
                    onCheckedChange={(checked) => setStyle({...style, bold: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Italic</Label>
                  <Switch
                    checked={style.italics}
                    onCheckedChange={(checked) => setStyle({...style, italics: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Uppercase</Label>
                  <Switch
                    checked={style.uppercase}
                    onCheckedChange={(checked) => setStyle({...style, uppercase: checked})}
                  />
                </div>
              </div>

              {/* Mood & Theme */}
              <div>
                <Label>Mood</Label>
                <Input
                  placeholder="e.g., melancholic, joyful..."
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                />
              </div>

              <div>
                <Label>Theme</Label>
                <Input
                  placeholder="e.g., nature, love, loss..."
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                />
              </div>

              {/* Background Color */}
              <div>
                <Label>Background Color</Label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 rounded border"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Poem
          </Button>
        </div>
      </div>
    </div>
  );
}