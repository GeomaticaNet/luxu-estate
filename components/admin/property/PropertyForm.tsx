"use client";

import { useState, useTransition, useRef, useCallback, useEffect } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { upsertProperty } from "@/app/[locale]/admin/properties/actions";
import { geocodeAddress, reverseGeocode } from "@/lib/geocode";
import { useLocale, useTranslations } from "next-intl";

const InteractiveMap = dynamic(
  () => import("@/components/property/InteractiveLeafletMap"),
  { ssr: false, loading: () => <div className="w-full h-48 bg-gray-100 rounded-[0.5rem] animate-pulse" /> }
);

interface PropertyFormProps {
  initialData?: any;
}

const AMENITIES_LIST = [
  "Swimming Pool",
  "Garden",
  "Air Conditioning",
  "Smart Home System",
  "Gym",
  "Parking",
  "Wifi",
  "Balcony",
  "Security System",
  "Elevator",
  "Concierge",
  "Laundry",
  "Storage",
  "Fireplace",
  "Home Theater",
  "Wine Cellar",
  "Sauna",
  "BBQ Area",
  "Ocean View",
  "City View",
  "Mountain View",
  "Central Heating & Cooling",
  "Electric Vehicle Charging",
  "Private Gym",
  "Home Office",
  "Pet Friendly",
];

const STATUS_OPTIONS = [
  { value: "SALE", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
  { value: "SOLD", label: "Sold" },
];

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "penthouse", label: "Penthouse" },
];

async function resizeImage(file: File, maxDimension: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      if (width <= maxDimension && height <= maxDimension) {
        URL.revokeObjectURL(img.src);
        resolve(file);
        return;
      }
      const ratio = Math.min(maxDimension / width, maxDimension / height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(img.src);
        resolve(file);
        return;
      }
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else resolve(file);
        },
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

export default function PropertyForm({ initialData }: PropertyFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Admin");
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryGridRef = useRef<HTMLDivElement>(null);
  const savedPropertyIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(() => {
    return initialData?.property_images?.map((img: any) => img.url) || [];
  });

  const [lat, setLat] = useState(initialData?.lat || 37.4419);
  const [lng, setLng] = useState(initialData?.lng || -122.143);
  const [address, setAddress] = useState(initialData?.address || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [state, setState] = useState(initialData?.state || "");
  const [country, setCountry] = useState(initialData?.country || "");
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false);

  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms || 3);
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms || 2);
  const [garages, setGarages] = useState(initialData?.garages || 1);

  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || []);
  const [descLength, setDescLength] = useState(initialData?.description?.length || 0);
  const [imageOrder, setImageOrder] = useState<string[]>(() => {
    return initialData?.property_images?.map((img: any) => img.url) || [];
  });
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);
  const geoTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const prevAddressRef = useRef(address);
  const isForwardGeocodingRef = useRef(false);

  const DEFAULT_LAT = 37.4419;
  const DEFAULT_LNG = -122.143;

  // Reverse geocode whenever lat/lng change from map interaction or manual input
  useEffect(() => {
    if (isForwardGeocodingRef.current) {
      isForwardGeocodingRef.current = false;
      return;
    }
    if (lat && lng && lat !== DEFAULT_LAT && lng !== DEFAULT_LNG) {
      if (geoTimeoutRef.current) clearTimeout(geoTimeoutRef.current);
      geoTimeoutRef.current = setTimeout(async () => {
        const result = await reverseGeocode(lat, lng, locale);
        if (result) {
          setAddress(result.address);
          if (result.city) setCity(result.city);
          if (result.state) setState(result.state);
          if (result.country) setCountry(result.country);
        }
      }, 400);
    }
  }, [lat, lng, locale]);

  const handleAddressChange = useCallback((value: string) => {
    setAddress(value);
    if (geoTimeoutRef.current) clearTimeout(geoTimeoutRef.current);
    if (value.trim().length >= 5) {
      geoTimeoutRef.current = setTimeout(async () => {
        const result = await geocodeAddress(value);
        if (result) {
          isForwardGeocodingRef.current = true;
          setLat(result.lat);
          setLng(result.lng);
        }
      }, 800);
    }
  }, []);

  const handleLatChange = useCallback((value: number) => {
    setLat(value);
  }, []);

  const handleLngChange = useCallback((value: number) => {
    setLng(value);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArray]);
      const newUrls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newUrls]);
      setImageOrder((prev) => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    const container = galleryGridRef.current;
    if (!container) return;

    const urlToRemove = previewUrls[index];
    const isExistingImage = initialData?.property_images?.some(
      (img: any) => img.url === urlToRemove
    );

    // Capture positions BEFORE removal
    const items = Array.from(container.querySelectorAll('[data-preview="true"]')) as HTMLElement[];
    const oldPositions = new Map<HTMLElement, DOMRect>();
    items.forEach((el) => oldPositions.set(el, el.getBoundingClientRect()));

    flushSync(() => {
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
      setImageOrder((prev) => prev.filter((_, i) => i !== index));
      if (isExistingImage) {
        setDeletedImageUrls((prev) => [...prev, urlToRemove]);
      }
      if (index < images.length) {
        setImages((prev) => prev.filter((_, i) => i !== index));
      }
    });

    // FLIP: animate remaining items from old positions to new positions
    const newItems = Array.from(container.querySelectorAll('[data-preview="true"]')) as HTMLElement[];
    newItems.forEach((el) => {
      const oldPos = oldPositions.get(el);
      if (!oldPos) return;
      const newPos = el.getBoundingClientRect();
      const deltaX = oldPos.left - newPos.left;
      const deltaY = oldPos.top - newPos.top;

      if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        el.style.transition = "none";
        el.getBoundingClientRect(); // force reflow
        el.style.transition = "transform 400ms cubic-bezier(0.25, 0.1, 0.25, 1)";
        el.style.transform = "translate(0, 0)";
        setTimeout(() => {
          el.style.transition = "";
          el.style.transform = "";
        }, 400);
      }
    });
  };

  const setMainImage = (index: number) => {
    const container = galleryGridRef.current;
    if (!container) return;

    // 1. Capture current positions keyed by DOM node reference
    const items = Array.from(container.querySelectorAll('[data-preview="true"]')) as HTMLElement[];
    const oldPositions = new Map<HTMLElement, DOMRect>();
    items.forEach((el) => oldPositions.set(el, el.getBoundingClientRect()));

    // 2. Reorder state SYNCHRONOUSLY
    flushSync(() => {
      setPreviewUrls((prev) => {
        const newUrls = [...prev];
        const [moved] = newUrls.splice(index, 1);
        if (index === 0) newUrls.push(moved);
        else newUrls.unshift(moved);
        return newUrls;
      });
      setImageOrder((prev) => {
        const newOrder = [...prev];
        const [moved] = newOrder.splice(index, 1);
        if (index === 0) newOrder.push(moved);
        else newOrder.unshift(moved);
        return newOrder;
      });
      if (index < images.length) {
        setImages((prev) => {
          const newImages = [...prev];
          const [moved] = newImages.splice(index, 1);
          if (index === 0) newImages.push(moved);
          else newImages.unshift(moved);
          return newImages;
        });
      }
    });

    // 3. Animate by matching same DOM nodes (React reuses them thanks to stable keys)
    const newItems = Array.from(container.querySelectorAll('[data-preview="true"]')) as HTMLElement[];
    newItems.forEach((el) => {
      const oldPos = oldPositions.get(el);
      if (!oldPos) return;

      const newPos = el.getBoundingClientRect();
      const deltaX = oldPos.left - newPos.left;
      const deltaY = oldPos.top - newPos.top;

      if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        el.style.transition = "none";
        el.getBoundingClientRect(); // force reflow
        el.style.transition = "transform 500ms cubic-bezier(0.25, 0.1, 0.25, 1)";
        el.style.transform = "translate(0, 0)";

        setTimeout(() => {
          el.style.transition = "";
          el.style.transform = "";
        }, 500);
      }
    });
  };


  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescLength(e.target.value.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    const saveMode = (formData.get("saveMode") as string) || "publish";

    const status = (formData.get("type") as string) || "SALE";
    const isDraft = saveMode === "draft";
    const active = formData.get("active") === "true";

    formData.set("lat", lat.toString());
    formData.set("lng", lng.toString());
    formData.set("city", city);
    formData.set("state", state);
    formData.set("country", country);
    formData.set("bedrooms", bedrooms.toString());
    formData.set("bathrooms", bathrooms.toString());
    formData.set("garages", garages.toString());
    formData.set("active", active.toString());
    formData.set("is_featured", isFeatured.toString());
    formData.set("amenities", JSON.stringify(amenities));

    const existingId = initialData?.id || savedPropertyIdRef.current;
    if (existingId) {
      formData.append("id", existingId);
    }
    formData.set("deleted_images", JSON.stringify(deletedImageUrls));

    // Upload new images client-side to Supabase Storage
    const existingUrls = new Set(
      initialData?.property_images?.map((img: any) => img.url) || []
    );
    const newBlobUrls = previewUrls.filter((u) => !existingUrls.has(u));
    const blobUrlToRealUrl: Record<string, string> = {};

    const supabase = createClient();

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const blobUrl = newBlobUrls[i];
      if (!file || file.size === 0) continue;

      const resizedBlob = await resizeImage(file, 1920);
      const fileExt = "jpg";
      const fileName = `${Date.now()}-${i}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("property_images")
        .upload(filePath, resizedBlob);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("property_images")
        .getPublicUrl(filePath);

      if (blobUrl && urlData?.publicUrl) {
        blobUrlToRealUrl[blobUrl] = urlData.publicUrl;
      }
    }

    const finalImageUrls = imageOrder.map(
      (url) => blobUrlToRealUrl[url] || url
    );
    formData.set("image_urls", JSON.stringify(finalImageUrls));

    startTransition(async () => {
      const result = await upsertProperty(formData);
      console.log("[handleSubmit] Server result:", result);
      if (result.success) {
        if (isDraft) {
          if (result.id) savedPropertyIdRef.current = result.id;
          setToast("Changes saved");
        } else {
          router.push("/admin/properties");
        }
      } else {
        alert("Error saving property: " + result.error);
      }
    });
  };

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-medium font-sf-pro animate-slide-in">
          {toast}
        </div>
      )}
      <form
      id="property-form"
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"
    >
      {/* LEFT COLUMN */}
      <div className="xl:col-span-8 space-y-8">
        {/* Basic Information */}
        <div id="basic-info-section" className="bg-white rounded-[0.75rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-hint-of-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-of-green/10 to-transparent">
            <div className="w-8 h-8 rounded-full bg-hint-of-green flex items-center justify-center text-nordic-dark">
              <span className="material-icons !text-[17px]">info</span>
            </div>
            <h2 className="text-xl font-bold text-nordic-dark">Basic Information</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="group">
              <label htmlFor="title" className="block text-sm font-medium text-nordic-dark mb-1.5 font-sf-pro">
                Property Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                defaultValue={initialData?.title}
                placeholder="e.g. Modern Penthouse with Ocean View"
                className="w-full text-base px-4 py-2.5 rounded-[0.375rem] border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf-pro"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-nordic-dark mb-1.5 font-sf-pro">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-sf-pro text-sm">$</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    defaultValue={initialData?.price}
                    placeholder="0.00"
                    className="w-full pl-7 pr-4 py-2.5 rounded-[0.375rem] border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-medium font-sf-pro"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-nordic-dark mb-1.5 font-sf-pro">
                  Status
                </label>
                <select
                  id="type"
                  name="type"
                  defaultValue={initialData?.type || "SALE"}
                  className="w-full px-4 py-2.5 rounded-[0.375rem] border border-gray-200 bg-white text-nordic-dark focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf-pro cursor-pointer"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="property_type" className="block text-sm font-medium text-nordic-dark mb-1.5 font-sf-pro">
                  Property Type
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  defaultValue={initialData?.property_type || "apartment"}
                  className="w-full px-4 py-2.5 rounded-[0.375rem] border border-gray-200 bg-white text-nordic-dark focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf-pro cursor-pointer"
                >
                  {PROPERTY_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured_checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-mosque border-gray-300 rounded focus:ring-mosque cursor-pointer"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-nordic-dark font-sf-pro cursor-pointer">
                Mark as featured property
              </label>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="active"
                name="active"
                value="true"
                defaultChecked={initialData?.active !== false}
                className="w-4 h-4 text-mosque border-gray-300 rounded focus:ring-mosque cursor-pointer"
              />
              <label htmlFor="active" className="text-sm font-medium text-nordic-dark font-sf-pro cursor-pointer">
                Visible on public site
              </label>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-[0.75rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-hint-of-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-of-green/10 to-transparent">
            <div className="w-8 h-8 rounded-full bg-hint-of-green flex items-center justify-center text-nordic-dark">
              <span className="material-icons !text-[17px]">description</span>
            </div>
            <h2 className="text-xl font-bold text-nordic-dark">Description</h2>
          </div>
          <div className="p-8">
            <div className="mb-3 flex gap-2 border-b border-gray-100 pb-2">
              <button type="button" className="p-1.5 text-gray-400 hover:text-nordic-dark hover:bg-gray-50 rounded transition-colors">
                <span className="material-icons text-lg">format_bold</span>
              </button>
              <button type="button" className="p-1.5 text-gray-400 hover:text-nordic-dark hover:bg-gray-50 rounded transition-colors">
                <span className="material-icons text-lg">format_italic</span>
              </button>
              <button type="button" className="p-1.5 text-gray-400 hover:text-nordic-dark hover:bg-gray-50 rounded transition-colors">
                <span className="material-icons text-lg">format_list_bulleted</span>
              </button>
            </div>
            <textarea
              id="description"
              name="description"
              defaultValue={initialData?.description}
              onChange={handleDescriptionChange}
              maxLength={2000}
              placeholder="Describe the property features, neighborhood, and unique selling points..."
              className="w-full px-4 py-3 rounded-[0.375rem] border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf-pro leading-relaxed resize-y min-h-[200px]"
            />
            <div className="mt-2 text-right text-xs text-gray-400 font-sf-pro">
              {descLength} / 2000 characters
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-[0.75rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-hint-of-green/30 flex justify-between items-center bg-gradient-to-r from-hint-of-green/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-hint-of-green flex items-center justify-center text-nordic-dark">
                <span className="material-icons !text-[17px]">image</span>
              </div>
              <h2 className="text-xl font-bold text-nordic-dark">Gallery</h2>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded font-sf-pro">
              JPG, PNG, WEBP
            </span>
          </div>
          <div className="p-8">
            <div className="relative border-2 border-dashed border-gray-300 rounded-[0.75rem] bg-gray-50/50 p-10 text-center hover:bg-hint-of-green/10 hover:border-mosque/40 transition-colors cursor-pointer group">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-mosque group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-2xl">cloud_upload</span>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-medium text-nordic-dark font-sf-pro">
                    Click or drag images here
                  </p>
                  <p className="text-xs text-gray-400 font-sf-pro">
                    Max file size 5MB per image
                  </p>
                </div>
              </div>
            </div>

            {previewUrls.length > 0 && (
              <div ref={galleryGridRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {previewUrls.map((url, index) => (
                  <div
                    key={url}
                    data-preview="true"
                    className="aspect-square rounded-[0.5rem] overflow-hidden relative group shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-nordic-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                      >
                        <span className="material-icons text-sm">delete</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMainImage(index)}
                        title={index === 0 ? "Remove from Main" : "Set as Main"}
                        className="w-8 h-8 rounded-full bg-white hover:bg-gray-400 flex items-center justify-center transition-colors"
                      >
                        <span className={`material-icons text-sm ${index === 0 ? "text-yellow-500" : "text-mosque"}`}>
                          star
                        </span>
                      </button>
                    </div>
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-mosque text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm font-sf-pro uppercase tracking-wider">
                        Main
                      </span>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-[0.5rem] border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-mosque hover:border-mosque hover:bg-hint-of-green/20 transition-all group"
                >
                  <span className="material-icons group-hover:scale-110 transition-transform">add</span>
                  <span className="text-xs mt-1 font-medium font-sf-pro">Add More</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="xl:col-span-4 space-y-8">
        {/* Location */}
        <div className="bg-white rounded-[0.75rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-hint-of-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-of-green/10 to-transparent">
            <div className="w-8 h-8 rounded-full bg-hint-of-green flex items-center justify-center text-nordic-dark">
              <span className="material-icons !text-[17px]">place</span>
            </div>
            <h2 className="text-lg font-bold text-nordic-dark">{t("location")}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-nordic-dark mb-1.5 font-sf-pro">
                {t("address_field")}
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder={t("street_address_placeholder")}
                className="w-full px-4 py-2.5 rounded-[0.375rem] border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-nordic-dark mb-1.5 font-sf-pro">
                  {t("city_locality")}
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Luján de Cuyo"
                  className="w-full px-4 py-2.5 rounded-[0.375rem] border border-gray-200 bg-gray-50 text-nordic-dark placeholder-gray-400 text-sm font-sf-pro cursor-not-allowed"
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-nordic-dark mb-1.5 font-sf-pro">
                  {t("state_province")}
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Mendoza"
                  className="w-full px-4 py-2.5 rounded-[0.375rem] border border-gray-200 bg-gray-50 text-nordic-dark placeholder-gray-400 text-sm font-sf-pro cursor-not-allowed"
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-nordic-dark mb-1.5 font-sf-pro">
                  {t("country_field")}
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Argentina"
                  className="w-full px-4 py-2.5 rounded-[0.375rem] border border-gray-200 bg-gray-50 text-nordic-dark placeholder-gray-400 text-sm font-sf-pro cursor-not-allowed"
                  readOnly
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="lat" className="block text-sm font-medium text-nordic-dark mb-1.5 font-sf-pro">
                  {t("latitude")}
                </label>
                <input
                  type="number"
                  id="lat"
                  name="lat"
                  step="any"
                  value={lat}
                  onChange={(e) => handleLatChange(parseFloat(e.target.value) || 0)}
                  placeholder="37.4419"
                  className="w-full px-4 py-2.5 rounded-[0.375rem] border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro"
                />
              </div>
              <div>
                <label htmlFor="lng" className="block text-sm font-medium text-nordic-dark mb-1.5 font-sf-pro">
                  {t("longitude")}
                </label>
                <input
                  type="number"
                  id="lng"
                  name="lng"
                  step="any"
                  value={lng}
                  onChange={(e) => handleLngChange(parseFloat(e.target.value) || 0)}
                  placeholder="-122.143"
                  className="w-full px-4 py-2.5 rounded-[0.375rem] border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro"
                />
              </div>
            </div>
            <div className="relative h-48 w-full rounded-lg shadow-[3px_3px_12px_rgba(0,0,0,0.25)] group">
              <InteractiveMap
                lat={lat}
                lng={lng}
                address={address}
                scrollWheelZoom={true}
                onChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-[0.75rem] shadow-sm border border-gray-100 overflow-hidden sticky top-24">
          <div className="px-6 py-4 border-b border-hint-of-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-of-green/10 to-transparent">
            <div className="w-8 h-8 rounded-full bg-hint-of-green flex items-center justify-center text-nordic-dark">
              <span className="material-icons !text-[17px]">straighten</span>
            </div>
            <h2 className="text-lg font-bold text-nordic-dark">Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label htmlFor="area" className="text-xs text-gray-500 font-medium font-sf-pro mb-1 block">
                  Area (m²)
                </label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  defaultValue={initialData?.area}
                  placeholder="0"
                  className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-nordic-dark focus:bg-white focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf-pro text-sm"
                />
              </div>
              <div className="group">
                <label htmlFor="year_built" className="text-xs text-gray-500 font-medium font-sf-pro mb-1 block">
                  Year Built
                </label>
                <input
                  type="number"
                  id="year_built"
                  name="year_built"
                  defaultValue={initialData?.year_built}
                  placeholder="YYYY"
                  className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-nordic-dark focus:bg-white focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf-pro text-sm"
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-nordic-dark font-sf-pro flex items-center gap-2">
                  <span className="material-icons text-gray-400 text-sm">bed</span>
                  Bedrooms
                </label>
                <div className="flex items-center border border-gray-200 rounded-[0.375rem] overflow-hidden bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setBedrooms(Math.max(0, bedrooms - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    readOnly
                    value={bedrooms}
                    className="w-10 text-center border-none bg-transparent text-nordic-dark p-0 focus:ring-0 text-sm font-medium font-sf-pro"
                  />
                  <button
                    type="button"
                    onClick={() => setBedrooms(bedrooms + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-nordic-dark font-sf-pro flex items-center gap-2">
                  <span className="material-icons text-gray-400 text-sm">shower</span>
                  Bathrooms
                </label>
                <div className="flex items-center border border-gray-200 rounded-[0.375rem] overflow-hidden bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setBathrooms(Math.max(0, bathrooms - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    readOnly
                    value={bathrooms}
                    className="w-10 text-center border-none bg-transparent text-nordic-dark p-0 focus:ring-0 text-sm font-medium font-sf-pro"
                  />
                  <button
                    type="button"
                    onClick={() => setBathrooms(bathrooms + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-nordic-dark font-sf-pro flex items-center gap-2">
                  <span className="material-icons text-gray-400 text-sm">directions_car</span>
                  Parking
                </label>
                <div className="flex items-center border border-gray-200 rounded-[0.375rem] overflow-hidden bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setGarages(Math.max(0, garages - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    readOnly
                    value={garages}
                    className="w-10 text-center border-none bg-transparent text-nordic-dark p-0 focus:ring-0 text-sm font-medium font-sf-pro"
                  />
                  <button
                    type="button"
                    onClick={() => setGarages(garages + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h3 className="text-xs font-bold text-nordic-dark mb-3 font-sf-pro uppercase tracking-wider text-gray-500">
                Amenities
              </h3>
              <div className="space-y-2">
                {AMENITIES_LIST.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="w-4 h-4 text-mosque border-gray-300 rounded focus:ring-mosque"
                    />
                    <span className="text-sm text-gray-700 font-sf-pro group-hover:text-nordic-dark transition-colors">
                      {amenity}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-50 bg-background-light/95 backdrop-blur-xl col-span-1 xl:col-span-12 mt-8">
        <div className="bg-background-light rounded-b-[0.75rem] shadow-sm border border-gray-100 border-t-gray-300 h-16 flex items-center justify-end px-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById("save-mode-input") as HTMLInputElement;
                if (input) input.value = "draft";
                formRef.current?.requestSubmit();
              }}
              className="px-5 py-2.5 rounded-[0.5rem] border border-mosque/20 bg-white text-mosque hover:bg-white/80 transition-colors font-medium font-sf-pro text-sm cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById("save-mode-input") as HTMLInputElement;
                if (input) input.value = "publish";
                formRef.current?.requestSubmit();
              }}
              className="px-5 py-2.5 rounded-[0.5rem] bg-mosque hover:bg-nordic-dark text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-sf-pro text-sm cursor-pointer"
            >
              <span className="material-icons text-sm">save</span>
              Save Property
            </button>
          </div>
        </div>
      </div>

      <input type="hidden" id="save-mode-input" name="saveMode" value="publish" />
    </form>
    </>
  );
}
