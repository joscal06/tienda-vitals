import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <h1 className="text-lg font-semibold">Producto no encontrado</h1>
      <p className="mt-2 text-sm text-zinc-600">El producto que buscas no existe o ya no está disponible.</p>
      <Link href="/" className="btn-primary mt-6">
        Volver al catálogo
      </Link>
    </div>
  );
}
