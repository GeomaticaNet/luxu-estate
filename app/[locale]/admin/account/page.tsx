"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { optimizeImage } from "@/lib/image-optimize";

export default function AdminAccountPage() {
  const t = useTranslations("Settings");
  const ta = useTranslations("Admin");
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<{
    id: string;
    email?: string | null;
    created_at?: string;
    user_metadata?: { [key: string]: unknown };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // Avatar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Password
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); };

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        setUser(u);
        setName(u.user_metadata?.full_name || "");
        setAvatarUrl(u.user_metadata?.avatar_url || null);
      }
      setLoading(false);
    })();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setError("");
    const { blob, extension } = await optimizeImage(file, { maxDimension: 512 });
    const filePath = `${user.id}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, blob, { upsert: true, contentType: `image/${extension}` });
    if (uploadError) { setError(uploadError.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl, custom_profile: true } });
    if (updateError) { setError(updateError.message); setUploading(false); return; }
    setAvatarUrl(publicUrl);
    setUploading(false);
    showSuccess(t("avatar_updated"));
  };

  const handleSaveName = async () => {
    setSaving(true); setError("");
    const { error: e } = await supabase.auth.updateUser({ data: { full_name: name, custom_profile: true } });
    if (e) { setError(e.message); setSaving(false); return; }
    setSaving(false); showSuccess(t("saved"));
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmNewPassword) { setError("Passwords do not match"); return; }
    setUpdatingPassword(true); setError("");
    const { error: e } = await supabase.auth.updateUser({ password: newPassword });
    if (e) { setError(e.message); setUpdatingPassword(false); return; }
    setNewPassword(""); setConfirmNewPassword(""); setUpdatingPassword(false);
    showSuccess(t("password_updated"));
  };

  if (loading) {
    return <main className="max-w-2xl mx-auto px-4 py-12 flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mosque" />
    </main>;
  }

  if (!user) {
    return <main className="max-w-2xl mx-auto px-4 py-12">
      <p className="text-nordic-dark/60">{t("login_required")}</p>
    </main>;
  }

function meta(full_name: unknown): string | undefined {
      return typeof full_name === "string" ? full_name : undefined;
    }

    return (
      <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-nordic-dark">{ta("account")}</h1>
        <p className="text-gray-500 mt-1">{t("account_info")}</p>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>}
      {success && <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">{success}</div>}

      {/* Avatar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-1.5">
        <div className="p-6 flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden ring-2 ring-mosque/20">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-icons text-3xl text-nordic-dark/30">person</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-mosque text-white flex items-center justify-center shadow-lg hover:bg-mosque/90 transition-colors"
            >
              <span className="material-icons text-sm">camera_alt</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div>
            <p className="text-sm font-semibold text-nordic-dark">{meta(user.user_metadata?.full_name) || "User"}</p>
            <p className="text-xs text-nordic-dark/50">{user.email}</p>
            {uploading && <p className="text-xs text-mosque mt-1">{t("uploading")}</p>}
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-1.5">
        <div className="p-6 border-b border-gray-100">
          <label className="block text-sm font-medium text-nordic-dark mb-1.5">{t("name")}</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
            />
            <button
              type="button"
              onClick={handleSaveName}
              disabled={saving || name === (meta(user.user_metadata?.full_name) || "")}
              className="px-5 py-2.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <span className="material-icons text-sm animate-spin">refresh</span>}
              {saving ? t("saving") : t("save")}
            </button>
          </div>
        </div>

        {/* Email */}
        <div className="p-6 border-b border-gray-100">
          <label className="block text-sm font-medium text-nordic-dark mb-1.5">{t("email")}</label>
          <input
            type="email"
            value={user.email || ""}
            disabled
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-nordic-dark/60 text-sm cursor-not-allowed"
          />
        </div>

        {/* Password */}
        <div className="p-6 space-y-3">
          <h2 className="text-sm font-bold text-nordic-dark uppercase tracking-wider">{t("password")}</h2>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("new_password")}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-nordic-dark/40 hover:text-nordic-dark transition-colors"
            >
              <span className="material-icons text-sm">{showPassword ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder={t("confirm_password")}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={updatingPassword || !newPassword || newPassword !== confirmNewPassword || newPassword.length < 6}
            className="px-5 py-2.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updatingPassword && <span className="material-icons text-sm animate-spin">refresh</span>}
            {t("update_password")}
          </button>
        </div>
      </div>
    </main>
  );
}