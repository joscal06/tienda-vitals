"use client";

import { ErrorState } from "@/components/error-state";

export default function HistoryError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorState title="No pudimos cargar tu historial" error={error} retry={retry} />;
}
