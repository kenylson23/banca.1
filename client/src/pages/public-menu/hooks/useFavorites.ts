import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar itens favoritos do menu
 * Persiste no localStorage por restaurante
 */
export const useFavorites = (restaurantSlug: string) => {
  const storageKey = `favorites_${restaurantSlug}`;
  
  const loadFavorites = useCallback(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [storageKey]);
  
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, [storageKey, loadFavorites]);

  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      localStorage.setItem(storageKey, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, [storageKey]);

  const isFavorite = useCallback((itemId: string) => {
    return favorites.includes(itemId);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
};
