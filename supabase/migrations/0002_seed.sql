-- Seed demo data. Safe to run multiple times.

insert into public.categories (name, slug, description, display_order) values
 ('Outerwear','outerwear','Coats, jackets, trenches',1),
 ('Knitwear','knitwear','Cashmere & wool',2),
 ('Bags','bags','Leather goods',3),
 ('Footwear','footwear','Shoes & boots',4),
 ('Accessories','accessories','Final touches',5)
on conflict (slug) do nothing;

insert into public.brands (name, slug) values
 ('Maison Luxe','maison-luxe'),
 ('Atelier Nord','atelier-nord'),
 ('Studio Bianca','studio-bianca')
on conflict (slug) do nothing;

insert into public.hero_slides (headline, subheadline, cta_label, cta_href, image_url, display_order) values
 ('The Autumn Edit','Tailored essentials in cashmere and wool','Shop the edit','/products','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800',1),
 ('Quiet Luxury','A study in restraint','Discover','/products','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1800',2)
on conflict do nothing;

-- Sample products
with c as (select id from public.categories where slug = 'outerwear' limit 1),
     b as (select id from public.brands where slug = 'maison-luxe' limit 1)
insert into public.products
  (name, slug, description, short_description, price, compare_at_price, sku,
   category_id, brand_id, stock, is_featured, is_trending, is_new_arrival, is_best_seller)
select 'Camel Wool Trench','camel-wool-trench',
       'Hand-finished double-breasted trench in Italian camel wool.','Italian camel wool, double-breasted',
       890.00, 1100.00, 'LUX-OUT-001',
       c.id, b.id, 12, true, true, true, true
from c, b
on conflict (slug) do nothing;

insert into public.product_images (product_id, url, is_primary, display_order)
select id, 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200', true, 0
from public.products where slug = 'camel-wool-trench'
on conflict do nothing;

with c as (select id from public.categories where slug = 'knitwear' limit 1)
insert into public.products
  (name, slug, description, short_description, price, sku, category_id, stock,
   is_featured, is_new_arrival)
select 'Cashmere Crew Sweater','cashmere-crew-sweater',
       'Pure Mongolian cashmere, ribbed cuffs, relaxed fit.','Mongolian cashmere, relaxed fit',
       340.00, 'LUX-KNT-001', c.id, 25, true, true
from c
on conflict (slug) do nothing;

insert into public.product_images (product_id, url, is_primary, display_order)
select id, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200', true, 0
from public.products where slug = 'cashmere-crew-sweater'
on conflict do nothing;

with c as (select id from public.categories where slug = 'bags' limit 1)
insert into public.products
  (name, slug, description, short_description, price, sku, category_id, stock,
   is_trending, is_best_seller)
select 'Leather Tote Bag','leather-tote-bag',
       'Vegetable-tanned full-grain leather. Handcrafted in Florence.','Vegetable-tanned full-grain leather',
       620.00, 'LUX-BAG-001', c.id, 18, true, true
from c
on conflict (slug) do nothing;

insert into public.product_images (product_id, url, is_primary, display_order)
select id, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200', true, 0
from public.products where slug = 'leather-tote-bag'
on conflict do nothing;

-- Sample coupon
insert into public.coupons (code, description, type, value, min_order_amount, is_active)
values ('WELCOME10','New customer 10% off','percentage',10,100,true)
on conflict (code) do nothing;
