import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/lib/properties";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyFeatures } from "@/components/property/PropertyFeatures";
import { MortgageCalculator } from "@/components/property/MortgageCalculator";
import PropertyMap from "@/components/property/PropertyMap";
import { BackButton } from "@/components/ui/BackButton";
import Image from "next/image";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { locale, slug } = resolvedParams;
  const data = await getPropertyBySlug(slug);

  if (!data || !data.property) {
    return {
      title: "Property Not Found | LuxeEstate",
    };
  }

  const { property, images } = data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://inmo-estate.vercel.app";
  const propertyUrl = `${siteUrl}/${locale}/propiedades/${slug}`;

  const imageUrls = [...images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 4)
    .map((img) => img.url);

  return {
    title: `${property.title} | ${property.location} | LuxeEstate`,
    description: property.description ?? `Check out this amazing property in ${property.location}.`,
    alternates: {
      canonical: propertyUrl,
    },
    openGraph: {
      title: `${property.title} | ${property.location} | LuxeEstate`,
      description: property.description ?? `Check out this amazing property in ${property.location}.`,
      url: propertyUrl,
      siteName: "Luxe Estate",
      type: "website",
      images: imageUrls,
    },
    twitter: {
      card: "summary_large_image",
      title: `${property.title} | ${property.location} | LuxeEstate`,
      description: property.description ?? `Check out this amazing property in ${property.location}.`,
      images: imageUrls.length > 0 ? [imageUrls[0]] : [],
    },
  };
}

export default async function PropertyDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const data = await getPropertyBySlug(resolvedParams.slug);
  const t = await getTranslations("PropertyDetails");

  if (!data || !data.property) {
    notFound();
  }

  const { property, images } = data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://inmo-estate.vercel.app";
  const mainImage = images.find((i) => i.is_main) || {
    id: "default",
    property_id: property.id,
    url: property.imageUrl,
    is_main: true,
    sort_order: 0,
  };

  const isSold = property.type === "SOLD";
  const isRented = property.type === "RENTED";
  const isUnavailable = isSold || isRented;

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `${siteUrl}/${resolvedParams.locale}/propiedades/${property.slug}`,
    image: property.imageUrl,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.location,
    },
    numberOfBedrooms: property.bedrooms,
    numberOfBathrooms: property.bathrooms,
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.area,
      unitCode: "MTK",
    },
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Sold/Rented Banner */}
      {isUnavailable && (
        <div className={`mb-6 p-4 rounded-xl text-center ${isSold ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-800'}`}>
          <span className="material-icons text-2xl mb-1 block">
            {isSold ? 'domain_disabled' : 'handshake'}
          </span>
          <p className="font-bold text-lg">
            {isSold ? 'This property has been sold' : 'This property has been rented'}
          </p>
          <p className="text-sm mt-1 opacity-80">
            Contact us to find similar properties
          </p>
        </div>
      )}
      
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
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-light text-nordic mb-2">
                  {formattedPrice} {property.priceLabel && <span className="text-lg font-medium text-nordic/60">{property.priceLabel}</span>}
                </h1>
                <p className="text-nordic/60 font-medium flex items-center gap-1">
                  <span className="material-icons text-mosque text-sm">location_on</span>
                  {property.address}
                </p>
              </div>

              <div className="h-px bg-slate-100 my-6"></div>

              {/* Agent Section (Hardcoded for now) */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w"
                    alt="Sarah Jenkins"
                    fill
                    sizes="56px"
                    className="rounded-full object-cover border-2 border-white shadow-sm"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-nordic">Sarah Jenkins</h3>
                  <div className="flex items-center gap-1 text-xs text-mosque font-medium">
                    <span className="material-icons text-[14px]">star</span>
                    <span>{t("top_rated_agent")}</span>
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
                {isUnavailable ? (
                  <>
                    <button className="w-full bg-mosque hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group">
                      <span className="material-icons text-xl group-hover:scale-110 transition-transform">
                        notifications
                      </span>
                      Notify me of similar properties
                    </button>
                    <button className="w-full bg-transparent border border-nordic/10 hover:border-mosque text-nordic/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                      <span className="material-icons text-xl">mail_outline</span>
                      {t("contact_agent")}
                    </button>
                  </>
                ) : (
                  <>
                    <button className="w-full bg-mosque hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group">
                      <span className="material-icons text-xl group-hover:scale-110 transition-transform">
                        calendar_today
                      </span>
                      {t("schedule_visit")}
                    </button>
                    <button className="w-full bg-transparent border border-nordic/10 hover:border-mosque text-nordic/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                      <span className="material-icons text-xl">mail_outline</span>
                      {t("contact_agent")}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white p-2 rounded-xl shadow-[3px_3px_12px_rgba(0,0,0,0.25)]">
              <PropertyMap address={property.address} lat={property.lat} lng={property.lng} />
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
