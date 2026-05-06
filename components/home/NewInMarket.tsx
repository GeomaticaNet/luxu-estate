import Link from "next/link";
import { PropertyCard } from "../property/PropertyCard";
import { Property } from "@/interfaces/property";

interface Props {
  properties: Property[];
  currentPage: number;
  totalPages: number;
  searchParams?: Record<string, string | string[] | undefined>;
}

export const NewInMarket = ({ properties, currentPage, totalPages, searchParams }: Props) => {
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

  // Build page numbers array (show up to 5 pages around current)
  const pageNumbers: number[] = [];
  const delta = 2;
  for (
    let i = Math.max(1, currentPage - delta);
    i <= Math.min(totalPages, currentPage + delta);
    i++
  ) {
    pageNumbers.push(i);
  }

  return (
    <section>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-nordic-dark">New in Market</h2>
          <p className="text-nordic-muted mt-1 text-sm">
            Fresh opportunities added this week.
          </p>
        </div>
        <div className="hidden md:flex bg-white p-1 rounded-lg">
          <Link href="/" className="px-4 py-1.5 rounded-md text-sm font-medium bg-nordic-dark text-white shadow-sm">
            All
          </Link>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark">
            Buy
          </button>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark">
            Rent
          </button>
        </div>
      </div>

      {/* Property grid */}
      {properties.length === 0 ? (
        <p className="text-nordic-muted text-center py-16">
          No properties found.
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
          {/* Previous button */}
          {hasPrev ? (
            <Link
              href={createPageURL(currentPage - 1)}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark text-sm font-medium rounded-lg transition-all hover:shadow-md"
            >
              <span className="material-icons text-base">chevron_left</span>
              Prev
            </Link>
          ) : (
            <span className="flex items-center gap-1 px-4 py-2 bg-white border border-nordic-dark/10 text-nordic-muted text-sm font-medium rounded-lg cursor-not-allowed opacity-50">
              <span className="material-icons text-base">chevron_left</span>
              Prev
            </span>
          )}

          {/* First page + ellipsis */}
          {pageNumbers[0] > 1 && (
            <>
              <Link
                href={createPageURL(1)}
                className="w-9 h-9 flex items-center justify-center bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark text-sm font-medium rounded-lg transition-all"
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

          {/* Page numbers */}
          {pageNumbers.map((page) => (
            <Link
              key={page}
              href={createPageURL(page)}
              className={`w-9 h-9 flex items-center justify-center border text-sm font-medium rounded-lg transition-all ${
                page === currentPage
                  ? "bg-nordic-dark text-white border-nordic-dark shadow-sm"
                  : "bg-white border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark hover:shadow-md"
              }`}
            >
              {page}
            </Link>
          ))}

          {/* Last page + ellipsis */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="w-9 h-9 flex items-center justify-center text-nordic-muted text-sm">
                  …
                </span>
              )}
              <Link
                href={createPageURL(totalPages)}
                className="w-9 h-9 flex items-center justify-center bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark text-sm font-medium rounded-lg transition-all"
              >
                {totalPages}
              </Link>
            </>
          )}

          {/* Next button */}
          {hasNext ? (
            <Link
              href={createPageURL(currentPage + 1)}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark text-sm font-medium rounded-lg transition-all hover:shadow-md"
            >
              Next
              <span className="material-icons text-base">chevron_right</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 px-4 py-2 bg-white border border-nordic-dark/10 text-nordic-muted text-sm font-medium rounded-lg cursor-not-allowed opacity-50">
              Next
              <span className="material-icons text-base">chevron_right</span>
            </span>
          )}
        </div>
      )}

      {/* Page info */}
      {totalPages > 1 && (
        <p className="mt-4 text-center text-xs text-nordic-muted">
          Page {currentPage} of {totalPages}
        </p>
      )}
    </section>
  );
};
