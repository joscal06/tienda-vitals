"use client";

import { ErrorState } from "@/components/error-state";

export default function CheckoutError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorState title="Hubo un problema con el checkout" error={error} retry={retry} />;
}
