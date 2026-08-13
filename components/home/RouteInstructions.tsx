"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDistance, formatDuration } from "@/lib/routing";
import type { RouteResult, RouteStep } from "@/lib/routing";

function maneuverIcon(type: number): string {
  if (type === 1) return "trip_origin"; // start
  if (type >= 4 && type <= 6) return "location_on"; // destination
  if (type === 10 || type === 11 || type === 9 || type === 2) return "turn_right";
  if (type === 15 || type === 14 || type === 16 || type === 3) return "turn_left";
  if (type === 12 || type === 13) return "u_turn_left";
  if (type === 26 || type === 27) return "roundabout_right";
  if (type === 25 || type === 34 || type === 35) return "merge";
  if (type >= 17 && type <= 21) return "exit_to_app"; // ramp / exit
  if (type === 7 || type === 8 || type === 22 || type === 23 || type === 24) return "straight";
  return "directions";
}

interface Props {
  routes: RouteResult[];
  activeRoute: number;
  onSelectRoute: (index: number) => void;
  onClose: () => void;
}

export function RouteInstructions({ routes, activeRoute, onSelectRoute, onClose }: Props) {
  const t = useTranslations("Map");
  const locale = useLocale();
  const [collapsed, setCollapsed] = useState(false);

  const route = routes[activeRoute];
  if (!route) return null;

  return (
    <div className="absolute z-[1000] inset-x-0 bottom-0 sm:inset-x-auto sm:right-2 sm:top-2 sm:bottom-2 sm:w-80">
      <div
        className={`flex flex-col ${
          collapsed ? "h-auto" : "h-full max-h-[55vh] sm:max-h-full"
        } rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border border-black/5 overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-gray-100">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-nordic-dark truncate">{t("directions")}</p>
            <p className="text-xs text-nordic-muted">
              {formatDistance(route.distance, locale)} · {formatDuration(route.duration)}
            </p>
          </div>
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-nordic-muted hover:bg-gray-100 hover:text-nordic-dark transition-colors"
              aria-label={collapsed ? t("expand") : t("collapse")}
              title={collapsed ? t("expand") : t("collapse")}
            >
              <span className="material-icons text-lg">
                {collapsed ? "expand_less" : "expand_more"}
              </span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-nordic-muted hover:bg-gray-100 hover:text-nordic-dark transition-colors"
              aria-label={t("close")}
            >
              <span className="material-icons text-lg">close</span>
            </button>
          </div>
        </div>

        {!collapsed && (
          <>
            {/* Route selector chips */}
            {routes.length > 1 && (
              <div className="flex gap-1.5 px-3 pt-2 flex-wrap">
                {routes.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectRoute(i)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                      i === activeRoute
                        ? "bg-mosque text-white"
                        : "bg-gray-100 text-nordic-muted hover:bg-gray-200"
                    }`}
                  >
                    {t("route")} {i + 1} · {formatDuration(r.duration)}
                  </button>
                ))}
              </div>
            )}

            {t.has("drag_origin_hint") && (
              <p className="px-4 pt-2 text-[10px] text-nordic-muted">{t("drag_origin_hint")}</p>
            )}

            {/* Steps */}
            <ol className="flex-1 overflow-y-auto px-3 py-2">
              {route.steps.map((s: RouteStep, i: number) => (
                <li key={i} className="flex items-start gap-2.5 py-1.5">
                  <span className="material-icons text-mosque text-[18px] shrink-0 mt-0.5">
                    {maneuverIcon(s.type)}
                  </span>
                  <p className="flex-1 min-w-0 text-[13px] text-nordic-dark leading-snug">
                    {s.instruction}
                  </p>
                  <span className="ml-auto text-[11px] text-nordic-muted shrink-0 whitespace-nowrap pt-0.5">
                    {formatDistance(s.distance, locale)}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}