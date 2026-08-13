"use client";

import { useState } from "react";
import UserList from "./UserList";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  roles: string[];
  active: boolean;
  created_at: string;
}

const tabs = [
  { id: "all", label: "All Users" },
  { id: "users", label: "Users" },
  { id: "agents", label: "Agents" },
  { id: "admins", label: "Admins" },
];

export default function UserFilters({
  users,
  currentUserId,
  locale,
}: {
  users: UserWithRole[];
  currentUserId: string | null;
  locale: string;
}) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredUsers = users.filter(user => {
    if (activeTab === "all") return true;
    if (activeTab === "users") return user.roles.length === 0;
    if (activeTab === "agents") return user.roles.includes("agent");
    if (activeTab === "admins") return user.roles.includes("admin");
    return true;
  });

  return (
    <>
      <div className="mt-8 flex gap-6 border-b border-nordic-dark/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "text-mosque border-b-2 border-mosque font-semibold"
                : "text-nordic-dark/60 hover:text-nordic-dark"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <UserList users={filteredUsers} totalUsers={users.length} currentUserId={currentUserId} locale={locale} />
    </>
  );
}
