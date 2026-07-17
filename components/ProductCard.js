"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { getEffectivePrice } from "@/lib/pricing";
import StarRating from "./StarRating";

function formatPrice(n) {
  return "R$ " + Number(n).toFixed(2).replace(".", ",");
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const href = "/produto/" + (product.slug || product.id);
  const finalPrice = getEffectivePrice(product);
  const hasDiscount = product.onSale && product.discountPercent > 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-brand-paper text-brand-navy shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:shadow-brand-blue/20">
      <Link href={href} className="relative flex h-40 items-center justify-center bg-gradient-to-br from-brand-navy to-brand-blue">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        ) : (
          <span className="text-5xl">{product.icon || "\u{1F4E6}"}</span>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-brand-ink/85 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-brand-blueLight">
          {product.category}
        </span>

        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
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
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <Link href={href}>
          <h3 className="font-display text-base font-bold leading-snug text-brand-navy">{product.name}</h3>
        </Link>

        <div className="flex items-center justify-between">
          <StarRating rating={product.rating || 0} reviewCount={product.reviewCount || 0} />
          {product.soldCount > 0 && (
            <span className="font-mono text-[10px] text-slate-400">{product.soldCount} vendidos</span>
          )}
        </div>

        <p className="line-clamp-2 flex-1 text-xs text-slate-500">{product.desc}</p>

        <div className="mt-2 flex items-end justify-between border-t border-slate-200 pt-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wide text-slate-400">Melhor preço</p>
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>
                <span className="font-display text-lg font-bold text-red-500">{formatPrice(finalPrice)}</span>
              </div>
            ) : (
              <p className="font-display text-lg font-bold text-brand-blue">{formatPrice(finalPrice)}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href={href}
              className="rounded-lg border border-slate-300 px-3 py-2 font-mono text-[10px] font-bold text-brand-navy hover:border-brand-blue"
            >
              Detalhes
            </Link>
            <button
              onClick={() => addItem(product)}
              className="rounded-lg bg-brand-blue px-3 py-2 font-mono text-[10px] font-bold text-white hover:bg-brand-navy"
            >
              Comprar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
