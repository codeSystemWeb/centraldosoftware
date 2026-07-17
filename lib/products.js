// Busca de produto no servidor (usado pra gerar metadata de SEO e a pagina em si).
import { adminDb } from "@/lib/firebaseAdmin";

export async function getProductBySlug(slug) {
  // tenta achar por slug primeiro
  const bySlug = await adminDb.collection("products").where("slug", "==", slug).limit(1).get();
  if (!bySlug.empty) {
    const doc = bySlug.docs[0];
    return { id: doc.id, ...doc.data() };
  }
  // fallback: aceita o id direto do documento (compatibilidade)
  const byId = await adminDb.collection("products").doc(slug).get();
  if (byId.exists) return { id: byId.id, ...byId.data() };
  return null;
}
