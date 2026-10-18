import Link from "next/link";

import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

import { AddToCartButton } from "./add-to-cart-button";
import { ProductImage } from "./product-image";

export function ProductCard({ product, preload }: { product: Product; preload: boolean }) {
  return (
    <article className="card flex flex-col overflow-hidden">
      <Link href={`/productos/${product.id}`} className="group block">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          preload={preload}
          className="transition group-hover:opacity-90"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category && (
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">{product.category}</span>
        )}
        <h2 className="line-clamp-2 font-semibold text-zinc-900">
          <Link href={`/productos/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
        </h2>
        <div className="mt-auto flex items-baseline justify-between pt-2">
          <span className="text-lg font-bold">{formatPrice(product.price)}</span>
          <span className={`text-xs ${product.stock > 0 ? "text-zinc-500" : "text-red-600"}`}>
            {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
          </span>
        </div>
        <AddToCartButton product={product} compact />
      </div>
    </article>
  );
}
