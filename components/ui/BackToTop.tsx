"use client";

interface Props {
  visible: boolean;
}

export function BackToTop({ visible }: Props) {
  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-mosque transition-colors cursor-pointer"
    >
      <span className="material-icons text-base">arrow_upward</span>
      <span>Subir</span>
    </button>
  );
}
