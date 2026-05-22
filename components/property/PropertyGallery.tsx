"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { PropertyImage } from "@/interfaces/property";

interface Props {
  mainImage: PropertyImage;
  images: PropertyImage[];
}

const BLUR_PLACEHOLDER = "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v+AEAA=";

export const PropertyGallery = ({ mainImage, images }: Props) => {
  const [activeImage, setActiveImage] = useState<PropertyImage>(mainImage);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allImages = images.length > 0 ? images : [mainImage];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, goNext, goPrev]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  const activeIndex = allImages.findIndex((img) => img.id === activeImage.id);

  return (
    <>
      <div className="space-y-4">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group">
          <Image
            src={activeImage.url}
            alt="Main Property Image"
            fill
            priority
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            {activeImage.is_main && (
              <span className="bg-mosque text-white text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                Premium
              </span>
            )}
          </div>
          <button
            onClick={() => openLightbox(activeIndex >= 0 ? activeIndex : 0)}
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-nordic px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur transition-all flex items-center gap-2"
          >
            <span className="material-icons text-sm">grid_view</span>
            View All Photos ({allImages.length})
          </button>
        </div>

        {allImages.length > 1 && (
          <div className="flex gap-4 overflow-x-auto scrollbar-mosque py-2 px-2 scroll-px-2 snap-x">
            {allImages.map((img, index) => (
              <div
                key={img.id}
                onClick={() => setActiveImage(img)}
                className={`flex-none w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer snap-start transition-opacity relative
                  ${img.id === activeImage.id ? "ring-2 ring-mosque ring-offset-2 ring-offset-clear-day" : "opacity-70 hover:opacity-100"}
                `}
              >
                <Image
                  src={img.url}
                  alt="Property gallery thumbnail"
                  fill
                  sizes="192px"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <span className="material-icons text-xl">close</span>
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 z-10 text-white/60 text-sm font-medium">
            {lightboxIndex + 1} / {allImages.length}
          </div>

          {/* Main image area */}
          <div
            className="flex-1 flex items-center justify-center p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-w-5xl max-h-[75vh]">
              <Image
                src={allImages[lightboxIndex].url}
                alt="Property photo"
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Navigation arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <span className="material-icons text-2xl">chevron_left</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <span className="material-icons text-2xl">chevron_right</span>
              </button>
            </>
          )}

          {/* Thumbnails strip */}
          {allImages.length > 1 && (
            <div
              className="flex justify-center gap-2 p-4 overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {allImages.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setLightboxIndex(index)}
                  className={`flex-none w-16 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                    index === lightboxIndex
                      ? "ring-2 ring-mosque ring-offset-2 ring-offset-black opacity-100"
                      : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
