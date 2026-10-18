import { NextResponse, type NextRequest } from "next/server";

const TOKEN_COOKIE = "tv_token";
const USER_COOKIE = "tv_user";

const PROTECTED = ["/checkout", "/historial"];
const GUEST_ONLY = ["/login", "/registro"];

/** Lee el `exp` del JWT sin verificar la firma (eso lo hace la API). */
function isExpired(token: string): boolean {
  const payload = token.split(".")[1];
  if (!payload) return true;
  try {
    const json: unknown = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof json === "object" && json !== null && "exp" in json && typeof json.exp === "number") {
      return json.exp * 1000 <= Date.now();
    }
  } catch {
    return true;
  }
  return false;
}

const matches = (path: string, list: string[]) => list.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * Proxy (antes "middleware"): filtra las rutas protegidas antes de renderizar.
 * Sin token válido → /login?next=<ruta>; con sesión activa no se muestra el login.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const valid = token !== undefined && !isExpired(token);

  if (matches(pathname, PROTECTED) && !valid) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    if (token) url.searchParams.set("expirada", "1");
    const response = NextResponse.redirect(url);
    response.cookies.delete(TOKEN_COOKIE);
    response.cookies.delete(USER_COOKIE);
    return response;
  }

  if (matches(pathname, GUEST_ONLY) && valid) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/historial/:path*", "/login", "/registro"],
};
