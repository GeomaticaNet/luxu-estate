import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/lib/properties";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyFeatures } from "@/components/property/PropertyFeatures";
import { MortgageCalculator } from "@/components/property/MortgageCalculator";
import PropertyMap from "@/components/property/PropertyMap";
import { BackButton } from "@/components/ui/BackButton";
import { PropertyContactSection } from "@/components/contact/PropertyContactSection";
import Image from "next/image";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createPublicClient } from "@/lib/supabase/server";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data: slugs } = await supabase
    .from("properties")
    .select("slug")
    .eq("active", true);

  const locales = ["es", "en", "pt"];
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    for (const row of slugs ?? []) {
      params.push({ locale, slug: row.slug });
    }
  }

  return params;
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

  const ogImages = [...images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 4)
    .map((img) => ({
      url: img.url,
      width: 1200,
      height: 630,
      alt: property.title,
    }));

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
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${property.title} | ${property.location} | LuxeEstate`,
      description: property.description ?? `Check out this amazing property in ${property.location}.`,
      images: ogImages.length > 0 ? [ogImages[0].url] : [],
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

  // Fetch the assigned agent's profile if the property has one
  const supabase = createPublicClient();
  let agent: { full_name: string | null; avatar_url: string | null; phone: string | null } | null = null;
  if (property.agentId) {
    const { data: agentProfile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, phone")
      .eq("user_id", property.agentId)
      .maybeSingle();
    if (agentProfile) agent = agentProfile;
  }

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
                  {property.address}{property.city ? `, ${property.city}` : ""}
                </p>
              </div>

              <div className="h-px bg-slate-100 my-6"></div>

              {/* Agent Section — dynamic from assigned agent */}
              {agent ? (
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    {agent.avatar_url ? (
                      <Image
                        src={agent.avatar_url}
                        alt={agent.full_name || "Agente"}
                        fill
                        sizes="56px"
                        className="rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-mosque/10 flex items-center justify-center">
                        <span className="material-icons text-nordic-dark/60">person</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-nordic">{agent.full_name || "Agente"}</h3>
                    <div className="flex items-center gap-1 text-xs text-mosque font-medium">
                      <span className="material-icons text-[14px]">star</span>
                      <span>{t("top_rated_agent")}</span>
                    </div>
                  </div>
                  {agent.phone && (
                    <div className="ml-auto flex gap-2">
                      <a
                        href={`https://wa.me/${agent.phone.replace(/[^+\d]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="WhatsApp"
                        className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors"
                      >
                        <span className="material-icons text-sm">chat</span>
                      </a>
                      <a
                        href={`tel:${agent.phone.replace(/[^+\d]/g, "")}`}
                        aria-label="Llamar"
                        className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors"
                      >
                        <span className="material-icons text-sm">call</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-mosque/10 flex items-center justify-center">
                      <span className="material-icons text-nordic-dark/60">business</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-nordic">Luxe Estate</h3>
                    <div className="flex items-center gap-1 text-xs text-mosque font-medium">
                      <span className="material-icons text-[14px]">star</span>
                      <span>{t("top_rated_agent")}</span>
                    </div>
                  </div>
                </div>
              )}

              <PropertyContactSection
                isUnavailable={isUnavailable}
                isSold={isSold}
                propertyId={property.id}
                propertyTitle={property.title}
              />
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
