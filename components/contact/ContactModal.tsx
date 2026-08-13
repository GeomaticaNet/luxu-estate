"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Portal } from "@/components/ui/Portal";
import { DatePicker } from "@/components/ui/DatePicker";
import { createClient } from "@/lib/supabase/client";
import { optimizeImage } from "@/lib/image-optimize";

const MAX_IMAGES = 5;

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
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const prevPreviewsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setPreferredDate("");
      setImages([]);
      setImageError("");
      setSending(false);
      setSent(false);
      setError("");
    }
  }, [isOpen]);

  // Keep previews in sync with images, revoking old object URLs
  useEffect(() => {
    const newPreviews = images.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
    return () => {
      prevPreviewsRef.current.forEach((url) => URL.revokeObjectURL(url));
      prevPreviewsRef.current = newPreviews;
    };
  }, [images]);

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

  const addImages = (files: FileList | File[]) => {
    setImageError("");
    const incoming = Array.from(files);

    for (const file of incoming) {
      if (!file.type.startsWith("image/")) {
        setImageError(t("image_invalid_type"));
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setImageError(t("image_too_large"));
        continue;
      }
    }

    if (incoming.some((f) => f.size > 10 * 1024 * 1024)) return;
    if (incoming.some((f) => !f.type.startsWith("image/"))) return;

    const available = MAX_IMAGES - images.length;
    if (available <= 0) {
      setImageError(t("image_max_reached", { max: MAX_IMAGES }));
      return;
    }
    if (incoming.length > available) {
      setImageError(t("image_max_limit", { max: MAX_IMAGES }));
    }
    setImages((prev) => [...prev, ...incoming.slice(0, available)]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setDragging(false);
    if (e.dataTransfer.files?.length) addImages(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageError("");
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setImageError("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Name, email and message are required");
      return;
    }

    setSending(true);

    try {
      // Upload images, each optimized (WebP) and resized before uploading
      const supabase = createClient();
      const uploadedUrls: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const { blob, extension } = await optimizeImage(images[i], { maxDimension: 1600, quality: 0.8 });
        const fileName = `leads-${Date.now()}-${i}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("leads")
          .upload(fileName, blob, { contentType: blob.type || `image/${extension}` });
        if (uploadError) {
          console.error("Lead image upload error:", uploadError);
          continue;
        }
        const { data: { publicUrl } } = supabase.storage.from("leads").getPublicUrl(fileName);
        if (publicUrl) uploadedUrls.push(publicUrl);
      }

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
          images: uploadedUrls,
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
    <Portal>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999] flex items-start md:items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-6 md:py-10"
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
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
                  <DatePicker
                    value={preferredDate}
                    onChange={setPreferredDate}
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

              {/* Photo upload (drag & drop) — only for selling requests */}
              {leadType === "sell" && (
                <div>
                  <label className="block text-sm font-medium text-nordic-dark mb-1">
                    {t("image_upload_title")} <span className="text-xs text-gray-400 font-normal">({images.length}/{MAX_IMAGES})</span>
                  </label>
                  <div
                    onDragEnter={(e) => { e.preventDefault(); dragCounterRef.current++; setDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current <= 0) { dragCounterRef.current = 0; setDragging(false); } }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      dragging
                        ? "border-mosque bg-hint-of-green/20"
                        : "border-gray-300 bg-gray-50/50 hover:border-mosque/50 hover:bg-hint-of-green/10"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.length) addImages(e.target.files);
                        e.target.value = "";
                      }}
                    />
                    <div className="flex flex-col items-center space-y-2 pointer-events-none">
                      <span className="material-icons text-3xl text-mosque">add_photo_alternate</span>
                      <p className="text-sm text-gray-500">{t("image_drop_hint")}</p>
                      <p className="text-xs text-gray-400">{t("image_max", { max: MAX_IMAGES })}</p>
                    </div>
                  </div>
                  {imageError && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
                </div>
              )}

              {leadType === "sell" && imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map((url, index) => (
                    <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                      <img src={url} alt={`${t("image_upload_title")} ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <span className="material-icons text-white text-lg">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

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
    </Portal>
  );
}
