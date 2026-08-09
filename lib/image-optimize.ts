export interface OptimizedImage {
  blob: Blob;
  extension: "webp" | "jpg";
}

export interface OptimizeOptions {
  maxDimension?: number;
  quality?: number;
  maxSkipSize?: number;
}

const DEFAULT_MAX_DIMENSION = 1920;
const DEFAULT_QUALITY = 0.8;
const DEFAULT_MAX_SKIP_SIZE = 400 * 1024; // 400 KB

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode failed"));
    img.src = URL.createObjectURL(file);
  });
}

function drawToBlob(
  img: HTMLImageElement,
  maxDimension: number,
  mimeType: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const { width, height } = img;
    const ratio = Math.min(
      maxDimension / width,
      maxDimension / height,
      1
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(null);
      return;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => resolve(blob),
      mimeType,
      quality
    );
  });
}

/**
 * Optimizes an image for the web:
 * - Always converts to WebP (falling back to JPEG) at the given quality
 * - Resizes down to `maxDimension` on the longest side, keeping aspect ratio
 * - Skips processing when the file is already a small WebP within bounds
 *
 * Runs entirely in the browser (Canvas API) — no libraries required.
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<OptimizedImage> {
  const {
    maxDimension = DEFAULT_MAX_DIMENSION,
    quality = DEFAULT_QUALITY,
    maxSkipSize = DEFAULT_MAX_SKIP_SIZE,
  } = options;

  const alreadyOptimized =
    file.type === "image/webp" &&
    file.size <= maxSkipSize;

  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    // Canvas can't decode this file (e.g. HEIC from iPhone) — upload as-is
    return { blob: file, extension: "webp" };
  }

  try {
    if (alreadyOptimized && img.width <= maxDimension && img.height <= maxDimension) {
      URL.revokeObjectURL(img.src);
      return { blob: file, extension: "webp" };
    }

    // Prefer WebP; if the browser can't encode it (toBlob returns null), fall back to JPEG.
    let blob = await drawToBlob(img, maxDimension, "image/webp", quality);
    let extension: OptimizedImage["extension"] = "webp";

    if (!blob) {
      blob = await drawToBlob(img, maxDimension, "image/jpeg", quality);
      extension = "jpg";
    }

    URL.revokeObjectURL(img.src);

    if (blob && blob.size > 0) {
      return { blob, extension };
    }

    return { blob: file, extension };
  } catch {
    URL.revokeObjectURL(img.src);
    return { blob: file, extension: "webp" };
  }
}
