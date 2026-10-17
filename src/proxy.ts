import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ONLY_ROUTES = [
  "/dashboard/clinica",
  "/dashboard/usuarios",
  "/dashboard/vinculos",
  "/dashboard/idosos",
];

const CLINICAL_ROUTES = [
  "/dashboard/saude",
  "/dashboard/medicamentos",
  "/dashboard/consultas",
  "/dashboard/historico",
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

    let role = "";
    if (userCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userCookie));
        const user = parsed.user || parsed.usuario || parsed;
        role = String(user.perfil || user.role || "").toUpperCase();
      } catch {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    const isAdmin = role === "ADMINISTRADOR" || role === "ADMIN";
    const isRotaAdmin = ADMIN_ONLY_ROUTES.some((rota) =>
      pathname.startsWith(rota)
    );
    const isRotaClinica = CLINICAL_ROUTES.some((rota) =>
      pathname.startsWith(rota)
    );

    if (isRotaAdmin && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // O Administrador gerencia a instituicao, nao executa operacoes clinicas
    if (isRotaClinica && isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Familiar possui acesso somente leitura nos modulos clinicos
    if (
      role === "FAMILIAR" &&
      (pathname.endsWith("/novo") || pathname.endsWith("/nova"))
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/dashboard/:path*"],
};