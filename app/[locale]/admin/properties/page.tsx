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
  const adminClient = createAdminClient();

  // Resolve admin status + agent list (for the "Assign to" feature).
  // The agent list is fetched with the service-role client so that agents also
  // see every agent's name in the "Assigned to" column (RLS alone would return
  // only the agent's own row).
  const serverSupabase = await createServerClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  const { data: userRole } = await serverSupabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user?.id)
    .single();
  const roles: string[] = userRole?.role ?? [];
  const isAdmin = roles.includes('admin');

  const { data: agentRoleRows } = await adminClient
    .from('user_roles')
    .select('user_id')
    .contains('role', ['agent']);

  const agentIds = (agentRoleRows || []).map((r) => r.user_id);
  const { data: agents } = agentIds.length > 0
    ? await adminClient
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', agentIds)
    : { data: [] };

  const { page: pageParam, property_type: typeFilter } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Total count for pagination
  const countQuery = publicClient
    .from('properties')
    .select('*', { count: 'exact', head: true });

  if (typeFilter) {
    countQuery.eq('property_type', typeFilter);
  }

  const { count: totalCount } = await countQuery;

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);

  // Agents always get their own properties first, so they are not buried
  // behind a pagination page (which made them appear "locked" in gray).
  const isAgent = !isAdmin && !!user;

  let error: { message: string } | null = null;
  let properties: Property[] = [];

  const buildDataQuery = (withRange: boolean) => {
    const q = publicClient
      .from('properties')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: true });
    if (typeFilter) q.eq('property_type', typeFilter);
    if (withRange) q.range(from, to);
    return q;
  };

  if (isAgent) {
    const { data: allFiltered, error: err } = await buildDataQuery(false);
    error = err;
    const own = (allFiltered || []).filter((p) => p.agent_id === user?.id);
    const rest = (allFiltered || []).filter((p) => p.agent_id !== user?.id);
    properties = [...own, ...rest].slice(from, to + 1);
  } else {
    const { data, error: err } = await buildDataQuery(true);
    error = err;
    properties = data || [];
  }

  if (error) {
    console.error('Error loading properties:', error);
    return <div className="text-red-600">{t("error_loading", { message: error.message })}</div>;
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

  // Stats from database. For agents these reflect the properties assigned to
  // the logged-in agent only, not the whole portfolio.
  const agentScope = isAgent ? user?.id : null;

  const scopedAll = agentScope
    ? await publicClient.from('properties').select('id').eq('agent_id', agentScope)
    : await publicClient.from('properties').select('id');

  const { data: allProperties } = scopedAll;

  const scopedActive = agentScope
    ? await publicClient.from('properties').select('id').eq('active', true).eq('agent_id', agentScope)
    : await publicClient.from('properties').select('id').eq('active', true);

  const { data: activeProps } = scopedActive;

  const scopedRent = agentScope
    ? await publicClient.from('properties').select('id').eq('type', 'RENT').eq('agent_id', agentScope)
    : await publicClient.from('properties').select('id').eq('type', 'RENT');

  const { data: rentProps } = scopedRent;

  const scopedSale = agentScope
    ? await publicClient.from('properties').select('id').eq('type', 'SALE').eq('agent_id', agentScope)
    : await publicClient.from('properties').select('id').eq('type', 'SALE');

  const { data: saleProps } = scopedSale;

  const scopedSold = agentScope
    ? await publicClient.from('properties').select('id').eq('type', 'SOLD').eq('agent_id', agentScope)
    : await publicClient.from('properties').select('id').eq('type', 'SOLD');

  const { data: soldProps } = scopedSold;

  const scopedRented = agentScope
    ? await publicClient.from('properties').select('id').eq('type', 'RENTED').eq('agent_id', agentScope)
    : await publicClient.from('properties').select('id').eq('type', 'RENTED');

  const { data: rentedProps } = scopedRented;

  const totalListings = allProperties?.length || 0;
  const activeProperties = activeProps?.length || 0;
  const forSaleCount = saleProps?.length || 0;
  const forRentCount = rentProps?.length || 0;
  const soldCount = soldProps?.length || 0;
  const rentedCount = rentedProps?.length || 0;

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
        agents={agents || []}
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
