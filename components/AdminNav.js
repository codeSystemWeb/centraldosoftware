"use client";
import Link from "next/link";

export default function AdminNav({ active }) {
  const tabs = [
    { key: "dashboard", label: "Dashboard", href: "/admin" },
    { key: "produtos", label: "Produtos", href: "/admin/produtos" },
    { key: "pedidos", label: "Pedidos", href: "/admin/pedidos" }
  ];
  return (
    <div className="mb-6 flex gap-6 border-b border-white/10">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`border-b-2 pb-3 font-mono text-xs uppercase tracking-wide ${
            active === t.key ? "border-brand-blueLight text-brand-blueLight" : "border-transparent "
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
