import Link from "next/link";
import { FeaturedPropertyCard } from "../property/FeaturedPropertyCard";
import { FeaturedProperty } from "@/interfaces/property";

interface Props {
  properties: FeaturedProperty[];
}

export const FeaturedCollections = ({ properties }: Props) => {
  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-nordic-dark">
            Featured Collections
          </h2>
          <p className="text-nordic-muted mt-1 text-sm">
            Curated properties for the discerning eye.
          </p>
        </div>
        <Link
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity"
          href="/"
        >
          View all{" "}
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
