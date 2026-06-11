import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { FeaturedPropertyCard } from "../property/FeaturedPropertyCard";
import { FeaturedProperty } from "@/interfaces/property";

interface Props {
  properties: FeaturedProperty[];
}

export const FeaturedCollections = ({ properties }: Props) => {
  const t = useTranslations("FeaturedCollections");
  return (
    <section className="mb-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-nordic-dark">
            {t("title")}
          </h2>
          <p className="text-nordic-muted mt-1 text-sm">
            {t("subtitle")}
          </p>
        </div>
        <Link
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity"
          href="/?type=all"
        >
          {t("view_all")}{" "}
          <span className="material-icons text-sm">arrow_forward</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {properties.map((property) => (
          <FeaturedPropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
};
