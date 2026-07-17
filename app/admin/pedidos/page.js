"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminGuard from "@/components/AdminGuard";
import AdminNav from "@/components/AdminNav";

const PAGE_SIZE = 8;

function formatPrice(n) {
  return "R$ " + Number(n).toFixed(2).replace(".", ",");
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const STATUS_META = {
  paid: { label: "Pago", dot: "bg-emerald-400", text: "text-emerald-300", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  pending: { label: "Pendente", dot: "bg-amber-400", text: "text-amber-300", bg: "bg-amber-400/10", border: "border-amber-400/30" },
  cancelled: { label: "Cancelado", dot: "bg-slate-400", text: "text-slate-300", bg: "bg-slate-400/10", border: "border-slate-400/30" },
  rejected: { label: "Recusado", dot: "bg-red-400", text: "text-red-300", bg: "bg-red-400/10", border: "border-red-400/30" }
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${meta.border} ${meta.bg} px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${meta.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
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
      className="font-mono text-[10px] text-white/30 hover:text-brand-blueLight"
    >
      {copied ? "copiado ✓" : "copiar"}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-white/10 bg-brand-navy/60 p-4">
      <p className="font-mono text-[10px] uppercase tracking-wide text-white/40">{label}</p>
      <p className={`mt-1 font-display text-xl font-bold ${accent || "text-white"}`}>{value}</p>
    </div>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  async function loadOrders() {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function markAsPaid(order) {
    if (!confirm("Confirmar que este pedido foi pago manualmente? Isso vai liberar o produto pro cliente.")) return;
    setBusyId(order.id);
    try {
      await updateDoc(doc(db, "orders", order.id), {
        status: "paid",
        paidAt: new Date().toISOString(),
        paymentId: "manual-admin"
      });
      for (const item of order.items) {
        await updateDoc(doc(db, "products", item.id), { soldCount: increment(1) });
      }
      await loadOrders();
    } catch (e) {
      alert("Erro ao aprovar pedido: " + e.message);
    }
    setBusyId(null);
  }

  async function cancelOrder(order) {
    if (!confirm("Cancelar este pedido? O cliente não vai receber acesso ao produto.")) return;
    setBusyId(order.id);
    try {
      await updateDoc(doc(db, "orders", order.id), { status: "cancelled" });
      await loadOrders();
    } catch (e) {
      alert("Erro ao cancelar pedido: " + e.message);
    }
    setBusyId(null);
  }

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status === "paid");
    const pending = orders.filter((o) => o.status === "pending");
    const revenue = paid.reduce((s, o) => s + o.total, 0);
    return { total: orders.length, paid: paid.length, pending: pending.length, revenue };
  }, [orders]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus = !statusFilter || o.status === statusFilter;
      if (!matchStatus) return false;
      if (!term) return true;
      const haystack = [o.id, o.customerName, o.customerEmail, ...(o.items || []).map((i) => i.name)]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearchChange(value) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value) {
    setStatusFilter(value);
    setPage(1);
  }

  if (loading) return <p className="font-mono text-xs text-white/40">Carregando...</p>;

  const statusOptions = [
    { value: "", label: "Todos" },
    { value: "paid", label: "Pago" },
    { value: "pending", label: "Pendente" },
    { value: "cancelled", label: "Cancelado" },
    { value: "rejected", label: "Recusado" }
  ];

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total de pedidos" value={stats.total} />
        <StatCard label="Pendentes" value={stats.pending} accent="text-amber-300" />
        <StatCard label="Pagos" value={stats.paid} accent="text-emerald-300" />
        <StatCard label="Receita confirmada" value={formatPrice(stats.revenue)} accent="text-brand-blueLight" />
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-brand-paper shadow-md shadow-black/10 lg:max-w-sm">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar pedido, cliente, e-mail ou produto..."
            className="w-full bg-transparent py-3 pl-11 pr-4 text-sm text-brand-navy placeholder:text-slate-400 outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-full border border-white/10 bg-brand-navy/60 p-1.5">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={
                "rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wide transition " +
                (statusFilter === opt.value
                  ? "bg-brand-blue text-white"
                  : "text-white/50 hover:text-white")
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-14 text-center">
          <p className="font-mono text-xs text-white/50">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pageItems.map((o) => (
            <div key={o.id} className="rounded-2xl border border-white/10 bg-brand-navy/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/20 font-mono text-sm font-bold text-brand-blueLight">
                    {(o.customerName || o.customerEmail || "?").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{o.customerName || "Cliente"}</p>
                    <p className="font-mono text-[11px] text-white/40">{o.customerEmail}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={o.status} />
                  <span className="font-mono text-[10px] text-white/30">{formatDate(o.createdAt)}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-white/30">#{o.id.slice(0, 8)}</span>
                  <CopyButton text={o.id} />
                  <span className="text-white/20">·</span>
                  <span className="text-xs text-white/60">{o.items.map((i) => i.name).join(", ")}</span>
                </div>
                <span className="font-mono text-sm font-bold text-brand-blueLight">{formatPrice(o.total)}</span>
              </div>

              {o.status === "pending" && (
                <div className="mt-4 flex gap-2 border-t border-white/10 pt-4">
                  <button
                    disabled={busyId === o.id}
                    onClick={() => markAsPaid(o)}
                    className="rounded-lg bg-emerald-400/10 px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-wide text-emerald-300 ring-1 ring-inset ring-emerald-400/30 transition hover:bg-emerald-400/20 disabled:opacity-40"
                  >
                    ✓ Marcar como pago
                  </button>
                  <button
                    disabled={busyId === o.id}
                    onClick={() => cancelOrder(o)}
                    className="rounded-lg bg-red-400/10 px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-wide text-red-300 ring-1 ring-inset ring-red-400/30 transition hover:bg-red-400/20 disabled:opacity-40"
                  >
                    ✕ Cancelar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="mt-6 flex items-center justify-between font-mono text-xs text-white/50">
          <span>Página {currentPage} de {totalPages} · {filtered.length} pedido(s)</span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-white transition hover:border-brand-blueLight disabled:opacity-30 disabled:hover:border-white/15"
            >
              ← Anterior
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-white transition hover:border-brand-blueLight disabled:opacity-30 disabled:hover:border-white/15"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <AdminGuard>
      <AdminNav active="pedidos" />
      <OrdersContent />
    </AdminGuard>
  );
}