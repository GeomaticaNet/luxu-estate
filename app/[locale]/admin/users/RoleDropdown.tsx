"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { updateUserRole, toggleUserActive, softDeleteUser } from "./actions";

interface RoleDropdownProps {
  userId: string;
  roles: string[];
  currentUserId: string | null;
  active: boolean;
  isFirst: boolean;
  onDeleted?: (userId: string) => void;
}

export default function RoleDropdown({ userId, roles: initialRoles, currentUserId, active, isFirst, onDeleted }: RoleDropdownProps) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [roles, setRoles] = useState<string[]>(initialRoles);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isCurrentUser = userId === currentUserId;
  const isAdmin = roles.includes('admin');
  const isAgent = roles.includes('agent');

  async function toggleRole(role: string) {
    // Prevent removing your own admin role (would lock yourself out)
    if (isCurrentUser && role === 'admin' && roles.includes('admin')) {
      setErrorMsg(t("cannot_remove_own_admin"));
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    const next = roles.includes(role)
      ? roles.filter((r) => r !== role)
      : [...roles, role];
    setUpdating(true);
    setIsOpen(false);
    setErrorMsg(null);
    const res = await updateUserRole(userId, next);
    if (res.success) {
      setRoles(next);
    } else if (res.error) {
      setErrorMsg(res.error);
      setTimeout(() => setErrorMsg(null), 4000);
    }
    setUpdating(false);
  }

  async function handleToggleActive() {
    if (isCurrentUser) return;
    setUpdating(true);
    setIsOpen(false);
    setErrorMsg(null);
    const res = await toggleUserActive(userId, !active);
    if (res && res.error) {
      setErrorMsg(res.error);
      setTimeout(() => setErrorMsg(null), 4000);
    }
    setUpdating(false);
  }

  async function handleDelete() {
    if (isCurrentUser) return;
    setUpdating(true);
    setErrorMsg(null);
    const res = await softDeleteUser(userId);
    if (res && res.error) {
      setErrorMsg(res.error);
      setTimeout(() => setErrorMsg(null), 4000);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(false);
      onDeleted?.(userId);
      router.refresh();
    }
    setUpdating(false);
  }

  return (
    <div className="col-span-12 md:col-span-2 w-full flex justify-end relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={updating}
        className={`inline-flex items-center px-4 py-2 border text-xs font-medium rounded-lg transition-colors w-full md:w-auto justify-center ${
          isOpen
            ? "bg-mosque text-white shadow-md"
            : isFirst 
              ? "border-nordic-dark/10 bg-white text-nordic-dark hover:bg-nordic-dark hover:text-white"
              : "border-gray-200 bg-transparent text-nordic-dark/70 hover:border-nordic-dark hover:text-nordic-dark"
        }`}
      >
        {updating ? t("saving") : t("change_role")}
        <span className="material-icons text-[16px] ml-2">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {errorMsg && (
        <div className="absolute top-full right-0 mt-2 w-64 rounded-lg bg-red-600 text-white text-xs font-medium px-4 py-3 shadow-xl z-50">
          {errorMsg}
        </div>
      )}

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 rounded-lg shadow-xl bg-mosque ring-1 ring-black ring-opacity-5 overflow-hidden z-50 origin-top-right">
          <div className="px-4 py-3 text-[10px] uppercase tracking-wider text-white/50 border-b border-white/10">
            {isAdmin ? t("administrator_role") : ""} {isAgent ? t("agent_role") : ""}
            {!isAdmin && !isAgent ? t("user_role") : ""}
          </div>
          <div className="py-1" role="menu">
            {/* Admin toggle */}
            <button
              onClick={() => toggleRole('admin')}
              disabled={isCurrentUser && isAdmin}
              className={`group flex items-center w-full px-4 py-3 text-xs transition-colors ${
                isCurrentUser && isAdmin
                  ? 'text-white/30 cursor-not-allowed'
                  : isAdmin
                    ? 'text-white hover:bg-white/10 hover:text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={`material-icons text-sm mr-3 ${isAdmin ? 'text-white' : 'text-white/50'}`}>shield</span>
              <span className="flex-1 text-left">
                {isCurrentUser && isAdmin ? t("cannot_remove_own_admin") : isAdmin ? t("already_admin") : t("promote_to_admin")}
              </span>
              <span className={`material-icons text-base ${isAdmin ? 'text-white' : 'text-white/30'}`}>
                {isAdmin ? 'check_box' : 'check_box_outline_blank'}
              </span>
            </button>

            {/* Agent toggle */}
            <button
              onClick={() => toggleRole('agent')}
              className={`group flex items-center w-full px-4 py-3 text-xs transition-colors ${
                isAgent
                  ? 'text-white hover:bg-white/10 hover:text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={`material-icons text-sm mr-3 ${isAgent ? 'text-white' : 'text-white/50'}`}>badge</span>
              <span className="flex-1 text-left">
                {isAgent ? t("already_agent") : t("promote_to_agent")}
              </span>
              <span className={`material-icons text-base ${isAgent ? 'text-white' : 'text-white/30'}`}>
                {isAgent ? 'check_box' : 'check_box_outline_blank'}
              </span>
            </button>

            <div className="border-t border-white/10 my-1"></div>

            {/* Suspend/Reactivate */}
            <button
              onClick={handleToggleActive}
              disabled={isCurrentUser || updating}
              className={`group flex items-center w-full px-4 py-3 text-xs transition-colors ${
                isCurrentUser 
                  ? 'text-red-200/40 cursor-not-allowed' 
                  : active
                    ? 'text-red-200 hover:bg-red-500/20 hover:text-red-100'
                    : 'text-green-200 hover:bg-green-500/20 hover:text-green-100'
              }`}
            >
              <span className={`material-icons text-sm mr-3 ${isCurrentUser ? 'text-red-300/40' : active ? 'text-red-300' : 'text-green-300'}`}>
                {active ? 'block' : 'check_circle'}
              </span>
              {isCurrentUser ? t("cannot_suspend_self") : active ? t("suspend_user") : t("reactivate_user")}
            </button>

            <div className="border-t border-white/10 my-1"></div>

            {/* Delete (soft delete) */}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={isCurrentUser || updating}
                className={`group flex items-center w-full px-4 py-3 text-xs transition-colors ${
                  isCurrentUser
                    ? 'text-red-200/40 cursor-not-allowed'
                    : 'text-red-200 hover:bg-red-500/20 hover:text-red-100'
                }`}
              >
                <span className={`material-icons text-sm mr-3 ${isCurrentUser ? 'text-red-300/40' : 'text-red-300'}`}>
                  person_off
                </span>
                {isCurrentUser ? t("cannot_delete_self") : t("delete_user")}
              </button>
            ) : (
              <div className="px-4 py-3 space-y-2">
                <p className="text-[11px] text-white/80 leading-snug">{t("confirm_delete_text")}</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={updating}
                    className="flex-1 py-1.5 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? t("deleting") : t("yes_delete")}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={updating}
                    className="px-3 py-1.5 rounded bg-white/10 text-white text-xs hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
