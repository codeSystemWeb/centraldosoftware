"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminGuard from "@/components/AdminGuard";
import AdminNav from "@/components/AdminNav";

function formatPrice(n) {
  return "R$ " + Number(n).toFixed(2).replace(".", ",");
}

function DashboardContent() {
  const [orders, setOrders] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ordersSnap, productsSnap] = await Promise.all([
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "products"))
      ]);
      const paidOrders = ordersSnap.docs
        .map((d) => d.data())
        .filter((o) => o.status === "paid");
      setOrders(paidOrders);
      setProductCount(productsSnap.size);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="font-mono text-xs">Carregando...</p>;

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const avg = orders.length ? revenue / orders.length : 0;

  const sales = {};
  orders.forEach((o) => o.items.forEach((i) => { sales[i.name] = (sales[i.name] || 0) + 1; }));
  const ranked = Object.entries(sales).sort((a, b) => b[1] - a[1]);
  const max = ranked.length ? ranked[0][1] : 1;

  return (
    <div>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Receita total" value={formatPrice(revenue)} />
        <Stat label="Pedidos pagos" value={orders.length} />
        <Stat label="Ticket medio" value={formatPrice(avg)} />
        <Stat label="Produtos ativos" value={productCount} />
      </div>
      <h2 className="mb-4 font-display text-lg ">Mais vendidos</h2>
      {ranked.length === 0 ? (
        <p className="font-mono text-xs /40">Ainda nao ha vendas.</p>
      ) : (
        <div className="space-y-3">
          {ranked.map(([name, n]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-48 truncate text-sm /80">{name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded bg-white/10">
                <div className="h-full bg-brand-blue" style={{ width: `${(n / max) * 100}%` }} />
              </div>
              <span className="w-6 text-right font-mono text-xs /50">{n}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-brand-navy/60 p-5">
      <p className="font-mono text-[10px] uppercase tracking-wide">{label}</p>
      <p className="mt-2 font-display text-2xl text-brand-blueLight">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminNav active="dashboard" />
      <DashboardContent />
    </AdminGuard>
  );
}
