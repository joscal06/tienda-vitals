const STEPS = ["Orden", "Pago", "Confirmación"] as const;

export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="mb-6 flex items-center gap-2 text-sm" aria-label="Pasos del checkout">
      {STEPS.map((step, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "current" : "todo";
        return (
          <li key={step} className="flex items-center gap-2" aria-current={state === "current" ? "step" : undefined}>
            <span
              className={`grid size-7 place-items-center rounded-full text-xs font-bold ${
                state === "todo" ? "bg-zinc-200 text-zinc-600" : "bg-brand-600 text-white"
              }`}
            >
              {state === "done" ? "✓" : n}
            </span>
            <span className={state === "current" ? "font-semibold" : "text-zinc-500"}>{step}</span>
            {n < STEPS.length && <span aria-hidden className="mx-1 h-px w-8 bg-zinc-300" />}
          </li>
        );
      })}
    </ol>
  );
}
