import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductImage } from "@/components/product-image";
import { ApiError } from "@/lib/api";
import { getProduct } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

async function loadProduct(id: string): Promise<Product> {
  if (!/^\d+$/.test(id)) notFound();
  try {
    return await getProduct(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error; // Cualquier otro fallo lo atrapa (catalogo)/error.tsx
  }
}

export async function generateMetadata({ params }: PageProps<"/productos/[id]">): Promise<Metadata> {
  const product = await loadProduct((await params).id);
  const description = product.description ?? `Compra ${product.name} en Voltio.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/productos/${product.id}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: product.image_url ? [{ url: product.image_url, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/productos/[id]">) {
  const product = await loadProduct((await params).id);

  return (
    <article>
      <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:underline">
          Catálogo
        </Link>
        {product.category && <span> / {product.category}</span>}
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          sizes="(min-width: 768px) 50vw, 100vw"
          preload
          className="rounded-2xl border border-zinc-200"
        />

        <div className="flex flex-col gap-4">
          {product.category && (
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-700">{product.category}</span>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-3xl font-bold text-zinc-900">{formatPrice(product.price)}</p>
          {product.description && <p className="leading-relaxed text-zinc-600">{product.description}</p>}

          <dl className="grid grid-cols-2 gap-3 rounded-xl bg-zinc-100 p-4 text-sm">
            <div>
              <dt className="text-zinc-600">SKU</dt>
              <dd className="font-mono font-medium">{product.sku}</dd>
            </div>
            <div>
              <dt className="text-zinc-600">Disponibilidad</dt>
              <dd className={`font-medium ${product.stock > 0 ? "text-emerald-700" : "text-red-600"}`}>
                {product.stock > 0 ? `${product.stock} en stock` : "Agotado"}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3 pt-2">
            <AddToCartButton product={product} />
            <Link href="/carrito" className="btn-secondary">
              Ver carrito
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
