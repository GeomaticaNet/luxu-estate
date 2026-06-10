import PropertyForm from "@/components/admin/property/PropertyForm";
import { StickyBottomBar } from "../StickyBottomBar";
import { Link } from "@/i18n/routing";
import { createPublicClient } from "@/lib/supabase/server";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createPublicClient();
  
  const { data: property, error } = await supabase
    .from('properties')
    .select('*, property_images(*)')
    .eq('id', id)
    .single();

  if (error || !property) {
    return <div className="p-8 text-red-500">Property not found</div>;
  }

  // Sort images
  if (property.property_images) {
    property.property_images.sort((a: any, b: any) => a.sort_order - b.sort_order);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="space-y-4">
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 font-medium font-sf-pro">
              <li><Link href="/admin/properties" className="hover:text-mosque transition-colors">Properties</Link></li>
              <li><span className="material-icons text-xs text-gray-400">chevron_right</span></li>
              <li aria-current="page" className="text-nordic-dark">Edit</li>
            </ol>
          </nav>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-nordic-dark tracking-tight mb-2">Edit Property</h1>
            <p className="text-base text-gray-500 max-w-2xl font-normal font-sf-pro">
              Update the details below.
            </p>
          </div>
        </div>
      </header>

      <PropertyForm initialData={property} />
      <StickyBottomBar />
    </main>
  );
}
