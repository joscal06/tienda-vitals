"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useState, type FormEvent } from "react";

let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = (key: string) => (stripePromise ??= loadStripe(key));

type Props = {
  publishableKey: string;
  clientSecret: string;
  orderId: number;
  paymentId: number;
  amountLabel: string;
};

function PaymentForm({ orderId, paymentId, amountLabel }: Omit<Props, "publishableKey" | "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    // Stripe confirma el PaymentIntent (con 3-D Secure si el banco lo pide) y
    // redirige a la página de confirmación con ?payment_intent&redirect_status.
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/confirmacion?orden=${orderId}&pago=${paymentId}`,
      },
    });

    // Solo se llega aquí si hubo un error inmediato (tarjeta rechazada, datos
    // incompletos, etc.); en caso de éxito el navegador ya fue redirigido.
    setError(stripeError.message ?? "No se pudo procesar el pago.");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="font-semibold">Datos de pago</h2>
      <PaymentElement options={{ layout: "tabs" }} />
      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" disabled={!stripe || submitting} className="btn-primary w-full">
        {submitting ? "Procesando pago…" : `Pagar ${amountLabel}`}
      </button>
      <p className="text-xs text-zinc-500">
        Modo de prueba: usa la tarjeta 4242 4242 4242 4242, cualquier fecha futura y cualquier CVC. Para simular un
        rechazo usa 4000 0000 0000 0002.
      </p>
    </form>
  );
}

export default function StripePaymentForm({ publishableKey, clientSecret, ...rest }: Props) {
  return (
    <Elements
      stripe={getStripe(publishableKey)}
      options={{ clientSecret, locale: "es", appearance: { theme: "stripe", variables: { colorPrimary: "#4f46e5" } } }}
    >
      <PaymentForm {...rest} />
    </Elements>
  );
}
