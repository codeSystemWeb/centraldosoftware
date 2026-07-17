"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

function formatPrice(n) {
  return "R$ " + Number(n).toFixed(2).replace(".", ",");
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="font-mono text-[10px] uppercase tracking-wide text-brand-blueLight hover:"
    >
      {copied ? "Copiado ✓" : "Copiar"}
    </button>
  );
}

function InstructionsBlock({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-brand-blue">
          {open ? "Ocultar instruções de acesso" : "Ver instruções de acesso"}
        </span>
        <span className="text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-slate-200 px-4 py-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">Acesso liberado</span>
            <CopyButton text={text || ""} />
          </div>
          <pre className="whitespace-pre-wrap rounded-lg bg-brand-ink p-4 font-mono text-xs leading-relaxed text-brand-blueLight">
            {text || "Instruções não cadastradas para este produto."}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function MinhasComprasPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      const q = query(
        collection(db, "orders"),
        where("customerEmail", "==", user.email),
        where("status", "==", "paid")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.paidAt || b.createdAt || "").localeCompare(a.paidAt || a.createdAt || ""));
      setOrders(list);
      setLoading(false);
    }
    load();
  }, [user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-sm py-16 text-center">
        <p className="mb-4 font-mono text-xs /60">Entre com Google para ver suas compras.</p>
        <button onClick={signInWithGoogle} className="rounded-lg bg-brand-blue px-4 py-2 font-mono text-xs font-bold ">
          Entrar com Google
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 border-b border-white/10 pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-blueLight">Área do cliente</p>
        <h1 className="mt-2 font-display text-3xl font-bold ">Minhas compras</h1>
        <p className="mt-2 text-sm /50">Seus produtos com acesso liberado, prontos pra usar.</p>
      </div>

      {loading ? (
        <p className="font-mono text-xs /40">Carregando...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-14 text-center">
          <p className="font-mono text-xs /50">Você ainda não tem nenhuma compra confirmada.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div key={order.id} className="overflow-hidden rounded-2xl border border-white/10 bg-brand-paper">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
                    Pedido #{order.id.slice(0, 8)}
                  </span>
                  <CopyButton text={order.id} />
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  Comprado em {formatDate(order.paidAt || order.createdAt)}
                </span>
              </div>

              <div className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <div key={order.id + item.id + idx} className="flex items-start gap-4 px-6 py-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-navy to-brand-blue">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} width={56} height={56} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-2xl">{item.icon || "\u{1F4E6}"}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-base font-bold text-brand-navy">{item.name}</h3>
                        <span className="shrink-0 font-mono text-sm font-bold text-brand-blue">{formatPrice(item.price)}</span>
                      </div>
                      <InstructionsBlock text={item.instructions} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}