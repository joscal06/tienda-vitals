// Tipos que reflejan exactamente los recursos JSON de la API Laravel
// (app/Http/Resources/*Resource.php del repositorio swaggerapi).

export type Product = {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  created_at: string | null;
};

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type Payment = {
  id: number;
  order_id: number;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string | null;
  failure_reason: string | null;
  created_at: string | null;
};

export type OrderItem = {
  id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type Order = {
  id: number;
  user_id: number;
  status: OrderStatus;
  total: number;
  currency: string;
  notes: string | null;
  items: OrderItem[];
  payment: Payment | null;
  created_at: string | null;
  updated_at: string | null;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type Paginated<T> = {
  success: true;
  data: T[];
  meta: PaginationMeta;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export type AuthPayload = {
  user: User;
  token: string;
  token_type: "bearer";
  expires_in: number;
};

export type PayPayload = {
  payment: Payment;
  client_secret: string | null;
};

/** Usuario guardado en la cookie de sesión (sin datos sensibles). */
export type SessionUser = Pick<User, "id" | "name" | "email">;

/** Resultado tipado que devuelven las Server Actions a los formularios. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };
