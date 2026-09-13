import { getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { LeadsList } from "./LeadsList";
import { getAdminAuth } from "@/lib/admin-auth";

export default async function AdminMessagesPage() {
  const t = await getTranslations("Admin");
  const auth = await getAdminAuth();
  const supabase = await createServerClient();

  const { data: leads, error } = await supabase
    .from("contact_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading leads:", error);
    return <div className="text-red-600">Error loading messages</div>;
  }

  // Enrich leads with assigned agent names from profiles
  const assignedIds = [
    ...new Set(
      (leads ?? [])
        .map((l) => l.assigned_to)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  let agentNames: Record<string, string> = {};
  if (assignedIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", assignedIds);
    if (profiles) {
      agentNames = Object.fromEntries(
        profiles.map((p) => [p.user_id, p.full_name || "Agente"])
      );
    }
  }

  return (
    <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-nordic-dark tracking-wide">
            {t("messages_title") || "Messages"}
          </h1>
          <p className="text-gray-500 mt-1 tracking-wide">
            {t("manage_leads") || "Manage incoming leads and contact requests."}
          </p>
        </div>
      </div>

      <LeadsList leads={leads || []} isAdmin={auth.isAdmin} currentUserId={auth.user?.id ?? null} agentNames={agentNames} />
    </main>
  );
}
