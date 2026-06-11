"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const TYPES = [
  { value: "", label: "Todos" },
  { value: "house", label: "Casa" },
  { value: "apartment", label: "Apartamento" },
  { value: "villa", label: "Villa" },
  { value: "penthouse", label: "Penthouse" },
];

const typeColors: Record<string, { bg: string; text: string; }> = {
  house: { bg: "bg-orange-100", text: "text-orange-700" },
  apartment: { bg: "bg-blue-100", text: "text-blue-700" },
  villa: { bg: "bg-purple-100", text: "text-purple-700" },
  penthouse: { bg: "bg-rose-100", text: "text-rose-700" },
};

export function PropertyTypeFilter() {
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
        Filter
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
            <h3 className="text-lg font-semibold text-nordic-dark">Filter by type</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {TYPES.map((t) => {
                const isActive = t.value === currentType || (!t.value && !currentType);
                const colors = typeColors[t.value];
                return (
                  <button
                    key={t.value || "all"}
                    onClick={() => selectType(t.value)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? t.value
                          ? `${colors.bg} ${colors.text} border-2 border-current`
                          : "bg-mosque text-white shadow-md shadow-mosque/20"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    {t.label}
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
