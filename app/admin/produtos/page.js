"use client";
import { useEffect, useState } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { slugify } from "@/lib/slug";
import AdminGuard from "@/components/AdminGuard";
import AdminNav from "@/components/AdminNav";

function formatPrice(n) {
  return "R$ " + Number(n).toFixed(2).replace(".", ",");
}

function sortProducts(list) {
  return [...list].sort((a, b) => {
    const oa = a.order ?? 999999;
    const ob = b.order ?? 999999;
    if (oa !== ob) return oa - ob;
    return (a.createdAt || "").localeCompare(b.createdAt || "");
  });
}

const emptyForm = {
  id: null,
  name: "",
  category: "",
  icon: "\u{1F4E6}",
  image: "",
  price: "",
  desc: "",
  instructions: "",
  slug: "",
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  rating: "",
  reviewCount: "",
  featured: false,
  onSale: false,
  discountPercent: "20",
  lastUnits: false,
  slugTouched: false
};

function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [tab, setTab] = useState("info");
  const [dragId, setDragId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(sortProducts(list));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Migracao automatica: se algum produto ainda nao tem "order" (produtos
  // cadastrados antes dessa funcionalidade existir), atribui a ordem atual
  // uma unica vez, silenciosamente.
  useEffect(() => {
    if (loading || products.length === 0) return;
    const missingOrder = products.some((p) => p.order === undefined || p.order === null);
    if (!missingOrder) return;
    const batch = writeBatch(db);
    products.forEach((p, idx) => {
      batch.update(doc(db, "products", p.id), { order: idx });
    });
    batch.commit().catch(() => {});
  }, [products, loading]);

  function openNew() {
    setForm(emptyForm);
    setTab("info");
  }

  function openEdit(p) {
    setForm({
      ...emptyForm,
      ...p,
      discountPercent: p.discountPercent ? String(p.discountPercent) : "20",
      slugTouched: true
    });
    setTab("info");
  }

  function updateName(name) {
    setForm((f) => ({
      ...f,
      name,
      slug: f.slugTouched ? f.slug : slugify(name)
    }));
  }

  async function handleSave() {
    if (!form.name || form.price === "") return;
    const finalSlug = form.slug ? slugify(form.slug) : slugify(form.name);
    const payload = {
      name: form.name,
      category: form.category || "Geral",
      icon: form.icon || "\u{1F4E6}",
      image: form.image || "",
      price: Number(form.price),
      desc: form.desc,
      instructions: form.instructions,
      slug: finalSlug,
      metaTitle: form.metaTitle || form.name,
      metaDescription: form.metaDescription || form.desc,
      keywords: form.keywords,
      rating: form.rating ? Number(form.rating) : 0,
      reviewCount: form.reviewCount ? Number(form.reviewCount) : 0,
      featured: !!form.featured,
      onSale: !!form.onSale,
      discountPercent: form.onSale ? Number(form.discountPercent || 0) : 0,
      lastUnits: !!form.lastUnits,
      updatedAt: new Date().toISOString()
    };
    if (form.id) {
      await updateDoc(doc(db, "products", form.id), payload);
    } else {
      // produto novo entra no final da lista
      const nextOrder = products.length
        ? Math.max(...products.map((p) => p.order ?? 0)) + 1
        : 0;
      await addDoc(collection(db, "products"), {
        ...payload,
        order: nextOrder,
        createdAt: new Date().toISOString()
      });
    }
    setForm(null);
  }

  async function handleDelete(id) {
    if (!confirm("Excluir este produto?")) return;
    await deleteDoc(doc(db, "products", id));
  }

  function handleDragStart(id) {
    setDragId(id);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  async function handleDrop(targetId) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const list = [...products];
    const fromIndex = list.findIndex((p) => p.id === dragId);
    const toIndex = list.findIndex((p) => p.id === targetId);
    if (fromIndex === -1 || toIndex === -1) {
      setDragId(null);
      return;
    }
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    setProducts(list); // atualiza a tela na hora, sem esperar o Firestore

    const batch = writeBatch(db);
    list.forEach((p, idx) => {
      batch.update(doc(db, "products", p.id), { order: idx });
    });
    try {
      await batch.commit();
    } catch (e) {
      alert("Erro ao salvar a nova ordem: " + e.message);
    }
    setDragId(null);
  }

  return (
    <div>
      <button
        onClick={openNew}
        className="mb-4 rounded-lg bg-brand-blue px-4 py-2 font-mono text-xs font-bold text-white"
      >
        + Novo produto
      </button>
      <p className="mb-4 font-mono text-[11px] text-white/40">
        Arraste pelo ícone ⠿ pra reordenar. A ordem aqui é a mesma que aparece na loja.
      </p>

      {loading ? (
        <p className="font-mono text-xs text-white/40">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div
              key={p.id}
              draggable
              onDragStart={() => handleDragStart(p.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(p.id)}
              className={
                "flex items-center justify-between rounded-xl border bg-brand-navy/60 p-4 transition " +
                (dragId === p.id ? "border-brand-blueLight opacity-50" : "border-white/10")
              }
            >
              <div className="flex items-center gap-3">
                <span className="cursor-grab select-none text-lg text-white/30" title="Arraste para reordenar">⠿</span>
                <span className="text-xl">{p.icon}</span>
                <div>
                  <p className="text-sm text-white">
                    {p.name}
                    {p.featured && <span className="ml-2 rounded bg-amber-400/20 px-2 py-0.5 font-mono text-[9px] text-amber-300">DESTAQUE</span>}
                    {p.onSale && <span className="ml-2 rounded bg-red-400/20 px-2 py-0.5 font-mono text-[9px] text-red-300">-{p.discountPercent}%</span>}
                    {p.lastUnits && <span className="ml-2 rounded bg-orange-400/20 px-2 py-0.5 font-mono text-[9px] text-orange-300">ÚLTIMAS UNID.</span>}
                  </p>
                  <p className="font-mono text-xs text-white/50">
                    {p.category} - {formatPrice(p.price)} - /produto/{p.slug || p.id}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="rounded-lg border border-white/15 px-3 py-2 font-mono text-xs text-white">
                  Editar
                </button>
                <button onClick={() => handleDelete(p.id)} className="rounded-lg border border-red-400/40 px-3 py-2 font-mono text-xs text-red-400">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setForm(null)}>
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-brand-navy p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 font-display text-lg text-white">{form.id ? "Editar produto" : "Novo produto"}</h2>

            <div className="mb-4 flex gap-2 border-b border-white/10">
              <button
                onClick={() => setTab("info")}
                className={"pb-2 font-mono text-xs uppercase " + (tab === "info" ? "border-b-2 border-brand-blueLight text-brand-blueLight" : "text-white/40")}
              >
                Informações
              </button>
              <button
                onClick={() => setTab("seo")}
                className={"pb-2 font-mono text-xs uppercase " + (tab === "seo" ? "border-b-2 border-brand-blueLight text-brand-blueLight" : "text-white/40")}
              >
                SEO
              </button>
            </div>

            {tab === "info" && (
              <div className="space-y-3">
                <Field label="Nome do produto">
                  <input className="field" value={form.name} onChange={(e) => updateName(e.target.value)} />
                </Field>
                <Field label="Categoria">
                  <input className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </Field>
                <Field label="Imagem (URL)">
                  <input
                    className="field"
                    placeholder="https://..."
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                  />
                  <p className="mt-1 font-mono text-[10px] text-white/40">Se deixar em branco, usa o emoji abaixo como capa.</p>
                </Field>
                <Field label="Ícone (emoji, usado se não houver imagem)">
                  <input className="field" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
                </Field>
                <Field label="Preço (R$)">
                  <input type="number" className="field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </Field>
                <Field label="Avaliação (nota de 0 a 5)">
                  <input type="number" step="0.1" min="0" max="5" className="field" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
                </Field>
                <Field label="Quantidade de avaliações">
                  <input type="number" min="0" className="field" value={form.reviewCount} onChange={(e) => setForm({ ...form, reviewCount: e.target.value })} />
                </Field>
                <Field label="Descrição curta (aparece na loja)">
                  <textarea className="field" rows={2} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
                </Field>
                <Field label="Instruções de acesso (só aparece após o pagamento ser aprovado)">
                  <textarea className="field font-mono" rows={4} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
                </Field>

                <div className="rounded-xl border border-white/10 bg-brand-ink/60 p-4">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-wide text-white/50">Etiquetas do produto (aparecem sobre a imagem, na loja)</p>

                  <label className="mb-2 flex items-center gap-2 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    />
                    Produto em destaque
                  </label>

                  <label className="mb-2 flex items-center gap-2 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={form.onSale}
                      onChange={(e) => setForm({ ...form, onSale: e.target.checked })}
                    />
                    Produto com desconto
                  </label>
                  {form.onSale && (
                    <div className="mb-2 ml-6">
                      <label className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-white/50">Desconto (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        className="field w-24"
                        value={form.discountPercent}
                        onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                      />
                      {form.price && (
                        <p className="mt-1 font-mono text-[10px] text-white/40">
                          Preço com desconto: {formatPrice(Number(form.price) * (1 - Number(form.discountPercent || 0) / 100))}
                        </p>
                      )}
                    </div>
                  )}

                  <label className="flex items-center gap-2 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={form.lastUnits}
                      onChange={(e) => setForm({ ...form, lastUnits: e.target.checked })}
                    />
                    Últimas unidades
                  </label>
                </div>
              </div>
            )}

            {tab === "seo" && (
              <div className="space-y-3">
                <Field label="URL do produto (slug)">
                  <div className="flex items-center gap-1 font-mono text-xs text-white/40">
                    <span>/produto/</span>
                    <input
                      className="field flex-1"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value, slugTouched: true })}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-white/40">Gerado automaticamente pelo nome, mas você pode editar.</p>
                </Field>
                <Field label="Meta title (título que aparece no Google)">
                  <input
                    className="field"
                    placeholder={form.name || "Usa o nome do produto se deixar em branco"}
                    value={form.metaTitle}
                    onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                  />
                </Field>
                <Field label="Meta description (resumo que aparece no Google)">
                  <textarea
                    className="field"
                    rows={3}
                    placeholder={form.desc || "Usa a descrição curta se deixar em branco"}
                    value={form.metaDescription}
                    onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  />
                </Field>
                <Field label="Palavras-chave de SEO (separadas por vírgula)">
                  <textarea
                    className="field font-mono"
                    rows={2}
                    placeholder="windows 11 pro, licença original, chave de ativação"
                    value={form.keywords}
                    onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  />
                </Field>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => setForm(null)} className="rounded-lg border border-white/15 px-4 py-2 font-mono text-xs text-white">
                Cancelar
              </button>
              <button onClick={handleSave} className="rounded-lg bg-brand-blue px-4 py-2 font-mono text-xs font-bold text-white">
                Salvar produto
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .field {
          width: 100%;
          background: #060B1F;
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-white/50">{label}</label>
      {children}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <AdminGuard>
      <AdminNav active="produtos" />
      <ProductsContent />
    </AdminGuard>
  );
}
