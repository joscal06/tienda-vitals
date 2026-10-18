import Link from "next/link";

import { logoutAction } from "@/actions/auth";
import { getSessionUser } from "@/lib/session";

import { CartLink } from "./cart-link";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-900">
          <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-brand-600 text-white">
            ⚡
          </span>
          Voltio
        </Link>

        <nav className="ml-auto flex items-center gap-1 text-sm font-medium sm:gap-2">
          <Link href="/" className="rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100">
            Catálogo
          </Link>
          {user && (
            <Link href="/historial" className="rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100">
              Mis compras
            </Link>
          )}
          <CartLink />
          {user ? (
            <form action={logoutAction} className="flex items-center gap-2">
              <span className="hidden max-w-36 truncate text-zinc-500 md:inline" title={user.email}>
                {user.name}
              </span>
              <button type="submit" className="rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100">
                Salir
              </button>
            </form>
          ) : (
            <Link href="/login" className="btn-primary px-3 py-2">
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
