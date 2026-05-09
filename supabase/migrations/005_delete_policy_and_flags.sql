-- Allow creators and admins to hard-delete their friend tournaments
create policy "Creador y admins eliminan torneos" on public.tournaments
  for delete using (
    auth.uid() = created_by
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
