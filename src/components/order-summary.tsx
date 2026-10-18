import { formatDate, formatPrice, orderStatusLabel, orderStatusStyle } from "@/lib/format";
import type { Order } from "@/lib/types";

export function OrderStatusBadge({ status }: { status: Order["status"] }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${orderStatusStyle[status]}`}>
      {orderStatusLabel[status]}
    </span>
  );
}

export function OrderSummary({ order }: { order: Order }) {
  return (
    <section className="card p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">Orden #{order.id}</h2>
          <p className="text-sm text-zinc-500">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>
      <ul className="mt-4 divide-y divide-zinc-100 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 py-2">
            <span>
              {item.product_name ?? `Producto #${item.product_id}`}{" "}
              <span className="text-zinc-500">× {item.quantity}</span>
            </span>
            <span className="font-medium">{formatPrice(item.subtotal)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between border-t border-zinc-200 pt-3 font-bold">
        <span>Total</span>
        <span>{formatPrice(order.total)}</span>
      </div>
    </section>
  );
}
