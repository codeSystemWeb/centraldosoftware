// Calcula o preco final de um produto considerando o desconto, se ativado.
// Usado tanto no cliente (pra mostrar o preco) quanto no servidor
// (pra cobrar o valor certo no checkout) - assim os dois nunca ficam
// dessincronizados.
export function getEffectivePrice(product) {
  if (product?.onSale && product?.discountPercent > 0) {
    const raw = Number(product.price) * (1 - Number(product.discountPercent) / 100);
    return Math.round(raw * 100) / 100;
  }
  return Number(product?.price || 0);
}
