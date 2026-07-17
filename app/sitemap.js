import { adminDb } from "@/lib/firebaseAdmin";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Gerado automaticamente em /sitemap.xml - o Google usa isso pra indexar
// cada produto sem voce precisar submeter nada manualmente.
export default async function sitemap() {
  const staticRoutes = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/minhas-compras`, changeFrequency: "monthly", priority: 0.2 }
  ];

  try {
    const snap = await adminDb.collection("products").get();
    const productRoutes = snap.docs.map((doc) => {
      const p = doc.data();
      return {
        url: `${baseUrl}/produto/${p.slug || doc.id}`,
        lastModified: p.updatedAt || p.createdAt || new Date().toISOString(),
        changeFrequency: "weekly",
        priority: 0.8
      };
    });
    return [...staticRoutes, ...productRoutes];
  } catch (e) {
    // Se as credenciais do Firebase Admin ainda nao estiverem configuradas,
    // o sitemap cai pra so as rotas estaticas em vez de quebrar o build.
    return staticRoutes;
  }
}
