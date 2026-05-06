// scripts/seed.mjs
// Run with: node --env-file=.env.local scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "❌ Missing environment variables. Make sure .env.local exists with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const properties = [
  // ── Featured ────────────────────────────────────────────────────────────────
  {
    title: "The Glass Pavilion",
    price: 5250000,
    price_label: null,
    location: "Beverly Hills, California",
    address: "Beverly Hills, California",
    type: "SALE",
    bedrooms: 5,
    bathrooms: 4.5,
    area: 4200,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCra-FKp81t0_OM8bWD55m2o9OOSnR_v7D0UilyExMImxyIcr9tIMZ2Py3HcC0ra_MtSsBkduMcwxUNKI9_iSXFFr_YRON1SF9hNM3fcYy-uG7N7uusL0Z367WINi1V7_GwfNQx-gsbUqLtzVi4ivFyqFQGb4qBs79bALeSFb6i3_ZnJnI1VVrN-VeZYHjfYyQI5C6zy90N3uxWZpwzIBhNoUDKKQjQ8EOEYPoyPTzhnh6b6AS3dkkFJ8t4xSDC6qjhMrQUoUPnAeM",
    image_alt: "Luxury modern villa exterior with pool",
    is_featured: true,
    featured_label: "Exclusive",
  },
  {
    title: "Azure Heights Penthouse",
    price: 3800000,
    price_label: null,
    location: "Downtown, Vancouver",
    address: "Downtown, Vancouver",
    type: "SALE",
    bedrooms: 3,
    bathrooms: 3,
    area: 2100,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDurAGHzg_fpQxFal-obkFVy1Q3WLPdueAQpz0itcQiRV-WfvulnBEDJbNeV8J06q4mX7PTtXYVJjX4-mHVr_khZLZxQ_s8f6fruGqzeqALyMu8wEHRK1EsOs9f4_jPmS7FxcdzrDkR88Wz0GjaPLXkTZRoJQfur59rxYRLi-WYcW-VU_gKS39CPLOMlftvqGvW0IOk5tXgst5mJ4WQM-ICN4vkdel9ido9YFUQga0OI10i6NSe5W4owt33-2YRi_b_ltdZW2QZC5s",
    image_alt: "Modern interior living room with view",
    is_featured: true,
    featured_label: "New Arrival",
  },
  // ── New in Market ────────────────────────────────────────────────────────────
  {
    title: "Modern Family Home",
    price: 850000,
    price_label: null,
    location: "Seattle",
    address: "123 Pine St, Seattle",
    type: "SALE",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDuQ9M7U6euA6_cXmYuXnej-N5IuawAW8ds-4G1mzfqmiBc13qXsPhf9_j_zTB8gfEunrBHo8xMsxYawCw_pl8fsxbxRkmyvLR1N9Tiye5ZJG7fwlLn9MwyBanXYhE0emGwp59es1FEyQTRQbmXLUKO74Yj34ZHqrqIkOtMKhP8CmRFvfoHT5LAe10105vUhKNkxIBvtt530nfLigSUTemOOcJMVNmsgactntRJUwOBU_TZzND7BYtDklr8uZcNYlQOK5U74-ufIf-E",
    image_alt: "Modern white house facade",
    is_featured: false,
    featured_label: null,
  },
  {
    title: "Urban Loft",
    price: 3200,
    price_label: "/mo",
    location: "Portland",
    address: "456 Elm Ave, Portland",
    type: "RENT",
    bedrooms: 1,
    bathrooms: 1,
    area: 85,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4zNatD3vePhIZAi6OHHJKmamYSgeBNSKjEt32tvkkf4s6aBXCF8R4LNfDfPa9leA0t6N1OKOcP358WwZrnosbCBxSM7EaY2_P7qkx3MinRgmHQn7RvleNTwy8cLigMoR3iv0u83chBVbZYI6BcNMcqv80W-l1pIUgIWZcDIXEqtUatrsojSGfM0lTNDZpkBntBUkRY6NB4ZUymYNYvTHXKbO8NZ6N6uoyuuHqcaRWKzHCNXkOR3p-_EVFAHR8QwijIY_m1mefPZ4",
    image_alt: "Stylish apartment living room",
    is_featured: false,
    featured_label: null,
  },
  {
    title: "Highland Retreat",
    price: 620000,
    price_label: null,
    location: "Bend",
    address: "789 Mountain Rd, Bend",
    type: "SALE",
    bedrooms: 2,
    bathrooms: 2,
    area: 98,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARQWC19e7mleUpjb8CWLztEv_svJeRFOaC2i-9r9GctFuX5Barzhfai9wNM1WW8bcGlqdFM32d3KPf7SItom5ijdHOz5rGGQPeT7PlWs8-y9LkfcsHLQqsLxalhxP94XJo76_mAMp7T2dVj3hPKHNzTDLLiS6ujSdSsyo3onxQthp4ZkVE8op92gyTLUUucaGaxO8vJvyhH3HuWB07EPqT1WsW0lr9Of5lUPonjG9eiqE1XiJXTqzXUZQt5JorfPwCO1MioZA_Zro",
    image_alt: "Cabin in the woods",
    is_featured: false,
    featured_label: null,
  },
  {
    title: "Sea View Penthouse",
    price: 4500,
    price_label: "/mo",
    location: "Miami",
    address: "321 Ocean Dr, Miami",
    type: "RENT",
    bedrooms: 3,
    bathrooms: 3,
    area: 180,
    image_url:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_alt: "Bright bedroom with large window",
    is_featured: false,
    featured_label: null,
  },
  {
    title: "Central Studio",
    price: 550000,
    price_label: null,
    location: "Chicago",
    address: "555 Main St, Chicago",
    type: "SALE",
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    image_url:
      "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_alt: "Cozy apartment interior",
    is_featured: false,
    featured_label: null,
  },
  {
    title: "Garden Villa",
    price: 2800,
    price_label: "/mo",
    location: "Austin",
    address: "999 Oak Ln, Austin",
    type: "RENT",
    bedrooms: 2,
    bathrooms: 2,
    area: 110,
    image_url:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_alt: "Modern minimalist home exterior",
    is_featured: false,
    featured_label: null,
  },
  {
    title: "Luxury Condo",
    price: 950000,
    price_label: null,
    location: "New York",
    address: "100 Broadway, New York",
    type: "SALE",
    bedrooms: 2,
    bathrooms: 2,
    area: 130,
    image_url:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_alt: "Luxury Condo interior",
    is_featured: false,
    featured_label: null,
  },
  {
    title: "Suburban Family House",
    price: 450000,
    price_label: null,
    location: "Dallas",
    address: "200 Suburb Ln, Dallas",
    type: "SALE",
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    image_url:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_alt: "Suburban Family House",
    is_featured: false,
    featured_label: null,
  },
  {
    title: "Beachfront Villa",
    price: 15000,
    price_label: "/mo",
    location: "Malibu",
    address: "300 Pacific Coast Hwy, Malibu",
    type: "RENT",
    bedrooms: 5,
    bathrooms: 4,
    area: 350,
    image_url:
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_alt: "Beachfront Villa exterior",
    is_featured: false,
    featured_label: null,
  },
  {
    title: "Modern Townhouse",
    price: 750000,
    price_label: null,
    location: "Denver",
    address: "400 City Pl, Denver",
    type: "SALE",
    bedrooms: 3,
    bathrooms: 2.5,
    area: 180,
    image_url:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_alt: "Modern Townhouse facade",
    is_featured: false,
    featured_label: null,
  },
  {
    title: "Downtown Apartment",
    price: 2500,
    price_label: "/mo",
    location: "San Francisco",
    address: "500 Market St, San Francisco",
    type: "RENT",
    bedrooms: 1,
    bathrooms: 1,
    area: 70,
    image_url:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_alt: "Downtown apartment view",
    is_featured: false,
    featured_label: null,
  },
  {
    title: "Rustic Cabin",
    price: 320000,
    price_label: null,
    location: "Asheville",
    address: "600 Forest Rd, Asheville",
    type: "SALE",
    bedrooms: 2,
    bathrooms: 1,
    area: 110,
    image_url:
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_alt: "Rustic cabin in the woods",
    is_featured: false,
    featured_label: null,
  },
  {
    title: "Lakehouse Retreat",
    price: 850000,
    price_label: null,
    location: "Lake Tahoe",
    address: "700 Lakeview Dr, Lake Tahoe",
    type: "SALE",
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    image_url:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_alt: "Lakehouse deck and view",
    is_featured: false,
    featured_label: null,
  },
  {
    title: "Minimalist Studio",
    price: 1800,
    price_label: "/mo",
    location: "Brooklyn",
    address: "800 Brooklyn Ave, Brooklyn",
    type: "RENT",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    image_url:
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_alt: "Minimalist studio interior",
    is_featured: false,
    featured_label: null,
  },
  {
    title: "Historic Mansion",
    price: 2100000,
    price_label: null,
    location: "Charleston",
    address: "900 Historic Ln, Charleston",
    type: "SALE",
    bedrooms: 6,
    bathrooms: 5,
    area: 520,
    image_url:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_alt: "Historic Mansion exterior",
    is_featured: false,
    featured_label: null,
  },
  {
    title: "Eco-Friendly Home",
    price: 680000,
    price_label: null,
    location: "Austin",
    address: "1000 Green Way, Austin",
    type: "SALE",
    bedrooms: 3,
    bathrooms: 2,
    area: 160,
    image_url:
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_alt: "Eco-Friendly modern home",
    is_featured: false,
    featured_label: null,
  },
];

async function seed() {
  console.log(`Seeding ${properties.length} properties...`);

  const { data, error } = await supabase
    .from("properties")
    .insert(properties)
    .select("id, title");

  if (error) {
    console.error("❌ Error seeding:", error.message);
    process.exit(1);
  }

  console.log(`✅ Inserted ${data.length} rows:`);
  data.forEach((r) => console.log(`  - ${r.id} | ${r.title}`));
}

seed();
