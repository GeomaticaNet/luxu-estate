import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

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
const MAX_DIMENSION = 1920;
const TARGET_BYTES = 380 * 1024; // aim ~400KB with headroom

function formatKB(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

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

async function optimizeToWebp(buffer, originalName) {
  const img = sharp(buffer).rotate();
  const meta = await img.metadata();

  let outBuffer;
  const qualities = [78, 68, 58, 48, 38];
  for (const quality of qualities) {
    outBuffer = await img
      .clone()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 6 })
      .toBuffer();
    if (outBuffer.length <= TARGET_BYTES) break;
  }

  return {
    buffer: outBuffer,
    width: meta.width,
    height: meta.height,
    skipped: false,
  };
}

async function main() {
  const items = await listAll(BUCKET, PREFIX);
  console.log(`${items.length} objects in ${BUCKET}/${PREFIX}\n`);

  let optimized = 0;
  let skipped = 0;
  let errors = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const it of items) {
    const sizeBefore = it.metadata?.size || 0;
    totalBefore += sizeBefore;
    const path = `${PREFIX}/${it.name}`;

    try {
      if (sizeBefore <= TARGET_BYTES && it.metadata?.mimetype === "image/webp") {
        skipped++;
        totalAfter += sizeBefore;
        console.log(`SKIP  ${it.name.padEnd(28)} ${formatKB(sizeBefore)} (already small webp)`);
        continue;
      }

      const { data: blob, error: downloadError } = await supabase.storage
        .from(BUCKET)
        .download(path);
      if (downloadError || !blob) {
        errors++;
        console.log(`ERROR ${it.name.padEnd(28)} download: ${downloadError?.message || "no data"}`);
        continue;
      }

      const arrayBuffer = await blob.arrayBuffer();
      const { buffer, width, height } = await optimizeToWebp(Buffer.from(arrayBuffer), it.name);

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(
        path,
        buffer,
        { upsert: true, contentType: "image/webp" }
      );
      if (uploadError) {
        errors++;
        console.log(`ERROR ${it.name.padEnd(28)} upload: ${uploadError.message}`);
        totalAfter += sizeBefore;
        continue;
      }

      const sizeAfter = buffer.length;
      totalAfter += sizeAfter;
      optimized++;
      const pct = sizeBefore > 0 ? ((1 - sizeAfter / sizeBefore) * 100).toFixed(0) : "0";
      console.log(
        `DONE  ${it.name.padEnd(28)} ${formatKB(sizeBefore).padStart(7)} -> ${formatKB(sizeAfter).padStart(6)}  (-${pct}%)  ${width}x${height}`
      );
    } catch (e) {
      errors++;
      console.log(`ERROR ${it.name.padEnd(28)} ${e.message}`);
      totalAfter += sizeBefore;
    }
  }

  console.log(`\nSummary: ${optimized} optimized, ${skipped} skipped, ${errors} errors`);
  console.log(`Total: ${formatKB(totalBefore)} -> ${formatKB(totalAfter)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
