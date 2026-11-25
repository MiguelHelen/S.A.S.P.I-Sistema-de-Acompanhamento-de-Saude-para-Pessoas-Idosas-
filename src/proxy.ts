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

function parseJsonResiliente(raw?: string): any {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {}
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {}
  return null;
}

function extrairPerfilCookie(rawCookie?: string): string {
  const parsed = parseJsonResiliente(rawCookie);
  if (!parsed) return "";
  const user = parsed?.user || parsed?.usuario || parsed;
  const role = String(user?.perfil || user?.role || "")
    .trim()
    .toUpperCase();
  return role === "ADMIN" ? "ADMINISTRADOR" : role;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("saspi_token")?.value;
  const userCookie = req.cookies.get("saspi_user")?.value;
  const role = extrairPerfilCookie(userCookie);

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (role === "IDOSO") {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("saspi_token");
    res.cookies.delete("saspi_user");
    return res;
  }

  if (!role) {
    return NextResponse.next();
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

  if (pathname === "/dashboard/medicamentos/novo" && role !== "MEDICO") {
    return NextResponse.redirect(new URL("/dashboard/medicamentos", req.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/dashboard/:path*"],
};