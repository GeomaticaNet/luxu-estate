"use client";

import { useFavorites } from "@/hooks/useFavorites";

interface Props {
  slug: string;
  className?: string;
  iconSize?: string;
}

export const FavoriteButton = ({ slug, className = "", iconSize = "text-lg" }: Props) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(slug);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(slug);
      }}
      className={`flex items-center justify-center transition-all z-10 ${className} ${
        active
          ? "bg-mosque text-white"
          : "bg-white/90 text-nordic-dark hover:bg-mosque hover:text-white"
      }`}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
    >
      <span className={`material-icons ${iconSize}`}>
        {active ? "favorite" : "favorite_border"}
      </span>
    </button>
  );
};
