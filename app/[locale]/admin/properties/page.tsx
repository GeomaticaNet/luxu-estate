import { getTranslations } from "next-intl/server";
import { createPublicClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { PropertyList } from "./PropertyList";

const PAGE_SIZE = 10;

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const t = await getTranslations("Admin");
  const publicClient = createPublicClient();

  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Total count for pagination
  const { count: totalCount } = await publicClient
    .from('properties')
    .select('*', { count: 'exact', head: true });

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);

  const { data: properties, error } = await publicClient
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error loading properties:', error);
    return <div className="text-red-600">Error loading properties: {error.message}</div>;
  }

  // Fetch main images for displayed properties
  const propertyIds = properties?.map(p => p.id) || [];
  const { data: mainImages } = await publicClient
    .from('property_images')
    .select('property_id, url')
    .eq('is_main', true)
    .in('property_id', propertyIds);

  const imagesMap: Record<string, string> = {};
  mainImages?.forEach(img => {
    imagesMap[img.property_id] = img.url;
  });

  // Stats from database
  const { data: allProperties } = await publicClient
    .from('properties')
    .select('id');
  
  const { data: activeProps } = await publicClient
    .from('properties')
    .select('id')
    .eq('active', true);

  const { data: rentProps } = await publicClient
    .from('properties')
    .select('id')
    .eq('type', 'RENT');

  const totalListings = allProperties?.length || 0;
  const activeProperties = activeProps?.length || 0;
  const pendingSale = rentProps?.length || 0;

  const showingFrom = from + 1;
  const showingTo = Math.min(to + 1, totalCount || 0);

  return (
    <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-nordic-dark tracking-wide">My Properties</h1>
          <p className="text-gray-500 mt-1 tracking-wide">Manage your portfolio and track performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-200 text-nordic-dark hover:bg-gray-50 px-4 py-2.5 rounded-[7px] text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2">
            <span className="material-icons text-base">filter_list</span> Filter
          </button>
          <button className="bg-mosque hover:bg-mosque/90 text-white px-5 py-2.5 rounded-[7px] text-sm font-medium shadow-md shadow-mosque/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2">
            <span className="material-icons text-base">add</span> Add New Property
          </button>
        </div>
      </div>

      {/* Property List with Stats */}
      <PropertyList 
        properties={properties || []}
        mainImages={imagesMap}
        initialTotal={totalListings}
        initialActive={activeProperties}
        initialRent={pendingSale}
      />

      {/* Pagination */}
      <div className="mt-6 px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-lg">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium text-nordic-dark">{showingFrom}</span> to <span className="font-medium text-nordic-dark">{showingTo}</span> of <span className="font-medium text-nordic-dark">{totalCount || 0}</span> results
        </div>
        <div className="flex gap-2">
          <Link
            href={currentPage > 1 ? `/admin/properties?page=${currentPage - 1}` : '#'}
            className={`px-3 py-1 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-white ${currentPage <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Previous
          </Link>
          <Link
            href={currentPage < totalPages ? `/admin/properties?page=${currentPage + 1}` : '#'}
            className={`px-3 py-1 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-white ${currentPage >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Next
          </Link>
        </div>
      </div>
    </main>
  );
}
