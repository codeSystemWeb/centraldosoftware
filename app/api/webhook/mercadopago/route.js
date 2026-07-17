import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { mpPayment } from "@/lib/mercadopago";

// O Mercado Pago chama essa rota automaticamente quando o status de um
// pagamento muda. E aqui que o pedido e liberado de verdade - nunca confie
// no redirecionamento do navegador (back_urls) para liberar produto.
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);

    const paymentId =
      body?.data?.id ||
      url.searchParams.get("data.id") ||
      url.searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    const payment = await mpPayment.get({ id: paymentId });
    const orderId = payment.external_reference;
    if (!orderId) return NextResponse.json({ received: true });

    const orderRef = adminDb.collection("orders").doc(orderId);

    if (payment.status === "approved") {
      await orderRef.update({
        status: "paid",
        paymentId: String(paymentId),
        paidAt: new Date().toISOString()
      });
    } else {
      await orderRef.update({ status: payment.status, paymentId: String(paymentId) });
      // soma +1 em "soldCount" de cada produto comprado nesse pedido
      const orderSnap = await orderRef.get();
      const orderData = orderSnap.data();
      const batch = adminDb.batch();
      orderData.items.forEach((item) => {
        batch.update(adminDb.collection("products").doc(item.id), {
          soldCount: FieldValue.increment(1)
        });
      });
      await batch.commit();
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Erro no webhook do Mercado Pago:", err);
    // Retorna 200 mesmo em erro interno para o MP nao ficar reenviando em loop
    // enquanto voce depura - ajuste esse comportamento como preferir.
    return NextResponse.json({ received: true });
  }
}

// O Mercado Pago tambem pode chamar via GET dependendo da config
export async function GET(req) {
  return POST(req);
}
