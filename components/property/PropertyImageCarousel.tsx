"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const BLUR_PLACEHOLDER = "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v+AEAA=";

interface Props {
  images: string[];
  alt: string;
  isInactive?: boolean;
  sizes?: string;
  className?: string;
  compact?: boolean;
}

export const PropertyImageCarousel = ({
  images,
  alt,
  isInactive = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className = "",
  compact = false,
}: Props) => {
  const t = useTranslations("PropertyCard");
  const [current, setCurrent] = useState(0);

  const goTo = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrent((index + images.length) % images.length);
    },
    [images.length]
  );

  const goPrev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrent((prev) => (prev - 1 + images.length) % images.length);
    },
    [images.length]
  );

  const goNext = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrent((prev) => (prev + 1) % images.length);
    },
    [images.length]
  );

  return (
    <div className={`absolute inset-0 ${className}`}>
      {images.map((src, index) => (
        <Image
          key={src + index}
          fill
          priority={index === 0}
          sizes={sizes}
          alt={alt}
          src={src}
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          className={`object-cover transition-all duration-500 ease-out ${
            isInactive ? "grayscale opacity-70" : ""
          } ${index === current ? "opacity-100 scale-100" : "opacity-0 scale-[1.03] pointer-events-none"}`}
        />
      ))}

      {/* Left arrow */}
      <button
        type="button"
        onClick={goPrev}
        aria-label={t("prev_image")}
        className={`absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full backdrop-blur-sm shadow-md transition-all duration-200 active:scale-95 z-20 opacity-0 md:group-hover:opacity-100 max-md:opacity-100 ${
          compact ? "" : "w-9 h-9 bg-white/85 text-nordic-dark hover:bg-white hover:scale-105"
        }`}
        style={compact ? { width: 26, height: 26, background: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" } : undefined}
      >
        <span className={`material-icons leading-none ${compact ? "" : "text-xl"}`} style={compact ? { fontSize: 15 } : undefined}>chevron_left</span>
      </button>

      {/* Right arrow */}
      <button
        type="button"
        onClick={goNext}
        aria-label={t("next_image")}
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full backdrop-blur-sm shadow-md transition-all duration-200 active:scale-95 z-20 opacity-0 md:group-hover:opacity-100 max-md:opacity-100 ${
          compact ? "" : "w-9 h-9 bg-white/85 text-nordic-dark hover:bg-white hover:scale-105"
        }`}
        style={compact ? { width: 26, height: 26, background: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" } : undefined}
      >
        <span className={`material-icons leading-none ${compact ? "" : "text-xl"}`} style={compact ? { fontSize: 15 } : undefined}>chevron_right</span>
      </button>

      {/* Dots */}
      <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`${index + 1} / ${images.length}`}
            onClick={(e) => goTo(e, index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === current ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
