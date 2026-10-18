import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <h1 className="text-lg font-semibold">Página no encontrada</h1>
      <p className="mt-2 text-sm text-zinc-600">La página que buscas no existe o no tienes acceso a ella.</p>
      <Link href="/" className="btn-primary mt-6">
        Volver al catálogo
      </Link>
    </div>
  );
}
