"use client";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminGuard({ children }) {
  const { user, loading, isAdmin, signInWithGoogle } = useAuth();

  if (loading) {
    return <p className="p-10 text-center font-mono text-xs ">Carregando...</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-sm py-20 text-center">
        <p className="mb-4 font-mono text-xs ">
          Faca login com uma conta Google autorizada para acessar o painel admin.
        </p>
        <button
          onClick={signInWithGoogle}
          className="rounded-lg bg-brand-blue px-4 py-2 font-mono text-xs font-bold "
        >
          Entrar com Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <p className="p-10 text-center font-mono text-xs text-red-400">
        Esta conta ({user.email}) nao tem acesso ao painel admin.
      </p>
    );
  }

  return children;
}
