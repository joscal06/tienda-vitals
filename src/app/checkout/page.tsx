import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout-form";
import { CheckoutSteps } from "@/components/checkout-steps";
import { requireToken } from "@/lib/session";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  await requireToken("/checkout");

  return (
    <>
      <CheckoutSteps current={1} />
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Revisa tu orden</h1>
      <CheckoutForm />
    </>
  );
}
