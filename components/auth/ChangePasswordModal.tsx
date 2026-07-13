"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Portal } from "@/components/ui/Portal";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const supabase = createClient();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/link-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to set password");
      }

      setSuccess("Password updated successfully");
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-nordic-dark">Change password</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-nordic-dark hover:bg-gray-100 transition-colors"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

        <p className="text-sm text-nordic-dark/70 mb-4">
          Set a password for your account so you can also sign in with email and password.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-nordic-dark mb-1">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nordic-dark mb-1">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <span className="material-icons text-sm animate-spin">refresh</span>}
            Update password
          </button>
        </form>
      </div>
    </div>
    </Portal>
  );
}
