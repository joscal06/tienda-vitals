import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckoutSteps } from "@/components/checkout-steps";
import { OrderSummary } from "@/components/order-summary";
import { PayPanel } from "@/components/pay-panel";
import { getOrder } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { handleProtectedError } from "@/lib/protected";
import { requireToken } from "@/lib/session";
import type { Order } from "@/lib/types";

export const metadata: Metadata = { title: "Pagar orden" };

export default async function PayOrderPage({ params }: PageProps<"/checkout/orden/[id]">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const path = `/checkout/orden/${id}`;
  const token = await requireToken(path);

  let order: Order;
  try {
    order = await getOrder(token, id);
  } catch (error) {
    handleProtectedError(error, path);
  }

  return (
    <>
      <CheckoutSteps current={order.status === "paid" ? 3 : 2} />
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Pago de la orden #{order.id}</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <OrderSummary order={order} />
        <section className="card h-fit p-5">
          {order.status === "pending" ? (
            <PayPanel
              orderId={order.id}
              amountLabel={formatPrice(order.total)}
              publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-zinc-600">
                {order.status === "paid"
                  ? "Esta orden ya fue pagada."
                  : "Esta orden ya no admite pagos. Crea una nueva orden desde el carrito."}
              </p>
              <Link href="/historial" className="btn-primary w-full">
                Ver mis compras
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
