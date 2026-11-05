-- Bucket privado exclusivo do BID. Caminho: <exhibitor_id>/<document_type_id>/<uuid>-<arquivo>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bid-documentos', 'bid-documentos', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy bid_documentos_select on storage.objects
  for select to authenticated using (
    bucket_id = 'bid-documentos'
    and (
      bid.is_admin()
      or (storage.foldername(name))[1] in (
        select exhibitor_id::text from bid.exhibitor_members where user_id = auth.uid()
      )
    )
  );

create policy bid_documentos_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'bid-documentos'
    and (
      bid.is_admin()
      or (storage.foldername(name))[1] in (
        select exhibitor_id::text from bid.exhibitor_members where user_id = auth.uid()
      )
    )
  );

create policy bid_documentos_delete on storage.objects
  for delete to authenticated using (
    bucket_id = 'bid-documentos'
    and (
      bid.is_admin()
      or (storage.foldername(name))[1] in (
        select exhibitor_id::text from bid.exhibitor_members where user_id = auth.uid()
      )
    )
  );
