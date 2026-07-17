"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

function formatPrice(n) {
  return "R$ " + Number(n).toFixed(2).replace(".", ",");
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
  );
}

function EmptyCart() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-white/15 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-2xl">🛒</div>
      <p className="font-display text-lg font-bold text-white">Seu carrinho está vazio</p>
      <p className="mt-2 font-mono text-xs text-white/40">Adicione produtos na loja pra continuar.</p>
    </div>
  );
}

export default function CartPage() {
  const { items, removeItem, total, clearCart } = useCart();
  const { user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleCheckout() {
    setError("");
    if (!user) {
      setError("Faça login com Google antes de finalizar a compra.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerEmail: user.email,
          customerName: user.displayName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao criar pagamento");
      window.location.href = data.initPoint;
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div>
        <div className="mb-8 border-b border-white/10 pb-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-blueLight">Checkout</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white">Seu carrinho</h1>
        </div>
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 border-b border-white/10 pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-blueLight">Checkout</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">Seu carrinho</h1>
        <p className="mt-2 text-sm text-white/50">{items.length} {items.length === 1 ? "item" : "itens"} prontos pra liberação instantânea</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Itens */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-brand-paper">
          <div className="divide-y divide-slate-200">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-navy to-brand-blue">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={48} height={48} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl">{item.icon || "\u{1F4E6}"}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-navy">{item.name}</p>
                  <p className="font-mono text-xs text-slate-400">{formatPrice(item.price)}</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  title="Remover"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={clearCart}
            className="w-full border-t border-slate-200 py-3 font-mono text-[10px] uppercase tracking-wide text-slate-400 hover:text-red-500"
          >
            Esvaziar carrinho
          </button>
        </div>

        {/* Resumo */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-brand-navy/60 p-5">
            <div className="flex items-center justify-between font-mono text-xs text-white/50">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-sm font-medium text-white">Total</span>
              <span className="font-display text-2xl font-bold text-brand-blueLight">{formatPrice(total)}</span>
            </div>

            {!user ? (
              <button
                onClick={signInWithGoogle}
                className="mt-4 w-full rounded-lg border border-white/15 py-3 font-mono text-xs text-white transition hover:border-brand-blueLight"
              >
                Entrar com Google pra continuar
              </button>
            ) : (
              <p className="mt-4 font-mono text-[10px] text-white/40">
                Comprando como <span className="text-white/70">{user.email}</span>
              </p>
            )}

            {error && <p className="mt-3 font-mono text-[11px] text-red-400">{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={loading || !user}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue py-3.5 font-mono text-xs font-bold text-white shadow-lg shadow-brand-blue/20 transition hover:bg-brand-blueLight disabled:cursor-not-allowed disabled:opacity-40"
            >
              <BoltIcon />
              {loading ? "Redirecionando..." : "Pagar com Mercado Pago"}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[10px] text-white/30">
              <LockIcon /> Pagamento seguro via Mercado Pago
            </p>
          </div>

          <p className="text-center font-mono text-[10px] leading-relaxed text-white/30">
            Assim que o pagamento for aprovado, o acesso aparece automaticamente em "Minhas Compras".
          </p>
        </div>
      </div>
    </div>
  );
}