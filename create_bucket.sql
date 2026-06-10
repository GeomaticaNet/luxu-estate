-- 1. Create the bucket
insert into storage.buckets (id, name, public)
values ('property_images', 'property_images', true);

-- 2. Allow public access to view images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'property_images' );

-- 3. Allow authenticated users to upload/update images
create policy "Authenticated Users can insert"
on storage.objects for insert
with check ( bucket_id = 'property_images' and auth.role() = 'authenticated' );

create policy "Authenticated Users can update"
on storage.objects for update
using ( bucket_id = 'property_images' and auth.role() = 'authenticated' );

create policy "Authenticated Users can delete"
on storage.objects for delete
using ( bucket_id = 'property_images' and auth.role() = 'authenticated' );
