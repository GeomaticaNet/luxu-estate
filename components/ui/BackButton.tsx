"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function BackButton() {
  const router = useRouter();
  const t = useTranslations("Common");

  return (
    <button
      onClick={() => router.back()}
      className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-nordic-dark transition-colors cursor-pointer"
      title={t("back")}
    >
      <span className="material-icons text-base">arrow_back</span>
      <span>{t("back")}</span>
    </button>
  );
}
