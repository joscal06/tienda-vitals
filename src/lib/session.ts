import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { SessionUser, User } from "./types";

export const TOKEN_COOKIE = "tv_token";
export const USER_COOKIE = "tv_user";

const baseCookie = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

/**
 * Guarda el JWT de la API en una cookie httpOnly (inaccesible desde JavaScript
 * del navegador) con la misma vida útil que el token (expires_in de Laravel).
 */
export async function createSession(token: string, expiresIn: number, user: User): Promise<void> {
  const store = await cookies();
  const sessionUser: SessionUser = { id: user.id, name: user.name, email: user.email };
  store.set(TOKEN_COOKIE, token, { ...baseCookie, maxAge: expiresIn });
  store.set(USER_COOKIE, JSON.stringify(sessionUser), { ...baseCookie, maxAge: expiresIn });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
  store.delete(USER_COOKIE);
}

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(USER_COOKIE)?.value;
  if (!raw || !store.has(TOKEN_COOKIE)) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "id" in parsed &&
      "name" in parsed &&
      "email" in parsed &&
      typeof parsed.id === "number" &&
      typeof parsed.name === "string" &&
      typeof parsed.email === "string"
    ) {
      return { id: parsed.id, name: parsed.name, email: parsed.email };
    }
  } catch {
    // Cookie manipulada o corrupta: se trata como sesión inexistente.
  }
  return null;
}

/**
 * Segunda línea de defensa (la primera es proxy.ts): las páginas y acciones
 * protegidas obtienen el token o redirigen al login conservando el destino.
 */
export async function requireToken(next: string): Promise<string> {
  const token = await getToken();
  if (!token) redirect(`/login?next=${encodeURIComponent(next)}`);
  return token;
}

/** Destino seguro tras el login: solo rutas internas, nunca URLs externas. */
export function safeNext(value: FormDataEntryValue | string | null | undefined): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
