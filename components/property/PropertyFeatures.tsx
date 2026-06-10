import { Property } from "@/interfaces/property";
import { useTranslations } from "next-intl";

interface Props {
  property: Property;
}

export const PropertyFeatures = ({ property }: Props) => {
  const t = useTranslations("PropertyDetails");

  function getTranslation(key: string, fallback: string): string {
    const result = t(key as any);
    if (typeof result !== "string") return fallback;
    // next-intl returns the key path when translation is missing
    const keySuffix = key.includes(".") ? key.split(".").pop()! : key;
    if (result.includes(keySuffix) && result.includes("PropertyDetails.")) {
      return fallback;
    }
    return result;
  }

  return (
    <div className="space-y-8">
      {/* Property Stats */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
        <h2 className="text-lg font-semibold mb-6 text-nordic">{t("property_features")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
            <span className="material-icons text-mosque text-2xl mb-2">square_foot</span>
            <span className="text-xl font-bold text-nordic">{property.area}</span>
            <span className="text-xs uppercase tracking-wider text-nordic/50">{t("square_meters")}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
            <span className="material-icons text-mosque text-2xl mb-2">bed</span>
            <span className="text-xl font-bold text-nordic">{property.bedrooms}</span>
            <span className="text-xs uppercase tracking-wider text-nordic/50">{t("bedrooms")}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
            <span className="material-icons text-mosque text-2xl mb-2">shower</span>
            <span className="text-xl font-bold text-nordic">{property.bathrooms}</span>
            <span className="text-xs uppercase tracking-wider text-nordic/50">{t("bathrooms")}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
            <span className="material-icons text-mosque text-2xl mb-2">directions_car</span>
            <span className="text-xl font-bold text-nordic">{property.garages || 2}</span>
            <span className="text-xs uppercase tracking-wider text-nordic/50">{t("garage")}</span>
          </div>
        </div>
      </div>

      {/* About this home */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
        <h2 className="text-lg font-semibold mb-4 text-nordic">{t("about_this_home")}</h2>
        <div className="prose prose-slate max-w-none text-nordic/70 leading-relaxed whitespace-pre-line">
          <p className="mb-4">
            {property.description || t("no_description")}
          </p>
        </div>
      </div>

      {/* Amenities */}
      {property.amenities && property.amenities.length > 0 && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
          <h2 className="text-lg font-semibold mb-6 text-nordic">{t("amenities")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            {property.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-3 text-nordic/70">
                <span className="material-icons text-mosque/60 text-sm">check_circle</span>
                <span>{getTranslation(`amenities_map.${amenity}`, amenity)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
