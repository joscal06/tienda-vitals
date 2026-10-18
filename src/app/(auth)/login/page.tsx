import type { Metadata } from "next";

import { AuthForm } from "@/components/auth-form";
import { safeNext } from "@/lib/session";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : null);

  return (
    <div className="card mx-auto max-w-md p-8">
      <h1 className="text-2xl font-bold tracking-tight">Iniciar sesión</h1>
      <p className="mt-1 mb-6 text-sm text-zinc-600">Ingresa para completar tu compra y ver tu historial.</p>
      {params.expirada === "1" && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Tu sesión expiró. Vuelve a iniciar sesión para continuar.
        </p>
      )}
      <AuthForm mode="login" next={next} />
    </div>
  );
}
