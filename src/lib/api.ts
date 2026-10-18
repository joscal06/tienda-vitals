import "server-only";

import type { ApiEnvelope } from "./types";

/**
 * URL base de la API Laravel. Solo se lee en el servidor: el navegador nunca
 * habla directamente con la API, así el token JWT no sale de la cookie httpOnly.
 */
export function apiBaseUrl(): string {
  const url = process.env.API_BASE_URL;
  if (!url) {
    throw new Error("Falta la variable de entorno API_BASE_URL (revisa .env.local).");
  }
  return url.replace(/\/+$/, "");
}

/** Error de la API con el código HTTP y los errores de validación (422). */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type ApiRequestInit = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  /** Opciones de caché de Next (tags/revalidate) para lecturas públicas. */
  next?: { revalidate?: number | false; tags?: string[] };
  cache?: RequestCache;
};

function isEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return typeof value === "object" && value !== null && "success" in value;
}

/**
 * fetch tipado contra la API. Devuelve el JSON completo (envoltorio incluido)
 * y convierte cualquier respuesta no exitosa en un ApiError con el mensaje
 * que envía Laravel (ApiResponse::error).
 */
export async function apiFetch<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (init.token) headers.Authorization = `Bearer ${init.token}`;

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      method: init.method ?? "GET",
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: init.cache,
      next: init.next,
    });
  } catch {
    throw new ApiError(503, "No se pudo conectar con la API. Verifica que el servidor esté en ejecución.");
  }

  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    // Respuesta sin cuerpo JSON (p. ej. un 500 de PHP): se maneja abajo.
  }

  if (!response.ok || (isEnvelope(json) && json.success === false)) {
    const message =
      isEnvelope(json) && json.message ? json.message : `La API respondió con el código ${response.status}.`;
    throw new ApiError(response.status, message, isEnvelope(json) ? json.errors : undefined);
  }

  return json as T;
}
