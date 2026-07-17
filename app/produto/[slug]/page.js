import { getProductBySlug } from "@/lib/products";
import { getEffectivePrice } from "@/lib/pricing";
import AddToCartButton from "@/components/AddToCartButton";
import StarRating from "@/components/StarRating";
import Image from "next/image";
import { notFound } from "next/navigation";

function formatPrice(n) {
  return "R$ " + Number(n).toFixed(2).replace(".", ",");
}

export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug).catch(() => null);
  if (!product) return { title: "Produto não encontrado" };

  const title = product.metaTitle || product.name;
  const description = product.metaDescription || product.desc;
  const keywords = product.keywords
    ? product.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : undefined;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/produto/${product.slug || product.id}` },
    openGraph: {
      title,
      description,
      images: product.image ? [product.image] : ["/logo.png"],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.image ? [product.image] : ["/logo.png"]
    }
  };
}

export default async function ProductPage({ params }) {
  const product = await getProductBySlug(params.slug).catch(() => null);
  if (!product) notFound();

  const finalPrice = getEffectivePrice(product);
  const hasDiscount = product.onSale && product.discountPercent > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.desc,
    category: product.category,
    image: product.image || undefined,
    brand: { "@type": "Brand", name: "CodeSystemWeb Store" },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: finalPrice,
      availability: "https://schema.org/InStock",
      url: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/produto/${product.slug || product.id}`
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-brand-paper">
        <div className="relative flex h-64 items-center justify-center bg-gradient-to-br from-brand-navy to-brand-blue">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" />
          ) : (
            <span className="text-6xl">{product.icon || "📦"}</span>
          )}
          <span className="absolute left-4 top-4 rounded-full bg-brand-ink/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-brand-blueLight">
            {product.category}
          </span>
          <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
            {product.featured && (
              <span className="-rotate-2 rounded bg-amber-400 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wide text-brand-ink shadow">
                ⭐ Destaque
              </span>
            )}
            {hasDiscount && (
              <span className="rotate-1 rounded bg-red-500 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wide text-white shadow">
                -{product.discountPercent}% OFF
              </span>
            )}
            {product.lastUnits && (
              <span className="-rotate-1 rounded bg-orange-500 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wide text-white shadow">
                Últimas unidades
              </span>
            )}
          </div>
        </div>

        <div className="p-8">
          <h1 className="font-display text-2xl font-bold text-brand-navy">{product.name}</h1>
          <div className="mt-2">
            <StarRating rating={product.rating || 0} reviewCount={product.reviewCount || 0} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{product.desc}</p>

          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-slate-400">Melhor preço</p>
              {hasDiscount ? (
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-sm text-slate-400 line-through">{formatPrice(product.price)}</span>
                  <span className="font-display text-2xl text-red-500">{formatPrice(finalPrice)}</span>
                </div>
              ) : (
                <p className="font-display text-2xl text-brand-blue">{formatPrice(finalPrice)}</p>
              )}
            </div>
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
