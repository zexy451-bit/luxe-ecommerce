// Hand-written DB types — replace with generated types via `supabase gen types` post-deploy.

export type UserRole = "customer" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  size: string | null;
  color: string | null;
  price_modifier: number;
  stock: number;
  image_url: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  category_id: string | null;
  brand_id: string | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
  categories?: Pick<Category, "name" | "slug"> | null;
  brands?: Pick<Brand, "name" | "slug"> | null;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "cod" | "qr" | "card" | "other";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_label: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  image_url: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_line1: string;
  shipping_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  cod_fee: number;
  grand_total: number;
  coupon_code: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  status: OrderStatus;
  customer_note: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface StoreSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  logo_url: string | null;
  currency: string;
  currency_symbol: string;
  announcement_text: string | null;
  announcement_enabled: boolean;
  social_instagram: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

export interface PaymentSettings {
  cod_enabled: boolean;
  cod_fee: number;
  qr_enabled: boolean;
  qr_image_url: string | null;
  qr_instructions: string | null;
  card_enabled: boolean;
}

export interface ShippingSettings {
  flat_rate: number;
  free_shipping_threshold: number;
  tax_rate: number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: "percentage" | "fixed";
  value: number;
  min_order_amount: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export interface HeroSlide {
  id: string;
  headline: string;
  subheadline: string | null;
  cta_label: string | null;
  cta_href: string | null;
  image_url: string;
  display_order: number;
  is_active: boolean;
}
