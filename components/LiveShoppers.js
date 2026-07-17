"use client";
import { useEffect, useState } from "react";

export default function LiveShoppers() {
  const [count, setCount] = useState(8);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.min(24, Math.max(4, c + delta));
      });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs text-white/80 backdrop-blur">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-blueLight opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-blueLight" />
      </span>
      {count} clientes navegando agora
    </span>
  );
}
