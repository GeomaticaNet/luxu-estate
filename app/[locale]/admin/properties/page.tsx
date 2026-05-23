import { getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";

export default async function AdminPropertiesPage() {
  const t = await getTranslations("Admin");
  const supabase = await createServerClient();

  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-red-600">Error loading properties</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-light text-nordic-dark">{t("properties_title")}</h1>
        <Link
          href="/admin/properties/new"
          className="flex items-center gap-2 px-4 py-2 bg-mosque text-white rounded-lg hover:bg-mosque/90 transition-colors"
        >
          <span className="material-icons">add</span>
          {t("add_property")}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-nordic-muted">{t("property")}</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-nordic-muted">{t("type")}</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-nordic-muted">{t("price")}</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-nordic-muted">{t("location")}</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-nordic-muted">{t("featured")}</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-nordic-muted">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {properties?.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {property.image_url && (
                      <img 
                        src={property.image_url} 
                        alt={property.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-nordic-dark">{property.title}</p>
                      <p className="text-sm text-nordic-muted">{property.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    property.type === 'SALE' 
                      ? 'bg-mosque/10 text-mosque' 
                      : 'bg-nordic-dark/10 text-nordic-dark'
                  }`}>
                    {property.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-nordic-dark font-medium">
                  ${property.price.toLocaleString()}
                  {property.price_label && <span className="text-sm text-nordic-muted">{property.price_label}</span>}
                </td>
                <td className="px-6 py-4 text-nordic-muted text-sm">{property.location}</td>
                <td className="px-6 py-4">
                  {property.is_featured ? (
                    <span className="material-icons text-mosque">star</span>
                  ) : (
                    <span className="material-icons text-gray-300">star_border</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/propiedades/${property.slug}`}
                      target="_blank"
                      className="p-2 text-nordic-muted hover:text-mosque transition-colors"
                      title={t("view")}
                    >
                      <span className="material-icons">visibility</span>
                    </Link>
                    <Link
                      href={`/admin/properties/${property.id}/edit`}
                      className="p-2 text-nordic-muted hover:text-mosque transition-colors"
                      title={t("edit")}
                    >
                      <span className="material-icons">edit</span>
                    </Link>
                    <button
                      className="p-2 text-nordic-muted hover:text-red-500 transition-colors"
                      title={t("delete")}
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
