-- ============================================================================
-- LUXE E-COMMERCE — Complete Supabase schema with RLS
-- Run this entire file in the Supabase SQL editor (one-shot).
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. PROFILES (extends auth.users)
-- ---------------------------------------------------------------------------
create type user_role as enum ('customer', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  phone text,
  avatar_url text,
  role user_role not null default 'customer',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.profiles (role);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is_admin()
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. ADDRESSES
-- ---------------------------------------------------------------------------
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'US',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.addresses (user_id);

-- ---------------------------------------------------------------------------
-- 3. CATEGORIES / BRANDS / TAGS
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  parent_id uuid references public.categories(id) on delete set null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.categories (slug);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

-- ---------------------------------------------------------------------------
-- 4. PRODUCTS
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  short_description text,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2),
  sku text unique,
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  stock int not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_trending boolean not null default false,
  is_new_arrival boolean not null default false,
  is_best_seller boolean not null default false,
  rating_avg numeric(3,2) default 0,
  rating_count int default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.products (slug);
create index on public.products (category_id);
create index on public.products (brand_id);
create index on public.products (is_active, is_featured);
create index on public.products (created_at desc);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  display_order int not null default 0,
  is_primary boolean not null default false
);
create index on public.product_images (product_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text,
  size text,
  color text,
  price_modifier numeric(12,2) not null default 0,
  stock int not null default 0,
  image_url text
);
create index on public.product_variants (product_id);

create table public.product_tags (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- 5. REVIEWS
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index on public.reviews (product_id);

-- ---------------------------------------------------------------------------
-- 6. WISHLIST
-- ---------------------------------------------------------------------------
create table public.wishlist (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------------------------------------------------------------------------
-- 7. CARTS (server-side, optional — clients can also use localStorage)
-- ---------------------------------------------------------------------------
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, product_id, variant_id)
);

-- ---------------------------------------------------------------------------
-- 8. COUPONS / DISCOUNTS
-- ---------------------------------------------------------------------------
create type discount_type as enum ('percentage', 'fixed');

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  type discount_type not null,
  value numeric(12,2) not null check (value > 0),
  min_order_amount numeric(12,2) default 0,
  max_discount numeric(12,2),
  usage_limit int,
  used_count int not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.coupons (code);

-- Flash sales / scheduled promotions
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  banner_image_url text,
  discount_type discount_type not null,
  discount_value numeric(12,2) not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 9. ORDERS
-- ---------------------------------------------------------------------------
create type order_status as enum (
  'pending','confirmed','packed','shipped','delivered','cancelled','refunded'
);
create type payment_method as enum ('cod','qr','card','other');
create type payment_status as enum ('unpaid','paid','refunded','failed');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references public.profiles(id) on delete set null,

  -- snapshot of customer info (so order survives profile changes)
  customer_email text not null,
  customer_name text not null,
  customer_phone text not null,

  -- shipping address (snapshot)
  shipping_line1 text not null,
  shipping_line2 text,
  shipping_city text not null,
  shipping_state text not null,
  shipping_postal_code text not null,
  shipping_country text not null,

  -- totals
  subtotal numeric(12,2) not null,
  discount_total numeric(12,2) not null default 0,
  shipping_total numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  cod_fee numeric(12,2) not null default 0,
  grand_total numeric(12,2) not null,
  coupon_code text,

  -- payment + fulfillment
  payment_method payment_method not null,
  payment_status payment_status not null default 'unpaid',
  payment_reference text,
  status order_status not null default 'pending',

  customer_note text,
  admin_note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.orders (user_id);
create index on public.orders (status);
create index on public.orders (created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_label text,
  unit_price numeric(12,2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(12,2) not null,
  image_url text
);
create index on public.order_items (order_id);

-- Order number generator
create or replace function public.generate_order_number()
returns trigger language plpgsql as $$
begin
  if new.order_number is null then
    new.order_number := 'LUX-' || to_char(now(),'YYMMDD') || '-' ||
      lpad(floor(random()*100000)::text, 5, '0');
  end if;
  return new;
end $$;

drop trigger if exists set_order_number on public.orders;
create trigger set_order_number before insert on public.orders
  for each row execute function public.generate_order_number();

-- ---------------------------------------------------------------------------
-- 10. INVOICES
-- ---------------------------------------------------------------------------
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references public.orders(id) on delete cascade,
  invoice_number text unique not null,
  issued_at timestamptz not null default now(),
  pdf_url text
);

-- ---------------------------------------------------------------------------
-- 11. STORE SETTINGS (singletons via single-row tables)
-- ---------------------------------------------------------------------------
create table public.store_settings (
  id boolean primary key default true check (id),
  store_name text not null default 'Luxe',
  store_email text not null default 'hello@luxe.com',
  store_phone text not null default '+1 555 0100',
  store_address text not null default '123 Madison Ave, New York, NY',
  logo_url text,
  currency text not null default 'USD',
  currency_symbol text not null default '$',
  announcement_text text default 'Complimentary shipping on orders over $200',
  announcement_enabled boolean not null default true,
  social_instagram text,
  social_facebook text,
  social_twitter text,
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (true) on conflict do nothing;

create table public.payment_settings (
  id boolean primary key default true check (id),
  cod_enabled boolean not null default true,
  cod_fee numeric(12,2) not null default 5.00,
  qr_enabled boolean not null default true,
  qr_image_url text,
  qr_instructions text default 'Scan and pay. Upload screenshot at checkout.',
  card_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.payment_settings (id) values (true) on conflict do nothing;

create table public.shipping_settings (
  id boolean primary key default true check (id),
  flat_rate numeric(12,2) not null default 9.99,
  free_shipping_threshold numeric(12,2) not null default 200.00,
  tax_rate numeric(5,4) not null default 0.0000,
  zones jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.shipping_settings (id) values (true) on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 12. HOMEPAGE CONTENT
-- ---------------------------------------------------------------------------
create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  subheadline text,
  cta_label text,
  cta_href text,
  image_url text not null,
  display_order int not null default 0,
  is_active boolean not null default true
);

create table public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,            -- 'featured','trending','new_arrivals','best_sellers'
  title text not null,
  subtitle text,
  is_enabled boolean not null default true,
  display_order int not null default 0
);
insert into public.homepage_sections (key, title, subtitle, display_order) values
 ('featured','Featured collections','Curated for the season',1),
 ('trending','Trending now','Loved by our community',2),
 ('new_arrivals','New arrivals','Just landed',3),
 ('best_sellers','Best sellers','Customer favourites',4)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 13. ADMIN LOGS
-- ---------------------------------------------------------------------------
create table public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index on public.admin_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.addresses           enable row level security;
alter table public.categories          enable row level security;
alter table public.brands              enable row level security;
alter table public.tags                enable row level security;
alter table public.products            enable row level security;
alter table public.product_images      enable row level security;
alter table public.product_variants    enable row level security;
alter table public.product_tags        enable row level security;
alter table public.reviews             enable row level security;
alter table public.wishlist            enable row level security;
alter table public.carts               enable row level security;
alter table public.cart_items          enable row level security;
alter table public.coupons             enable row level security;
alter table public.promotions          enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.invoices            enable row level security;
alter table public.store_settings      enable row level security;
alter table public.payment_settings    enable row level security;
alter table public.shipping_settings   enable row level security;
alter table public.hero_slides         enable row level security;
alter table public.homepage_sections   enable row level security;
alter table public.admin_logs          enable row level security;

-- ---- Public-read content (anyone can read; only admin writes) ----
create policy "read products"        on public.products          for select using (is_active or public.is_admin());
create policy "read product_images"  on public.product_images    for select using (true);
create policy "read product_variants" on public.product_variants for select using (true);
create policy "read product_tags"    on public.product_tags      for select using (true);
create policy "read categories"      on public.categories        for select using (is_active or public.is_admin());
create policy "read brands"          on public.brands            for select using (is_active or public.is_admin());
create policy "read tags"            on public.tags              for select using (true);
create policy "read reviews"         on public.reviews           for select using (is_approved or public.is_admin());
create policy "read store_settings"  on public.store_settings    for select using (true);
create policy "read payment_settings" on public.payment_settings for select using (true);
create policy "read shipping_settings" on public.shipping_settings for select using (true);
create policy "read hero_slides"     on public.hero_slides       for select using (is_active or public.is_admin());
create policy "read homepage_sections" on public.homepage_sections for select using (true);
create policy "read coupons"         on public.coupons           for select using (is_active);
create policy "read promotions"      on public.promotions        for select using (is_active);

-- ---- Admin-only writes on catalog/settings ----
create policy "admin write products"        on public.products          for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write product_images"  on public.product_images    for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write product_variants" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write product_tags"    on public.product_tags      for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write categories"      on public.categories        for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write brands"          on public.brands            for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write tags"            on public.tags              for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write store_settings"  on public.store_settings    for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write payment_settings" on public.payment_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write shipping_settings" on public.shipping_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write hero_slides"     on public.hero_slides       for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write homepage_sections" on public.homepage_sections for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write coupons"         on public.coupons           for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write promotions"      on public.promotions        for all using (public.is_admin()) with check (public.is_admin());
create policy "admin read admin_logs"       on public.admin_logs        for select using (public.is_admin());
create policy "admin write admin_logs"      on public.admin_logs        for insert with check (public.is_admin());

-- ---- Profile self-access + admin ----
create policy "read own profile"   on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "admin write profile" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- ---- Addresses ----
create policy "self addresses" on public.addresses for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- ---- Reviews (customers can write their own) ----
create policy "self reviews insert" on public.reviews for insert with check (auth.uid() = user_id);
create policy "self reviews update" on public.reviews for update using (auth.uid() = user_id);
create policy "admin reviews"       on public.reviews for all using (public.is_admin()) with check (public.is_admin());

-- ---- Wishlist ----
create policy "self wishlist" on public.wishlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---- Carts ----
create policy "self carts" on public.carts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "self cart_items" on public.cart_items for all
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

-- ---- Orders ----
create policy "read own orders"   on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "insert own orders" on public.orders for insert with check (auth.uid() = user_id or user_id is null);
create policy "admin orders"      on public.orders for all using (public.is_admin()) with check (public.is_admin());

create policy "read own order_items" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "insert order_items"   on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or o.user_id is null)));
create policy "admin order_items"    on public.order_items for all using (public.is_admin()) with check (public.is_admin());

create policy "read own invoices" on public.invoices for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "admin invoices"    on public.invoices for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 15. STORAGE BUCKETS
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('products','products', true), ('store','store', true)
on conflict do nothing;

create policy "public read products bucket"
  on storage.objects for select using (bucket_id = 'products');
create policy "admin write products bucket"
  on storage.objects for all
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());

create policy "public read store bucket"
  on storage.objects for select using (bucket_id = 'store');
create policy "admin write store bucket"
  on storage.objects for all
  using (bucket_id = 'store' and public.is_admin())
  with check (bucket_id = 'store' and public.is_admin());
