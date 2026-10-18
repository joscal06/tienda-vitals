import "server-only";

import { cache } from "react";

import { apiFetch } from "./api";
import { ORDERS_PER_PAGE, PRODUCTS_PER_PAGE } from "./constants";
import type { ApiEnvelope, Order, Paginated, Payment, Product } from "./types";

export const PRODUCTS_TAG = "products";
export const productTag = (id: number | string) => `product-${id}`;

/**
 * Catálogo público: se cachea en el Data Cache de Next 60 s y se etiqueta con
 * "products" para invalidarlo al crear una orden (el stock cambia).
 */
export async function getProducts(page: number): Promise<Paginated<Product>> {
  return apiFetch<Paginated<Product>>(`/products?page=${page}&per_page=${PRODUCTS_PER_PAGE}`, {
    next: { revalidate: 60, tags: [PRODUCTS_TAG] },
  });
}

/**
 * Detalle de un producto. `cache` de React deduplica la llamada entre
 * generateMetadata y la página dentro del mismo render.
 */
export const getProduct = cache(async (id: string): Promise<Product> => {
  const res = await apiFetch<ApiEnvelope<Product>>(`/products/${encodeURIComponent(id)}`, {
    next: { revalidate: 60, tags: [PRODUCTS_TAG, productTag(id)] },
  });
  if (!res.data) throw new Error("La API no devolvió el producto.");
  return res.data;
});

/** Datos privados del usuario: nunca se cachean (no-store). */
export async function getOrders(token: string, page: number): Promise<Paginated<Order>> {
  return apiFetch<Paginated<Order>>(`/orders?page=${page}&per_page=${ORDERS_PER_PAGE}`, { token, cache: "no-store" });
}

export async function getOrder(token: string, id: string): Promise<Order> {
  const res = await apiFetch<ApiEnvelope<Order>>(`/orders/${encodeURIComponent(id)}`, {
    token,
    cache: "no-store",
  });
  if (!res.data) throw new Error("La API no devolvió la orden.");
  return res.data;
}

/** GET /payments/{id}: la API sincroniza el estado con Stripe si sigue pendiente. */
export async function getPayment(token: string, id: string): Promise<Payment> {
  const res = await apiFetch<ApiEnvelope<Payment>>(`/payments/${encodeURIComponent(id)}`, {
    token,
    cache: "no-store",
  });
  if (!res.data) throw new Error("La API no devolvió el pago.");
  return res.data;
}
