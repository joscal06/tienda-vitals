"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createOrderAction } from "@/actions/orders";
import { formatPrice } from "@/lib/format";

import { CartLines } from "./cart-lines";
import { useCart } from "./cart-provider";

export function CheckoutForm() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-zinc-600">No hay productos en el carrito para pagar.</p>
        <Link href="/" className="btn-primary mt-6">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  function placeOrder() {
    setError(null);
    startTransition(async () => {
      const result = await createOrderAction(items.map((i) => ({ product_id: i.id, quantity: i.quantity })));
      if (!result.ok) {
        setError(result.message);
        return;
      }
      // La orden ya existe en la API: se vacía el carrito local y se pasa al pago.
      clear();
      router.push(`/checkout/orden/${result.data.orderId}`);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="card px-5">
        <h2 className="pt-5 font-semibold">Productos</h2>
        <CartLines editable={false} />
      </section>
      <aside className="card h-fit space-y-4 p-5">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <p className="text-xs text-zinc-500">
          La API valida el stock y recalcula los precios al crear la orden.
        </p>
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button type="button" onClick={placeOrder} disabled={pending} className="btn-primary w-full">
          {pending ? "Creando orden…" : "Confirmar orden"}
        </button>
        <Link href="/carrito" className="btn-secondary w-full">
          Editar carrito
        </Link>
      </aside>
    </div>
  );
}
