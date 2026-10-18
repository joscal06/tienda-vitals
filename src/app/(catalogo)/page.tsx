import { Suspense } from "react";

import { Pagination } from "@/components/pagination";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/skeletons";
import { getProducts } from "@/lib/data";

function parsePage(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** Sección pesada: espera la API y se transmite (streaming) dentro de Suspense. */
async function ProductGrid({ page }: { page: number }) {
  const { data: products, meta } = await getProducts(page);

  if (products.length === 0) {
    return <p className="card p-8 text-center text-zinc-600">No hay productos en esta página.</p>;
  }

  return (
    <>
      <p className="mb-4 text-sm text-zinc-500">
        Mostrando {products.length} de {meta.total} productos · página {meta.current_page} de {meta.last_page}
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, index) => (
          // Solo la primera fila (posible LCP) se precarga; el resto es lazy.
          <ProductCard key={product.id} product={product} preload={index < 4} />
        ))}
      </div>
      <Pagination page={meta.current_page} lastPage={meta.last_page} basePath="/" label="Páginas del catálogo" />
    </>
  );
}

export default async function CatalogPage({ searchParams }: PageProps<"/">) {
  const page = parsePage((await searchParams).page);

  return (
    <>
      <section className="mb-8 rounded-3xl bg-gradient-to-br from-brand-700 to-brand-600 px-6 py-10 text-white sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-100">Catálogo</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Tecnología que se carga rápido</h1>
        <p className="mt-3 max-w-2xl text-brand-100">
          Laptops, celulares, audio y accesorios con stock en tiempo real. Paga de forma segura con Stripe.
        </p>
      </section>

      {/* key={page}: al cambiar de página se vuelve a mostrar el esqueleto. */}
      <Suspense key={page} fallback={<ProductGridSkeleton />}>
        <ProductGrid page={page} />
      </Suspense>
    </>
  );
}
