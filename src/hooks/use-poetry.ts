import { useState, useCallback } from 'react';
import { Poetry, PoetryAnalytics } from '@/types/poetry';
import { useToast } from '@/components/ui/use-toast';

export function usePoetry() {
  const [poetry, setPoetry] = useState<Poetry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getPoetry = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/poetry');
      if (response.ok) {
        const result = await response.json();
        setPoetry(result.data || []);
      } else {
        throw new Error('Failed to fetch poetry');
      }
    } catch (error) {
      console.error('Error fetching poetry:', error);
      toast({
        title: "Error",
        description: "Failed to fetch poetry",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createPoetry = useCallback(async (poetryData: Partial<Poetry>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/poetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(poetryData),
      });
      
      if (response.ok) {
        const result = await response.json();
        setPoetry(prev => [result.data, ...prev]);
        toast({
          title: "Success",
          description: "Poem created successfully",
        });
        return result.data;
      } else {
        throw new Error('Failed to create poem');
      }
    } catch (error) {
      console.error('Error creating poetry:', error);
      toast({
        title: "Error",
        description: "Failed to create poem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updatePoetry = useCallback(async (id: string, updates: Partial<Poetry>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/poetry/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        const result = await response.json();
        setPoetry(prev => prev.map(poem => poem.id === id ? result.data : poem));
        toast({
          title: "Success",
          description: "Poem updated successfully",
        });
        return result.data;
      } else {
        throw new Error('Failed to update poem');
      }
    } catch (error) {
      console.error('Error updating poetry:', error);
      toast({
        title: "Error",
        description: "Failed to update poem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deletePoetry = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/poetry/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setPoetry(prev => prev.filter(poem => poem.id !== id));
        toast({
          title: "Success",
          description: "Poem deleted successfully",
        });
        return true;
      } else {
        throw new Error('Failed to delete poem');
      }
    } catch (error) {
      console.error('Error deleting poetry:', error);
      toast({
        title: "Error",
        description: "Failed to delete poem",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/poetry/${id}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_favorite: isFavorite }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setPoetry(prev => prev.map(poem => poem.id === id ? result.data : poem));
        return result.data;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  }, [toast]);

  const togglePin = useCallback(async (id: string, isPinned: boolean) => {
    try {
      const response = await fetch(`/api/poetry/${id}/pin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_pinned: isPinned }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setPoetry(prev => prev.map(poem => poem.id === id ? result.data : poem));
        return result.data;
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: "Error",
        description: "Failed to update pin status",
        variant: "destructive",
      });
    }
  }, [toast]);

  const duplicatePoetry = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/poetry/${id}/duplicate`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        setPoetry(prev => [result.data, ...prev]);
        toast({
          title: "Success",
          description: "Poem duplicated successfully",
        });
        return result.data;
      } else {
        throw new Error('Failed to duplicate poem');
      }
    } catch (error) {
      console.error('Error duplicating poetry:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate poem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const exportPoetry = useCallback(async (format: string, poemIds?: string[]) => {
    try {
      let url = `/api/poetry/export?format=${format}`;
      if (poemIds && poemIds.length > 0) {
        url += `&poemIds=${poemIds.join(',')}`;
      }
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error exporting poetry:', error);
      toast({
        title: "Error",
        description: "Failed to export poetry",
        variant: "destructive",
      });
    }
  }, [toast]);

  const getPoetryAnalytics = useCallback(async (): Promise<PoetryAnalytics | null> => {
    try {
      const response = await fetch('/api/poetry/analytics');
      if (response.ok) {
        const result = await response.json();
        return result.data;
      }
    } catch (error) {
      console.error('Error fetching poetry analytics:', error);
    }
    return null;
  }, []);

  const getRhymeSuggestions = useCallback(async (word: string) => {
    try {
      const response = await fetch(`/api/poetry/rhymes?word=${encodeURIComponent(word)}`);
      if (response.ok) {
        const result = await response.json();
        return result.data || [];
      }
    } catch (error) {
      console.error('Error fetching rhyme suggestions:', error);
    }
    return [];
  }, []);

  const getSynonymSuggestions = useCallback(async (word: string) => {
    try {
      const response = await fetch(`/api/poetry/synonyms?word=${encodeURIComponent(word)}`);
      if (response.ok) {
        const result = await response.json();
        return result.data || [];
      }
    } catch (error) {
      console.error('Error fetching synonym suggestions:', error);
    }
    return [];
  }, []);

  const analyzePoetryForm = useCallback(async (content: string) => {
    try {
      const response = await fetch('/api/poetry/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data;
      }
    } catch (error) {
      console.error('Error analyzing poetry form:', error);
    }
    return null;
  }, []);

  return {
    poetry,
    isLoading,
    getPoetry,
    createPoetry,
    updatePoetry,
    deletePoetry,
    toggleFavorite,
    togglePin,
    duplicatePoetry,
    exportPoetry,
    getPoetryAnalytics,
    getRhymeSuggestions,
    getSynonymSuggestions,
    analyzePoetryForm,
  };
}