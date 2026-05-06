import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/lib/properties";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyFeatures } from "@/components/property/PropertyFeatures";
import { MortgageCalculator } from "@/components/property/MortgageCalculator";
import PropertyMap from "@/components/property/PropertyMap";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getPropertyBySlug(resolvedParams.slug);

  if (!data || !data.property) {
    return {
      title: "Property Not Found | LuxeEstate",
    };
  }

  const { property } = data;
  return {
    title: `${property.title} | ${property.location} | LuxeEstate`,
    description: property.description ?? `Check out this amazing property in ${property.location}.`,
  };
}

export default async function PropertyDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const data = await getPropertyBySlug(resolvedParams.slug);

  if (!data || !data.property) {
    notFound();
  }

  const { property, images } = data;
  const mainImage = images.find((i) => i.is_main) || {
    id: "default",
    property_id: property.id,
    url: property.imageUrl,
    is_main: true,
    sort_order: 0,
  };

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: Gallery */}
        <div className="lg:col-span-8 space-y-4">
          <PropertyGallery mainImage={mainImage} images={images} />
        </div>

        {/* Right Column: Key Details & Sticky Agent Sidebar */}
        <div className="lg:col-span-4 relative">
          <div className="sticky top-28 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-mosque/5">
              <div className="mb-4">
                <h1 className="text-4xl font-display font-light text-nordic mb-2">
                  {formattedPrice} {property.priceLabel && <span className="text-lg font-medium text-nordic/60">{property.priceLabel}</span>}
                </h1>
                <p className="text-nordic/60 font-medium flex items-center gap-1">
                  <span className="material-icons text-mosque text-sm">location_on</span>
                  {property.address}, {property.location}
                </p>
              </div>

              <div className="h-px bg-slate-100 my-6"></div>

              {/* Agent Section (Hardcoded for now) */}
              <div className="flex items-center gap-4 mb-6">
                {/* Use normal img here as it's an external unconfigured URL for demo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w"
                  alt="Sarah Jenkins"
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <h3 className="font-semibold text-nordic">Sarah Jenkins</h3>
                  <div className="flex items-center gap-1 text-xs text-mosque font-medium">
                    <span className="material-icons text-[14px]">star</span>
                    <span>Top Rated Agent</span>
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors">
                    <span className="material-icons text-sm">chat</span>
                  </button>
                  <button className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors">
                    <span className="material-icons text-sm">call</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-mosque hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group">
                  <span className="material-icons text-xl group-hover:scale-110 transition-transform">
                    calendar_today
                  </span>
                  Schedule Visit
                </button>
                <button className="w-full bg-transparent border border-nordic/10 hover:border-mosque text-nordic/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                  <span className="material-icons text-xl">mail_outline</span>
                  Contact Agent
                </button>
              </div>
            </div>

            <div className="bg-white p-2 rounded-xl shadow-sm border border-mosque/5">
              <PropertyMap address={`${property.address}, ${property.location}`} lat={property.lat} lng={property.lng} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Features and Description */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <PropertyFeatures property={property} />
          <MortgageCalculator price={property.price} />
        </div>
      </div>
    </main>
  );
}
