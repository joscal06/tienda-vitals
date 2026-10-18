"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";

import { startPaymentAction } from "@/actions/orders";

// Stripe.js (~90 kB) solo se descarga cuando el usuario decide pagar:
// no penaliza el LCP/TBT del catálogo ni del resto del checkout.
const StripePaymentForm = dynamic(() => import("./stripe-payment-form"), {
  ssr: false,
  loading: () => <div className="skeleton h-56 w-full" aria-label="Cargando formulario de pago" />,
});

type Props = { orderId: number; amountLabel: string; publishableKey: string };

export function PayPanel({ orderId, amountLabel, publishableKey }: Props) {
  const [intent, setIntent] = useState<{ clientSecret: string; paymentId: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!publishableKey) {
    return (
      <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Falta configurar NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en .env.local para habilitar los pagos.
      </p>
    );
  }

  function start() {
    setError(null);
    startTransition(async () => {
      const result = await startPaymentAction(orderId);
      if (result.ok) setIntent(result.data);
      else setError(result.message);
    });
  }

  if (intent) {
    return (
      <StripePaymentForm
        publishableKey={publishableKey}
        clientSecret={intent.clientSecret}
        orderId={orderId}
        paymentId={intent.paymentId}
        amountLabel={amountLabel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Método de pago</h2>
      <p className="text-sm text-zinc-600">
        El cobro se procesa con Stripe. Tus datos de tarjeta nunca pasan por nuestros servidores.
      </p>
      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="button" onClick={start} disabled={pending} className="btn-primary w-full">
        {pending ? "Conectando con Stripe…" : `Pagar ${amountLabel} con Stripe`}
      </button>
    </div>
  );
}
