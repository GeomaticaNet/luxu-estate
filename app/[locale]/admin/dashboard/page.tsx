import { getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";

export default async function AdminDashboardPage() {
  const t = await getTranslations("Admin");
  const supabase = await createServerClient();

  // Get stats
  const { count: propertiesCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });

  const { count: usersCount } = await supabase
    .from('user_roles')
    .select('*', { count: 'exact', head: true });

  const { count: featuredCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('is_featured', true);

  const stats = [
    { label: t("total_properties"), value: propertiesCount || 0, icon: "apartment", href: "/admin/properties" },
    { label: t("total_users"), value: usersCount || 0, icon: "people", href: "/admin/users" },
    { label: t("featured_properties"), value: featuredCount || 0, icon: "star", href: "/admin/properties" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-light text-nordic-dark mb-8">{t("dashboard_title")}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="material-icons text-mosque text-3xl">{stat.icon}</span>
              <span className="text-3xl font-bold text-nordic-dark">{stat.value}</span>
            </div>
            <p className="text-nordic-muted text-sm">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-nordic-dark mb-4">{t("quick_actions")}</h2>
        <div className="flex gap-4">
          <Link
            href="/admin/properties"
            className="flex items-center gap-2 px-6 py-3 bg-mosque text-white rounded-lg hover:bg-mosque/90 transition-colors"
          >
            <span className="material-icons">apartment</span>
            {t("manage_properties")}
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 px-6 py-3 bg-nordic-dark text-white rounded-lg hover:bg-nordic-dark/90 transition-colors"
          >
            <span className="material-icons">people</span>
            {t("manage_users")}
          </Link>
        </div>
      </div>
    </div>
  );
}
