"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();

  async function handleLogin() {
    await signInWithGoogle();
    router.push("/");
  }

  if (user) {
    return <p className="font-mono text-xs ">Voce ja esta logado como {user.email}.</p>;
  }

  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      <h1 className="mb-4 font-display text-xl font-bold ">Entrar</h1>
      <button onClick={handleLogin} className="rounded-lg bg-brand-blue px-5 py-3 font-mono text-xs font-bold">
        Entrar com Google
      </button>
    </div>
  );
}
