import { getTranslations } from "next-intl/server";
import { createPublicClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";

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

  const imagesMap = new Map();
  mainImages?.forEach(img => {
    imagesMap.set(img.property_id, img.url);
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

  const stats = [
    { label: "Total Listings", value: totalListings, icon: "apartment", color: "bg-mosque/10 text-mosque" },
    { label: "Active Properties", value: activeProperties, icon: "check_circle", color: "bg-hint-of-green text-mosque" },
    { label: "Pending Sale", value: pendingSale, icon: "pending", color: "bg-orange-100 text-orange-600" },
  ];

  const getStatusBadge = (active: boolean) => {
    if (active) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-hint-of-green text-mosque">
          <span className="w-1.5 h-1.5 rounded-full bg-mosque mr-1.5"></span>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>
        Sold
      </span>
    );
  };

  const getMainImage = (propertyId: string) => {
    return imagesMap.get(propertyId) || null;
  };

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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-lg border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-nordic-dark mt-1">{stat.value}</p>
            </div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${stat.color}`}>
              <span className="material-icons">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Property List Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-6">Property Details</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Properties */}
        {properties?.map((property, index) => {
          const mainImage = getMainImage(property.id);
          return (
            <div 
              key={property.id}
              className={`group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 hover:bg-background-light transition-colors items-center ${
                index === properties.length - 1 ? 'border-b-0' : ''
              }`}
            >
              {/* Property Details */}
              <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                <div className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                  {mainImage && (
                    <img 
                      src={mainImage} 
                      alt={property.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-nordic-dark group-hover:text-mosque transition-colors cursor-pointer">
                    {property.title}
                  </h3>
                  <p className="text-sm text-gray-500">{property.address}, {property.location}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-[14px]">bed</span> {property.bedrooms} Beds
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-[14px]">bathtub</span> {property.bathrooms} Baths
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{property.area} sqft</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="col-span-6 md:col-span-2">
                <div className="text-base font-semibold text-nordic-dark">
                  ${Number(property.price).toLocaleString()}
                </div>
                {property.price_label && (
                  <div className="text-xs text-gray-400">Monthly: ${property.price_label}</div>
                )}
              </div>

              {/* Status */}
              <div className="col-span-6 md:col-span-2">
                {getStatusBadge(property.active)}
              </div>

              {/* Actions */}
              <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                <button className="p-2 rounded-lg text-gray-400 hover:text-mosque hover:bg-hint-of-green/30 transition-all" title="Edit Property">
                  <span className="material-icons text-xl">edit</span>
                </button>
                <button className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete Property">
                  <span className="material-icons text-xl">delete_outline</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
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
      </div>
    </main>
  );
}
