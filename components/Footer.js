"use client";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-brand-ink">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="CodeSystemWeb" width={32} height={26} className="h-7 w-auto" />
              <span className="font-display text-sm font-semibold text-white">
                CodeSystemWeb <span className="text-brand-blueLight">Store</span>
              </span>
            </div>
            <p className="mt-3 text-xs text-white/50">
              Produtos digitais com entrega automática e acesso liberado assim que o pagamento é confirmado.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Loja</p>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>
                  <Link href="/" className="hover:text-brand-blueLight">Todos os produtos</Link>
                </li>
                <li>
                  <Link href="/minhas-compras" className="hover:text-brand-blueLight">Minhas compras</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Contato</p>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>
                  <a href="https://wa.me/5551994879614" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blueLight">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href="mailto:contato@codesystemweb.com.br" className="hover:text-brand-blueLight">
                    contato@codesystemweb.com.br
                  </a>
                </li>
                <li>
                    <Link href="/devolucao" className="hover:text-brand-blueLight">Política de Devoução</Link>
                  </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-center font-mono text-[11px] text-white/40">
          © {year} CodeSystemWeb. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}