"use client";

import { useState } from "react";

import type { Product } from "@/lib/types";

import { useCart } from "./cart-provider";

type Props = {
  product: Pick<Product, "id" | "name" | "price" | "image_url" | "stock">;
  compact?: boolean;
};

export function AddToCartButton({ product, compact = false }: Props) {
  const { items, add } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.id === product.id)?.quantity ?? 0;
  const soldOut = product.stock <= 0;
  const maxed = inCart >= product.stock;

  function handleClick() {
    add({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, stock: product.stock });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  const label = soldOut ? "Agotado" : maxed ? "Máximo en carrito" : added ? "¡Agregado!" : "Agregar al carrito";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldOut || maxed}
      className={`btn-primary ${compact ? "w-full py-2" : "w-full sm:w-auto"}`}
      aria-live="polite"
    >
      {label}
      {inCart > 0 && !compact && <span className="text-xs font-normal opacity-80">({inCart} en carrito)</span>}
    </button>
  );
}
