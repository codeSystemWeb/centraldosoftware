"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import CartDrawer from "./CartDrawer";

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M6 6h15l-1.5 9h-12L6 6Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6 5 3H2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="20" r="1.5" />
      <circle cx="17.5" cy="20" r="1.5" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Header() {
  const { items } = useCart();
  const { user, signInWithGoogle, signOut, isAdmin } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-ink/95 shadow-lg shadow-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="CodeSystemWeb" width={40} height={32} className="h-8 w-auto" />
            <span className="font-display text-sm font-semibold tracking-wide text-white">
              CodeSystemWeb <span className="text-brand-blueLight">Store</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 font-mono text-xs uppercase tracking-wide text-white/70 md:flex">
            {isAdmin && <Link href="/admin" className="transition hover:text-brand-blueLight">Admin</Link>}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 transition hover:border-white/20"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "Cliente"}
                      referrerPolicy="no-referrer"
                      className="h-7 w-7 rounded-full ring-1 ring-white/20"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue font-mono text-xs font-bold text-white">
                      {(user.displayName || user.email || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="hidden max-w-[100px] truncate font-mono text-xs text-white/80 sm:inline">
                    {user.displayName?.split(" ")[0] || "Conta"}
                  </span>
                  <ChevronDown />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-52 overflow-hidden rounded-xl border border-white/10 bg-brand-navy shadow-xl shadow-black/30">
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="truncate text-sm text-white">{user.displayName}</p>
                      <p className="truncate font-mono text-[10px] text-white/40">{user.email}</p>
                    </div>
                    <Link
                      href="/minhas-compras"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 font-mono text-xs text-white/70 hover:bg-white/5 hover:text-white"
                    >
                      Minhas compras
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 font-mono text-xs text-white/70 hover:bg-white/5 hover:text-white"
                      >
                        Painel admin
                      </Link>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); signOut(); }}
                      className="block w-full px-4 py-2.5 text-left font-mono text-xs text-red-400 hover:bg-white/5"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="rounded-lg border border-white/15 px-3 py-2 font-mono text-xs text-white transition hover:border-brand-blueLight"
              >
                Entrar com Google
              </button>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 font-mono text-xs font-bold text-white shadow-md shadow-brand-blue/30 transition hover:bg-brand-blueLight"
            >
              <CartIcon />
              <span className="hidden sm:inline">Carrinho</span>
              {items.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}