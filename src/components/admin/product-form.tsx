"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";
import { Upload, Trash2, Star, Plus } from "lucide-react";
import type { Product, ProductImage, ProductVariant } from "@/types/db";

interface Props {
  product?: Product;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}

export function ProductForm({ product, categories, brands }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [sku, setSku] = useState(product?.sku || "");
  const [shortDescription, setShortDescription] = useState(product?.short_description || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [compare, setCompare] = useState(product?.compare_at_price?.toString() || "");
  const [stock, setStock] = useState(product?.stock?.toString() || "0");
  const [categoryId, setCategoryId] = useState(product?.category_id || "");
  const [brandId, setBrandId] = useState(product?.brand_id || "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isTrending, setIsTrending] = useState(product?.is_trending ?? false);
  const [isNew, setIsNew] = useState(product?.is_new_arrival ?? false);
  const [isBest, setIsBest] = useState(product?.is_best_seller ?? false);

  const [images, setImages] = useState<ProductImage[]>(product?.product_images || []);
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>(product?.product_variants || []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("products").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    return data.publicUrl;
  };

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        const url = await uploadFile(f);
        setImages((prev) => [
          ...prev,
          {
            id: `tmp-${Math.random()}`,
            product_id: product?.id || "",
            url,
            alt: name,
            display_order: prev.length,
            is_primary: prev.length === 0,
          } as ProductImage,
        ]);
      }
      toast.success("Image uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        name,
        slug: slug || slugify(name),
        sku: sku || null,
        short_description: shortDescription || null,
        description: description || null,
        price: parseFloat(price),
        compare_at_price: compare ? parseFloat(compare) : null,
        stock: parseInt(stock) || 0,
        category_id: categoryId || null,
        brand_id: brandId || null,
        is_active: isActive,
        is_featured: isFeatured,
        is_trending: isTrending,
        is_new_arrival: isNew,
        is_best_seller: isBest,
      };

      let productId = product?.id;
      if (product) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        productId = data.id;
      }

      // Replace images
      if (productId) {
        await supabase.from("product_images").delete().eq("product_id", productId);
        if (images.length) {
          await supabase.from("product_images").insert(
            images.map((img, i) => ({
              product_id: productId!,
              url: img.url,
              alt: img.alt,
              display_order: i,
              is_primary: img.is_primary,
            }))
          );
        }
        // Replace variants
        await supabase.from("product_variants").delete().eq("product_id", productId);
        if (variants.length) {
          await supabase.from("product_variants").insert(
            variants.map((v) => ({
              product_id: productId!,
              name: v.name || "Variant",
              size: v.size || null,
              color: v.color || null,
              sku: v.sku || null,
              price_modifier: v.price_modifier ?? 0,
              stock: v.stock ?? 0,
            }))
          );
        }
      }

      toast.success(product ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!product || !confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      router.push("/admin/products");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-medium">Basics</h3>
          <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Slug">
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated from name" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SKU"><Input value={sku} onChange={(e) => setSku(e.target.value)} /></Field>
            <Field label="Stock"><Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} /></Field>
            <Field label="Price"><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
            <Field label="Compare at"><Input type="number" step="0.01" value={compare} onChange={(e) => setCompare(e.target.value)} placeholder="Optional, shows as strikethrough" /></Field>
          </div>
          <Field label="Short description"><Textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} /></Field>
          <Field label="Full description"><Textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-medium">Images</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img, i) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                <Image src={img.url} alt="" fill sizes="200px" className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setImages(images.map((im, j) => ({ ...im, is_primary: j === i })))}
                    className={`rounded p-1 ${img.is_primary ? "bg-amber-400 text-black" : "bg-white/80 text-black"}`}
                    title="Set primary"
                  >
                    <Star className="h-3 w-3" fill={img.is_primary ? "currentColor" : "none"} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="rounded bg-white/80 p-1 text-black"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                {img.is_primary && (
                  <span className="absolute bottom-1 left-1 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-black">
                    Primary
                  </span>
                )}
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-xs text-muted-foreground hover:bg-muted/40">
              <Upload className="h-5 w-5" />
              {uploading ? "Uploading..." : "Upload"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onUpload(e.target.files)}
              />
            </label>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Variants</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setVariants([...variants, { name: "", size: "", color: "", price_modifier: 0, stock: 0 }])
              }
            >
              <Plus className="h-3 w-3" /> Add variant
            </Button>
          </div>
          {variants.length === 0 && (
            <p className="text-sm text-muted-foreground">No variants. Add sizes/colors if needed.</p>
          )}
          {variants.map((v, i) => (
            <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr,1fr,1fr,1fr,1fr,auto]">
              <Input placeholder="Name (e.g. Small / Black)" value={v.name || ""} onChange={(e) => {
                const next = [...variants]; next[i] = { ...next[i], name: e.target.value }; setVariants(next);
              }} />
              <Input placeholder="Size" value={v.size || ""} onChange={(e) => {
                const next = [...variants]; next[i] = { ...next[i], size: e.target.value }; setVariants(next);
              }} />
              <Input placeholder="Color" value={v.color || ""} onChange={(e) => {
                const next = [...variants]; next[i] = { ...next[i], color: e.target.value }; setVariants(next);
              }} />
              <Input type="number" step="0.01" placeholder="Δ price" value={v.price_modifier ?? 0} onChange={(e) => {
                const next = [...variants]; next[i] = { ...next[i], price_modifier: parseFloat(e.target.value) }; setVariants(next);
              }} />
              <Input type="number" placeholder="Stock" value={v.stock ?? 0} onChange={(e) => {
                const next = [...variants]; next[i] = { ...next[i], stock: parseInt(e.target.value) }; setVariants(next);
              }} />
              <Button type="button" variant="ghost" size="icon" onClick={() => setVariants(variants.filter((_, j) => j !== i))}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </Card>
      </div>

      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <Card className="p-6 space-y-4">
          <h3 className="font-medium">Status</h3>
          <Toggle label="Active" value={isActive} onChange={setIsActive} />
          <Toggle label="Featured" value={isFeatured} onChange={setIsFeatured} />
          <Toggle label="Trending" value={isTrending} onChange={setIsTrending} />
          <Toggle label="New arrival" value={isNew} onChange={setIsNew} />
          <Toggle label="Best seller" value={isBest} onChange={setIsBest} />
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-medium">Organisation</h3>
          <Field label="Category">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Brand">
            <Select value={brandId} onValueChange={setBrandId}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </Card>

        <div className="flex flex-col gap-2">
          <Button size="lg" onClick={save} disabled={saving || !name || !price}>
            {saving ? "Saving..." : product ? "Save changes" : "Create product"}
          </Button>
          {product && (
            <Button variant="destructive" onClick={deleteProduct}>
              Delete product
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
