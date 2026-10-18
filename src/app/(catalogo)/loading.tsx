import { ProductGridSkeleton } from "@/components/skeletons";

/** Fallback de ruta del catálogo y del detalle mientras llega el RSC. */
export default function CatalogLoading() {
  return (
    <>
      <div className="skeleton mb-8 h-44 rounded-3xl" />
      <ProductGridSkeleton />
    </>
  );
}
