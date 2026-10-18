"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { apiFetch, ApiError } from "@/lib/api";
import { PRODUCTS_TAG, productTag } from "@/lib/data";
import { destroySession, getToken } from "@/lib/session";
import type { ActionResult, ApiEnvelope, Order, PayPayload } from "@/lib/types";

const itemsSchema = z
  .array(
    z.object({
      product_id: z.number().int().positive(),
      quantity: z.number().int().min(1).max(99),
    }),
  )
  .min(1, "El carrito está vacío.");

async function tokenOrLogin(next: string): Promise<string> {
  const token = await getToken();
  if (!token) redirect(`/login?next=${encodeURIComponent(next)}`);
  return token;
}

/** Un 401 significa token vencido o revocado: se cierra la sesión local. */
async function handleAuthError(error: unknown, next: string): Promise<void> {
  if (error instanceof ApiError && error.status === 401) {
    await destroySession();
    redirect(`/login?next=${encodeURIComponent(next)}&expirada=1`);
  }
}

export type CreateOrderInput = z.input<typeof itemsSchema>;

/**
 * Crea la orden en la API (POST /orders). El backend recalcula precios y
 * descuenta stock, por lo que después se invalida la caché del catálogo
 * y la del historial para que ninguna vista muestre datos viejos.
 */
export async function createOrderAction(items: CreateOrderInput): Promise<ActionResult<{ orderId: number }>> {
  const parsed = itemsSchema.safeParse(items);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Carrito inválido." };
  }

  const token = await tokenOrLogin("/checkout");

  let order: Order;
  try {
    const res = await apiFetch<ApiEnvelope<Order>>("/orders", {
      method: "POST",
      token,
      body: { items: parsed.data },
      cache: "no-store",
    });
    if (!res.data) return { ok: false, message: "La API no devolvió la orden creada." };
    order = res.data;
  } catch (error) {
    await handleAuthError(error, "/checkout");
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "No se pudo crear la orden. Intenta de nuevo." };
  }

  // Stock actualizado: expira de inmediato el catálogo y cada detalle comprado.
  revalidateTag(PRODUCTS_TAG, { expire: 0 });
  for (const item of parsed.data) revalidateTag(productTag(item.product_id), { expire: 0 });
  revalidatePath("/historial");

  return { ok: true, data: { orderId: order.id } };
}

/**
 * Inicia el cobro: POST /orders/{id}/pay crea un PaymentIntent en Stripe y
 * devuelve su client_secret, que el Payment Element usa para confirmar el pago.
 */
export async function startPaymentAction(
  orderId: number,
): Promise<ActionResult<{ clientSecret: string; paymentId: number }>> {
  const next = `/checkout/orden/${orderId}`;
  const token = await tokenOrLogin(next);

  try {
    const res = await apiFetch<ApiEnvelope<PayPayload>>(`/orders/${orderId}/pay`, {
      method: "POST",
      token,
      cache: "no-store",
    });
    const clientSecret = res.data?.client_secret;
    if (!res.data || !clientSecret) {
      return { ok: false, message: "Stripe no devolvió un client_secret para esta orden." };
    }
    revalidatePath("/historial");
    return { ok: true, data: { clientSecret, paymentId: res.data.payment.id } };
  } catch (error) {
    await handleAuthError(error, next);
    // 409 = la orden ya no está pendiente; 502 = Stripe rechazó o no respondió.
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "No se pudo iniciar el pago. Intenta de nuevo." };
  }
}
