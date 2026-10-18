import type { Metadata } from "next";

import { AuthForm } from "@/components/auth-form";
import { safeNext } from "@/lib/session";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegisterPage({ searchParams }: PageProps<"/registro">) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : null);

  return (
    <div className="card mx-auto max-w-md p-8">
      <h1 className="text-2xl font-bold tracking-tight">Crear cuenta</h1>
      <p className="mt-1 mb-6 text-sm text-zinc-600">Regístrate como cliente para comprar en Voltio.</p>
      <AuthForm mode="register" next={next} />
    </div>
  );
}
