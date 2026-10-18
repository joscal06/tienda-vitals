/** Fallback de las rutas de checkout (orden, pago y confirmación). */
export default function CheckoutLoading() {
  return (
    <div role="status" aria-label="Cargando checkout">
      <div className="mb-6 flex gap-4">
        <div className="skeleton h-7 w-24" />
        <div className="skeleton h-7 w-24" />
        <div className="skeleton h-7 w-32" />
      </div>
      <div className="skeleton mb-6 h-8 w-64" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card space-y-4 p-5">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="skeleton size-16" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="card h-fit space-y-4 p-5">
          <div className="skeleton h-6 w-full" />
          <div className="skeleton h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
