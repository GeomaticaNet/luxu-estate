import { ImageResponse } from "next/og";
import { getPropertyBySlug } from "@/lib/properties";

export const alt = "Luxe Estate Property";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPropertyBySlug(slug);

  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#19322F",
            color: "white",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          Luxe Estate
        </div>
      ),
      { ...size }
    );
  }

  const { property, images } = data;

  const sortedImages = [...images].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const displayImages: (string | null)[] = sortedImages
    .slice(0, 4)
    .map((img) => img.url);

  while (displayImages.length < 4) {
    displayImages.push(null);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#EEF6F6",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "row" }}>
            {displayImages.slice(0, 2).map((url, i) =>
              url ? (
                <img
                  key={i}
                  src={url}
                  alt=""
                  style={{ flex: 1, height: "100%" }}
                />
              ) : (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: "100%",
                    backgroundColor: "#006655",
                  }}
                />
              )
            )}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "row" }}>
            {displayImages.slice(2, 4).map((url, i) =>
              url ? (
                <img
                  key={i + 2}
                  src={url}
                  alt=""
                  style={{ flex: 1, height: "100%" }}
                />
              ) : (
                <div
                  key={i + 2}
                  style={{
                    flex: 1,
                    height: "100%",
                    backgroundColor: "#006655",
                  }}
                />
              )
            )}
          </div>
        </div>

        <div
          style={{
            height: 100,
            backgroundColor: "#006655",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "0 40px",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "white",
                marginBottom: 2,
                display: "flex",
              }}
            >
              {property.title}
            </div>
            <div
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.85)",
                display: "flex",
              }}
            >
              {formatPrice(property.price)}
              {"  ·  "}
              {property.bedrooms} dorm.  ·  {property.location}
            </div>
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: 4,
              display: "flex",
            }}
          >
            LUXE
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
