"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import LiveShoppers from "@/components/LiveShoppers";

function sortProducts(list) {
  return [...list].sort((a, b) => {
    const oa = a.order ?? 999999;
    const ob = b.order ?? 999999;
    if (oa !== ob) return oa - ob;
    return (a.createdAt || "").localeCompare(b.createdAt || "");
  });
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "products"),
      (snap) => {
        setProducts(sortProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const filtered = products.filter((p) => {
    const matchQ = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    const matchC = !category || p.category === category;
    return matchQ && matchC;
  });

  return (
    <div>
      {/* HERO */}
      <section className="relative mb-12 overflow-hidden rounded-3xl border border-white/10 bg-brand-navy px-8 py-12 sm:px-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-blue/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-brand-blueLight/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-blueLight">Softwares em destaque</p>
            <h1 className="mt-3 max-w-xl font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl">
              Licenças e produtos digitais, com acesso imediato.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
              Assim que o pagamento é confirmado, o acesso e as instruções aparecem direto em{" "}
              <span className="text-white/80">"Minhas Compras"</span>.
            </p>
          </div>
          <LiveShoppers />
        </div>
      </section>

      {/* BUSCA */}
      <div className="mb-8 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-brand-paper shadow-xl shadow-black/20 sm:flex-row sm:items-center">
        <div className="relative flex flex-1 items-center">
          <span className="pointer-events-none absolute left-5 text-slate-400">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar produtos..."
            className="w-full bg-transparent py-4 pl-12 pr-4 text-sm text-brand-navy placeholder:text-slate-400 outline-none"
          />
        </div>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        <div className="relative border-t border-slate-200 sm:w-56 sm:border-l sm:border-t-0">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full appearance-none bg-transparent py-4 pl-5 pr-10 text-sm text-brand-navy outline-none"
          >
            <option value="">Todas categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
            <ChevronIcon />
          </span>
        </div>
      </div>

      {loading ? (
        <p className="font-mono text-xs text-white/40">Carregando produtos...</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 p-10 text-center font-mono text-xs text-white/50">
          Nenhum produto cadastrado ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}