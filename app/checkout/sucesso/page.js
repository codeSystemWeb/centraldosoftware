"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CheckoutSucessoPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-brand-navy/60 p-8 text-center">
      <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-brand-blue/20 text-2xl leading-[3.5rem]">✓</div>
      <h1 className="font-display text-xl font-bold text-white">Pagamento em processamento</h1>
      <p className="mt-3 text-sm text-white/60">
        Assim que o Mercado Pago confirmar o pagamento (geralmente em segundos), seu produto
        aparece automaticamente em "Minhas Compras", com as instruções de acesso liberadas.
      </p>
      <Link href="/minhas-compras" className="mt-6 inline-block rounded-lg bg-brand-blue px-5 py-3 font-mono text-xs font-bold text-white">
        Ir para Minhas Compras
      </Link>
    </div>
  );
}