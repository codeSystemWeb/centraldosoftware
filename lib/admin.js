// Helper simples para checar se um e-mail e admin da loja.
// Definido via variavel de ambiente ADMIN_EMAILS (separados por virgula).
export function isAdminEmail(email) {
  if (!email) return false;
  const list = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
