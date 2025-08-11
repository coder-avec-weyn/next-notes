import { useState, useCallback } from 'react';
import { Poetry } from '@/types/poetry';

export function usePoetry() {
  const [poetry, setPoetry] = useState<Poetry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getPoetry = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/poetry');
      if (response.ok) {
        const result = await response.json();
        setPoetry(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching poetry:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPoetry = useCallback(async (poetryData: Partial<Poetry>) => {
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
        return result.data;
      }
    } catch (error) {
      console.error('Error creating poetry:', error);
    }
  }, []);

  const updatePoetry = useCallback(async (id: string, updates: Partial<Poetry>) => {
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
        return result.data;
      }
    } catch (error) {
      console.error('Error updating poetry:', error);
    }
  }, []);

  const deletePoetry = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/poetry/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setPoetry(prev => prev.filter(poem => poem.id !== id));
      }
    } catch (error) {
      console.error('Error deleting poetry:', error);
    }
  }, []);

  return {
    poetry,
    isLoading,
    getPoetry,
    createPoetry,
    updatePoetry,
    deletePoetry,
  };
}