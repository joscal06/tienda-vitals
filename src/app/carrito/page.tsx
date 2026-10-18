import type { Metadata } from "next";

import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Carrito" };

export default function CartPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Tu carrito</h1>
      <CartView />
    </>
  );
}
