"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-nordic-dark transition-colors cursor-pointer"
      title="Go back"
    >
      <span className="material-icons text-base">arrow_back</span>
      <span>Back</span>
    </button>
  );
}
