import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { OrderStatusBadge } from "@/components/order-summary";
import { Pagination } from "@/components/pagination";
import { OrdersSkeleton } from "@/components/skeletons";
import { getOrders } from "@/lib/data";
import { formatDate, formatPrice, paymentStatusLabel } from "@/lib/format";
import { handleProtectedError } from "@/lib/protected";
import { getSessionUser, requireToken } from "@/lib/session";
import type { Order, Paginated } from "@/lib/types";

export const metadata: Metadata = { title: "Mis compras" };

/** Sección pesada del historial: se transmite dentro de Suspense. */
async function OrdersList({ token, page }: { token: string; page: number }) {
  const path = page > 1 ? `/historial?page=${page}` : "/historial";
  let result: Paginated<Order>;
  try {
    result = await getOrders(token, page);
  } catch (error) {
    handleProtectedError(error, path);
  }

  if (result.data.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-zinc-600">Aún no tienes compras registradas.</p>
        <Link href="/" className="btn-primary mt-6">
          Explorar el catálogo
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-4">
        {result.data.map((order) => (
          <li key={order.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">Orden #{order.id}</h2>
                <p className="text-sm text-zinc-500">{formatDate(order.created_at)}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-zinc-600">
              {order.items.map((i) => `${i.product_name ?? `Producto #${i.product_id}`} × ${i.quantity}`).join(" · ")}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-sm">
              <span className="text-zinc-500">
                Pago: {order.payment ? paymentStatusLabel[order.payment.status] : "sin iniciar"}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-base font-bold">{formatPrice(order.total)}</span>
                {order.status === "pending" && (
                  <Link href={`/checkout/orden/${order.id}`} className="btn-primary px-3 py-1.5">
                    Pagar
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Pagination
        page={result.meta.current_page}
        lastPage={result.meta.last_page}
        basePath="/historial"
        label="Páginas del historial"
      />
    </>
  );
}

export default async function HistoryPage({ searchParams }: PageProps<"/historial">) {
  const raw = (await searchParams).page;
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  const page = Number.isInteger(n) && n > 0 ? n : 1;
  const token = await requireToken("/historial");
  const user = await getSessionUser();

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Mis compras</h1>
      <p className="mt-1 mb-6 text-sm text-zinc-600">
        {user ? `Historial de órdenes de ${user.name}.` : "Historial de órdenes."} Los datos se consultan en vivo a la
        API (sin caché).
      </p>
      <Suspense key={page} fallback={<OrdersSkeleton />}>
        <OrdersList token={token} page={page} />
      </Suspense>
    </>
  );
}
