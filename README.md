# Luxe — Ultra-Premium E-Commerce Platform

Production-ready full-stack e-commerce platform built on **Next.js 15**, **TypeScript**, **Tailwind**, **shadcn/ui**, **Framer Motion**, and **Supabase** (Postgres + Auth + Storage + RLS).

---

## What's included

### Customer storefront (`/`)
- Hero slider (admin-editable)
- Featured / trending / new arrivals / best sellers sections (toggleable)
- Category showcase
- Flash sale countdown (driven by `promotions` table)
- Customer testimonials & newsletter
- Promotional popup
- **Product listing** with category/brand/price/search filters, sort, pagination
- **Product detail** with image zoom, gallery, variants, stock indicator, reviews, related products, wishlist
- **Cart** with quantity, coupons, live totals
- **Multi-step checkout**: Customer → Shipping → Payment → Review
- **Payments**: COD (toggleable), QR image upload + reference confirmation (gateway-ready scaffolding)
- **Auth**: signup, login, password reset (Supabase Auth)
- **Account**: profile, orders, addresses, wishlist, invoice download

### Admin dashboard (`/admin`) — admin role only
- Overview: total revenue, today, pending, low stock, customers, 30-day chart, recent orders
- **Orders**: list/search/filter/status updates, payment status, internal notes, CSV export
- **Order detail**: timeline, items, address, invoice download
- **Products**: list, create/edit, multiple images upload, variants, stock, featured/trending/new/bestseller toggles
- **Customers**: list with order/spend stats
- **Discounts**: coupon generator (% / fixed), flash promotions scheduler
- **Settings**: store branding, currency, social links, SEO, announcement bar, COD on/off + fee, QR upload + instructions, shipping flat-rate + free-shipping threshold + tax rate, hero slide editor, homepage section toggles
- **Auto invoice**: branded HTML invoice with QR — print or save as PDF from the browser

### Foundation
- Supabase schema (22 tables) with full RLS policies (`supabase/migrations/0001_init.sql`)
- Seed data (`supabase/migrations/0002_seed.sql`)
- Middleware-based route protection
- Zod input validation on the checkout API
- Server-authoritative pricing (cart cannot be tampered)
- `robots.ts` + dynamic `sitemap.ts`
- Vercel-ready (`vercel.json`)

---

## Quick start

```bash
# 1. Install
cd ecommerce
npm install

# 2. Create .env.local from .env.example and fill in your Supabase keys
cp .env.example .env.local   # or create it manually on Windows

# 3. Run migrations in Supabase SQL editor
#    Paste contents of supabase/migrations/0001_init.sql, then 0002_seed.sql

# 4. Create your admin user
#    a) sign up at /auth/signup with the email in ADMIN_EMAIL
#    b) in Supabase SQL editor:
#       update public.profiles set role='admin' where email='you@example.com';

# 5. Start the dev server
npm run dev
```

Visit:
- Storefront: http://localhost:3000
- Admin: http://localhost:3000/admin

---

## Tech stack

| Layer | Tech |
|------|------|
| Framework | Next.js 15 (App Router, RSC) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom design tokens |
| UI primitives | Radix + shadcn-style components |
| Animation | Framer Motion |
| Database | Supabase Postgres |
| Auth | Supabase Auth (email/password + OAuth-ready) |
| Storage | Supabase Storage (`products`, `store` buckets) |
| State | Zustand (cart) |
| Validation | Zod |
| Deployment | Vercel |

---

## Folder structure

```
src/
├── app/
│   ├── (store)/              # Customer-facing routes
│   │   ├── page.tsx          # Homepage
│   │   ├── products/         # PLP + PDP
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── account/          # Auth-gated user area
│   │   └── auth/             # Login / Signup / Forgot
│   ├── admin/                # Admin-gated dashboard
│   │   ├── page.tsx          # Overview
│   │   ├── orders/
│   │   ├── products/
│   │   ├── customers/
│   │   ├── discounts/
│   │   └── settings/
│   ├── api/
│   │   ├── checkout/         # Order creation (server-authoritative)
│   │   └── invoice/[orderId] # Printable HTML invoice
│   ├── globals.css
│   ├── layout.tsx
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/                   # shadcn-style primitives
│   ├── store/                # Storefront components
│   ├── admin/                # Admin components
│   └── providers/
├── lib/
│   ├── supabase/             # client/server/admin/middleware
│   ├── auth.ts
│   ├── cart-store.ts         # Zustand persisted cart
│   ├── pricing.ts            # Discount / shipping / tax math
│   └── utils.ts
├── types/db.ts
└── middleware.ts             # Session refresh + route guards
supabase/migrations/
├── 0001_init.sql             # Full schema + RLS + storage buckets
└── 0002_seed.sql             # Demo categories, brands, products
```

---

## Notes for development

- The cart is **client-only** (localStorage via Zustand). Orders are persisted server-side at checkout.
- All pricing is recalculated on the server in `src/app/api/checkout/route.ts` — clients cannot tamper totals.
- `is_admin()` is a Postgres function used by every admin-write RLS policy.
- Storage uploads (`products`, `store`) require `role='admin'`.
- Invoices are rendered as printable HTML at `/api/invoice/[orderId]` — users click "Print / Save as PDF" in their browser. If you want a server-rendered PDF, swap in `puppeteer-core` + `@sparticuz/chromium` on a Vercel Function with `runtime = "nodejs"` and call it from the same route.
- To add a card gateway (Stripe/Razorpay), wire it into the `/api/checkout` route after the order is created; toggle `payment_settings.card_enabled` in the admin to surface it on the storefront.

---

## License
Commercial use OK. Built for the project owner.
