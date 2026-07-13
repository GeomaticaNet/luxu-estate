"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { BackButton } from "@/components/ui/BackButton";
import { BackToTop } from "@/components/ui/BackToTop";

function GithubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.945 11a9 9 0 1 1 -3.284 -5.997l-2.655 2.392a5.5 5.5 0 1 0 2.119 6.605h-4.125v-3h7.945" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" />
      <path d="M3 7l9 6l9 -6" />
    </svg>
  );
}

function ConfirmModal({ title, message, confirmText, cancelText, deletingText, onConfirm, onCancel, loading }: {
  title: string; message: string; confirmText: string; cancelText: string; deletingText: string;
  onConfirm: () => void; onCancel: () => void; loading?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <span className="material-icons text-red-600">delete_forever</span>
          </div>
          <h3 className="text-lg font-bold text-nordic-dark">{title}</h3>
        </div>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-nordic-dark hover:bg-gray-50 transition-colors">{cancelText}</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
            {loading ? deletingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
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

  // Notifications
  const [notif, setNotif] = useState({ email_notifications: true, marketing_emails: false, property_updates: true });
  const [savingNotif, setSavingNotif] = useState(false);

  // Delete account
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); };

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        setUser(u);
        setName(u.user_metadata?.full_name || "");
        setAvatarUrl(u.user_metadata?.avatar_url || null);
        const { data: prefs } = await supabase.from("user_notification_preferences").select("*").eq("user_id", u.id).single();
        if (prefs) setNotif(prefs);
      }
      setLoading(false);
    })();
  }, []);

  // -- Avatar --
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setError("");
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) { setError(uploadError.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    if (updateError) { setError(updateError.message); setUploading(false); return; }
    setAvatarUrl(publicUrl);
    setUploading(false);
    showSuccess(t("avatar_updated"));
  };

  // -- Profile --
  const handleSaveName = async () => {
    setSaving(true); setError("");
    const { error: e } = await supabase.auth.updateUser({ data: { full_name: name } });
    if (e) { setError(e.message); setSaving(false); return; }
    setSaving(false); showSuccess(t("saved"));
  };

  // -- Password --
  const handleChangePassword = async () => {
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmNewPassword) { setError("Passwords do not match"); return; }
    setUpdatingPassword(true); setError("");
    const { error: e } = await supabase.auth.updateUser({ password: newPassword });
    if (e) { setError(e.message); setUpdatingPassword(false); return; }
    setNewPassword(""); setConfirmNewPassword(""); setUpdatingPassword(false);
    showSuccess(t("password_updated"));
  };

  // -- Language --
  const handleLanguageChange = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale });
  };

  // -- Notifications --
  const handleSaveNotif = async () => {
    setSavingNotif(true); setError("");
    const { error: e } = await supabase.from("user_notification_preferences").upsert({ user_id: user.id, ...notif, updated_at: new Date().toISOString() });
    if (e) { setError(e.message); setSavingNotif(false); return; }
    setSavingNotif(false); showSuccess(t("notif_saved"));
  };

  // -- Delete account --
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/auth/delete-account", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return <main className="flex-1 flex items-center justify-center bg-background-light">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mosque" />
    </main>;
  }

  if (!user) {
    return <main className="flex-1 flex items-center justify-center bg-background-light">
      <div className="text-center"><p className="text-nordic-dark/60 mb-4">{t("login_required")}</p>
      <a href="/login" className="text-mosque hover:underline font-medium">{t("login_required")}</a></div>
    </main>;
  }

  const providers: string[] = user.app_metadata?.providers || [];

  return (
    <main className="flex-1 bg-background-light min-h-screen">
      {showDelete && (
        <ConfirmModal
          title={t("delete_account_title")}
          message={t("delete_account_confirm")}
          confirmText={t("delete_account_button")}
          cancelText={t("cancel")}
          deletingText={t("deleting")}
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDelete(false)}
          loading={deleting}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-12">
        <BackButton />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-nordic-dark">{t("title")}</h1>
          <p className="text-nordic-dark/60 mt-1">{t("account_info")}</p>
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
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-mosque text-white flex items-center justify-center shadow-lg hover:bg-mosque/90 transition-colors"
              >
                <span className="material-icons text-sm">camera_alt</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div>
              <p className="text-sm font-semibold text-nordic-dark">{user.user_metadata?.full_name || "User"}</p>
              <p className="text-xs text-nordic-dark/50">{user.email}</p>
              {uploading && <p className="text-xs text-mosque mt-1">{t("uploading")}</p>}
            </div>
          </div>
        </div>

        {/* Account info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-1.5">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-nordic-dark uppercase tracking-wider">{t("account_info")}</h2>
          </div>

          {/* Name */}
          <div className="p-6 border-b border-gray-100">
            <label className="block text-sm font-medium text-nordic-dark mb-1.5">{t("name")}</label>
            <div className="flex gap-3">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm" />
              <button onClick={handleSaveName} disabled={saving || name === (user.user_metadata?.full_name || "")}
                className="px-5 py-2.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {saving && <span className="material-icons text-sm animate-spin">refresh</span>}
                {saving ? t("saving") : t("save")}
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="p-6 border-b border-gray-100">
            <label className="block text-sm font-medium text-nordic-dark mb-1.5">{t("email")}</label>
            <input type="email" value={user.email || ""} disabled
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-nordic-dark/60 text-sm cursor-not-allowed" />
          </div>

          {/* Member since */}
          <div className="p-6 border-b border-gray-100">
            <label className="block text-sm font-medium text-nordic-dark mb-1.5">{t("member_since")}</label>
            <p className="text-sm text-nordic-dark/70">
              {new Date(user.created_at).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Linked accounts */}
          <div className="p-6">
            <label className="block text-sm font-medium text-nordic-dark mb-3">{t("linked_accounts")}</label>
            <div className="flex flex-wrap gap-2">
              {providers.length === 0 ? (
                <span className="text-xs text-nordic-dark/40">{t("no_linked_accounts")}</span>
              ) : providers.map((p) => (
                <span key={p} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-hint-of-green/50 text-mosque text-xs font-medium">
                  {p === "github" && <GithubIcon />}
                  {p === "google" && <GoogleIcon />}
                  {p === "email" && <EmailIcon />}
                  {p !== "github" && p !== "google" && p !== "email" && <span className="material-icons text-sm">link</span>}
                  {p === "google" ? "Google" : p.charAt(0).toUpperCase() + p.slice(1)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-1.5">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-nordic-dark uppercase tracking-wider">{t("language")}</h2>
          </div>
          <div className="p-6">
            <div className="flex gap-3">
              {["es", "en", "pt"].map((l) => (
                <button key={l} onClick={() => handleLanguageChange(l)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    locale === l
                      ? "bg-mosque text-white shadow-sm"
                      : "border border-gray-200 text-nordic-dark hover:bg-gray-50"
                  }`}>
                  {l === "es" ? "Español" : l === "en" ? "English" : "Português"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-1.5">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-nordic-dark uppercase tracking-wider">{t("password")}</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("new_password")}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-nordic-dark/40 hover:text-nordic-dark transition-colors">
                <span className="material-icons text-sm">{showPassword ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder={t("confirm_password")}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm" />
            </div>
            <button onClick={handleChangePassword}
              disabled={updatingPassword || !newPassword || newPassword !== confirmNewPassword || newPassword.length < 6}
              className="px-5 py-2.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {updatingPassword && <span className="material-icons text-sm animate-spin">refresh</span>}
              {t("update_password")}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-1.5">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-nordic-dark uppercase tracking-wider">{t("notifications")}</h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { key: "email_notifications", label: t("notif_email") },
              { key: "marketing_emails", label: t("notif_marketing") },
              { key: "property_updates", label: t("notif_property_updates") },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-nordic-dark">{label}</span>
                <div className="relative">
                  <input type="checkbox" checked={(notif as any)[key]} onChange={() => setNotif({ ...notif, [key]: !(notif as any)[key] })}
                    className="sr-only peer" />
                  <div className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-mosque transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-4"></div>
                </div>
              </label>
            ))}
            <button onClick={handleSaveNotif} disabled={savingNotif}
              className="mt-2 px-5 py-2.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-colors disabled:opacity-50 flex items-center gap-2">
              {savingNotif && <span className="material-icons text-sm animate-spin">refresh</span>}
              {t("save")}
            </button>
          </div>
        </div>

        {/* Delete account */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden mb-1.5">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50/50">
            <h2 className="text-sm font-bold text-red-700 uppercase tracking-wider">{t("danger_zone")}</h2>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-nordic-dark">{t("delete_account")}</p>
              <p className="text-xs text-nordic-dark/50">{t("delete_account_desc")}</p>
            </div>
            <button onClick={() => setShowDelete(true)}
              className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
              {t("delete_account_button")}
            </button>
          </div>
        </div>
      </div>
      {/* Back to top */}
      <div className="flex justify-center pt-2 pb-4">
        <BackToTop visible={showScrollTop} />
      </div>
    </main>
  );
}
