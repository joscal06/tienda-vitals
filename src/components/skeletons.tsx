import { PRODUCTS_PER_PAGE } from "@/lib/constants";

/** Esqueletos con las mismas dimensiones que el contenido real (evitan CLS). */
export function ProductGridSkeleton() {
  return (
    <div role="status" aria-label="Cargando productos" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: PRODUCTS_PER_PAGE }, (_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton aspect-[3/2] rounded-none" />
          <div className="space-y-3 p-4">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrdersSkeleton() {
  return (
    <div role="status" aria-label="Cargando compras" className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="card space-y-3 p-5">
          <div className="flex justify-between">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton h-5 w-24" />
          </div>
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
