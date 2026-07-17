import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { mpPreference } from "@/lib/mercadopago";
import { getEffectivePrice } from "@/lib/pricing";

export async function POST(req) {
  try {
    const { items, customerEmail, customerName } = await req.json();

    if (!items?.length || !customerEmail) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Nunca confia no preco/instrucoes vindos do navegador - busca o produto
    // real no Firestore (com o preco ja calculado com desconto, se houver)
    // pra montar o pedido com dados confiaveis.
    const fullItems = [];
    for (const i of items) {
      const snap = await adminDb.collection("products").doc(i.id).get();
      if (!snap.exists) continue;
      const p = snap.data();
      fullItems.push({
        id: i.id,
        name: p.name,
        icon: p.icon || "",
        price: getEffectivePrice(p),
        instructions: p.instructions || ""
      });
    }

    if (!fullItems.length) {
      return NextResponse.json({ error: "Nenhum produto valido no carrinho" }, { status: 400 });
    }

    const total = fullItems.reduce((sum, i) => sum + i.price, 0);

    const orderRef = await adminDb.collection("orders").add({
      items: fullItems,
      total,
      customerEmail,
      customerName: customerName || "",
      status: "pending",
      createdAt: new Date().toISOString()
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const preference = await mpPreference.create({
      body: {
        items: fullItems.map((i) => ({
          id: i.id,
          title: i.name,
          quantity: 1,
          unit_price: i.price,
          currency_id: "BRL"
        })),
        payer: { email: customerEmail },
        external_reference: orderRef.id,
        notification_url: `${baseUrl}/api/webhook/mercadopago`,
        back_urls: {
          success: `${baseUrl}/checkout/sucesso?order=${orderRef.id}`,
          pending: `${baseUrl}/checkout/sucesso?order=${orderRef.id}`,
          failure: `${baseUrl}/carrinho`
        },
        auto_return: "approved"
      }
    });

    return NextResponse.json({
      initPoint: preference.init_point,
      orderId: orderRef.id
    });
  } catch (err) {
    console.error("Erro no checkout:", err);
    return NextResponse.json({ error: "Erro ao iniciar pagamento" }, { status: 500 });
  }
}
