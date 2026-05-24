"use client";

import { useState } from "react";
import { updateUserRole, toggleUserActive } from "./actions";

interface RoleDropdownProps {
  userId: string;
  currentRole: string;
  currentUserId: string | null;
  active: boolean;
  isFirst: boolean;
}

export default function RoleDropdown({ userId, currentRole, currentUserId, active, isFirst }: RoleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showConfirmDemote, setShowConfirmDemote] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  const isCurrentUser = userId === currentUserId;

  async function handleRoleChange(newRole: string) {
    // If demoting admin to user, show confirmation first (even for self)
    if (currentRole === 'admin' && newRole === 'user') {
      setPendingRole(newRole);
      setShowConfirmDemote(true);
      setIsOpen(false);
      return;
    }
    
    setUpdating(true);
    setIsOpen(false);
    await updateUserRole(userId, newRole);
    setUpdating(false);
  }

  async function confirmDemote() {
    if (pendingRole) {
      setUpdating(true);
      setShowConfirmDemote(false);
      await updateUserRole(userId, pendingRole);
      setPendingRole(null);
      setUpdating(false);
    }
  }

  async function handleToggleActive() {
    if (isCurrentUser) return;
    setUpdating(true);
    setIsOpen(false);
    await toggleUserActive(userId, !active);
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
        {updating ? 'Saving...' : 'Change Role'}
        <span className="material-icons text-[16px] ml-2">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl bg-mosque ring-1 ring-black ring-opacity-5 overflow-hidden z-50 origin-top-right">
          <div className="py-1" role="menu">
            <button
              onClick={() => handleRoleChange('admin')}
              disabled={currentRole === 'admin'}
              className={`group flex items-center w-full px-4 py-3 text-xs transition-colors ${
                currentRole === 'admin' 
                  ? 'text-white/30 cursor-not-allowed' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={`material-icons text-sm mr-3 ${currentRole === 'admin' ? 'text-white/20' : 'text-white/50'}`}>shield</span>
              {currentRole === 'admin' ? 'Already Admin' : 'Promote to Admin'}
            </button>
            <button
              onClick={() => handleRoleChange('user')}
              disabled={currentRole === 'user'}
              className={`group flex items-center w-full px-4 py-3 text-xs transition-colors ${
                currentRole === 'user'
                  ? 'text-white/30 cursor-not-allowed' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={`material-icons text-sm mr-3 ${currentRole === 'user' ? 'text-white/20' : 'text-white/50'}`}>person</span>
              {currentRole === 'user' ? 'Already User' : 'Demote to User'}
            </button>
            <div className="border-t border-white/10 my-1"></div>
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
              {isCurrentUser ? 'Cannot suspend yourself' : active ? 'Suspend User' : 'Re-activate User'}
            </button>
          </div>
        </div>
      )}

      {/* Confirm Demote Modal */}
      {showConfirmDemote && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="material-icons text-orange-600">warning</span>
              </div>
              <h3 className="text-lg font-bold text-nordic-dark">Confirm Action</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              You are about to <strong>demote this admin to a regular user</strong>. They will lose all admin privileges immediately. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirmDemote(false); setPendingRole(null); }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-nordic-dark hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDemote}
                className="flex-1 px-4 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                Yes, Demote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
