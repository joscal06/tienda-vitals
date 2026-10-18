"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, registerAction, type AuthFormState } from "@/actions/auth";

type Field = { name: string; label: string; type: string; autoComplete: string };

const FIELDS: Record<"login" | "register", Field[]> = {
  login: [
    { name: "email", label: "Correo electrónico", type: "email", autoComplete: "email" },
    { name: "password", label: "Contraseña", type: "password", autoComplete: "current-password" },
  ],
  register: [
    { name: "name", label: "Nombre completo", type: "text", autoComplete: "name" },
    { name: "email", label: "Correo electrónico", type: "email", autoComplete: "email" },
    { name: "password", label: "Contraseña (mín. 8 caracteres)", type: "password", autoComplete: "new-password" },
    { name: "password_confirmation", label: "Confirmar contraseña", type: "password", autoComplete: "new-password" },
  ],
};

export function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    mode === "login" ? loginAction : registerAction,
    null,
  );
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />

      {state && !state.ok && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      {FIELDS[mode].map((field) => {
        const fieldError = errors?.[field.name]?.[0];
        return (
          <div key={field.name}>
            <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-zinc-700">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              required
              aria-invalid={fieldError ? true : undefined}
              aria-describedby={fieldError ? `${field.name}-error` : undefined}
              className="input"
            />
            {fieldError && (
              <p id={`${field.name}-error`} className="mt-1 text-xs text-red-600">
                {fieldError}
              </p>
            )}
          </div>
        );
      })}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Procesando…" : mode === "login" ? "Ingresar" : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
        <Link
          href={`${mode === "login" ? "/registro" : "/login"}?next=${encodeURIComponent(next)}`}
          className="font-semibold text-brand-700 hover:underline"
        >
          {mode === "login" ? "Regístrate" : "Inicia sesión"}
        </Link>
      </p>
    </form>
  );
}
