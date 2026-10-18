"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { apiFetch, ApiError } from "@/lib/api";
import { createSession, destroySession, getToken, safeNext } from "@/lib/session";
import type { ActionResult, ApiEnvelope, AuthPayload } from "@/lib/types";

const loginSchema = z.object({
  email: z.email("Ingresa un correo electrónico válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(255),
    email: z.email("Ingresa un correo electrónico válido."),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: "La confirmación de la contraseña no coincide.",
    path: ["password_confirmation"],
  });

export type AuthFormState = ActionResult | null;

function toFailure(error: unknown): ActionResult {
  if (error instanceof ApiError) {
    return { ok: false, message: error.message, fieldErrors: error.fieldErrors };
  }
  return { ok: false, message: "Ocurrió un error inesperado. Intenta de nuevo." };
}

async function authenticate(path: "/auth/login" | "/auth/register", body: Record<string, string>): Promise<ActionResult> {
  try {
    const res = await apiFetch<ApiEnvelope<AuthPayload>>(path, { method: "POST", body, cache: "no-store" });
    if (!res.data) return { ok: false, message: "La API no devolvió un token." };
    await createSession(res.data.token, res.data.expires_in, res.data.user);
    return { ok: true, data: undefined };
  } catch (error) {
    return toFailure(error);
  }
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Revisa los datos del formulario.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const result = await authenticate("/auth/login", parsed.data);
  if (!result.ok) return result;

  // El layout muestra el nombre del usuario: se invalida para no dejar UI desactualizada.
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    password_confirmation: formData.get("password_confirmation"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Revisa los datos del formulario.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const result = await authenticate("/auth/register", parsed.data);
  if (!result.ok) return result;

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  const token = await getToken();
  if (token) {
    try {
      // Invalida el JWT en la lista negra de tymon/jwt-auth.
      await apiFetch("/auth/logout", { method: "POST", token, cache: "no-store" });
    } catch {
      // Si el token ya expiró igual se borra la cookie local.
    }
  }
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}
