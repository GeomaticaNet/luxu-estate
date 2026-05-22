"use client";

import Image from "next/image";
import { useState } from "react";
import { PropertyImage } from "@/interfaces/property";

interface Props {
  mainImage: PropertyImage;
  images: PropertyImage[];
}

const BLUR_PLACEHOLDER = "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v+AEAA=";

export const PropertyGallery = ({ mainImage, images }: Props) => {
  const [activeImage, setActiveImage] = useState<PropertyImage>(mainImage);

  return (
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
        <button className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-nordic px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur transition-all flex items-center gap-2">
          <span className="material-icons text-sm">grid_view</span>
          View All Photos
        </button>
      </div>

      {images && images.length > 0 && (
        <div className="flex gap-4 overflow-x-auto scrollbar-mosque py-2 px-2 scroll-px-2 snap-x">
          {images.map((img) => (
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
  );
};
