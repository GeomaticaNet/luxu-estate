"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface PropertyRowProps {
  property: {
    id: string;
    title: string;
    price: number;
    price_label?: string;
    address: string;
    location: string;
    city?: string;
    state?: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    active: boolean;
    is_featured: boolean;
    type: string;
    property_type: string;
    agent_id?: string | null;
  };
  mainImage: string | null;
  isLast: boolean;
  isAdmin?: boolean;
  currentUserId?: string | null;
  agents?: Agent[];
}

interface Agent {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

function StatusBadge({ active, isFeatured, type, t }: { active: boolean; isFeatured: boolean; type: string; t: (key: string) => string }) {
  // Determine the primary badge text, color, and dot
  let badgeText: string;
  let badgeColor: string;
  let dotColor: string;

  if (!active) {
    badgeText = t("inactive");
    badgeColor = "bg-gray-200 text-gray-600";
    dotColor = "bg-gray-500";
  } else if (type === "SALE") {
    badgeText = t("for_sale");
    badgeColor = "bg-green-100 text-green-700";
    dotColor = "bg-green-500";
  } else if (type === "RENT") {
    badgeText = t("for_rent");
    badgeColor = "bg-blue-100 text-blue-700";
    dotColor = "bg-blue-500";
  } else if (type === "SOLD") {
    badgeText = t("sold");
    badgeColor = "bg-gray-200 text-gray-600";
    dotColor = "bg-gray-500";
  } else if (type === "RENTED") {
    badgeText = t("rented");
    badgeColor = "bg-blue-900 text-blue-100";
    dotColor = "bg-blue-300";
  } else {
    badgeText = t("active_prop");
    badgeColor = "bg-hint-of-green text-mosque";
    dotColor = "bg-mosque";
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${badgeColor}`}>
        <span className={`w-1 h-1 rounded-full mr-1 ${dotColor}`}></span>
        {badgeText}
      </span>
      {isFeatured && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-700 whitespace-nowrap" title={t("featured_badge")}>
          <span className="material-icons text-[12px] leading-none mr-0.5">star</span>
        </span>
      )}
    </div>
  );
}

const typeColors: Record<string, { bg: string; text: string }> = {
  house: { bg: "bg-orange-100", text: "text-orange-700" },
  apartment: { bg: "bg-blue-100", text: "text-blue-700" },
  villa: { bg: "bg-purple-100", text: "text-purple-700" },
  penthouse: { bg: "bg-rose-100", text: "text-rose-700" },
};

export function PropertyRow({ property, mainImage, isLast, isAdmin = false, currentUserId = null, agents = [] }: PropertyRowProps) {
  const t = useTranslations("Admin");
  const [isActive, setIsActive] = useState(property.active);
  const [propertyType, setPropertyType] = useState(property.type);
  const [isFeatured, setIsFeatured] = useState(property.is_featured);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(property.agent_id ?? null);
  const [assignLoading, setAssignLoading] = useState(false);
  const router = useRouter();

  const currentAgent = agents.find((a) => a.user_id === agentId) || null;
  const availableAgents = agents.filter((a) => a.user_id !== agentId);
  // Admin manages every property; agents only manage the ones assigned to them.
  const canManage = isAdmin || (currentUserId && agentId === currentUserId);

  const assignAgent = async (targetAgentId: string | null) => {
    setAssignLoading(true);
    try {
      const res = await fetch("/api/property/assign-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id, agentId: targetAgentId }),
      });

      if (!res.ok) {
        const err = await res.text();
        alert("Error: " + err);
        return;
      }

      setAgentId(targetAgentId);
      setAssignOpen(false);
      router.refresh();
    } catch (err) {
      alert("Error: " + String(err));
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (action === "edit") {
      router.push(`/admin/properties/${property.id}`);
      return;
    }

    setIsLoading(true);
    setMenuOpen(false);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("Not logged in");
        return;
      }

      const res = await fetch("/api/property/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          action,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        alert("Error: " + err);
        return;
      }

      // Update local state for immediate feedback
      if (action === "toggle") {
        setIsActive(!isActive);
      } else if (action === "forSale") {
        setPropertyType("SALE");
      } else if (action === "forRent") {
        setPropertyType("RENT");
      } else if (action === "sold") {
        setPropertyType("SOLD");
      } else if (action === "rented") {
        setPropertyType("RENTED");
      } else if (action === "toggleFeatured") {
        setIsFeatured(!isFeatured);
      }

      router.refresh();
    } catch (err) {
      alert("Error: " + String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { action: "edit", label: t("edit_property"), icon: "edit" },
    { action: "toggle", label: isActive ? t("deactivate") : t("activate"), icon: isActive ? "visibility_off" : "visibility" },
    { action: "toggleFeatured", label: isFeatured ? t("unmark_featured") : t("mark_featured"), icon: isFeatured ? "star_border" : "star" },
    { action: "forSale", label: t("for_sale"), icon: "home" },
    { action: "forRent", label: t("for_rent"), icon: "key" },
    { action: "sold", label: t("sold"), icon: "check_circle" },
    { action: "rented", label: t("rented"), icon: "handshake" },
  ];

  return (
    <div 
      className={`group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 transition-colors items-center ${
        isLast ? 'border-b-0' : ''
      } ${canManage ? 'hover:bg-background-light' : 'opacity-60 grayscale'}`}
    >
      {/* Property Details */}
      <div className="col-span-12 md:col-span-4 flex gap-4 items-center min-w-0">
        <div className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
          {mainImage && (
            <>
              <img 
                src={mainImage} 
                alt={property.title}
                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${!isActive || propertyType === 'SOLD' || propertyType === 'RENTED' ? 'grayscale opacity-50' : ''}`}
              />
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <span className="material-icons text-white text-2xl">visibility_off</span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`text-lg font-bold text-nordic-dark transition-colors flex items-center gap-2 ${canManage ? 'cursor-pointer group-hover:text-mosque' : ''}`} onClick={canManage ? () => router.push(`/admin/properties/${property.id}`) : undefined}>
            {property.title}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${typeColors[property.property_type]?.bg || "bg-gray-100"} ${typeColors[property.property_type]?.text || "text-gray-700"}`}>{property.property_type}</span>
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {[property.address, property.city, property.state].filter(Boolean).join(", ")}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="material-icons text-[14px]">bed</span> {property.bedrooms} {t("beds")}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="flex items-center gap-1">
              <span className="material-icons text-[14px]">bathtub</span> {property.bathrooms} {t("baths")}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>{property.area} {t("sqft")}</span>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="col-span-6 md:col-span-2">
        <div className="text-base font-semibold text-nordic-dark">
          ${Number(property.price).toLocaleString()}
        </div>
        {property.price_label && (
          <div className="text-xs text-gray-400">{property.price_label}</div>
        )}
      </div>

      {/* Status */}
      <div className="col-span-6 md:col-span-2">
        <StatusBadge active={isActive} isFeatured={isFeatured} type={propertyType} t={t} />
      </div>

      {/* Assigned to */}
      <div className="col-span-6 md:col-span-2">
        <div className={`flex items-center gap-2 ${canManage && currentAgent ? "text-mosque" : "text-gray-500"}`}>
          <span className="relative w-5 h-5 flex-shrink-0 rounded-full overflow-hidden bg-gray-200">
            {currentAgent?.avatar_url ? (
              <img src={currentAgent.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="material-icons text-[13px] text-gray-400 absolute inset-0 flex items-center justify-center">
                {currentAgent ? "person" : "person_off"}
              </span>
            )}
          </span>
          <span className="text-xs font-medium truncate">
            {currentAgent ? currentAgent.full_name || currentAgent.user_id.slice(0, 8) : t("unassigned")}
          </span>
        </div>
      </div>

      {/* Actions - Menu */}
      <div className="col-span-6 md:col-span-2 flex items-center justify-end gap-2">
        {!canManage && (
          <span
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-100 text-gray-400"
            title={t("assigned_other_agent")}
          >
            <span className="material-icons text-[15px]">lock</span>
            <span className="text-[11px] font-medium">{t("locked_property")}</span>
          </span>
        )}
        {/* Assign to agent (admin only) */}
        {isAdmin && canManage && (
          <div className="relative">
            <button
              onClick={() => setAssignOpen(!assignOpen)}
              disabled={assignLoading}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                currentAgent
                  ? "border-mosque/30 bg-mosque/5 text-mosque hover:bg-mosque/10"
                  : "border-gray-200 bg-white text-gray-400 hover:border-mosque/40 hover:text-mosque"
              }`}
              title={t("assign_to")}
            >
              <span className="material-icons text-[15px]">person_add_alt</span>
              <span className="max-w-[70px] truncate">
                {currentAgent ? currentAgent.full_name : t("unassigned")}
              </span>
              <span className="material-icons text-[13px]">expand_more</span>
            </button>

            {assignOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAssignOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-[60] w-52 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-100">
                    {t("assign_to")}
                  </div>
                  <button
                    onClick={() => assignAgent(null)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-background-light transition-colors cursor-pointer ${
                      agentId === null ? "text-mosque font-medium" : "text-nordic-dark"
                    }`}
                  >
                    <span className="material-icons text-sm text-gray-400">person_off</span>
                    {t("unassigned")}
                  </button>
                  {availableAgents.map((agent) => {
                    const isCurrent = agent.user_id === agentId;
                    return (
                      <button
                        key={agent.user_id}
                        onClick={() => assignAgent(agent.user_id)}
                        disabled={isCurrent || assignLoading}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer ${
                          isCurrent
                            ? "bg-mosque/5 text-mosque font-medium cursor-default"
                            : "text-nordic-dark hover:bg-background-light"
                        }`}
                      >
                        <span className="relative w-5 h-5 flex-shrink-0 rounded-full overflow-hidden bg-gray-200">
                          {agent.avatar_url ? (
                            <img src={agent.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="material-icons text-[13px] text-gray-400 absolute inset-0 flex items-center justify-center">person</span>
                          )}
                        </span>
                        <span className="truncate">{agent.full_name || agent.user_id.slice(0, 8)}</span>
                        {isCurrent && <span className="material-icons text-[14px] ml-auto text-mosque">check</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {canManage && (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all cursor-pointer text-gray-400 hover:text-nordic-dark hover:bg-gray-100 ${isLoading ? 'opacity-50' : ''}`}
            title="Actions"
          >
            <span className="material-icons text-xl">more_vert</span>
          </button>

          {menuOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              {/* Menu */}
              <div className="absolute right-0 top-full mt-1 z-[60] w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {menuItems.map((item) => (
                  <button
                    key={item.action}
                    onClick={() => handleAction(item.action)}
                    className="w-full text-left px-3 py-1.5 text-xs text-nordic-dark hover:bg-background-light transition-colors flex items-center gap-2"
                  >
                    <span className="material-icons text-sm text-gray-400">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
