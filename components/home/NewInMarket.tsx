import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { PropertyCard } from "../property/PropertyCard";
import { Property } from "@/interfaces/property";
import { BackToTop } from "../ui/BackToTop";

const PARADISE_IMAGE = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80";

interface Props {
  properties: Property[];
  currentPage: number;
  totalPages: number;
  searchParams?: Record<string, string | string[] | undefined>;
  listingType: "buy" | "rent" | "all";
}

export const NewInMarket = ({ properties, currentPage, totalPages, searchParams, listingType }: Props) => {
  const t = useTranslations("NewInMarket");
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined) {
          params.set(key, String(value));
        }
      });
    }
    params.set('page', pageNumber.toString());
    return `/?${params.toString()}`;
  };

  const createTypeURL = (type: "buy" | "rent") => {
    const params = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && key !== "page") {
          params.set(key, String(value));
        }
      });
    }
    if (type === "rent") params.set("type", "rent");
    else params.delete("type");
    return `/?${params.toString()}`;
  };

  const pageNumbers: number[] = [];
  const delta = 2;
  for (
    let i = Math.max(1, currentPage - delta);
    i <= Math.min(totalPages, currentPage + delta);
    i++
  ) {
    pageNumbers.push(i);
  }

  const hasFilters = searchParams ? Object.keys(searchParams).some(k => k !== "page") : false;

  return (
    <section id="new-in-market" className="relative scroll-mt-24">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={PARADISE_IMAGE}
          alt=""
          fill
          className="object-cover object-center opacity-35"
          priority={false}
        />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-background-light to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-light text-nordic-dark">{t("title")}</h2>
            <p className="text-nordic-muted mt-1 text-sm">
              {t("subtitle")}
            </p>
          </div>
          <div className="hidden md:flex bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
            <Link href={createTypeURL("buy")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              listingType === "buy"
                ? "bg-nordic-dark text-white shadow-sm"
                : "text-nordic-muted hover:text-nordic-dark"
            }`}>
              {t("buy")}
            </Link>
            <Link href={createTypeURL("rent")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              listingType === "rent"
                ? "bg-nordic-dark text-white shadow-sm"
                : "text-nordic-muted hover:text-nordic-dark"
            }`}>
              {t("rent")}
            </Link>
          </div>
        </div>

        {/* Property grid */}
        {properties.length === 0 ? (
          <p className="text-nordic-muted text-center py-16">
            {t("no_properties")}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {hasPrev ? (
              <Link
                href={createPageURL(currentPage - 1)}
                className="flex items-center gap-1 px-4 py-2 bg-white/80 backdrop-blur-sm border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark text-sm font-medium rounded-lg transition-all hover:shadow-md"
              >
                <span className="material-icons text-base">chevron_left</span>
                {t("prev")}
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-4 py-2 bg-white/80 backdrop-blur-sm border border-nordic-dark/10 text-nordic-muted text-sm font-medium rounded-lg cursor-not-allowed opacity-50">
                <span className="material-icons text-base">chevron_left</span>
                {t("prev")}
              </span>
            )}

            {pageNumbers[0] > 1 && (
              <>
                <Link
                  href={createPageURL(1)}
                  className="w-9 h-9 flex items-center justify-center bg-white/80 backdrop-blur-sm border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark text-sm font-medium rounded-lg transition-all"
                >
                  1
                </Link>
                {pageNumbers[0] > 2 && (
                  <span className="w-9 h-9 flex items-center justify-center text-nordic-muted text-sm">
                    …
                  </span>
                )}
              </>
            )}

            {pageNumbers.map((page) => (
              <Link
                key={page}
                href={createPageURL(page)}
                className={`w-9 h-9 flex items-center justify-center border text-sm font-medium rounded-lg transition-all ${
                  page === currentPage
                    ? "bg-nordic-dark text-white border-nordic-dark shadow-sm"
                    : "bg-white/80 backdrop-blur-sm border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark hover:shadow-md"
                }`}
              >
                {page}
              </Link>
            ))}

            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <>
                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                  <span className="w-9 h-9 flex items-center justify-center text-nordic-muted text-sm">
                    …
                  </span>
                )}
                <Link
                  href={createPageURL(totalPages)}
                  className="w-9 h-9 flex items-center justify-center bg-white/80 backdrop-blur-sm border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark text-sm font-medium rounded-lg transition-all"
                >
                  {totalPages}
                </Link>
              </>
            )}

            {hasNext ? (
              <Link
                href={createPageURL(currentPage + 1)}
                className="flex items-center gap-1 px-4 py-2 bg-white/80 backdrop-blur-sm border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark text-sm font-medium rounded-lg transition-all hover:shadow-md"
              >
                {t("next")}
                <span className="material-icons text-base">chevron_right</span>
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-4 py-2 bg-white/80 backdrop-blur-sm border border-nordic-dark/10 text-nordic-muted text-sm font-medium rounded-lg cursor-not-allowed opacity-50">
                {t("next")}
                <span className="material-icons text-base">chevron_right</span>
              </span>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <p className="mt-4 text-center text-xs text-nordic-muted">
            {t("page_info", { current: currentPage, total: totalPages })}
          </p>
        )}

        <div className="flex justify-start mt-6">
          <BackToTop visible={hasFilters} />
        </div>
      </div>
    </section>
  );
};
