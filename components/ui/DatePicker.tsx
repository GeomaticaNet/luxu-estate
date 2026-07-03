"use client";

import { useState, useRef, useEffect } from "react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  className?: string;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  return { first, total };
}

export function DatePicker({ value, onChange, className = "" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(value + "T12:00:00") : null;
  const [viewYear, setViewYear] = useState(selected?.getFullYear() || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() || new Date().getMonth());

  useEffect(() => {
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [selected]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { first, total } = getMonthDays(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  }

  function selectDate(day: number) {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  }

  const formatDisplay = (date: string) => {
    if (!date) return "";
    const [y, m, d] = date.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark hover:border-mosque focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm cursor-pointer"
      >
        <span className="material-icons text-gray-400 text-base">calendar_today</span>
        <span className={value ? "text-nordic-dark" : "text-gray-400"}>
          {value ? formatDisplay(value) : "Seleccionar fecha"}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72">
          {/* Month/Year header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-nordic-dark transition-colors cursor-pointer"
            >
              <span className="material-icons text-sm">chevron_left</span>
            </button>
            <span className="text-sm font-semibold text-nordic-dark">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-nordic-dark transition-colors cursor-pointer"
            >
              <span className="material-icons text-sm">chevron_right</span>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-gray-400 uppercase tracking-wider py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: first }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: total }, (_, i) => {
              const day = i + 1;
              const isSelected = selected &&
                selected.getDate() === day &&
                selected.getMonth() === viewMonth &&
                selected.getFullYear() === viewYear;

              const today = new Date();
              const isToday = today.getDate() === day &&
                today.getMonth() === viewMonth &&
                today.getFullYear() === viewYear;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDate(day)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-mosque text-white shadow-sm"
                      : isToday
                        ? "bg-mosque/10 text-mosque font-semibold"
                        : "text-nordic-dark hover:bg-gray-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
