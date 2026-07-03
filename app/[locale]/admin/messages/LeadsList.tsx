"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  property_id: string | null;
  property_title: string | null;
  lead_type: string;
  status: string;
  preferred_date: string | null;
  assigned_to: string | null;
  assigned_at: string | null;
  created_at: string;
}

interface LeadsListProps {
  leads: Lead[];
}

const typeColors: Record<string, { bg: string; text: string; icon: string }> = {
  sell: { bg: "bg-orange-100", text: "text-orange-700", icon: "sell" },
  contact: { bg: "bg-blue-100", text: "text-blue-700", icon: "mail" },
  visit: { bg: "bg-green-100", text: "text-green-700", icon: "calendar_today" },
};

const statusColors: Record<string, string> = {
  new: "bg-green-500",
  read: "bg-gray-400",
  contacted: "bg-blue-500",
  closed: "bg-gray-200",
};

export function LeadsList({ leads: initialLeads }: LeadsListProps) {
  const t = useTranslations("Admin");
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("contact_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setLeads(data);
  }, []);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) setCurrentUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("leads-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_leads" },
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeads]);

  async function assignLead(id: string) {
    setAssigning(id);
    try {
      const res = await fetch("/api/contact/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.status === 409) {
        alert(t("leads_taken_by_other"));
        fetchLeads();
        return;
      }

      if (!res.ok) {
        const err = await res.text();
        console.error("Error:", err);
        return;
      }

      setLeads((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, assigned_to: currentUserId, assigned_at: new Date().toISOString() } : l
        )
      );
      if (selectedLead?.id === id) {
        setSelectedLead((prev) => (prev ? { ...prev, assigned_to: currentUserId } : null));
      }
    } catch (err) {
      console.error("Error assigning lead:", err);
    } finally {
      setAssigning(null);
    }
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch("/api/contact/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Error:", err);
        return;
      }

      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      );
      if (selectedLead?.id === id) {
        setSelectedLead((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      console.error("Error updating lead:", err);
    } finally {
      setUpdating(null);
    }
  }

  const typeLabel = (type: string) => t(`leads_type_${type}`) || type;
  const statusLabel = (status: string) => t(`leads_status_${status}`) || status;

  const filteredLeads = leads.filter((l) => {
    if (typeFilter !== "all" && l.lead_type !== typeFilter) return false;
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    return true;
  });

  const newCount = leads.filter((l) => l.status === "new").length;
  const statusTabs = [
    { id: "all", label: t("leads_status_all") },
    { id: "new", label: `${statusLabel("new")} (${newCount})` },
    { id: "read", label: statusLabel("read") },
    { id: "contacted", label: statusLabel("contacted") },
    { id: "closed", label: statusLabel("closed") },
  ];

  return (
    <>
      {/* Type Filter */}
      <div className="flex gap-3 mb-4 overflow-x-auto">
        {[
          { id: "all", label: t("leads_type_all") },
          { id: "contact", label: typeLabel("contact") },
          { id: "visit", label: typeLabel("visit") },
          { id: "sell", label: typeLabel("sell") },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTypeFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
              typeFilter === tab.id
                ? "bg-mosque text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:border-mosque hover:text-mosque"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-3 mb-6 overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.id
                ? "bg-mosque text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-mosque hover:text-mosque"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <span className="material-icons text-4xl text-gray-300 mb-3">inbox</span>
          <p className="text-gray-500">{t("leads_no_results")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">{t("leads_table_name")}</div>
            <div className="col-span-1">{t("leads_table_email")}</div>
            <div className="col-span-2">{t("leads_table_type")}</div>
            <div className="col-span-2">{t("leads_table_date")}</div>
            <div className="col-span-2">{t("leads_table_status")}</div>
            <div className="col-span-1">Asignado</div>
            <div className="col-span-1"></div>
          </div>

          {filteredLeads.map((lead) => {
            const colors = typeColors[lead.lead_type] || typeColors.contact;
            const isAssignedToCurrentUser = lead.assigned_to && currentUserId && lead.assigned_to === currentUserId;
            return (
              <div key={lead.id}>
                <div
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-background-light transition-colors items-center cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="col-span-3">
                    <div className="text-sm font-medium text-nordic-dark truncate">{lead.name}</div>
                    <div className="text-xs text-gray-400 truncate">{lead.property_title || lead.message.slice(0, 50)}</div>
                  </div>
                  <div className="col-span-1 text-sm text-gray-600 truncate hidden md:block">{lead.email}</div>
                  <div className="col-span-2 hidden md:block">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                      <span className="material-icons text-xs">{colors.icon}</span>
                      {typeLabel(lead.lead_type)}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm text-gray-500 hidden md:block">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 hidden md:block">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      lead.status === "new" ? "bg-green-100 text-green-700" :
                      lead.status === "contacted" ? "bg-blue-100 text-blue-700" :
                      lead.status === "closed" ? "bg-gray-100 text-gray-500" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusColors[lead.status] || "bg-gray-400"}`}></span>
                      {statusLabel(lead.status)}
                    </span>
                  </div>
                  <div className="col-span-1 hidden md:block">
                    {lead.assigned_to ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                        isAssignedToCurrentUser
                          ? "bg-mosque/10 text-mosque"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        <span className="material-icons text-[12px]">person</span>
                        {isAssignedToCurrentUser ? t("leads_taken_by_you") : t("leads_taken")}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); assignLead(lead.id); }}
                        disabled={assigning === lead.id}
                        className="text-[10px] font-medium text-mosque hover:text-mosque/80 transition-colors"
                      >
                        {assigning === lead.id ? "..." : t("leads_take")}
                      </button>
                    )}
                  </div>
                  <div className="col-span-1 text-right hidden md:block">
                    <span className="material-icons text-gray-300 text-lg">chevron_right</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-nordic-dark">{selectedLead.name}</h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-nordic-dark hover:bg-gray-100 transition-colors"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t("leads_table_email")}</p>
                  <p className="text-sm text-nordic-dark">{selectedLead.email}</p>
                </div>
                {selectedLead.phone && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t("leads_phone")}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-nordic-dark">{selectedLead.phone}</p>
                      <div className="flex gap-1">
                        <a
                          href={`tel:${selectedLead.phone.replace(/[^+\d]/g, "")}`}
                          className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-colors"
                          title={t("leads_call")}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="material-icons text-sm">phone</span>
                        </a>
                        <a
                          href={`https://wa.me/${selectedLead.phone.replace(/[^+\d]/g, "")}`}
                          className="w-7 h-7 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors"
                          title={t("leads_open_whatsapp")}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="material-icons text-sm">chat</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    (typeColors[selectedLead.lead_type] || typeColors.contact).bg
                  } ${(typeColors[selectedLead.lead_type] || typeColors.contact).text}`}>
                    <span className="material-icons text-xs">{(typeColors[selectedLead.lead_type] || typeColors.contact).icon}</span>
                    {typeLabel(selectedLead.lead_type)}
                  </span>
                </div>
                {selectedLead.preferred_date && (
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      <span className="material-icons text-xs">event</span>
                      {selectedLead.preferred_date}
                    </span>
                  </div>
                )}
              </div>

              {selectedLead.property_title && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t("leads_property")}</p>
                  <p className="text-sm font-medium text-nordic-dark">{selectedLead.property_title}</p>
                </div>
              )}

              <div className="border border-gray-100 rounded-lg p-3">
                {selectedLead.assigned_to ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="material-icons text-sm text-mosque">person_pin</span>
                    <span className="text-gray-600">
                      {selectedLead.assigned_to === currentUserId
                        ? t("leads_taken_by_you")
                        : t("leads_taken_by_other")
                      }
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => assignLead(selectedLead.id)}
                    disabled={assigning === selectedLead.id}
                    className="w-full py-2 rounded-lg bg-mosque text-white text-xs font-medium hover:bg-mosque/90 transition-colors disabled:opacity-50"
                  >
                    {assigning === selectedLead.id ? "..." : t("leads_take")}
                  </button>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">{t("message")}</p>
                <p className="text-sm text-nordic-dark bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{selectedLead.message}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">{t("leads_update_status")}</p>
                <div className="flex gap-2">
                  {["new", "read", "contacted", "closed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedLead.id, s)}
                      disabled={updating === selectedLead.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedLead.status === s
                          ? "bg-mosque text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {updating === selectedLead.id ? "..." : statusLabel(s)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                {t("leads_received")}: {new Date(selectedLead.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
