-- ============================================================================
-- Auto-link guest orders to user accounts by email.
--
-- After this migration:
--   1. A guest places an order with email X → order saved with user_id = NULL.
--   2. Later, anyone signs up / logs in with email X → all their previous
--      guest orders get user_id set to their new user_id automatically.
--   3. The orders/items/invoice RLS policies also let a logged-in user read
--      orders where customer_email matches their JWT email, even if user_id
--      hasn't been backfilled yet.
-- ============================================================================

-- ---- 1. Trigger: claim guest orders on profile creation ----
create or replace function public.link_guest_orders_to_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.orders
     set user_id = new.id
   where customer_email = new.email
     and user_id is null;
  return new;
end $$;

drop trigger if exists link_guest_orders_after_profile_created on public.profiles;
create trigger link_guest_orders_after_profile_created
  after insert on public.profiles
  for each row execute function public.link_guest_orders_to_profile();

-- ---- 2. Helper: current JWT email ----
create or replace function public.current_user_email()
returns text language sql stable as $$
  select coalesce(
    (auth.jwt() ->> 'email')::text,
    (select email from public.profiles where id = auth.uid())
  );
$$;

-- ---- 3. RLS: orders / order_items / invoices — read by user_id OR email ----
drop policy if exists "read own orders"            on public.orders;
drop policy if exists "read own or guest-email orders" on public.orders;
create policy "read own or guest-email orders"
  on public.orders for select
  using (
    auth.uid() = user_id
    or public.is_admin()
    or customer_email = public.current_user_email()
  );

drop policy if exists "read own order_items"               on public.order_items;
drop policy if exists "read own or guest-email order_items" on public.order_items;
create policy "read own or guest-email order_items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
       where o.id = order_id
         and (
           o.user_id = auth.uid()
           or public.is_admin()
           or o.customer_email = public.current_user_email()
         )
    )
  );

drop policy if exists "read own invoices"               on public.invoices;
drop policy if exists "read own or guest-email invoices" on public.invoices;
create policy "read own or guest-email invoices"
  on public.invoices for select
  using (
    exists (
      select 1 from public.orders o
       where o.id = order_id
         and (
           o.user_id = auth.uid()
           or public.is_admin()
           or o.customer_email = public.current_user_email()
         )
    )
  );

-- ---- 4. One-time backfill — claim existing guest orders for current profiles ----
update public.orders o
   set user_id = p.id
  from public.profiles p
 where o.customer_email = p.email
   and o.user_id is null;
