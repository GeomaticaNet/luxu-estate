import { getTranslations } from "next-intl/server";
import { createPublicClient, createServerClient, createAdminClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { PropertyList, type Property } from "./PropertyList";
import { PropertyTypeFilter } from "./PropertyTypeFilter";

const PAGE_SIZE = 10;

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; property_type?: string }>;
}) {
  const t = await getTranslations("Admin");
  const publicClient = createPublicClient();
  const serverSupabase = await createServerClient();

  const { page: pageParam, property_type: typeFilter } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Step 1: Auth + role (fast, needed for all subsequent queries)
  const { data: { user } } = await serverSupabase.auth.getUser();
  const { data: userRole } = await serverSupabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user?.id)
    .single();

  const roles: string[] = userRole?.role ?? [];
  const isAdmin = roles.includes('admin');
  const isAgent = !isAdmin && !!user;

  // Step 2: All data queries in parallel
  const [
    countResult,
    dataResult,
    agentsResult,
    { data: mainImages },
    { data: allStats },
  ] = await Promise.all([
    // Total count
    (async () => {
      const q = publicClient
        .from('properties')
        .select('*', { count: 'exact', head: true });
      if (typeFilter) q.eq('property_type', typeFilter);
      return q;
    })(),
    // Properties data
    (async () => {
      const q = publicClient
        .from('properties')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: true });
      if (typeFilter) q.eq('property_type', typeFilter);
      if (!isAgent) q.range(from, to);
      return q;
    })(),
    // Agent list
    (async () => {
      try {
        const adminClient = createAdminClient();
        const { data: agentRoleRows } = await adminClient
          .from('user_roles')
          .select('user_id')
          .contains('role', ['agent']);
        const agentIds = (agentRoleRows || []).map((r) => r.user_id);
        if (agentIds.length === 0) return { data: [] };
        return adminClient
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', agentIds);
      } catch {
        return { data: [] };
      }
    })(),
    // Main images (will use after we know property IDs)
    { data: [] as any[] }, // placeholder, fetched after properties load
    // Stats: single query for all type counts
    publicClient.from('properties').select('type, active, agent_id'),
  ]);

  const { count: totalCount } = countResult;
  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);

  let error: { message: string } | null = null;
  let properties: Property[] = [];

  if (isAgent) {
    const allFiltered = dataResult.data || [];
    const own = allFiltered.filter((p: any) => p.agent_id === user?.id);
    const rest = allFiltered.filter((p: any) => p.agent_id !== user?.id);
    properties = [...own, ...rest].slice(from, to + 1);
    error = dataResult.error;
  } else {
    properties = dataResult.data || [];
    error = dataResult.error;
  }

  if (error) {
    console.error('Error loading properties:', error);
    return <div className="text-red-600">{t("error_loading", { message: error.message })}</div>;
  }

  // Fetch main images for displayed properties
  const propertyIds = properties?.map(p => p.id) || [];
  const { data: images } = propertyIds.length > 0
    ? await publicClient
        .from('property_images')
        .select('property_id, url')
        .eq('is_main', true)
        .in('property_id', propertyIds)
    : { data: [] };

  const imagesMap: Record<string, string> = {};
  images?.forEach((img: any) => {
    imagesMap[img.property_id] = img.url;
  });

  // Stats: compute from single query
  const scopedStats = isAgent
    ? (allStats || []).filter((p: any) => p.agent_id === user?.id)
    : allStats || [];

  const totalListings = scopedStats.length;
  const activeProperties = scopedStats.filter((p: any) => p.active).length;
  const forSaleCount = scopedStats.filter((p: any) => p.type === 'SALE').length;
  const forRentCount = scopedStats.filter((p: any) => p.type === 'RENT').length;
  const soldCount = scopedStats.filter((p: any) => p.type === 'SOLD').length;
  const rentedCount = scopedStats.filter((p: any) => p.type === 'RENTED').length;

  const showingFrom = from + 1;
  const showingTo = Math.min(to + 1, totalCount || 0);

  function pageUrl(page: number) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (typeFilter) params.set("property_type", typeFilter);
    return `/admin/properties?${params.toString()}`;
  }

  return (
    <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-nordic-dark tracking-wide">{t("my_properties_title")}</h1>
          <p className="text-gray-500 mt-1 tracking-wide">{t("manage_portfolio_desc")}</p>
        </div>
        <div className="flex items-center gap-3">
          <PropertyTypeFilter />
          <Link href="/admin/properties/new" className="bg-mosque hover:bg-mosque/90 text-white px-5 py-2.5 rounded-[7px] text-sm font-medium shadow-md shadow-mosque/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2">
            <span className="material-icons text-base">add</span> {t("add_new_property")}
          </Link>
        </div>
      </div>

      {/* Property List with Stats */}
      <PropertyList 
        properties={properties || []}
        mainImages={imagesMap}
        totalListings={totalListings}
        activeProperties={activeProperties}
        forSaleCount={forSaleCount}
        forRentCount={forRentCount}
        soldCount={soldCount}
        rentedCount={rentedCount}
        currentPage={currentPage}
        totalPages={totalPages}
        showingFrom={showingFrom}
        showingTo={showingTo}
        totalCount={totalCount || 0}
        currentPropertyType={typeFilter || undefined}
        isAdmin={isAdmin}
        currentUserId={user?.id ?? null}
        agents={agentsResult.data || []}
      />

      {/* Pagination */}
      <div className="mt-6 px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-lg">
        <div className="text-sm text-gray-500">
          {t("showing_results", { from: showingFrom, to: showingTo, total: totalCount || 0 })}
        </div>
        <div className="flex gap-2">
          <Link
            href={currentPage > 1 ? pageUrl(currentPage - 1) : '#'}
            className={`px-3 py-1 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-white ${currentPage <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {t("previous")}
          </Link>
          <Link
            href={currentPage < totalPages ? pageUrl(currentPage + 1) : '#'}
            className={`px-3 py-1 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-white ${currentPage >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {t("next")}
          </Link>
        </div>
      </div>
    </main>
  );
}
