"use client";

import { useState } from "react";
import { updateUserRole } from "./actions";

interface RoleDropdownProps {
  userId: string;
  currentRole: string;
  isFirst: boolean;
}

export default function RoleDropdown({ userId, currentRole, isFirst }: RoleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleRoleChange(newRole: string) {
    setUpdating(true);
    setIsOpen(false);
    await updateUserRole(userId, newRole);
    setUpdating(false);
  }

  return (
    <div className="col-span-12 md:col-span-2 w-full flex justify-end relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={updating}
        className={`inline-flex items-center px-4 py-2 border text-xs font-medium rounded-md transition-colors w-full md:w-auto justify-center ${
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
        <div className="absolute top-full right-0 mt-2 w-48 rounded-md shadow-xl bg-mosque ring-1 ring-black ring-opacity-5 overflow-hidden z-50 origin-top-right">
          <div className="py-1" role="menu">
            <button
              onClick={() => handleRoleChange('admin')}
              className={`group flex items-center w-full px-4 py-3 text-xs transition-colors ${
                currentRole === 'admin' ? 'text-white font-medium bg-white/10' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="material-icons text-sm mr-3 text-white/50">shield</span>
              Administrator
            </button>
            <button
              onClick={() => handleRoleChange('user')}
              className={`group flex items-center w-full px-4 py-3 text-xs transition-colors ${
                currentRole === 'user' ? 'text-white font-medium bg-white/10' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="material-icons text-sm mr-3 text-white/50">person</span>
              User
            </button>
            <div className="border-t border-white/10 my-1"></div>
            <button
              className="group flex items-center w-full px-4 py-3 text-xs text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-colors"
            >
              <span className="material-icons text-sm mr-3 text-red-300">block</span>
              Suspend User
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
