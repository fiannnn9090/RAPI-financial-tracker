-- F7 — pisahkan identitas login dari username tampilan.
-- Latar: GoTrue menolak updateUser({email}) ke domain @rapi.local
-- (email_address_invalid pada email TERSIMPAN), sehingga username tak bisa
-- diubah lewat jalur auth. Solusi: login memakai auth_email yang stabil,
-- sementara username bebas diubah sebagai identitas tampilan.
-- Jalankan manual di Supabase SQL Editor. Idempoten.

alter table profiles add column if not exists auth_email text;

create unique index if not exists profiles_auth_email_key
  on profiles (auth_email) where auth_email is not null;

update profiles set auth_email = lower(username) || '@rapi.local' where auth_email is null;

-- Login terjadi SEBELUM sesi ada, jadi RLS (auth.uid() = id) memblokir
-- pembacaan profiles untuk resolve auth_email. RPC security definer ini
-- satu-satunya pintu pre-auth: menerima satu username, mengembalikan
-- SATU kolom (auth_email) atau null — tidak bisa dump daftar profil.
create or replace function public.resolve_login_email(p_username text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select auth_email from profiles where username ilike p_username limit 1;
$$;

grant execute on function public.resolve_login_email(text) to anon, authenticated;
