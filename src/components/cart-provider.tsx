"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

import type { Product } from "@/lib/types";

export type CartItem = Pick<Product, "id" | "name" | "price" | "image_url" | "stock"> & { quantity: number };

const STORAGE_KEY = "tienda-vitals:cart";
const EMPTY: CartItem[] = [];

// ---------------------------------------------------------------------------
// Store externo sincronizado con localStorage. useSyncExternalStore evita
// desajustes de hidratación: en el servidor el carrito siempre está vacío y
// en el cliente se lee el valor persistido.
// ---------------------------------------------------------------------------
let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "number" &&
    typeof v.name === "string" &&
    typeof v.price === "number" &&
    typeof v.quantity === "number" &&
    typeof v.stock === "number" &&
    (typeof v.image_url === "string" || v.image_url === null)
  );
}

function read(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function emit(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Modo privado o cuota llena: el carrito sigue funcionando en memoria.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Sincroniza el carrito entre pestañas abiertas.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      items = read();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): CartItem[] {
  if (!loaded) {
    items = read();
    loaded = true;
  }
  return items;
}

const getServerSnapshot = () => EMPTY;

// ---------------------------------------------------------------------------

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (id: number, quantity: number) => void;
  remove: (id: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((product: Omit<CartItem, "quantity">, quantity = 1) => {
    const list = getSnapshot();
    const existing = list.find((i) => i.id === product.id);
    const nextQty = Math.min((existing?.quantity ?? 0) + quantity, product.stock);
    emit(
      existing
        ? list.map((i) => (i.id === product.id ? { ...i, ...product, quantity: nextQty } : i))
        : [...list, { ...product, quantity: nextQty }],
    );
  }, []);

  const setQuantity = useCallback((id: number, quantity: number) => {
    emit(
      getSnapshot()
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, Math.min(quantity, i.stock)) } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const remove = useCallback((id: number) => emit(getSnapshot().filter((i) => i.id !== id)), []);
  const clear = useCallback(() => emit(EMPTY), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items: current,
      count: current.reduce((n, i) => n + i.quantity, 0),
      total: Math.round(current.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [current, add, setQuantity, remove, clear],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>.");
  return ctx;
}
