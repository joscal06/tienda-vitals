import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckoutSteps } from "@/components/checkout-steps";
import { OrderSummary } from "@/components/order-summary";
import { getOrder, getPayment } from "@/lib/data";
import { formatPrice, paymentStatusLabel } from "@/lib/format";
import { handleProtectedError } from "@/lib/protected";
import { requireToken } from "@/lib/session";
import type { Order, Payment } from "@/lib/types";

export const metadata: Metadata = { title: "Confirmación de pago" };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

type Outcome = "success" | "processing" | "failed";

function outcomeOf(payment: Payment, redirectStatus: string | undefined): Outcome {
  if (payment.status === "succeeded") return "success";
  if (payment.status === "failed" || redirectStatus === "failed") return "failed";
  return "processing";
}

const COPY: Record<Outcome, { icon: string; title: string; text: string; tone: string }> = {
  success: {
    icon: "✓",
    title: "¡Pago aprobado!",
    text: "Tu compra se registró correctamente. Te enviaremos los detalles por correo.",
    tone: "bg-emerald-100 text-emerald-700",
  },
  processing: {
    icon: "…",
    title: "Estamos confirmando tu pago",
    text: "Stripe aún está procesando el cobro. Actualiza esta página en unos segundos.",
    tone: "bg-amber-100 text-amber-700",
  },
  failed: {
    icon: "✕",
    title: "El pago no se completó",
    text: "Tu banco rechazó el cobro o se canceló la autenticación. No se realizó ningún cargo.",
    tone: "bg-red-100 text-red-700",
  },
};

export default async function ConfirmationPage({ searchParams }: PageProps<"/checkout/confirmacion">) {
  const params = await searchParams;
  const orderId = first(params.orden);
  const paymentId = first(params.pago);
  if (!orderId || !paymentId || !/^\d+$/.test(orderId) || !/^\d+$/.test(paymentId)) notFound();

  const path = `/checkout/confirmacion?orden=${orderId}&pago=${paymentId}`;
  const token = await requireToken(path);

  let payment: Payment;
  let order: Order;
  try {
    // El pago primero: GET /payments/{id} sincroniza con Stripe y actualiza la orden.
    payment = await getPayment(token, paymentId);
    order = await getOrder(token, orderId);
  } catch (error) {
    handleProtectedError(error, path);
  }
  if (payment.order_id !== order.id) notFound();

  const outcome = outcomeOf(payment, first(params.redirect_status));
  const copy = COPY[outcome];

  return (
    <>
      <CheckoutSteps current={outcome === "success" ? 3 : 2} />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="card p-8 text-center" aria-live="polite">
          <div aria-hidden className={`mx-auto grid size-16 place-items-center rounded-full text-3xl font-bold ${copy.tone}`}>
            {copy.icon}
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{copy.title}</h1>
          <p className="mx-auto mt-2 max-w-md text-zinc-600">{copy.text}</p>
          {payment.failure_reason && outcome === "failed" && (
            <p className="mx-auto mt-3 max-w-md rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Motivo: {payment.failure_reason}
            </p>
          )}

          <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3 rounded-xl bg-zinc-100 p-4 text-left text-sm">
            <dt className="text-zinc-600">Orden</dt>
            <dd className="font-medium">#{order.id}</dd>
            <dt className="text-zinc-600">Monto</dt>
            <dd className="font-medium">{formatPrice(payment.amount)}</dd>
            <dt className="text-zinc-600">Estado del pago</dt>
            <dd className="font-medium">{paymentStatusLabel[payment.status]}</dd>
            <dt className="text-zinc-600">Referencia Stripe</dt>
            <dd className="truncate font-mono text-xs" title={payment.stripe_payment_intent_id}>
              {payment.stripe_payment_intent_id}
            </dd>
          </dl>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {outcome === "success" && (
              <Link href="/historial" className="btn-primary">
                Ver mis compras
              </Link>
            )}
            {outcome === "processing" && (
              <Link href={path} className="btn-primary">
                Actualizar estado
              </Link>
            )}
            {outcome === "failed" && order.status === "pending" && (
              <Link href={`/checkout/orden/${order.id}`} className="btn-primary">
                Intentar con otra tarjeta
              </Link>
            )}
            <Link href="/" className="btn-secondary">
              Seguir comprando
            </Link>
          </div>
        </section>
        <OrderSummary order={order} />
      </div>
    </>
  );
}
