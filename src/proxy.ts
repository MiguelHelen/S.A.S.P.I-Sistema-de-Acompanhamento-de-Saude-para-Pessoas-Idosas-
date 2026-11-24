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

function extrairPerfilCookie(rawCookie?: string): string {
  if (!rawCookie) return "";
  try {
    const parsed = JSON.parse(decodeURIComponent(rawCookie));
    const user = parsed?.user || parsed?.usuario || parsed;
    const role = String(user?.perfil || user?.role || "")
      .trim()
      .toUpperCase();
    return role === "ADMIN" ? "ADMINISTRADOR" : role;
  } catch {
    return "";
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("saspi_token")?.value;
  const userCookie = req.cookies.get("saspi_user")?.value;
  const role = extrairPerfilCookie(userCookie);

  // Exige token, cookie de usuário e perfil válido; bloqueia perfil IDOSO no painel web
  if (!token || !userCookie || !role || role === "IDOSO") {
    const loginUrl = new URL("/login", req.url);
    const res = NextResponse.redirect(loginUrl);
    if (role === "IDOSO" || !role) {
      res.cookies.delete("saspi_token");
      res.cookies.delete("saspi_user");
    }
    return res;
  }

  const isAdmin = role === "ADMINISTRADOR";

  const isAdminRoute = ADMIN_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const isClinicalRoute = CLINICAL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (isClinicalRoute && isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (role === "FAMILIAR") {
    const isCreateOrAccessRoute =
      pathname.endsWith("/novo") ||
      pathname.endsWith("/nova") ||
      pathname.includes("/acesso-app");
    if (isCreateOrAccessRoute) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/dashboard/:path*"],
};