import { getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { LeadsList } from "./LeadsList";

export default async function AdminMessagesPage() {
  const t = await getTranslations("Admin");
  const supabase = await createServerClient();

  const { data: leads, error } = await supabase
    .from("contact_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading leads:", error);
    return <div className="text-red-600">Error loading messages</div>;
  }

  const newCount = leads?.filter((l) => l.status === "new").length || 0;

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

      <LeadsList leads={leads || []} />
    </main>
  );
}
