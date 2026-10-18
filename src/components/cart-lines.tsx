"use client";

import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/format";

import { useCart } from "./cart-provider";

/** Líneas del carrito con controles de cantidad (o solo lectura en checkout). */
export function CartLines({ editable = true }: { editable?: boolean }) {
  const { items, setQuantity, remove } = useCart();

  return (
    <ul className="divide-y divide-zinc-200">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-4 py-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
            {item.image_url && <Image src={item.image_url} alt="" fill sizes="64px" className="object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <Link href={`/productos/${item.id}`} className="line-clamp-1 font-medium hover:underline">
              {item.name}
            </Link>
            <p className="text-sm text-zinc-500">{formatPrice(item.price)} c/u</p>
          </div>
          {editable ? (
            <div className="flex items-center gap-2">
              <label htmlFor={`qty-${item.id}`} className="sr-only">
                Cantidad de {item.name}
              </label>
              <select
                id={`qty-${item.id}`}
                value={item.quantity}
                onChange={(e) => setQuantity(item.id, Number(e.target.value))}
                className="input w-20 py-1.5"
              >
                {Array.from({ length: Math.min(item.stock, 10) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="rounded-md px-2 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                Quitar
              </button>
            </div>
          ) : (
            <span className="text-sm text-zinc-500">× {item.quantity}</span>
          )}
          <span className="w-24 text-right font-semibold">{formatPrice(item.price * item.quantity)}</span>
        </li>
      ))}
    </ul>
  );
}
