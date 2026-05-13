# Deployment Guide — Vercel

This project is built for one-click deploy to **Vercel** with a Supabase backend.

---

## 1. Prepare Supabase

1. Create a project at <https://supabase.com>.
2. Open the **SQL Editor** and run, in order:
   - `supabase/migrations/0001_init.sql` — full schema, RLS, storage buckets
   - `supabase/migrations/0002_seed.sql` — demo content (optional)
3. Go to **Authentication → URL Configuration** and add your production site URL (and `http://localhost:3000` for dev) to **Site URL** and **Redirect URLs**.
4. In **Project Settings → API**, copy:
   - `Project URL`
   - `anon public key`
   - `service_role secret key`

---

## 2. Push the project to GitHub

```bash
cd ecommerce
git init
git add -A
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

---

## 3. Import into Vercel

1. Go to <https://vercel.com/new>.
2. Click **Import Git Repository** and select the repo.
3. Vercel auto-detects Next.js. No build overrides needed.
4. **Environment Variables** — add each of these (project-wide, all environments):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (keep secret) |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` |
   | `ADMIN_EMAIL` | The email of your admin account |
   | `STORE_NAME` | e.g. `Luxe` |
   | `STORE_EMAIL` | e.g. `hello@luxe.com` |
   | `STORE_PHONE` | e.g. `+1 555 0100` |
   | `STORE_ADDRESS` | e.g. `123 Madison Ave, NYC` |

5. Click **Deploy**.

---

## 4. Promote your first admin

After deployment finishes:

1. Visit `https://<your-app>.vercel.app/auth/signup` and sign up using your admin email.
2. Confirm via the email Supabase sends.
3. Back in Supabase, open **SQL Editor** and run:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'you@example.com';
   ```

4. Sign in. The admin dashboard is now at `https://<your-app>.vercel.app/admin`.

---

## 5. Configure storage permissions

The migration creates two public buckets (`products`, `store`). Public reads are open; only admins can upload. Verify under **Storage** that both buckets exist and are marked public.

---

## 6. Set up custom domain (optional)

1. In Vercel → Project → **Domains**, add your domain.
2. Update `NEXT_PUBLIC_SITE_URL` to your custom domain.
3. Update **Site URL** and **Redirect URLs** in Supabase to match.
4. Redeploy.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Sign-up email not arriving | Configure SMTP under Supabase → Authentication → Email Templates, or enable a test provider. |
| `/admin` redirects to `/` | Your profile row's `role` is still `customer`. Update via SQL (step 4). |
| Images don't load | Add your Supabase project subdomain to `next.config.mjs` `images.remotePatterns` (already includes `*.supabase.co`). |
| RLS errors when checking out | Some tables require `service_role` for stock decrements. The API route uses the admin client — make sure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel. |
| Invoice page is blank for admin | The route uses the cookie session — confirm you're signed in. |

---

## Post-deploy checklist

- [ ] Sign up with admin email, promote to admin
- [ ] Visit `/admin/settings` and set store name, currency, social links
- [ ] Upload QR payment image under Settings → Payment
- [ ] Edit hero slides under Settings → Homepage
- [ ] Verify a test order end-to-end: add to cart → checkout → see in `/admin/orders` → download invoice
