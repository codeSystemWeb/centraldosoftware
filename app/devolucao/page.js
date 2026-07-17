"use client";

export default function Devolucao() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-brand-navy font-display">Política de Devolução e Reembolso</h1>
      
      <div className="space-y-6">
        {/* Seção 1 */}
        <section className="rounded-2xl border border-white/10 bg-brand-paper p-8 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-brand-navy font-display">1. Produtos Digitais</h2>
          <p className="leading-relaxed text-brand-navy/80">
            Por se tratar de chaves de ativação digitais (licenças de software), o envio é realizado 
            automaticamente após a confirmação do pagamento. Devido à natureza do produto, 
            o código é entregue instantaneamente.
          </p>
        </section>

        {/* Seção 2 */}
        <section className="rounded-2xl border border-white/10 bg-brand-paper p-8 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-brand-navy font-display">2. Condições de Reembolso</h2>
          <ul className="list-inside list-disc space-y-2 leading-relaxed text-brand-navy/80">
            <li>
              <span className="font-semibold text-brand-navy">Chave Inválida:</span> Caso a chave não funcione, faremos a substituição ou o reembolso total após análise técnica.
            </li>
            <li>
              <span className="font-semibold text-brand-navy">Produto Incorreto:</span> Se o item entregue for diferente do adquirido.
            </li>
            <li>
              <span className="font-semibold text-brand-navy">Erro Técnico:</span> Pedidos duplicados por falha do sistema.
            </li>
          </ul>
        </section>

        {/* Seção 3 */}
        <section className="rounded-2xl border border-white/10 bg-brand-paper p-8 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-brand-navy font-display">3. Prazo e Suporte</h2>
          <p className="leading-relaxed text-brand-navy/80">
            Você tem até <strong>7 dias corridos</strong> após a data da compra para solicitar suporte. 
            É necessário apresentar o número do pedido e um print do erro para agilizarmos a solução.
          </p>
        </section>
      </div>
    </div>
  );
}