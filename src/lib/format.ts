import type { OrderStatus, PaymentStatus } from "./types";

const money = new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("es-SV", { dateStyle: "medium", timeStyle: "short", timeZone: "America/El_Salvador" });

export function formatPrice(value: number): string {
  return money.format(value);
}

export function formatDate(iso: string | null): string {
  return iso ? date.format(new Date(iso)) : "—";
}

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending: "Pendiente de pago",
  paid: "Pagada",
  failed: "Pago fallido",
  cancelled: "Cancelada",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending: "Procesando",
  succeeded: "Aprobado",
  failed: "Rechazado",
  refunded: "Reembolsado",
};

export const orderStatusStyle: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-zinc-200 text-zinc-700",
};
