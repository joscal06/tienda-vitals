"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  title: string;
  error: Error & { digest?: string };
  retry: () => void;
};

/** UI compartida por los error.tsx: mensaje claro + botón de reintento. */
export function ErrorState({ title, error, retry }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="card mx-auto max-w-lg p-8 text-center">
      <div aria-hidden className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-red-100 text-2xl">
        !
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-zinc-600">
        {/* En producción Next oculta el mensaje de errores de servidor; se muestra un texto genérico. */}
        {error.digest ? "El servidor no pudo completar la solicitud. Puede que la API no esté disponible." : error.message}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={() => retry()} className="btn-primary">
          Reintentar
        </button>
        <Link href="/" className="btn-secondary">
          Ir al catálogo
        </Link>
      </div>
    </div>
  );
}
