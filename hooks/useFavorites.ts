"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "luxe_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setFavorites(new Set<string>(stored));
    } catch {
      setFavorites(new Set());
    }
  }, []);

  const isFavorite = useCallback(
    (slug: string) => favorites.has(slug),
    [favorites]
  );

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch { /* localStorage full or unavailable */ }
      return next;
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
