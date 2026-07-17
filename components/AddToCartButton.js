"use client";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function AddToCartButton({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-lg bg-brand-blue px-5 py-3 font-mono text-xs font-bold text-white hover:bg-brand-blueLight"
    >
      {added ? "Adicionado ✓" : "Comprar"}
    </button>
  );
}
