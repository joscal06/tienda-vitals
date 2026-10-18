"use client";

import Link from "next/link";

import { formatPrice } from "@/lib/format";

import { CartLines } from "./cart-lines";
import { useCart } from "./cart-provider";

export function CartView() {
  const { items, count, total, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-zinc-600">Tu carrito está vacío.</p>
        <Link href="/" className="btn-primary mt-6">
          Explorar el catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="card px-5">
        <CartLines />
      </section>
      <aside className="card h-fit space-y-4 p-5">
        <h2 className="font-semibold">Resumen</h2>
        <div className="flex justify-between text-sm text-zinc-600">
          <span>{count} {count === 1 ? "producto" : "productos"}</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between border-t border-zinc-200 pt-4 text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <Link href="/checkout" className="btn-primary w-full">
          Continuar al pago
        </Link>
        <button type="button" onClick={clear} className="btn-secondary w-full">
          Vaciar carrito
        </button>
        <p className="text-xs text-zinc-500">El carrito se guarda en este navegador (localStorage).</p>
      </aside>
    </div>
  );
}
