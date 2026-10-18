# Voltio — e-commerce con Next.js 16, Web Vitals y Server Actions

Frontend de una tienda de tecnología construido con **Next.js 16 (App Router)**, **TypeScript estricto** y **Tailwind CSS 4**, que consume la [API REST de e-commerce](https://github.com/joscal06/swaggerapi) (Laravel 12 + JWT + Swagger + Stripe).

El proyecto se centra en el **rendimiento** (Core Web Vitals, Lighthouse ≥ 90) y en las **mutaciones asíncronas en el servidor**: autenticación, creación de órdenes y pagos se hacen con Server Actions, sin exponer el token JWT al navegador, y la caché se invalida con `revalidateTag`/`revalidatePath` después de cada mutación.

## Funcionalidades

| Área | Implementación |
| --- | --- |
| Catálogo público | Listado paginado (`/?page=N`) y detalle (`/productos/[id]`) como **Server Components** con `fetch` en el servidor, `next/image` (AVIF/WebP, `sizes`, `preload` solo en la primera fila) y `generateMetadata` por producto (title, description, canonical, Open Graph). |
| Autenticación | Registro y login con **Server Actions** (`src/actions/auth.ts`) contra `POST /api/auth/register` y `/login`. El JWT se guarda en una **cookie httpOnly** (`tv_token`, SameSite=Lax, Secure en producción) con la vida útil del token. `src/proxy.ts` protege `/checkout` y `/historial`, verifica la expiración del JWT y redirige a `/login?next=…`. Errores de validación (422) y credenciales (401) de la API se muestran en el formulario; tras el login se redirige al destino original. |
| Carrito | Estado local con **React Context + `useSyncExternalStore`** persistido en `localStorage` (sin desajustes de hidratación y sincronizado entre pestañas). Agregar, cambiar cantidad, quitar y vaciar. |
| Orden | Server Action `createOrderAction` → `POST /api/orders`. Luego `revalidateTag('products', { expire: 0 })`, `revalidateTag('product-{id}')` (el stock cambió) y `revalidatePath('/historial')`. |
| Pago con Stripe | Server Action `startPaymentAction` → `POST /api/orders/{id}/pay` (crea el PaymentIntent y devuelve `client_secret`). El **Stripe Payment Element** (cargado de forma diferida) confirma el pago y **Stripe redirige** a `/checkout/confirmacion`, que consulta `GET /api/payments/{id}` (la API sincroniza el estado con Stripe) y muestra el resultado: aprobado, procesando o rechazado (con el motivo y la opción de reintentar con otra tarjeta). |
| Historial | Ruta protegida `/historial` con `GET /api/orders` paginado, sin caché (`no-store`), dentro de `<Suspense>` con esqueleto. |

### Rendimiento y resiliencia

- `loading.tsx` en el catálogo (`src/app/(catalogo)/loading.tsx`), en el checkout (`src/app/checkout/loading.tsx`) y en el historial.
- `error.tsx` con botón **Reintentar** (`retry()` de Next 16) en catálogo, checkout e historial.
- **Suspense granular**: la grilla de productos y la lista de órdenes se transmiten (streaming) mientras el encabezado ya está pintado; `key={page}` vuelve a mostrar el esqueleto al cambiar de página.
- Esqueletos con las mismas dimensiones que el contenido y `aspect-ratio` en las imágenes → **CLS = 0**.
- Stripe.js solo se descarga al pulsar «Pagar» (`next/dynamic`), así no afecta el LCP/TBT del resto del sitio.
- Datos públicos en el Data Cache (60 s + tags) y datos privados con `no-store` → no queda UI desactualizada después de las mutaciones.

Lighthouse (móvil, `next build && next start`): **Performance 95 – 97**, Accessibility 100, Best Practices 100, SEO 100.

## Rutas

| Ruta | Tipo | Acceso | Descripción |
| --- | --- | --- | --- |
| `/` | Server Component | Público | Catálogo paginado (`?page=N`) |
| `/productos/[id]` | Server Component | Público | Detalle con `generateMetadata` |
| `/carrito` | Client Component | Público | Carrito persistente |
| `/login` | Server Action | Solo invitados | Inicio de sesión (`?next=` para volver al destino) |
| `/registro` | Server Action | Solo invitados | Registro de cliente |
| `/checkout` | Server + Client | Protegida | Revisión del carrito y creación de la orden |
| `/checkout/orden/[id]` | Server + Client | Protegida | Pago de la orden con Stripe Payment Element |
| `/checkout/confirmacion` | Server Component | Protegida | Resultado del pago (`?orden=&pago=` + parámetros de Stripe) |
| `/historial` | Server Component | Protegida | Historial de compras del usuario |

### Endpoints de la API consumidos

| Método | Endpoint | Uso |
| --- | --- | --- |
| POST | `/api/auth/register` | Registro (Server Action) |
| POST | `/api/auth/login` | Login (Server Action) |
| POST | `/api/auth/logout` | Cierre de sesión (invalida el JWT) |
| GET | `/api/products?page&per_page` | Catálogo |
| GET | `/api/products/{id}` | Detalle y metadata |
| POST | `/api/orders` | Crear orden |
| GET | `/api/orders?page&per_page` | Historial |
| GET | `/api/orders/{id}` | Página de pago y confirmación |
| POST | `/api/orders/{id}/pay` | Crear PaymentIntent de Stripe |
| GET | `/api/payments/{id}` | Estado del pago (sincronizado con Stripe) |

## Requisitos

- Node.js 20.9 o superior
- La API [joscal06/swaggerapi](https://github.com/joscal06/swaggerapi) en ejecución (PHP 8.2, MySQL/MariaDB) con `STRIPE_SECRET` configurada
- Una cuenta de Stripe en **modo de prueba** (llaves `pk_test_…` / `sk_test_…` de la misma cuenta)

## Ejecución

1. Levanta la API (en su carpeta):

   ```bash
   php artisan migrate --seed
   php artisan serve --host=127.0.0.1 --port=8000
   ```

   En el `.env` de la API coloca `STRIPE_KEY` y `STRIPE_SECRET` (modo de prueba). Swagger queda en `http://127.0.0.1:8000/api/documentation`.

2. Instala y configura el frontend:

   ```bash
   npm install
   cp .env.example .env.local
   ```

   | Variable | Ejemplo | Descripción |
   | --- | --- | --- |
   | `API_BASE_URL` | `http://127.0.0.1:8000/api` | URL base de la API (solo servidor) |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` | Llave publicable de Stripe |
   | `SITE_URL` | `http://localhost:3000` | URL del frontend (canonical / Open Graph) |

3. Desarrollo: `npm run dev` → http://localhost:3000
4. Producción (para medir Lighthouse): `npm run build && npm start`

Tarjetas de prueba de Stripe: `4242 4242 4242 4242` (aprobada), `4000 0000 0000 0002` (rechazada), `4000 0025 0000 3155` (requiere 3-D Secure). Cualquier fecha futura y cualquier CVC.

### Calidad

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Estructura

```
src/
├── actions/          # Server Actions: auth.ts (login/registro/logout), orders.ts (orden y pago)
├── app/
│   ├── (catalogo)/   # / y /productos/[id] + loading.tsx + error.tsx
│   ├── (auth)/       # /login y /registro
│   ├── carrito/
│   ├── checkout/     # checkout, orden/[id], confirmacion + loading.tsx + error.tsx
│   └── historial/    # + loading.tsx + error.tsx
├── components/       # UI (cart-provider, stripe-payment-form, skeletons…)
├── lib/              # api.ts (fetch tipado), session.ts (cookies httpOnly), data.ts (lecturas + tags)
└── proxy.ts          # Protección de rutas (antes middleware)
```

## Autor

José Manuel Calderón González — Bootcamp Kodigo.
