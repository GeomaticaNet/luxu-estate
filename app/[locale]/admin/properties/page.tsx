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

  // Stats
  const totalListings = properties?.length || 0;
  const activeProperties = properties?.filter(p => p.type === 'SALE').length || 0;
  const pendingSale = properties?.filter(p => p.type === 'RENT').length || 0;

  const stats = [
    { label: "Total Listings", value: totalListings, icon: "apartment", color: "bg-mosque/10 text-mosque" },
    { label: "Active Properties", value: activeProperties, icon: "check_circle", color: "bg-hint-of-green text-mosque" },
    { label: "Pending Sale", value: pendingSale, icon: "pending", color: "bg-orange-100 text-orange-600" },
  ];

  const getStatusBadge = (type: string) => {
    switch (type) {
      case 'SALE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-hint-of-green text-mosque border border-mosque/10">
            <span className="w-1.5 h-1.5 rounded-full bg-mosque mr-1.5"></span>
            Active
          </span>
        );
      case 'RENT':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5"></span>
            Sold
          </span>
        );
    }
  };

  return (
    <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-nordic-dark tracking-tight">My Properties</h1>
          <p className="text-gray-500 mt-1">Manage your portfolio and track performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-200 text-nordic-dark hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2">
            <span className="material-icons text-base">filter_list</span> Filter
          </button>
          <button className="bg-mosque hover:bg-mosque/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-mosque/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2">
            <span className="material-icons text-base">add</span> Add New Property
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-6">Property Details</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Properties */}
        {properties?.map((property, index) => (
          <div 
            key={property.id}
            className={`group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 hover:bg-background-light transition-colors items-center ${
              index === properties.length - 1 ? 'border-b-0' : ''
            }`}
          >
            {/* Property Details */}
            <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
              <div className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                {property.image_url && (
                  <img 
                    src={property.image_url} 
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
                  <span>{property.area}m²</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="col-span-6 md:col-span-2">
              <div className="text-base font-semibold text-nordic-dark">
                ${property.price.toLocaleString()}
              </div>
              {property.price_label && (
                <div className="text-xs text-gray-400">Monthly: {property.price_label}</div>
              )}
            </div>

            {/* Status */}
            <div className="col-span-6 md:col-span-2">
              {getStatusBadge(property.type)}
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
        ))}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium text-nordic-dark">1</span> to <span className="font-medium text-nordic-dark">{properties?.length || 0}</span> of <span className="font-medium text-nordic-dark">{properties?.length || 0}</span> results
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-white disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-white">Next</button>
          </div>
        </div>
      </div>
    </main>
  );
}
