"use client";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

function formatPrice(n) {
  return "R$ " + Number(n).toFixed(2).replace(".", ",");
}

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, total } = useCart();
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-sm flex-col gap-4 border-l border-white/10 bg-brand-navy p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-white">Carrinho</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">✕</button>
        </div>

        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 p-6 text-center font-mono text-xs text-white/50">
            Seu carrinho esta vazio.
          </p>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <p className="text-sm text-white">{item.icon} {item.name}</p>
                  <p className="font-mono text-xs text-white/50">{formatPrice(item.price)}</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="font-mono text-xs text-red-400 hover:text-red-300"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/10 pt-4 font-mono text-brand-blueLight">
          <span className="font-body text-sm text-white">Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        <button
          disabled={items.length === 0}
          onClick={() => { onClose(); router.push("/carrinho"); }}
          className="rounded-lg bg-brand-blue py-3 text-center font-mono text-xs font-bold text-white disabled:opacity-40"
        >
          Finalizar compra
        </button>
      </div>
    </div>
  );
}
