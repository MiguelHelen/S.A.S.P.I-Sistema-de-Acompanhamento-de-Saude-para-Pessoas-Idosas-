import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROUTES = [
  "/dashboard/clinica",
  "/dashboard/usuarios/novo",
  "/dashboard/vinculos/novo",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("saspi_token")?.value;
  const userCookie = request.cookies.get("saspi_user")?.value;

  // 1. Se tentar acessar qualquer rota de /dashboard sem token válido, redireciona para /login
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Validação de RBAC no servidor para rotas exclusivas de ADMINISTRADOR
    const isRotaAdmin = ADMIN_ROUTES.some((rota) => pathname.startsWith(rota));

    if (isRotaAdmin) {
      if (!userCookie) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      try {
        const user = JSON.parse(decodeURIComponent(userCookie));
        const role = String(user.perfil || user.role || "").toUpperCase();

        if (role !== "ADMINISTRADOR" && role !== "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } catch {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/dashboard/:path*"],
};