"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  replied_at: string | null;
  reply_message: string | null;
  created_at: string;
  images?: string[];
}

interface ThreadMessage {
  id: string;
  lead_id: string;
  sender_type: "user" | "agent" | "system";
  sender_id: string | null;
  body: string;
  images?: string[];
  is_read: boolean;
  created_at: string;
}

interface LeadsListProps {
  leads: Lead[];
  isAdmin?: boolean;
  currentUserId?: string | null;
  agentNames?: Record<string, string>;
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

export function LeadsList({ leads: initialLeads, isAdmin = true, currentUserId: propUserId, agentNames = {} }: LeadsListProps) {
  const t = useTranslations("Admin");
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentUserId, setCurrentUserId] = useState<string | null>(propUserId ?? null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyExpanded, setReplyExpanded] = useState(false);
  const [replyEmailError, setReplyEmailError] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the thread to the latest message (WhatsApp-style)
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread]);

  const loadThread = useCallback(async (leadId: string) => {
    setThreadLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("lead_messages")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true });
    setThread(data || []);

    // Mark client messages as read once the staff opens the conversation,
    // so the admin bell badge clears for them.
    const unreadIds = (data || [])
      .filter((m: ThreadMessage) => m.sender_type === "user" && !m.is_read)
      .map((m) => m.id);
    if (unreadIds.length > 0) {
      await supabase
        .from("lead_messages")
        .update({ is_read: true })
        .in("id", unreadIds);
      setThread((prev) =>
        prev.map((m) => (m.sender_type === "user" ? { ...m, is_read: true } : m))
      );
    }

    // Opening the conversation moves the lead from "new" to "read" so the
    // bell badge stops counting it as unattended.
    try {
      const { data: leadRow } = await supabase
        .from("contact_leads")
        .select("status")
        .eq("id", leadId)
        .maybeSingle();
      if (leadRow && leadRow.status === "new") {
        await supabase
          .from("contact_leads")
          .update({ status: "read" })
          .eq("id", leadId);
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: "read" } : l))
        );
        setSelectedLead((prev) =>
          prev && prev.id === leadId ? { ...prev, status: "read" } : prev
        );
      }
    } catch {
      // ignore — non-critical
    }

    setThreadLoading(false);
  }, []);

  const fetchLeads = useCallback(async () => {
    const supabase = createClient();
    let query = supabase.from("contact_leads").select("*").order("created_at", { ascending: false });
    if (!isAdmin && propUserId) {
      query = query.or(`lead_type.eq.sell,assigned_to.eq.${propUserId}`);
    }
    const { data } = await query;
    if (data) setLeads(data);
  }, [isAdmin, propUserId]);

  useEffect(() => {
    const filtered = isAdmin
      ? initialLeads
      : initialLeads.filter(
          (l) => l.lead_type === "sell" || l.assigned_to === propUserId
        );
    setLeads(filtered);
  }, [initialLeads, isAdmin, propUserId]);

  useEffect(() => {
    if (propUserId) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) setCurrentUserId(session.user.id);
    });
  }, [propUserId]);

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
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lead_messages" },
        () => {
          if (selectedLead) loadThread(selectedLead.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeads, selectedLead, loadThread]);

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

  async function handleReply(lead: Lead) {
    if (!replyText.trim()) return;
    setReplySending(true);
    setReplyEmailError(null);

    try {
      const res = await fetch("/api/leads/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          leadName: lead.name,
          leadEmail: lead.email,
          replyText: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("leads_reply_error"));
      }

      // Surface email delivery problems (e.g. mailbox not found) without
      // losing the reply, which is already stored in the conversation thread.
      const email = data.email as { status?: string; message?: string } | undefined;
      if (email?.status === "invalid_mailbox") {
        setReplyEmailError(t("leads_email_invalid", { email: lead.email }));
      } else if (email?.status === "error") {
        setReplyEmailError(t("leads_email_error"));
      }

      const now = new Date().toISOString();
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? { ...l, replied_at: now, reply_message: replyText.trim(), status: "contacted" }
            : l
        )
      );
      setSelectedLead((prev) =>
        prev?.id === lead.id
          ? { ...prev, replied_at: now, reply_message: replyText.trim(), status: "contacted" }
          : prev
      );
      setReplyText("");
      setReplyExpanded(false);
      loadThread(lead.id);
    } catch (err) {
      console.error("Error sending reply:", err);
      alert(err instanceof Error ? err.message : t("leads_reply_error"));
    } finally {
      setReplySending(false);
    }
  }

  async function deleteChat(lead: Lead) {
    setDeleting(true);
    try {
      const res = await fetch("/api/leads/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });

      if (!res.ok) {
        const err = await res.text();
        alert("Error: " + err);
        return;
      }

      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
      setSelectedLead(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      alert("Error: " + String(err));
    } finally {
      setDeleting(false);
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const ids = filteredLeads.map((l) => l.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (ids.every((id) => next.has(id))) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  async function deleteSelected() {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      const res = await fetch("/api/leads/delete-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: Array.from(selectedIds) }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Error: " + (err.error || "Failed to delete"));
        return;
      }

      setLeads((prev) => prev.filter((l) => !selectedIds.has(l.id)));
      if (selectedLead && selectedIds.has(selectedLead.id)) {
        setSelectedLead(null);
        setShowDeleteConfirm(false);
      }
      setSelectedIds(new Set());
      setShowBulkConfirm(false);
    } catch (err) {
      alert("Error: " + String(err));
    } finally {
      setBulkDeleting(false);
    }
  }

  const typeLabel = (type: string) => t(`leads_type_${type}`) || type;
  const statusLabel = (status: string) => t(`leads_status_${status}`) || status;

  const filteredLeads = leads.filter((l) => {
    if (typeFilter !== "all" && l.lead_type !== typeFilter) return false;
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    return true;
  });

  const selectedCount = selectedIds.size;
  const allSelected = filteredLeads.length > 0 && filteredLeads.every((l) => selectedIds.has(l.id));

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

      {showBulkConfirm && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700 mb-3">
            {t("leads_delete_bulk_confirm", { count: selectedCount })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={deleteSelected}
              disabled={bulkDeleting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {bulkDeleting ? t("leads_deleting") : t("leads_delete_chat_btn")}
            </button>
            <button
              onClick={() => setShowBulkConfirm(false)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      {selectedCount > 0 && !showBulkConfirm && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-hint-of-green/40 border border-mosque/20 rounded-lg px-4 py-2.5">
          <p className="text-sm font-medium text-mosque">
            {t("leads_selected_count", { count: selectedCount })}
          </p>
          <button
            onClick={() => setShowBulkConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
          >
            <span className="material-icons text-sm">delete_sweep</span>
            {t("leads_delete_selected")}
          </button>
        </div>
      )}

      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <span className="material-icons text-4xl text-gray-300 mb-3">inbox</span>
          <p className="text-gray-500">{t("leads_no_results")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-3 py-4 bg-gray-50/50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {isAdmin && (
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  disabled={filteredLeads.length === 0}
                  className="w-4 h-4 accent-mosque cursor-pointer disabled:cursor-not-allowed"
                  title={t("leads_delete_selected")}
                />
              </div>
            )}
            <div className="col-span-2">{t("leads_table_name")}</div>
            <div className="col-span-2">{t("leads_table_email")}</div>
            <div className="col-span-2">{t("leads_table_type")}</div>
            <div className="col-span-1">{t("leads_table_date")}</div>
            <div className="col-span-2">{t("leads_table_status")}</div>
            <div className="col-span-2">Asignado</div>
            {!isAdmin && <div className="col-span-1" />}
          </div>

          {filteredLeads.map((lead) => {
            const colors = typeColors[lead.lead_type] || typeColors.contact;
            const isAssignedToCurrentUser = lead.assigned_to && currentUserId && lead.assigned_to === currentUserId;
            return (
              <div key={lead.id}>
                <div
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 px-3 py-4 border-b border-gray-100 hover:bg-background-light transition-colors items-center cursor-pointer"
                  onClick={() => { setSelectedLead(lead); loadThread(lead.id); }}
                >
                  {isAdmin && (
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 accent-mosque cursor-pointer"
                      />
                    </div>
                  )}
                  <div className="col-span-2">
                    <div className="text-sm font-medium text-nordic-dark truncate">{lead.name}</div>
                    <div className="text-xs text-gray-400 truncate flex items-center gap-1">
                      {(lead.images && lead.images.length > 0) && (
                        <span className="material-icons text-[12px] text-mosque" title={t("leads_images")}>photo_library</span>
                      )}
                      {lead.property_title || lead.message.slice(0, 50)}
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-gray-600 truncate hidden md:block">{lead.email}</div>
                  <div className="col-span-2 hidden md:block">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                      <span className="material-icons text-xs">{colors.icon}</span>
                      {typeLabel(lead.lead_type)}
                    </span>
                  </div>
                  <div className="col-span-1 text-sm text-gray-500 hidden md:block">
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
                  <div className="col-span-2 hidden md:block min-w-0">
                    {lead.assigned_to ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium max-w-full ${
                        isAssignedToCurrentUser
                          ? "bg-mosque/10 text-mosque"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        <span className="material-icons text-[12px] shrink-0">person</span>
                        <span className="truncate">
                          {isAssignedToCurrentUser
                            ? t("leads_taken_by_you")
                            : agentNames[lead.assigned_to] || t("leads_taken")}
                        </span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); assignLead(lead.id); }}
                        disabled={assigning === lead.id}
                        className="text-[10px] font-medium text-mosque hover:text-mosque/80 transition-colors whitespace-nowrap"
                      >
                        {assigning === lead.id ? "..." : t("leads_take")}
                      </button>
                    )}
                  </div>
                  {!isAdmin && <div className="col-span-1 hidden md:block" />}
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 overflow-y-auto max-h-[80vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-nordic-dark">{selectedLead.name}</h3>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title={t("leads_delete_chat")}
                  >
                    <span className="material-icons text-lg">delete</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedLead(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-nordic-dark hover:bg-gray-100 transition-colors"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
            </div>

            {showDeleteConfirm && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 mb-3">{t("leads_delete_chat_confirm")}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteChat(selectedLead)}
                    disabled={deleting}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting ? t("leads_deleting") : t("leads_delete_chat_btn")}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            )}

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
                        : agentNames[selectedLead.assigned_to] || t("leads_taken_by_other")
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

              {/* Lead images gallery */}
              {selectedLead.images && selectedLead.images.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">
                    {t("leads_images")} ({selectedLead.images.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedLead.images.map((url, idx) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-square rounded-lg overflow-hidden group bg-gray-100"
                      >
                        <img
                          src={url}
                          alt={`${selectedLead.name} - imagen ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="material-icons text-white">open_in_new</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation thread */}
              {thread.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">{t("leads_thread")}</p>
                  <div className="space-y-2 bg-background-light/50 rounded-lg p-3 max-h-64 overflow-y-auto">
                    {threadLoading && <p className="text-xs text-gray-400">{t("leads_loading_thread")}</p>}
                    {thread.map((m) => {
                      const isUser = m.sender_type === "user";
                      return (
                        <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                            isUser
                              ? "bg-mosque text-white rounded-tr-sm"
                              : "bg-white border border-gray-200 rounded-tl-sm"
                          }`}>
                            {m.body && <p className="text-sm whitespace-pre-wrap">{m.body}</p>}
                            {m.images && m.images.length > 0 && (
                              <div className="grid grid-cols-3 gap-1.5 mt-2">
                                {m.images.map((url, i) => (
                                  <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                                    <img src={url} alt={`${i + 1}`} className="w-full h-16 object-cover rounded-lg" />
                                  </a>
                                ))}
                              </div>
                            )}
                            <div className={`text-[10px] mt-1 ${isUser ? "text-white/70" : "text-gray-400"}`}>
                              {new Date(m.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={threadEndRef} />
                  </div>
                </div>
              )}

              {replyEmailError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <span className="material-icons text-lg shrink-0 mt-0.5 text-red-500">error_outline</span>
                  <div>
                    <p className="font-medium">{t("leads_email_warning")}</p>
                    <p className="text-xs text-red-600/80 mt-0.5">{replyEmailError}</p>
                  </div>
                </div>
              )}

              {/* Reply */}
              <div className="border border-gray-100 rounded-lg p-3">
                {!replyExpanded ? (
                  <button
                    onClick={() => setReplyExpanded(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-mosque text-mosque text-xs font-medium hover:bg-mosque/5 transition-colors"
                  >
                    <span className="material-icons text-sm">reply</span>
                    {t("leads_reply")}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={t("leads_reply_placeholder")}
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReply(selectedLead)}
                        disabled={replySending || !replyText.trim()}
                        className="flex-1 py-2 rounded-lg bg-mosque text-white text-xs font-medium hover:bg-mosque/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {replySending && <span className="material-icons text-sm animate-spin">refresh</span>}
                        {t("leads_reply_send")}
                      </button>
                      <button
                        onClick={() => { setReplyExpanded(false); setReplyText(""); }}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
                      >
                        {t("cancel")}
                      </button>
                    </div>
                  </div>
                )}
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

              {selectedLead.status !== "closed" && (
                <button
                  onClick={() => updateStatus(selectedLead.id, "closed")}
                  disabled={updating === selectedLead.id}
                  className="w-full mt-3 py-2.5 rounded-lg bg-nordic-dark text-white text-sm font-medium hover:bg-nordic-dark/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating === selectedLead.id ? (
                    <span className="material-icons text-sm animate-spin">refresh</span>
                  ) : (
                    <span className="material-icons text-sm">check_circle</span>
                  )}
                  {updating === selectedLead.id ? "..." : t("leads_close")}
                </button>
              )}
              {selectedLead.status === "closed" && (
                <div className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-100 text-gray-500 text-sm font-medium">
                  <span className="material-icons text-sm">check_circle</span>
                  {t("leads_closed_title")}
                </div>
              )}

              <button
                onClick={() => setSelectedLead(null)}
                className="w-full mt-3 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-icons text-sm">close</span>
                {t("leads_close_chat")}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
