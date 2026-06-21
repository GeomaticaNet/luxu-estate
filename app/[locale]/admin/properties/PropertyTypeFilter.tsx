"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

const TYPES = [
  { value: "", labelKey: "filter_all_types" },
  { value: "house", labelKey: "type_house" },
  { value: "apartment", labelKey: "type_apartment" },
  { value: "villa", labelKey: "type_villa" },
  { value: "penthouse", labelKey: "type_penthouse" },
];

const typeColors: Record<string, { bg: string; text: string; }> = {
  house: { bg: "bg-orange-100", text: "text-orange-700" },
  apartment: { bg: "bg-blue-100", text: "text-blue-700" },
  villa: { bg: "bg-purple-100", text: "text-purple-700" },
  penthouse: { bg: "bg-rose-100", text: "text-rose-700" },
};

export function PropertyTypeFilter() {
  const t = useTranslations("Admin");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("property_type") || "";

  function selectType(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("property_type", value);
    } else {
      params.delete("property_type");
    }
    params.delete("page");
    router.push(`/admin/properties?${params.toString()}`);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`bg-white border px-4 py-2.5 rounded-[7px] text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2 ${
          currentType
            ? "border-mosque text-mosque"
            : "border-gray-200 text-nordic-dark hover:bg-gray-50"
        }`}
      >
        <span className="material-icons text-base">filter_list</span>
        {t("filter")}
        {currentType && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${typeColors[currentType]?.bg || "bg-gray-100"} ${typeColors[currentType]?.text || "text-gray-700"}`}>
            {currentType}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4 min-w-[280px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-nordic-dark">{t("filter_by_type")}</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {TYPES.map((type) => {
                const isActive = type.value === currentType || (!type.value && !currentType);
                const colors = typeColors[type.value];
                return (
                  <button
                    key={type.value || "all"}
                    onClick={() => selectType(type.value)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? type.value
                          ? `${colors.bg} ${colors.text} border-2 border-current`
                          : "bg-mosque text-white shadow-md shadow-mosque/20"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    {t(type.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
