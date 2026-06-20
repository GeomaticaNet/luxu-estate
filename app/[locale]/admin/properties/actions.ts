"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertProperty(formData: FormData) {
  const supabase = await createServerClient();

  const propertyId = formData.get('id') as string;
  const isUpdating = !!propertyId;

  const title = formData.get('title') as string;
  const type = formData.get('type') as string || 'SALE';
  const saveMode = formData.get('saveMode') as string || 'publish';
  const isDraft = saveMode === 'draft';
  const active = formData.get('active') === 'true';
  const address = formData.get('address') as string || '';

  const propertyData = {
    slug: (formData.get('slug') as string) || title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + (propertyId ? '' : '-' + Date.now().toString(36)),
    title: title,
    price: parseFloat(formData.get('price') as string || '0'),
    type: type,
    property_type: formData.get('property_type') as string || 'apartment',
    active: active,
    is_featured: formData.get('is_featured') === 'true',
    featured_label: '',
    bedrooms: parseInt(formData.get('bedrooms') as string || '0', 10),
    bathrooms: parseInt(formData.get('bathrooms') as string || '0', 10),
    garages: parseInt(formData.get('garages') as string || '0', 10),
    area: parseFloat(formData.get('area') as string || '0'),
    year_built: formData.get('year_built') ? parseInt(formData.get('year_built') as string, 10) : null,
    description: formData.get('description') as string || '',
    location: address,
    address: address,
    lat: parseFloat(formData.get('lat') as string || '0'),
    lng: parseFloat(formData.get('lng') as string || '0'),
    amenities: JSON.parse(formData.get('amenities') as string || '[]'),
    state: formData.get('state') as string || null,
    country: formData.get('country') as string || null,
  };

  let savedPropertyId = propertyId;

  if (isUpdating) {
    const { error } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', propertyId);

    if (error) {
      console.error("Error updating property:", error);
      return { success: false, error: error.message };
    }
  } else {
    const { data, error } = await supabase
      .from('properties')
      .insert([propertyData])
      .select('id')
      .single();

    if (error) {
      console.error("Error creating property:", error);
      return { success: false, error: error.message };
    }
    savedPropertyId = data.id;
  }

  // Handle images — already uploaded to Supabase Storage from client
  const imageUrlsRaw = formData.get('image_urls') as string;
  const imageUrls: string[] = imageUrlsRaw ? JSON.parse(imageUrlsRaw) : [];

  if (imageUrls.length > 0 && savedPropertyId) {
    // Delete removed images
    const deletedImagesRaw = formData.get('deleted_images') as string;
    if (deletedImagesRaw) {
      const deletedUrls = JSON.parse(deletedImagesRaw) as string[];
      if (deletedUrls.length > 0) {
        await supabase
          .from('property_images')
          .delete()
          .eq('property_id', savedPropertyId)
          .in('url', deletedUrls);
      }
    }

    // Get existing images
    const { data: existingImages } = await supabase
      .from('property_images')
      .select('id, url')
      .eq('property_id', savedPropertyId);

    const existingUrlToId = new Map<string, string>();
    existingImages?.forEach((img: any) => existingUrlToId.set(img.url, img.id));

    const processedUrls = new Set<string>();

    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      if (processedUrls.has(url)) continue;
      processedUrls.add(url);

      const existingId = existingUrlToId.get(url);
      if (existingId) {
        await supabase
          .from('property_images')
          .update({ sort_order: i, is_main: i === 0 })
          .eq('id', existingId);
      } else {
        await supabase
          .from('property_images')
          .insert([{
            property_id: savedPropertyId,
            url: url,
            is_main: i === 0,
            sort_order: i,
          }]);
      }
    }
  }

  revalidatePath("/[locale]/admin/properties", "page");

  return { success: true, id: savedPropertyId };
}
