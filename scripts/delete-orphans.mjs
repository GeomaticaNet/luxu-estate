import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Load .env.local manually (no dotenv dependency)
const env = readFileSync(".env.local", "utf8");
for (const line of env.split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "property_images";
const PREFIX = "uploads";

async function listAll(bucket, prefix) {
  const items = [];
  const limit = 100;
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit, offset });
    if (error) throw error;
    items.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }
  return items;
}

async function main() {
  // 1) Get referenced storage URLs from the DB
  const { data: rows, error: dbError } = await supabase
    .from("property_images")
    .select("url");
  if (dbError) throw dbError;

  const referencedPaths = new Set();
  for (const row of rows) {
    const match = row.url.match(/\/object\/public\/property_images\/(.+)$/);
    if (match) referencedPaths.add(match[1]);
  }

  // 2) List all objects
  const items = await listAll(BUCKET, PREFIX);

  const orphans = items.filter((it) => {
    const fullPath = `${PREFIX}/${it.name}`;
    return !referencedPaths.has(fullPath);
  });

  console.log(`Total objects: ${items.length}`);
  console.log(`Referenced in DB: ${referencedPaths.size}`);
  console.log(`Orphans to delete: ${orphans.length}\n`);

  for (const o of orphans) {
    console.log(`  DELETE ${o.name} (${((o.metadata?.size || 0) / 1024).toFixed(0)} KB)`);
  }

  if (orphans.length === 0) {
    console.log("Nothing to delete.");
    return;
  }

  const paths = orphans.map((o) => `${PREFIX}/${o.name}`);
  const { data, error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) {
    console.error("Delete error:", error.message);
    process.exit(1);
  }
  console.log(`\nDeleted ${data?.length ?? 0} orphan files.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
