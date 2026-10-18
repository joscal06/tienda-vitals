import "server-only";

import { notFound, redirect } from "next/navigation";

import { ApiError } from "./api";

/**
 * Traduce errores de la API en rutas protegidas: 401 → login (sesión
 * vencida), 403/404 → not-found. El resto se relanza hacia error.tsx.
 */
export function handleProtectedError(error: unknown, next: string): never {
  if (error instanceof ApiError) {
    if (error.status === 401) redirect(`/login?next=${encodeURIComponent(next)}&expirada=1`);
    if (error.status === 403 || error.status === 404) notFound();
  }
  throw error;
}
