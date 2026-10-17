import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROUTES = [
  "/dashboard/clinica",
  "/dashboard/usuarios",
  "/dashboard/vinculos",
  "/dashboard/idosos/novo",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("saspi_token")?.value;
  const userCookie = request.cookies.get("saspi_user")?.value;

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isRotaAdmin = ADMIN_ROUTES.some((rota) => pathname.startsWith(rota));

    if (isRotaAdmin) {
      if (!userCookie) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      try {
        const parsed = JSON.parse(decodeURIComponent(userCookie));
        const user = parsed.user || parsed.usuario || parsed;
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