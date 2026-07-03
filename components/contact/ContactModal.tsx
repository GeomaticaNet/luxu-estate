"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadType: "contact" | "visit" | "sell";
  propertyId?: string;
  propertyTitle?: string;
}

export function ContactModal({ isOpen, onClose, leadType, propertyId, propertyTitle }: ContactModalProps) {
  const t = useTranslations("Contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setPreferredDate("");
      setSending(false);
      setSent(false);
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && leadType === "contact" && propertyTitle && !message) {
      setMessage(`${t("contact_message_placeholder")}\n\n${propertyTitle}`);
    }
  }, [isOpen, leadType, propertyTitle, message, t]);

  const title =
    leadType === "sell"
      ? t("sell_title")
      : leadType === "visit"
        ? t("schedule_visit_title")
        : t("contact_agent_title");

  const messagePlaceholder =
    leadType === "sell"
      ? t("sell_message_placeholder")
      : leadType === "visit"
        ? t("visit_message_placeholder")
        : t("contact_message_placeholder");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Name, email and message are required");
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          message: message.trim(),
          property_id: propertyId || null,
          property_title: propertyTitle || null,
          lead_type: leadType,
          preferred_date: preferredDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        {sent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-3xl text-green-600">check_circle</span>
            </div>
            <h3 className="text-lg font-bold text-nordic-dark mb-2">{t("success_message")}</h3>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-colors"
            >
              {t("close")}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-nordic-dark">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-nordic-dark hover:bg-gray-100 transition-colors"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nordic-dark mb-1">
                  {t("your_name")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-dark mb-1">
                  {t("your_email")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-dark mb-1">
                  {t("your_phone")}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+54 11 5555-5555"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
                />
              </div>

              {leadType === "visit" && (
                <div>
                  <label className="block text-sm font-medium text-nordic-dark mb-1">
                    {t("preferred_date")}
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-nordic-dark mb-1">
                  {t("message")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder={messagePlaceholder}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full py-2.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending && <span className="material-icons text-sm animate-spin">refresh</span>}
                {sending ? t("sending") : t("send")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
