"use client";

import Link from "next/link";

import { useCart } from "./cart-provider";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/carrito"
      className="relative rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100"
      aria-label={`Carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
    >
      Carrito
      {count > 0 && (
        <span className="ml-1.5 inline-grid min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
