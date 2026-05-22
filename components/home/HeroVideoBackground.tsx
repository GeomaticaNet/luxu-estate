"use client";

import { useRef, useState, useEffect } from "react";

interface Props {
  videos: string[];
}

export const HeroVideoBackground = ({ videos }: Props) => {
  const [visible, setVisible] = useState(0);
  const indexRef = useRef(0);
  const ref0 = useRef<HTMLVideoElement>(null);
  const ref1 = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref0.current;
    if (!video || videos.length === 0) return;
    video.src = videos[0];
    video.play().catch(() => {});
  }, [videos]);

  const handleEnded0 = () => {
    if (videos.length <= 1) {
      ref0.current?.play();
      return;
    }
    indexRef.current = (indexRef.current + 1) % videos.length;
    const nextRef = ref1.current;
    if (nextRef) {
      nextRef.src = videos[indexRef.current];
      nextRef.play().catch(() => {});
    }
    setVisible(1);
  };

  const handleEnded1 = () => {
    if (videos.length <= 1) {
      ref1.current?.play();
      return;
    }
    indexRef.current = (indexRef.current + 1) % videos.length;
    const nextRef = ref0.current;
    if (nextRef) {
      nextRef.src = videos[indexRef.current];
      nextRef.play().catch(() => {});
    }
    setVisible(0);
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        ref={ref0}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${visible === 0 ? "opacity-100" : "opacity-0"}`}
        muted
        loop={false}
        playsInline
        preload="auto"
        onEnded={handleEnded0}
      />
      <video
        ref={ref1}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${visible === 1 ? "opacity-100" : "opacity-0"}`}
        muted
        loop={false}
        playsInline
        preload="auto"
        onEnded={handleEnded1}
      />
    </div>
  );
};
