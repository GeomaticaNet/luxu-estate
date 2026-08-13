"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { optimizeImage } from "@/lib/image-optimize";
import { BackButton } from "@/components/ui/BackButton";
import { useRouter } from "next/navigation";

const MAX_IMAGES = 5;

interface Lead {
  id: string;
  name: string;
  email: string;
  message: string;
  property_title: string | null;
  lead_type: string;
  assigned_to: string | null;
  created_at: string;
  images?: string[];
}

interface LeadMessage {
  id: string;
  lead_id: string;
  sender_type: "user" | "agent" | "system";
  sender_id: string | null;
  body: string;
  images?: string[];
  is_read: boolean;
  created_at: string;
}

const typeLabels: Record<string, string> = {
  sell: "Venta",
  contact: "Contacto",
  visit: "Visita",
};

export default function UserMessagesPage() {
  const t = useTranslations("Messages");
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, LeadMessage[]>>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [agentNames, setAgentNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setNotLoggedIn(true);
      setLoading(false);
      return;
    }
    setNotLoggedIn(false);
    const res = await fetch("/api/leads/my");
    if (res.ok) {
      const data = await res.json();
      setLeads(data.leads || []);
      setMessagesMap(data.messages || {});
      setUnreadCount(data.unreadCount || 0);
      setAgentNames(data.agentNames || {});
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  // Live updates: new message arrives while viewing
  useEffect(() => {
    const channel = supabase
      .channel("user-messages-thread")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lead_messages" },
        (payload) => {
          const msg = payload.new as LeadMessage;
          setMessagesMap((prev) => {
            const list = prev[msg.lead_id] ? [...prev[msg.lead_id]] : [];
            if (list.some((m) => m.id === msg.id)) return prev;
            list.push(msg);
            return { ...prev, [msg.lead_id]: list };
          });
          if (msg.sender_type === "agent") {
            setUnreadCount((c) => c + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Scroll to bottom when conversation changes or a message is sent/received
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [selected, messagesMap]);

  const openConversation = (lead: Lead) => {
    setSelected(lead);
    setReplyText("");
    setImages([]);
    setPreviews([]);
    setError("");
    // Mark agent messages as read
    const msgs = messagesMap[lead.id] || [];
    const unread = msgs.filter((m) => m.sender_type === "agent" && !m.is_read);
    if (unread.length > 0) {
      supabase
        .from("lead_messages")
        .update({ is_read: true })
        .eq("lead_id", lead.id)
        .eq("sender_type", "agent")
        .eq("is_read", false)
        .then(({ error }) => {
          if (!error) {
            setMessagesMap((prev) => ({
              ...prev,
              [lead.id]: (prev[lead.id] || []).map((m) => (m.sender_type === "agent" ? { ...m, is_read: true } : m)),
            }));
            setUnreadCount((c) => Math.max(0, c - unread.length));
          }
        });
    }
  };

  const addImages = (files: FileList | File[]) => {
    setError("");
    const incoming = Array.from(files).filter((f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024);
    if (incoming.length !== Array.from(files).length) {
      setError(t("image_error"));
    }
    const available = MAX_IMAGES - images.length;
    setImages((prev) => [...prev, ...incoming.slice(0, available)]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteConversation = async () => {
    if (!selected) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/leads/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: selected.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      setLeads((prev) => prev.filter((l) => l.id !== selected.id));
      setSelected(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async () => {    if (!selected) return;
    if (!replyText.trim() && images.length === 0) return;
    setSending(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const { blob, extension } = await optimizeImage(images[i], { maxDimension: 1600, quality: 0.8 });
        const fileName = `user-reply-${Date.now()}-${i}.${extension}`;
        const { error: uploadError } = await supabase.storage.from("leads").upload(fileName, blob, { contentType: blob.type || `image/${extension}` });
        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }
        const { data: { publicUrl } } = supabase.storage.from("leads").getPublicUrl(fileName);
        if (publicUrl) uploadedUrls.push(publicUrl);
      }

      const res = await fetch("/api/leads/user-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: selected.id, body: replyText.trim(), images: uploadedUrls }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }

      setReplyText("");
      setImages([]);
      setPreviews([]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const formattedDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { day: "2-digit", month: "short" });
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mosque" />
      </main>
    );
  }

  if (notLoggedIn) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <span className="material-icons text-6xl text-gray-300 mb-4">chat_bubble_outline</span>
          <h2 className="text-xl font-semibold text-nordic-dark mb-2">{t("login_required")}</h2>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-6 py-2.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-colors"
          >
            {t("login_btn")}
          </button>
        </div>
      </main>
    );
  }

  const activeMessages = selected ? messagesMap[selected.id] || [] : [];

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <BackButton />
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-nordic-dark">{t("title")}</h1>
        <p className="text-gray-500 mt-0.5">{t("subtitle")}</p>
        {unreadCount > 0 && (
          <span className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            {unreadCount} {unreadCount === 1 ? t("unread_one") : t("unread_many")}
          </span>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <span className="material-icons text-6xl text-gray-300 mb-4">inbox</span>
          <h2 className="text-xl font-semibold text-nordic-dark mb-2">{t("empty_title")}</h2>
          <p className="text-gray-500 max-w-md mx-auto">{t("empty_desc")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Conversation list */}
          <div className="md:col-span-1 bg-white rounded-2xl border border-gray-200 overflow-hidden max-h-[58vh] overflow-y-auto min-w-0">
            {leads.map((lead) => {
              const msgs = messagesMap[lead.id] || [];
              const lastMsg = msgs[msgs.length - 1];
              const unread = msgs.filter((m) => m.sender_type === "agent" && !m.is_read).length;
              return (
                <button
                  key={lead.id}
                  onClick={() => openConversation(lead)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-background-light transition-colors flex items-start gap-3 ${
                    selected?.id === lead.id ? "bg-hint-of-green/30" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-mosque/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-icons text-mosque text-lg">support_agent</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-nordic-dark truncate">
                        {lead.assigned_to ? agentNames[lead.assigned_to] || t("agent_unassigned") : t("agent_unassigned")}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{lastMsg ? formattedDate(lastMsg.created_at) : formattedDate(lead.created_at)}</span>
                    </div>
                    <p className="text-[11px] text-mosque font-medium truncate mt-0.5">
                      {lead.property_title || typeLabels[lead.lead_type] || "Mensaje"}
                      {lead.property_title && lead.lead_type === "sell" && " · " + t("sell_lead")}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {lastMsg ? lastMsg.body || "📷 Imágenes" : lead.message.slice(0, 60)}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1.5">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Conversation thread */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[58vh] min-w-0">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center py-20 text-gray-400">
                <div className="text-center">
                  <span className="material-icons text-5xl mb-3">chat_bubble_outline</span>
                  <p>{t("select_conversation")}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                  <div className="w-9 h-9 rounded-full bg-mosque/10 flex items-center justify-center">
                    <span className="material-icons text-mosque text-lg">support_agent</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-nordic-dark">
                      {selected.assigned_to ? agentNames[selected.assigned_to] || t("agent_unassigned") : t("agent_unassigned")}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {selected.property_title || typeLabels[selected.lead_type] || ""}
                      {selected.property_title && selected.lead_type === "sell" && " · " + t("sell_lead")}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                    title={t("delete_chat")}
                  >
                    <span className="material-icons text-lg">delete</span>
                  </button>
                </div>

                {showDeleteConfirm && (
                  <div className="px-5 py-3 bg-red-50 border-b border-red-100">
                    <p className="text-sm text-red-700 mb-3">{t("delete_chat_confirm")}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={deleteConversation}
                        disabled={deleting}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {deleting ? "..." : t("delete")}
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

                {/* Messages */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 bg-background-light/50 min-w-0">
                  {/* Original lead message (sent by the client) */}
                  <div className="flex justify-end">
                    <div className="max-w-[75%] bg-mosque text-white rounded-2xl rounded-tr-sm px-3 py-2 break-words">
                      <p className="text-xs text-white/70 mb-1">{t("initial_message")}</p>
                      <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                      {selected.images && selected.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-1.5 mt-2">
                          {selected.images.map((url, i) => (
                            <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                              <img src={url} alt={`${i + 1}`} className="w-full h-20 object-cover rounded-lg" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {activeMessages.map((msg) => {
                    const isUser = msg.sender_type === "user";
                    return (
                      <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-3 py-2 break-words ${
                          isUser
                            ? "bg-mosque text-white rounded-tr-sm"
                            : "bg-white border border-gray-200 rounded-tl-sm"
                        }`}>
                          {msg.body && <p className="text-sm whitespace-pre-wrap">{msg.body}</p>}
                          {msg.images && msg.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-1.5 mt-2">
                              {msg.images.map((url, i) => (
                                <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                                  <img src={url} alt={`${i + 1}`} className="w-full h-20 object-cover rounded-lg" />
                                </a>
                              ))}
                            </div>
                          )}
                          <div className={`text-[10px] mt-1 ${isUser ? "text-white/70" : "text-gray-400"}`}>
                            {formattedDate(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply box */}
                <div className="border-t border-gray-100 p-3 space-y-2">
                  {previews.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {previews.map((url, i) => (
                        <div key={url} className="relative w-14 h-14 rounded-lg overflow-hidden group">
                          <img src={url} alt={`${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                          >
                            <span className="material-icons text-white text-sm">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-full text-mosque hover:bg-hint-of-green/30 transition-colors flex-shrink-0"
                      title={t("attach")}
                    >
                      <span className="material-icons">add_photo_alternate</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          addImages(e.target.files);
                          setPreviews(Array.from(e.target.files).map((f) => URL.createObjectURL(f)).slice(0, MAX_IMAGES - images.length));
                        }
                        e.target.value = "";
                      }}
                    />
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      placeholder={t("reply_placeholder")}
                      rows={1}
                      className="flex-1 min-w-0 px-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm resize-none"
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={sending || (!replyText.trim() && images.length === 0)}
                      className="w-10 h-10 rounded-full bg-mosque text-white hover:bg-mosque/90 transition-colors disabled:opacity-50 flex-shrink-0 flex items-center justify-center"
                    >
                      {sending ? <span className="material-icons animate-spin">refresh</span> : <span className="material-icons">send</span>}
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-500 px-2">{error}</p>}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
