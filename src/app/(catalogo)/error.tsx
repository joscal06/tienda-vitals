"use client";

import { ErrorState } from "@/components/error-state";

export default function CatalogError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorState title="No pudimos cargar el catálogo" error={error} retry={retry} />;
}
